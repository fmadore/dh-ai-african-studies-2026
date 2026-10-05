"""Offline regression coverage for destructive Zotero refresh failure modes."""

import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
import urllib.error
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parents[2]
# A bare environment proves no credentials leak in. Windows still needs
# SYSTEMROOT, or importing asyncio fails to load Winsock (WinError 10106).
BARE_ENV = {'SYSTEMROOT': os.environ['SYSTEMROOT']} if os.name == 'nt' else {}
sys.path.insert(0, str(ROOT))
from scripts import fetch_references as refresh


def csl(key, **fields):
    return {'id': f'3161450/{key}', 'title': f'Title {key}', 'type': 'book', **fields}


def zotero(key, **fields):
    return {'key': key, 'data': {'key': key, 'tags': [], **fields}}


class Response:
    def __init__(self, payload, headers=None):
        self.payload = payload
        self.headers = headers or {}

    def read(self):
        return json.dumps(self.payload).encode('utf-8')

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class HTTPFixture:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append(request)
        if not self.responses:
            raise AssertionError('Unexpected HTTP request')
        response = self.responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


class ReferenceRefreshTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.output = Path(self.directory.name) / 'references.json'
        self.output.write_text('previous published bibliography\n', encoding='utf-8')
        self.original = self.output.read_bytes()
        self.config = refresh.Config('test-secret-not-a-real-key')
        self.sleep = mock.Mock()

    def run_refresh(self, fixture, **kwargs):
        return refresh.fetch_references(self.config, self.output, opener=fixture, sleep=self.sleep, **kwargs)

    def assert_preserved(self):
        self.assertEqual(self.output.read_bytes(), self.original)
        self.assertEqual(list(self.output.parent.glob('.*.tmp')), [])

    def test_import_and_help_need_no_credentials(self):
        # Import has no .env reads or network requests. Help exits before configuration.
        result = subprocess.run([
            sys.executable, '-c',
            'from pathlib import Path\nfrom unittest.mock import patch\n'
            'with patch.object(Path, "exists", side_effect=AssertionError("Unexpected config access")):\n'
            '    from scripts import fetch_references\n',
        ], capture_output=True, text=True, env=BARE_ENV, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr)
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/fetch_references.py'), '--help'],
                                capture_output=True, text=True, env=BARE_ENV)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('--allow-empty', result.stdout)
        self.assertIn('--output', result.stdout)

    def test_environment_overrides_dotenv_and_quoted_values_are_unwrapped(self):
        dotenv = self.output.parent / '.env'
        dotenv.write_text('ZOTERO_API_KEY="file-key"\nZOTERO_USER_ID=123\n', encoding='utf-8')
        self.assertEqual(refresh.load_config({}, dotenv).api_key, 'file-key')
        config = refresh.load_config({'ZOTERO_API_KEY': 'environment-key'}, dotenv)
        self.assertEqual(config.api_key, 'environment-key')
        self.assertEqual(config.user_id, '123')
        with self.assertRaises(refresh.RefreshError):
            refresh.load_config({'ZOTERO_API_KEY': ''}, dotenv)

    def test_pagination_merge_and_secret_header(self):
        headers = {'Total-Results': '3', 'Last-Modified-Version': '7'}
        fixture = HTTPFixture(
            Response({'items': [csl('CCC', DOI='10.123/test'), csl('AAA')]}, headers),
            Response([csl('BBB')], headers),
            Response([zotero('BBB'), zotero('CCC', tags=[{'tag': 'Z'}, {'tag': 'Non lu'}, {'tag': 'A'}, {'tag': 'Z'}])], headers),
            Response([zotero('AAA', DOI='10.456/override', url='https://example.test/article')], headers),
        )
        self.assertEqual(self.run_refresh(fixture, limit=2), 3)
        saved = json.loads(self.output.read_text(encoding='utf-8'))
        self.assertEqual([item['id'] for item in saved], ['3161450/AAA', '3161450/BBB', '3161450/CCC'])
        self.assertEqual(saved[2]['tags'], ['A', 'Z'])
        self.assertEqual(saved[2]['URL'], 'https://doi.org/10.123/test')
        self.assertEqual(saved[0]['DOI'], '10.456/override')
        self.assertEqual(saved[0]['URL'], 'https://example.test/article')
        self.assertEqual([parse_qs(urlsplit(r.full_url).query)['start'][0] for r in fixture.requests], ['0', '2', '0', '2'])
        for request in fixture.requests:
            self.assertNotIn(self.config.api_key, request.full_url)
            headers = {key.lower(): value for key, value in request.header_items()}
            self.assertEqual(headers['zotero-api-key'], self.config.api_key)
            self.assertEqual(headers['zotero-api-version'], '3')
        self.assertEqual(fixture.responses, [])

    def test_pagination_without_headers_fetches_empty_final_page(self):
        fixture = HTTPFixture(Response([csl('A')]), Response([]), Response([zotero('A')]), Response([]))
        self.assertEqual(self.run_refresh(fixture, limit=1), 1)
        self.assertEqual(len(fixture.requests), 4)

    def test_malformed_response_and_metadata_never_replace_output(self):
        cases = [
            ({'error': 'backend failure'}, []),
            ({'items': None}, []),
            ([None], []),
            ([csl('')], []),
            ([csl('A', title=None)], []),
            ([csl('A', type=1)], []),
            ([csl('A', URL=[])], []),
            ([csl('A')], {'items': [zotero('A')]}),
            ([csl('A')], [{'key': 'A'}]),
            ([csl('A')], [zotero('A', tags=None)]),
            ([csl('A')], [zotero('A', tags=[{}])]),
            ([csl('A')], [zotero('A', DOI=[])]),
            ([csl('A')], [{'key': 'A', 'data': {'key': 'B', 'tags': []}}]),
        ]
        for csl_payload, metadata_payload in cases:
            with self.subTest(csl=csl_payload, metadata=metadata_payload):
                fixture = HTTPFixture(Response(csl_payload), Response(metadata_payload))
                with self.assertRaises(refresh.RefreshError):
                    self.run_refresh(fixture)
                self.assert_preserved()

    def test_duplicate_keys_across_pages_and_identifier_formats_are_rejected(self):
        fixture = HTTPFixture(Response([csl('A')]), Response([csl('A', id='3161450_A')]))
        with self.assertRaisesRegex(refresh.RefreshError, 'Duplicate'):
            self.run_refresh(fixture, limit=1)
        self.assert_preserved()

    def test_duplicate_metadata_keys_are_rejected(self):
        fixture = HTTPFixture(Response([csl('A')]), Response([zotero('A'), zotero('A')]))
        with self.assertRaisesRegex(refresh.RefreshError, 'Duplicate'):
            self.run_refresh(fixture)
        self.assert_preserved()

    def test_missing_and_extra_metadata_are_rejected(self):
        for metadata in ([], [zotero('B')], [zotero('A'), zotero('B')]):
            with self.subTest(metadata=metadata):
                with self.assertRaisesRegex(refresh.RefreshError, 'keys differ'):
                    self.run_refresh(HTTPFixture(Response([csl('A')]), Response(metadata)))
                self.assert_preserved()

    def test_changed_library_version_between_pages_or_formats_is_rejected(self):
        for limit in (1, 100):
            with self.subTest(limit=limit):
                fixture = HTTPFixture(Response([csl('A')], {'Last-Modified-Version': '3'}),
                                      Response([zotero('A')], {'Last-Modified-Version': '4'}))
                with self.assertRaisesRegex(refresh.RefreshError, 'Last-Modified-Version changed'):
                    self.run_refresh(fixture, limit=limit)
                self.assert_preserved()

    def test_total_count_mismatch_and_invalid_headers_are_rejected(self):
        for headers in ({'Total-Results': '2'}, {'Total-Results': '0'}, {'Total-Results': 'invalid'}, {'Last-Modified-Version': '-1'}):
            with self.subTest(headers=headers):
                with self.assertRaises(refresh.RefreshError):
                    self.run_refresh(HTTPFixture(Response([csl('A')], headers)))
                self.assert_preserved()

    def test_count_changes_between_formats_are_rejected(self):
        fixture = HTTPFixture(Response([csl('A')], {'Total-Results': '1'}),
                              Response([zotero('A')], {'Total-Results': '2'}))
        with self.assertRaisesRegex(refresh.RefreshError, 'Total-Results changed'):
            self.run_refresh(fixture)
        self.assert_preserved()

    def test_empty_collection_requires_explicit_opt_in(self):
        with self.assertRaisesRegex(refresh.RefreshError, '--allow-empty'):
            self.run_refresh(HTTPFixture(Response([]), Response([])))
        self.assert_preserved()
        self.assertEqual(self.run_refresh(HTTPFixture(Response([]), Response([])), allow_empty=True), 0)
        self.assertEqual(json.loads(self.output.read_text()), [])

    def test_failed_second_pass_preserves_published_file(self):
        fixture = HTTPFixture(Response([csl('A')]), urllib.error.URLError('connection lost'))
        with self.assertRaises(urllib.error.URLError):
            self.run_refresh(fixture)
        self.assert_preserved()

    def test_output_is_identical_for_reordered_inputs_and_does_not_mutate_them(self):
        item = csl('B')
        self.run_refresh(HTTPFixture(Response([item, csl('A')]), Response([zotero('A'), zotero('B', tags=[{'tag': 'z'}, {'tag': 'a'}])])))
        first_output = self.output.read_bytes()
        self.run_refresh(HTTPFixture(Response([csl('A'), item]), Response([zotero('B', tags=[{'tag': 'a'}, {'tag': 'z'}]), zotero('A')])))
        self.assertEqual(self.output.read_bytes(), first_output)
        self.assertNotIn('tags', item)

    def test_failed_atomic_replace_preserves_output_and_cleans_temporary_file(self):
        fixture = HTTPFixture(Response([csl('A')]), Response([zotero('A')]))
        with mock.patch.object(refresh.os, 'replace', side_effect=OSError('disk error')):
            with self.assertRaises(OSError):
                self.run_refresh(fixture)
        self.assert_preserved()

    def test_rate_limits_and_transient_errors_retry_with_bounded_waits(self):
        for status, headers, expected_wait in ((429, {'Retry-After': '4'}, 4), (503, {}, 1)):
            with self.subTest(status=status):
                fixture = HTTPFixture(urllib.error.HTTPError('https://api.zotero.org/', status, 'temporary', headers, None),
                                      Response([csl('A')]), Response([zotero('A')]))
                self.run_refresh(fixture)
                self.sleep.assert_called_with(expected_wait)
                self.assertEqual(len(fixture.requests), 3)

    def test_successful_response_backoff_is_respected(self):
        self.run_refresh(HTTPFixture(Response([csl('A')], {'Backoff': '3'}), Response([zotero('A')])))
        self.sleep.assert_called_once_with(3)

    def test_long_wait_and_permanent_http_errors_fail_without_retry(self):
        for status, headers, error_type in ((429, {'Retry-After': '300'}, refresh.RefreshError), (403, {}, urllib.error.HTTPError)):
            with self.subTest(status=status):
                fixture = HTTPFixture(urllib.error.HTTPError('https://api.zotero.org/', status, 'failure', headers, None))
                with self.assertRaises(error_type):
                    self.run_refresh(fixture)
                self.assertEqual(len(fixture.requests), 1)
                self.assert_preserved()
        self.sleep.assert_not_called()

    def test_retry_budget_is_finite_and_preserves_output(self):
        fixture = HTTPFixture(*[urllib.error.HTTPError('https://api.zotero.org/', 503, 'failure', {}, None)
                                for _ in range(refresh.MAX_RETRIES + 1)])
        with self.assertRaises(urllib.error.HTTPError):
            self.run_refresh(fixture)
        self.assertEqual(self.sleep.call_args_list, [mock.call(1), mock.call(2), mock.call(4)])
        self.assert_preserved()

    def test_cli_failure_is_nonzero_without_replacing_output(self):
        with mock.patch.object(refresh, 'load_config', side_effect=refresh.RefreshError('missing key')):
            with contextlib.redirect_stderr(io.StringIO()) as stderr:
                self.assertEqual(refresh.main(['--output', str(self.output)]), 1)
        self.assertIn('missing key', stderr.getvalue())
        self.assert_preserved()


if __name__ == '__main__':
    unittest.main()
