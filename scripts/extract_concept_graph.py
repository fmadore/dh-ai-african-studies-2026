"""
Extract a concept graph from the Obsidian vault for the DH & AI in African Studies workshop.

Usage:
    python scripts/extract_concept_graph.py --vault /path/to/vault

Supply --vault to extract private notes, or --repair-snapshot to prune an existing
JSON snapshot without accessing or reconstructing private notes.
Output goes to src/lib/data/concept-graph.json (relative to repo root).

Strategy:
1. Read the research note to identify seed concepts (wiki-links → Zotero/Concepts/)
2. Read each seed concept note and follow its wiki-links to other concept notes
3. Include 2nd-degree concepts with at least two distinct seed neighbors
4. Build edges from the actual wiki-links in concept notes
5. Output JSON for the website
"""

import argparse
import re
import json
import hashlib
import os
import tempfile
from pathlib import Path
from collections import defaultdict, Counter

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
OUTPUT_FILE = REPO_ROOT / "src" / "lib" / "data" / "concept-graph.json"

# Paths relative to vault root
CONCEPTS_REL = Path("Zotero") / "Concepts"
RESEARCH_NOTE_REL = (
    Path("Zotero") / "Research Notes"
    / "Conceptual Landscape for DH and AI in African Studies Workshop.md"
)


FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)", re.S)

# Vault notes naming a specific AI vendor, product or working practice. They are
# well linked inside the vault, so they otherwise surface as 2nd-degree concepts,
# but they belong to a tooling landscape rather than to the workshop's
# intellectual agenda — and named model versions date badly on a published map.
# Concepts stay in: "Large Language Models" yes, "Gemini 3 Pro" no.
EXCLUDED_CONCEPTS = {
    "ai agent skills",
    "chatgpt",
    "claude (ai)",
    "context engineering",
    "gemini 3 pro",
    "llama",
    "mistral",
    "model context protocol",
    "openai",
}


def normalise_target(target: str) -> str:
    """Reduce a wiki-link target to a bare note name.

    Drops the display alias ([[Note|shown]]), any #heading or ^block anchor,
    and any folder path — the vault links to some notes by full path, e.g.
    [[Zotero/Concepts/Metadata]].
    """
    target = target.split("|")[0]
    target = re.split(r"[#^]", target)[0]
    return target.strip().rstrip("/").split("/")[-1].strip()


def extract_wikilinks(text: str) -> list[str]:
    """Extract all [[wiki-links]] from markdown text as bare note names."""
    return [
        normalise_target(m.group(1)) for m in re.finditer(r"\[\[([^\]]+)\]\]", text)
    ]


def parse_alias_scalar(value: str) -> str:
    """A deliberately small YAML scalar grammar; reject rather than misparse."""
    value = value.strip()
    if not value:
        raise ValueError("Empty alias; use aliases: [] for no aliases")
    if value.startswith('"'):
        # JSON string escapes form a well-defined subset of YAML double quotes.
        try:
            result, end = json.JSONDecoder().raw_decode(value)
        except ValueError as error:
            raise ValueError(f"Unsupported quoted alias: {value}") from error
        tail = value[end:].strip()
        if not isinstance(result, str) or (tail and not tail.startswith('#')):
            raise ValueError(f"Invalid alias: {value}")
        return result.strip()
    if value.startswith("'"):
        match = re.fullmatch(r"'((?:[^']|'')*)'\s*(?:#.*)?", value)
        if not match:
            raise ValueError(f"Invalid single-quoted alias: {value}")
        return match.group(1).replace("''", "'").strip()
    value = re.split(r"\s+#", value, maxsplit=1)[0].strip()
    if value[0] in "[]{}&*!|>@`" or ": " in value or value in {"null", "~"}:
        raise ValueError(f"Unsupported alias syntax; quote the alias: {value}")
    return value


def parse_inline_aliases(value: str) -> list[str]:
    """Split a flow list without splitting commas inside quoted aliases."""
    parts, start, quote, escaped = [], 1, None, False
    i = 1
    while i < len(value):
        char = value[i]
        if quote:
            if quote == '"' and char == "\\" and not escaped:
                escaped = True
                i += 1
                continue
            if char == quote and not escaped:
                if quote == "'" and i + 1 < len(value) and value[i + 1] == "'":
                    i += 2
                    continue
                quote = None
            escaped = False
        elif char in {"'", '"'} and not value[start:i].strip():
            quote = char
        elif char in {",", "]"}:
            piece = value[start:i].strip()
            if piece:
                parts.append(parse_alias_scalar(piece))
            elif char == ",":
                raise ValueError("Empty item in aliases list")
            if char == "]":
                tail = value[i + 1:].strip()
                if tail and not tail.startswith("#"):
                    raise ValueError("Unexpected text after aliases list")
                return parts
            start = i + 1
        elif char in "[{":
            raise ValueError("Nested aliases are unsupported; use a list of strings")
        i += 1
    raise ValueError("Unclosed aliases list or quote")


def parse_aliases(text: str) -> list[str]:
    """Read scalar, inline or block string aliases without third-party YAML.

    Supported quoted strings use JSON double-quote escapes or YAML single-quote
    escaping. Nested collections, anchors and folded/multiline aliases fail with
    an actionable error instead of silently corrupting concept identities.
    """
    match = FRONTMATTER_RE.match(text)
    if not match:
        return []
    lines = match.group(1).splitlines()
    for i, line in enumerate(lines):
        if not re.match(r"^aliases\s*:", line):
            continue
        inline = line.split(":", 1)[1].strip()
        if inline.startswith("["):
            aliases = parse_inline_aliases(inline)
        elif inline and not inline.startswith("#"):
            aliases = [parse_alias_scalar(inline)]
        else:
            aliases = []
            for follow in lines[i + 1:]:
                item = follow.strip()
                if not item or item.startswith("#"):
                    continue
                if item.startswith("- "):
                    aliases.append(parse_alias_scalar(item[2:]))
                elif follow[0].isspace():
                    raise ValueError("Multiline aliases are unsupported; use quoted strings")
                else:
                    break
        if any(not alias for alias in aliases):
            raise ValueError("Aliases must be nonempty strings")
        return aliases
    return []


def build_concept_lookup(concepts_dir: Path) -> dict[str, Path]:
    """Build a case-insensitive lookup of concept notes by filename and alias.

    Filenames are registered first so a real note always wins over another
    note's alias; among aliases the alphabetically first note wins, which
    keeps the output stable between runs.

    Excluded notes are left out of the lookup entirely, so nothing resolves to
    them and they contribute neither nodes nor edges.
    """
    notes = sorted(
        f for f in concepts_dir.iterdir()
        if f.suffix == ".md" and f.stem.lower() not in EXCLUDED_CONCEPTS
    )
    lookup: dict[str, Path] = {f.stem.lower(): f for f in notes}
    for f in notes:
        for alias in parse_aliases(f.read_text(encoding="utf-8")):
            if alias.lower() not in EXCLUDED_CONCEPTS:
                lookup.setdefault(alias.lower(), f)
    return lookup


def resolve_concept(name: str, lookup: dict[str, Path]) -> str | None:
    """Check if a wiki-link target corresponds to a concept note."""
    key = normalise_target(name).lower()
    if key in lookup:
        return lookup[key].stem
    return None


def get_concept_links(concept_name: str, lookup: dict[str, Path]) -> list[str]:
    """Read a concept note and return wiki-links pointing to other concept notes."""
    key = concept_name.lower()
    if key not in lookup:
        return []
    content = lookup[key].read_text(encoding="utf-8")
    links = extract_wikilinks(content)
    resolved = set()
    for link in links:
        target = resolve_concept(link, lookup)
        if target and target.lower() != concept_name.lower():
            resolved.add(target)
    return sorted(resolved)


def parse_group_assignments(research_content: str, lookup: dict[str, Path]) -> dict[str, str]:
    """Parse the Conceptual Map by Workshop Group section for group assignments."""
    assignments = {}
    section_split = research_content.split("## Conceptual Map by Workshop Group")
    if len(section_split) < 2:
        return assignments

    section = section_split[1]
    current_group = None
    for line in section.split("\n"):
        # Stop at the next ## section (e.g. "## Related Concepts")
        if line.startswith("## ") and not line.startswith("### "):
            break
        if line.startswith("### Group 1"):
            current_group = "Language Technologies, NLP & Corpora"
        elif line.startswith("### Group 2"):
            current_group = "The Archive"
        elif line.startswith("### Group 3"):
            current_group = "Infrastructure, Governance & Access"
        elif line.startswith("### Group 4"):
            current_group = "Epistemologies, Decoloniality & Ethical Frameworks"
        elif line.startswith("### Cross-cutting"):
            current_group = "Cross-cutting"
        elif current_group and "[[" in line:
            for link in extract_wikilinks(line):
                resolved = resolve_concept(link, lookup)
                if resolved and resolved not in assignments:
                    assignments[resolved] = current_group

    return assignments


GROUP_COLORS = {
    "Language Technologies, NLP & Corpora": "#e74c3c",
    "The Archive": "#e67e22",
    "Infrastructure, Governance & Access": "#3498db",
    "Epistemologies, Decoloniality & Ethical Frameworks": "#9b59b6",
    "Cross-cutting": "#2ecc71",
    "Extended": "#95a5a6",
}


GENERATOR_VERSION = 2
MIN_SEED_NEIGHBORS = 2


def graph_policy() -> dict:
    return {
        "minDistinctSeedNeighbors": MIN_SEED_NEIGHBORS,
        "edgeSemantics": "undirected wiki-links between curated concept notes",
        "seedSelection": "resolved concept links in the workshop research note",
        "excludedConcepts": sorted(EXCLUDED_CONCEPTS),
    }


def build_graph(concepts_dir: Path, research_content: str) -> dict:
    """Extract a reproducible graph; count distinct seed neighbors, not links."""
    lookup = build_concept_lookup(concepts_dir)
    note_count = len({f for f in lookup.values()})
    print(f"Concept notes in vault: {note_count} "
          f"({len(lookup) - note_count} extra alias spellings)")

    # --- Step 1: Identify seed concepts from the research note ---
    seeds = set()
    for link in extract_wikilinks(research_content):
        resolved = resolve_concept(link, lookup)
        if resolved:
            seeds.add(resolved)

    print(f"Seed concepts: {len(seeds)}")

    # --- Step 2: Read seed concept notes → find 2nd-degree concepts ---
    concept_edges: dict[str, list[str]] = {}
    second_degree = set()

    for seed in seeds:
        links = get_concept_links(seed, lookup)
        concept_edges[seed] = links
        second_degree.update(links)

    new_concepts = second_degree - seeds
    print(f"2nd-degree concepts: {len(new_concepts)}")

    # Read 2nd-degree notes for their links too
    for concept in new_concepts:
        concept_edges[concept] = get_concept_links(concept, lookup)

    # --- Step 3: Filter 2nd-degree to well-connected ones ---
    seed_neighbors: dict[str, set[str]] = defaultdict(set)
    for seed in sorted(seeds):
        for link in concept_edges.get(seed, []):
            if link in new_concepts:
                seed_neighbors[link].add(seed)
    for concept in sorted(new_concepts):
        for link in concept_edges.get(concept, []):
            if link in seeds:
                seed_neighbors[concept].add(link)

    filtered_new = {c for c, neighbors in seed_neighbors.items()
                    if len(neighbors) >= MIN_SEED_NEIGHBORS}
    relevant_concepts = seeds | filtered_new

    print(f"Relevant concepts: {len(relevant_concepts)} "
          f"({len(seeds)} seeds + {len(filtered_new)} extended)")

    # --- Step 4: Build edges ---
    edge_set: set[tuple[str, str]] = set()
    for concept in sorted(relevant_concepts):
        for link in concept_edges.get(concept, []):
            if link in relevant_concepts:
                edge_set.add(tuple(sorted([concept, link])))
    edges = [{"source": source, "target": target} for source, target in sorted(edge_set)]

    # --- Step 5: Assign groups ---
    group_assignments = parse_group_assignments(research_content, lookup)

    # --- Step 6: Build nodes with degree ---
    degree: dict[str, int] = defaultdict(int)
    for edge in edges:
        degree[edge["source"]] += 1
        degree[edge["target"]] += 1

    nodes = []
    for concept in sorted(relevant_concepts):
        group = group_assignments.get(concept, "Extended")
        nodes.append({
            "id": concept,
            "label": concept,
            "group": group,
            "color": GROUP_COLORS.get(group, "#95a5a6"),
            "seed": concept in seeds,
            "degree": degree.get(concept, 0),
        })

    # --- Summary ---
    print(f"Edges: {len(edges)}")
    print("\nNodes by group:")
    for g, c in Counter(n["group"] for n in nodes).most_common():
        print(f"  {g}: {c}")
    print(f"\nTop 10 by degree:")
    for n in sorted(nodes, key=lambda x: x["degree"], reverse=True)[:10]:
        print(f"  {n['id']}: {n['degree']} ({n['group']})")

    return {"nodes": nodes, "edges": edges}


def extract_graph(vault: Path) -> dict:
    concepts_dir = vault / CONCEPTS_REL
    research_note_path = vault / RESEARCH_NOTE_REL
    if not concepts_dir.is_dir():
        raise FileNotFoundError(f"Concepts directory not found: {concepts_dir}")
    if not research_note_path.is_file():
        raise FileNotFoundError(f"Research note not found: {research_note_path}")
    data = build_graph(concepts_dir, research_note_path.read_text(encoding="utf-8"))
    # A digest identifies the private snapshot without publishing note text or paths.
    digest = hashlib.sha256()
    inputs = sorted([research_note_path, *concepts_dir.glob("*.md")])
    for path in inputs:
        digest.update(path.relative_to(vault).as_posix().encode("utf-8") + b"\0")
        digest.update(path.read_bytes() + b"\0")
    data["provenance"] = {
        "kind": "vault-extraction",
        "generator": "scripts/extract_concept_graph.py",
        "generatorVersion": GENERATOR_VERSION,
        "sourceSnapshotSha256": digest.hexdigest(),
        "inputNoteCount": len(inputs),
        "policy": graph_policy(),
        "interpretation": "Degree describes curated note linkage, not scholarly consensus.",
    }
    return data


def prune_snapshot(data: dict, source_digest: str) -> dict:
    """Apply the eligibility rule to an existing complete undirected snapshot.

    Only nonseeds and their incident edges are removed. No private source is
    reconstructed and no relationship is introduced. Removing nonseeds cannot
    change any other node's number of seed neighbors.
    """
    nodes = {node["id"]: node for node in data["nodes"]}
    if len(nodes) != len(data["nodes"]):
        raise ValueError("Duplicate node IDs")
    neighbors: dict[str, set[str]] = defaultdict(set)
    for edge in data["edges"]:
        a, b = edge["source"], edge["target"]
        if a not in nodes or b not in nodes or a == b:
            raise ValueError("Invalid graph edge")
        neighbors[a].add(b)
        neighbors[b].add(a)
    removed = sorted(node_id for node_id, node in nodes.items() if not node["seed"]
                     and sum(bool(nodes[n]["seed"]) for n in neighbors[node_id]) < MIN_SEED_NEIGHBORS)
    if not removed:
        return data
    kept = set(nodes) - set(removed)
    pairs = sorted({tuple(sorted((a, b))) for a in kept for b in neighbors[a] if b in kept})
    degrees = Counter(endpoint for pair in pairs for endpoint in pair)
    result = {
        "nodes": [{**nodes[node_id], "degree": degrees[node_id]} for node_id in sorted(kept)],
        "edges": [{"source": a, "target": b} for a, b in pairs],
        "provenance": {
            "kind": "snapshot-correction",
            "generator": "scripts/extract_concept_graph.py --repair-snapshot",
            "generatorVersion": GENERATOR_VERSION,
            "sourceSnapshotSha256": source_digest,
            "privateVaultReprocessed": False,
            "removedNodeIds": removed,
            "removedEdgeCount": len(data["edges"]) - len(pairs),
            "policy": graph_policy(),
            "transformation": "Removed nonseed nodes with fewer than two distinct seed neighbors and their incident edges; recalculated degrees and sorted undirected edges. No relationships added.",
            "interpretation": "Degree describes curated note linkage, not scholarly consensus.",
        },
    }
    if "provenance" in data:
        result["provenance"]["previousProvenance"] = data["provenance"]
    return result


def write_graph(output: Path, data: dict) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n",
                                         dir=output.parent, delete=False) as file:
            temporary = Path(file.name)
            json.dump(data, file, indent=2, ensure_ascii=False)
            file.write("\n")
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary, output)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


def main():
    parser = argparse.ArgumentParser(description="Extract a concept graph from Obsidian notes")
    sources = parser.add_mutually_exclusive_group(required=True)
    sources.add_argument("--vault", type=Path, help="Path to the private Obsidian vault")
    sources.add_argument("--repair-snapshot", type=Path,
                         help="Prune ineligible nodes from an existing snapshot; does not reread notes")
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE)
    args = parser.parse_args()
    if args.vault:
        data = extract_graph(args.vault.resolve())
    else:
        source = args.repair_snapshot.read_bytes()
        data = prune_snapshot(json.loads(source), hashlib.sha256(source).hexdigest())
    write_graph(args.output, data)
    print(f"Output: {args.output}")


if __name__ == "__main__":
    main()
