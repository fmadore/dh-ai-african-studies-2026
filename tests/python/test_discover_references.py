"""Offline coverage for the ACL Anthology / arXiv reference discovery pipeline."""

import argparse
import gzip
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
import urllib.error

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from scripts import discover_references as discovery

BIB = r'''@proceedings{rail-2026-1,
    title = "Proceedings of the Seventh Workshop on Resources for {A}frican Indigenous Languages",
    year = "2026",
    url = "https://aclanthology.org/2026.rail-1.0/"
}
@inproceedings{diallo-etal-2026-bambara,
    title = "Speech Recognition for {B}ambara: a Community Dataset from {M}ali",
    author = "Diallo, Aminata  and
      Tour{\'e}, Moussa",
    booktitle = "Proceedings of the Seventh Workshop on Resources for {A}frican Indigenous Languages",
    month = may,
    year = "2026",
    url = "https://aclanthology.org/2026.rail-1.4/",
    doi = "10.18653/v1/2026.rail-1.4",
    pages = "12--20",
    abstract = "We release Bambara speech recorded with communities in Mali, Africa: 88{\%} of it is new, a 4.4{\texttimes} gain."
}
@inproceedings{smith-2026-hot,
    title = "Subject omission across {E}nglish varieties",
    author = "Smith, Jane",
    booktitle = "Proceedings of {UDW} 2026",
    year = "2026",
    url = "https://aclanthology.org/2026.udw-1.2/",
    abstract = "Southeast Asian varieties show more omission than African ones."
}
@inproceedings{old-2018-yoruba,
    title = "{Y}oruba diacritics",
    author = "Old, Author",
    booktitle = "Proceedings of an old workshop",
    year = "2018",
    url = "https://aclanthology.org/W18-0001/"
}
'''


def atom(entries, total):
    body = ''.join(f'''
  <entry>
    <id>http://arxiv.org/abs/{e['id']}v1</id>
    <published>{e['published']}T00:00:00Z</published>
    <title>{e['title']}</title>
    <summary>{e.get('summary', '')}</summary>
    <author><name>Ada Lovelace</name></author>
    <arxiv:primary_category term="cs.CL"/>
  </entry>''' for e in entries)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
      xmlns:arxiv="http://arxiv.org/schemas/atom">
  <opensearch:totalResults>{total}</opensearch:totalResults>{body}
</feed>'''


class Response(io.BytesIO):
    def __init__(self, body, headers=None):
        super().__init__(body if isinstance(body, bytes) else body.encode('utf-8'))
        self.headers = headers or {}

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class Opener:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append(request)
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


def candidate(identifier, title, *, source='ACL Anthology', year=2026, score=12, doi=None, url=None):
    url = url or f'https://example.org/{identifier}'
    return discovery.Candidate(
        id=identifier, source=source, title=title, authors=['A B'], year=year, venue='V',
        abstract='', url=url, doi=doi, zotero_source=url, zotero_source_type='url', score=score,
        identifiers=discovery.identifiers_for(doi, url, title))


class TextTests(unittest.TestCase):
    def test_latex_becomes_unicode(self):
        self.assertEqual(
            discovery.latex_to_text(r"{\c{C}}a{\u{g}}r{\i} Tom{\'a}{\v{s}} \'{\i} Q\&A {W}olof{'}s ``hot{--}cool''"),
            'Çağrı Tomáš í Q&A Wolof’s “hot–cool”')
        self.assertEqual(discovery.latex_to_text(r'88{\%}, 4.4{\texttimes}, \emph{Ajami} and \url{https://x.org}'),
                         '88%, 4.4×, Ajami and https://x.org')
        # Zotero's own BibTeX import mangles these two ("p ensuremath< 0.05", "Yor `ub 'a").
        self.assertEqual(discovery.latex_to_text(r"p \ensuremath{<} 0.05 in Yor{\`u}b{\'a}"),
                         'p < 0.05 in Yorùbá')

    def test_keywords_match_names_and_demonyms_only(self):
        for text in ('African NLP', 'Nigerian Pidgin', 'Ghanaian radio', 'Togolese press',
                     'Maghrebi dialects', 'Fon speech', 'sub-Saharan archives'):
            self.assertTrue(discovery.keyword_hits(text), text)
        for text in ('Malicious content', 'Fonts and glyphs', 'Papua New Guinea', 'Chadwick'):
            self.assertFalse(discovery.keyword_hits(text), text)

    def test_screen_never_rejects_what_keywords_match(self):
        for text in ('Burkina Faso', 'The Ivorian press', 'AFRICAN', 'Kiswahili', "N'Ko script"):
            self.assertTrue(discovery.may_mention_africa(text), text)
        self.assertFalse(discovery.may_mention_africa('Subject omission in German'))

    def test_a_passing_mention_scores_zero(self):
        self.assertEqual(discovery.relevance('English varieties', 'more than African ones'), 0)
        self.assertGreater(discovery.relevance('Speech for Wolof', ''), 0)
        self.assertGreater(discovery.relevance('Speech', 'Wolof, Bambara and Fula in Senegal'), 0)


class AclTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.run_dir = Path(self.directory.name)

    def tearDown(self):
        self.directory.cleanup()

    def test_keeps_recent_relevant_papers_with_their_bibtex(self):
        found = list(discovery.acl_candidates(BIB, 2020))
        self.assertEqual([c.id for c in found], ['acl:2026.rail-1.4'])
        paper = found[0]
        self.assertEqual(paper.authors, ['Aminata Diallo', 'Moussa Touré'])
        self.assertEqual(paper.zotero_source_type, 'csl_json')
        [csl] = json.loads(paper.zotero_source)
        self.assertEqual(csl['type'], 'paper-conference')
        self.assertEqual(csl['id'], 'diallo-etal-2026-bambara')
        self.assertEqual(csl['author'], [{'family': 'Diallo', 'given': 'Aminata'},
                                         {'family': 'Touré', 'given': 'Moussa'}])
        self.assertEqual(csl['issued'], {'date-parts': [[2026, 5]]})
        self.assertEqual(csl['page'], '12-20')
        self.assertEqual(csl['DOI'], '10.18653/v1/2026.rail-1.4')
        # Zotero's BibTeX import would stop at the percent sign; CSL keeps the whole abstract.
        self.assertTrue(csl['abstract'].endswith('88% of it is new, a 4.4× gain.'))
        self.assertIn('acl:2026.rail-1.4', paper.identifiers)
        self.assertIn('doi:10.18653/v1/2026.rail-1.4', paper.identifiers)
        batch = discovery.batch_entry(paper, self.run_dir)
        record = Path(batch['zotero_source'])
        self.assertTrue(record.is_absolute())
        self.assertEqual(record.suffix, '.json')
        self.assertEqual(json.loads(record.read_text(encoding='utf-8')), json.loads(paper.zotero_source))

    def test_doi_with_or_without_v1_names_the_paper(self):
        for doi in ('10.18653/v1/2026.rail-1.4', '10.18653/2026.rail-1.4'):
            self.assertIn('acl:2026.rail-1.4', discovery.identifiers_for(doi=doi))

    def test_conditional_download_reuses_the_cache(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'dump.bib.gz'
            fresh = Opener(Response(gzip.compress(BIB.encode('utf-8')), {'ETag': '"v1"'}))
            self.assertIn('rail-1.4', discovery.download_acl_dump(path, opener=fresh))
            unchanged = Opener(urllib.error.HTTPError('u', 304, 'Not Modified', {}, None))
            self.assertIn('rail-1.4', discovery.download_acl_dump(path, opener=unchanged))
            self.assertEqual(unchanged.requests[0].get_header('If-none-match'), '"v1"')


class ArxivTests(unittest.TestCase):
    def test_pages_until_the_cutoff_year(self):
        page1 = atom([{'id': '2601.00001', 'published': '2026-01-05', 'title': 'Evaluating LLMs on Hausa'},
                      {'id': '2601.00002', 'published': '2026-01-04', 'title': 'Unrelated vision paper'}], 3)
        page2 = atom([{'id': '1912.00003', 'published': '2019-12-01', 'title': 'Old Yoruba paper'}], 3)
        opener = Opener(Response(page1), Response(page2))
        sleeps = []
        found = list(discovery.arxiv_candidates(2020, opener=opener, sleep=sleeps.append, log=lambda *_: None))
        self.assertEqual([c.id for c in found], ['arxiv:2601.00001'])
        self.assertEqual(found[0].zotero_source, 'https://arxiv.org/abs/2601.00001')
        self.assertEqual(sleeps, [discovery.ARXIV_DELAY_SECONDS])
        self.assertEqual(len(opener.requests), 2)

    def test_rate_limit_body_is_retried(self):
        page = atom([{'id': '2601.00001', 'published': '2026-01-05', 'title': 'Swahili corpus'}], 1)
        opener = Opener(Response('Rate exceeded.'), Response(page))
        sleeps = []
        entries, total = discovery.fetch_arxiv_page(0, opener=opener, sleep=sleeps.append)
        self.assertEqual((len(entries), total, sleeps), (1, 1, [discovery.ARXIV_BACKOFF_SECONDS]))

    def test_retry_after_is_honoured_up_to_a_cap(self):
        page = atom([{'id': '2601.00001', 'published': '2026-01-05', 'title': 'Swahili corpus'}], 1)
        throttled = urllib.error.HTTPError('u', 429, 'Too Many Requests', {'Retry-After': '9999'}, None)
        sleeps = []
        discovery.fetch_arxiv_page(0, opener=Opener(throttled, Response(page)), sleep=sleeps.append)
        self.assertEqual(sleeps, [discovery.ARXIV_MAX_WAIT_SECONDS])

    def test_an_error_page_is_not_an_empty_result(self):
        with self.assertRaises(discovery.DiscoveryError):
            discovery.parse_arxiv_feed('<feed xmlns="http://www.w3.org/2005/Atom"></feed>')


class SelectionTests(unittest.TestCase):
    def test_deduplicates_against_library_ledger_and_sources(self):
        acl = candidate('acl:2026.rail-1.4', 'Bambara Speech', doi='10.18653/v1/2026.rail-1.4')
        arxiv_copy = candidate('arxiv:2601.00009', 'Bambara speech!', source='arXiv',
                               url='https://arxiv.org/abs/2601.00009')
        known = candidate('arxiv:2601.00001', 'Already cited', source='arXiv',
                          url='https://arxiv.org/abs/2601.00001')
        ledgered = candidate('acl:2025.x-1.1', 'Rejected before')
        references = [{'title': 'Something else', 'URL': 'https://arxiv.org/abs/2601.00001v2'}]
        selected, available, skipped = discovery.select_candidates(
            [arxiv_copy, known, ledgered, acl], discovery.known_identifiers(references),
            {'acl:2025.x-1.1'}, 10)
        self.assertEqual([c.id for c in selected], ['acl:2026.rail-1.4'])
        self.assertEqual((available, skipped), (1, 3))

    def test_ranks_title_matches_then_recency_and_caps(self):
        items = [candidate('a', 'A', year=2026, score=3), candidate('b', 'B', year=2021, score=30),
                 candidate('c', 'C', year=2025, score=11)]
        selected, available, _ = discovery.select_candidates(items, set(), set(), 2)
        self.assertEqual([c.id for c in selected], ['c', 'b'])
        self.assertEqual(available, 3)


class RecordTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)
        self.run = self.root / 'run'
        self.ledger = self.root / 'ledger.json'
        selected = [candidate('acl:1', 'Kept'), candidate('acl:2', 'Dropped'),
                    candidate('acl:3', 'Kept but Zotero failed')]
        discovery.write_run(selected, {'Wolof': 3}, 2, self.run, since=2020, totals={})
        self.args = argparse.Namespace(run_dir=self.run, ledger=self.ledger)

    def tearDown(self):
        self.directory.cleanup()

    def decide(self, number, decisions):
        discovery.write_json(self.run / f'decisions-{number:02d}.json', decisions)

    def test_queue_then_record_proposals_rejections_and_failed_writes(self):
        self.decide(1, [
            {'id': 'acl:1', 'decision': 'include', 'score': 5, 'reason': 'Core.', 'tags': ['Wolof']},
            {'id': 'acl:2', 'decision': 'exclude', 'score': 2, 'reason': 'Narrow.'}])
        self.decide(2, [{'id': 'acl:3', 'decision': 'include', 'score': 4, 'reason': 'Useful.',
                         'tags': ['AI']}])
        first = discovery.queue(self.args, log=lambda *_: None)
        self.assertEqual(first['queued'], 2)
        rows = json.loads(Path(first['queue']).read_text(encoding='utf-8'))
        self.assertEqual([row['id'] for row in rows], ['acl:1', 'acl:3'])
        self.assertEqual(rows[0]['tags'], ['Wolof'])
        discovery.write_json(self.run / 'zotero-results-01.json', [
            {'id': 'acl:1', 'status': 'added', 'key': 'K1'},
            {'id': 'acl:3', 'status': 'failed', 'error': 'operation in progress'}])
        second = discovery.queue(self.args, log=lambda *_: None)
        self.assertTrue(second['queue'].endswith('zotero-queue-02.json'))
        self.assertEqual([row['id'] for row in json.loads(Path(second['queue']).read_text(encoding='utf-8'))],
                         ['acl:3'])

        result = discovery.record(self.args, log=lambda *_: None)
        self.assertEqual(result, {'proposed': 1, 'rejected': 1, 'retry': 1, 'pending': []})
        entries = json.loads(self.ledger.read_text(encoding='utf-8'))['entries']
        self.assertEqual(entries['acl:1']['status'], 'proposed')
        self.assertEqual(entries['acl:1']['zotero_key'], 'K1')
        self.assertEqual(entries['acl:2']['status'], 'rejected')
        self.assertNotIn('acl:3', entries)
        self.assertIn('Kept but Zotero failed', (self.run / 'report.md').read_text(encoding='utf-8'))

        discovery.write_json(self.run / 'zotero-results-02.json',
                             [{'id': 'acl:3', 'status': 'existing', 'key': 'K3'}])
        self.assertEqual(discovery.record(self.args, log=lambda *_: None)['proposed'], 2)
        self.assertEqual(discovery.queue(self.args, log=lambda *_: None)['queued'], 0)

    def test_rejects_results_for_unknown_papers_or_without_keys(self):
        self.decide(1, [{'id': 'acl:1', 'decision': 'include', 'score': 5, 'reason': 'Core.', 'tags': ['Wolof']},
                        {'id': 'acl:2', 'decision': 'exclude', 'score': 2, 'reason': 'Narrow.'}])
        self.decide(2, [{'id': 'acl:3', 'decision': 'exclude', 'score': 2, 'reason': 'Narrow.'}])
        for rows in ([{'id': 'acl:2', 'status': 'added', 'key': 'K2'}],
                     [{'id': 'acl:1', 'status': 'added'}],
                     [{'id': 'acl:1', 'status': 'maybe', 'key': 'K1'}]):
            discovery.write_json(self.run / 'zotero-results-01.json', rows)
            with self.subTest(rows=rows), self.assertRaises(discovery.DiscoveryError):
                discovery.record(self.args, log=lambda *_: None)

    def test_queue_waits_for_every_batch(self):
        self.decide(1, [{'id': 'acl:1', 'decision': 'exclude', 'score': 1, 'reason': 'No.'},
                        {'id': 'acl:2', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}])
        self.assertEqual(discovery.queue(self.args, log=lambda *_: None)['pending'], ['batch-02.json'])

    def test_missing_decisions_leave_the_batch_pending(self):
        self.decide(1, [{'id': 'acl:1', 'decision': 'exclude', 'score': 1, 'reason': 'No.'},
                        {'id': 'acl:2', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}])
        result = discovery.record(self.args, log=lambda *_: None)
        self.assertEqual(result['pending'], ['batch-02.json'])

    def test_rejects_incomplete_or_foreign_decisions(self):
        bad_sets = [
            [{'id': 'acl:1', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}],
            [{'id': 'acl:1', 'decision': 'exclude', 'score': 1, 'reason': 'No.'},
             {'id': 'acl:9', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}],
            [{'id': 'acl:1', 'decision': 'include', 'score': 5, 'reason': 'Yes.'},
             {'id': 'acl:2', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}],
            [{'id': 'acl:1', 'decision': 'exclude', 'score': True, 'reason': 'No.'},
             {'id': 'acl:2', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}],
            [{'id': 'acl:1', 'decision': 'maybe', 'score': 3, 'reason': '?'},
             {'id': 'acl:2', 'decision': 'exclude', 'score': 1, 'reason': 'No.'}],
        ]
        for decisions in bad_sets:
            self.decide(1, decisions)
            with self.subTest(decisions=decisions), self.assertRaises(discovery.DiscoveryError):
                discovery.record(self.args, log=lambda *_: None)
        self.assertFalse(self.ledger.exists())


class HarvestTests(unittest.TestCase):
    def test_offline_harvest_writes_batches_and_vocabulary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            references = root / 'references.json'
            references.write_text(json.dumps([{'title': 'X', 'tags': ['Wolof', 'AI']},
                                              {'title': 'Y', 'tags': ['AI']}]), encoding='utf-8')
            args = argparse.Namespace(
                references=references, ledger=root / 'ledger.json', sources={'acl'}, since=2020,
                max=10, batch_size=1, run_dir=root / 'run', cache_dir=root / 'cache')
            opener = Opener(Response(gzip.compress(BIB.encode('utf-8'))))
            manifest = discovery.harvest(args, opener=opener, log=lambda *_: None)
            self.assertEqual(manifest['selected'], 1)
            batch = json.loads((root / 'run/batch-01.json').read_text(encoding='utf-8'))
            self.assertEqual(batch[0]['id'], 'acl:2026.rail-1.4')
            vocabulary = json.loads((root / 'run/vocabulary.json').read_text(encoding='utf-8'))
            self.assertEqual(vocabulary, {'AI': 2, 'Wolof': 1})

    def test_an_arxiv_outage_keeps_the_acl_harvest(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            references = root / 'references.json'
            references.write_text('[]', encoding='utf-8')
            args = argparse.Namespace(
                references=references, ledger=root / 'ledger.json', sources={'acl', 'arxiv'},
                since=2020, max=10, batch_size=5, run_dir=root / 'run', cache_dir=root / 'cache')
            outage = [urllib.error.HTTPError('u', 503, 'Unavailable', {}, None) for _ in range(5)]
            opener = Opener(Response(gzip.compress(BIB.encode('utf-8'))), *outage)
            manifest = discovery.harvest(args, opener=opener, sleep=lambda _s: None, log=lambda *_: None)
            self.assertEqual(manifest['selected'], 1)
            self.assertEqual(len(manifest['warnings']), 1)
            self.assertIn('arXiv incomplete', manifest['warnings'][0])


if __name__ == '__main__':
    unittest.main()
