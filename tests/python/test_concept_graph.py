"""Offline regression fixtures for the graph's published methodology."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / 'scripts' / 'extract_concept_graph.py'
spec = importlib.util.spec_from_file_location('concept_graph', SCRIPT)
graph = importlib.util.module_from_spec(spec)
spec.loader.exec_module(graph)


class GraphTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.vault = Path(self.temporary.name)
        self.concepts = self.vault / graph.CONCEPTS_REL
        self.concepts.mkdir(parents=True)
        self.research = self.vault / graph.RESEARCH_NOTE_REL
        self.research.parent.mkdir(parents=True)
        self.research.write_text('## Conceptual Map by Workshop Group\n### Group 1\n[[A]] [[B]]\n', encoding='utf-8')
        # C has two reciprocal links, but only one distinct seed neighbor.
        for name, content in {'A': '[[C]] [[D]]', 'B': '[[D]]', 'C': '[[A]]', 'D': '[[A]]'}.items():
            (self.concepts / f'{name}.md').write_text(content, encoding='utf-8')

    def extract(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return graph.extract_graph(self.vault)

    def test_distinct_seed_neighbors(self):
        data = self.extract()
        self.assertEqual([n['id'] for n in data['nodes']], ['A', 'B', 'D'])
        self.assertEqual(data['edges'], [{'source': 'A', 'target': 'D'}, {'source': 'B', 'target': 'D'}])
        self.assertEqual({n['id']: n['degree'] for n in data['nodes']}, {'A': 1, 'B': 1, 'D': 2})

    def test_aliases_handle_quoted_commas_escapes_and_comments(self):
        self.assertEqual(graph.parse_aliases('---\naliases: ["Language, power", \'It\'\'s a note\', Plain] # note\n---\n'), ['Language, power', "It's a note", 'Plain'])
        self.assertEqual(graph.parse_aliases('---\naliases:\n  # comment\n  - "Language, power"\n\n  - Other # comment\ntags: [x]\n---\n'), ['Language, power', 'Other'])
        self.assertEqual(graph.parse_aliases('---\naliases: []\n---\n'), [])
        for value in ['["unclosed]', '[nested, [list]]', '|', '[, x]', '""', '["x" garbage]']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                graph.parse_aliases(f'---\naliases: {value}\n---\n')

    def test_alias_resolution_and_exclusions(self):
        (self.concepts / 'D.md').write_text('---\naliases: ["Data, evidence"]\n---\n[[A]]', encoding='utf-8')
        (self.concepts / 'ChatGPT.md').write_text('[[A]]', encoding='utf-8')
        lookup = graph.build_concept_lookup(self.concepts)
        self.assertEqual(graph.resolve_concept('Zotero/Concepts/Data, evidence#Section|shown', lookup), 'D')
        self.assertIsNone(graph.resolve_concept('ChatGPT', lookup))

    def test_deterministic_across_python_hash_seeds(self):
        values = []
        for seed in ['1', '2', '3']:
            output = self.vault / f'output-{seed}.json'
            subprocess.run([sys.executable, '-B', str(SCRIPT), '--vault', str(self.vault), '--output', str(output)], check=True, capture_output=True, env={**os.environ, 'PYTHONHASHSEED': seed})
            values.append(output.read_bytes())
        self.assertEqual(values[0], values[1])
        self.assertEqual(values[1], values[2])

    def test_provenance_identifies_changed_input_without_exposing_notes(self):
        first = self.extract()
        (self.concepts / 'A.md').write_text('[[C]] [[D]]\nPrivate research note.', encoding='utf-8')
        second = self.extract()
        self.assertNotEqual(first['provenance']['sourceSnapshotSha256'], second['provenance']['sourceSnapshotSha256'])
        self.assertNotIn('Private research note', json.dumps(second))
        self.assertEqual(first['provenance']['kind'], 'vault-extraction')

    def test_snapshot_correction_only_removes_existing_nodes_and_edges(self):
        original = {'nodes': [{'id': 'A', 'seed': True, 'degree': 2}, {'id': 'B', 'seed': True, 'degree': 1}, {'id': 'C', 'seed': False, 'degree': 1}, {'id': 'D', 'seed': False, 'degree': 2}], 'edges': [{'source': 'A', 'target': 'C'}, {'source': 'D', 'target': 'A'}, {'source': 'B', 'target': 'D'}]}
        corrected = graph.prune_snapshot(original, 'test-snapshot')
        self.assertEqual(corrected['provenance']['removedNodeIds'], ['C'])
        self.assertFalse(corrected['provenance']['privateVaultReprocessed'])
        self.assertEqual(corrected['provenance']['removedEdgeCount'], 1)
        old_edges = {tuple(sorted(e.values())) for e in original['edges']}
        self.assertTrue({tuple(sorted(e.values())) for e in corrected['edges']} <= old_edges)
        self.assertEqual(graph.prune_snapshot(corrected, 'unused'), corrected)

    def test_committed_snapshot_invariants(self):
        data = json.loads((ROOT / 'src/lib/data/concept-graph.json').read_text(encoding='utf-8'))
        nodes = {n['id']: n for n in data['nodes']}
        self.assertEqual(len(nodes), len(data['nodes']))
        neighbors = {key: set() for key in nodes}
        pairs = []
        for edge in data['edges']:
            a, b = edge['source'], edge['target']
            self.assertIn(a, nodes)
            self.assertIn(b, nodes)
            self.assertLess(a, b)
            neighbors[a].add(b)
            neighbors[b].add(a)
            pairs.append((a, b))
        self.assertEqual(pairs, sorted(set(pairs)))
        for key, node in nodes.items():
            self.assertEqual(node['degree'], len(neighbors[key]), key)
            if not node['seed']:
                self.assertGreaterEqual(sum(nodes[n]['seed'] for n in neighbors[key]), 2, key)
        self.assertIn('provenance', data)

    def test_atomic_write_failure_preserves_previous_snapshot(self):
        from unittest.mock import patch
        output = self.vault / 'graph.json'
        output.write_text('existing', encoding='utf-8')
        with patch.object(graph.os, 'replace', side_effect=OSError('disk failure')):
            with self.assertRaises(OSError):
                graph.write_graph(output, {'nodes': [], 'edges': []})
        self.assertEqual(output.read_text(), 'existing')
        self.assertEqual(list(self.vault.glob('tmp*')), [])


if __name__ == '__main__':
    unittest.main()
