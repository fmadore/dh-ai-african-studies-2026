"""Refresh the bibliography only after a complete, consistent Zotero download.

Configuration is loaded by main(), so importing this module never requires a key.
HTTP and sleep functions are injectable for offline regression tests. API details:
https://www.zotero.org/support/dev/web_api/v3/basics
"""

import argparse
from dataclasses import dataclass
import json
import os
from pathlib import Path
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT / 'src/lib/data/references.json'
MAX_RETRIES = 3
MAX_WAIT_SECONDS = 30


class RefreshError(ValueError):
    """The download cannot safely replace the published bibliography."""


@dataclass(frozen=True)
class Config:
    api_key: str
    user_id: str = '3161450'
    collection_id: str = 'FI8KEUSF'

    @property
    def base_url(self):
        user = urllib.parse.quote(self.user_id, safe='')
        collection = urllib.parse.quote(self.collection_id, safe='')
        return f'https://api.zotero.org/users/{user}/collections/{collection}/items/top'


def load_env(env_path=ROOT / '.env'):
    values = {}
    if Path(env_path).exists():
        for line in Path(env_path).read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                value = value.strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in '\"\'':
                    value = value[1:-1]
                values[key.strip()] = value
    return values


def load_config(environ=None, env_path=ROOT / '.env'):
    # CI and one-off environment variables take precedence over the local file.
    environ = os.environ if environ is None else environ
    env = {**load_env(env_path), **{k: v for k, v in environ.items() if k.startswith('ZOTERO_')}}
    key = env.get('ZOTERO_API_KEY', '').strip()
    if not key:
        raise RefreshError('ZOTERO_API_KEY not found in the environment or the .env file')
    return Config(key, env.get('ZOTERO_USER_ID', '3161450'), env.get('ZOTERO_COLLECTION_ID', 'FI8KEUSF'))


def integer_header(headers, name):
    value = headers.get(name.lower())
    if value is None:
        return None
    if not str(value).isascii() or not str(value).isdigit():
        raise RefreshError(f'Invalid {name} response header')
    return int(value)


def wait_for_server(headers, sleep, default=0):
    delay = max(
        integer_header(headers, 'Retry-After') or 0,
        integer_header(headers, 'Backoff') or 0,
        default,
    )
    if delay > MAX_WAIT_SECONDS:
        # Do not retry sooner than the server permits, or block a CLI indefinitely.
        raise RefreshError(f'Zotero requested a {delay}s wait; rerun the refresh later')
    if delay:
        sleep(delay)


def fetch_url(url, config, *, opener=urllib.request.urlopen, sleep=time.sleep):
    """Return JSON and case-normalized headers; retry only transient HTTP errors."""
    request = urllib.request.Request(url, headers={
        'User-Agent': 'dh-ai-african-studies-2026 fetch_references',
        'Zotero-API-Key': config.api_key,
        'Zotero-API-Version': '3',
    })
    for attempt in range(MAX_RETRIES + 1):
        try:
            with opener(request, timeout=30) as response:
                headers = {key.lower(): value for key, value in response.headers.items()}
                payload = json.loads(response.read().decode('utf-8'))
            # Backoff can occur on successful responses too.
            wait_for_server(headers, sleep)
            return payload, headers
        except urllib.error.HTTPError as error:
            headers = {key.lower(): value for key, value in error.headers.items()} if error.headers else {}
            retryable = error.code == 429 or 500 <= error.code < 600
            error.close()
            if not retryable or attempt == MAX_RETRIES:
                raise
            wait_for_server(headers, sleep, default=2 ** attempt)
    raise AssertionError('Unreachable retry state')


@dataclass
class Snapshot:
    """Check all pages and both formats against the same available API headers."""
    version: int | None = None
    total: int | None = None

    def observe(self, headers):
        for field, header in (('version', 'Last-Modified-Version'), ('total', 'Total-Results')):
            value = integer_header(headers, header)
            previous = getattr(self, field)
            if value is not None:
                if previous is not None and value != previous:
                    raise RefreshError(f'{header} changed during refresh; rerun against a stable collection')
                setattr(self, field, value)


def require_string(value, label):
    if not isinstance(value, str) or not value.strip():
        raise RefreshError(f'{label} must be a nonempty string')
    return value


def csl_key(item):
    identifier = require_string(item.get('id'), 'CSL id')
    # Zotero exports have used USER/KEY, USER_KEY, and bare keys.
    return require_string(identifier.rsplit('/', 1)[-1].rsplit('_', 1)[-1], 'CSL item key')


def validate_items(payload, format_type):
    # CSL exports can use {"items": [...]}; an arbitrary object is never an empty page.
    if format_type == 'csljson' and isinstance(payload, dict) and 'items' in payload:
        payload = payload['items']
    if not isinstance(payload, list):
        raise RefreshError(f'{format_type} response must contain an item array')
    for item in payload:
        if not isinstance(item, dict):
            raise RefreshError(f'{format_type} item must be an object')
        if format_type == 'csljson':
            csl_key(item)
            for field in ('type', 'title'):
                require_string(item.get(field), f'CSL {field}')
            for field in ('DOI', 'URL'):
                if item.get(field) is not None and not isinstance(item[field], str):
                    raise RefreshError(f'CSL {field} must be a string')
        else:
            key = require_string(item.get('key'), 'Zotero key')
            data = item.get('data')
            if not isinstance(data, dict):
                raise RefreshError(f'Zotero data for {key} must be an object')
            if data.get('key', key) != key:
                raise RefreshError(f'Zotero item and data keys disagree for {key}')
            tags = data.get('tags')
            if not isinstance(tags, list):
                raise RefreshError(f'Zotero tags for {key} must be an array')
            for tag in tags:
                if not isinstance(tag, dict):
                    raise RefreshError(f'Zotero tag for {key} must be an object')
                require_string(tag.get('tag'), f'Zotero tag for {key}')
            for field in ('DOI', 'url'):
                if data.get(field) is not None and not isinstance(data[field], str):
                    raise RefreshError(f'Zotero {field} for {key} must be a string')
    return payload


def fetch_all_items(format_type, config, snapshot, *, opener=urllib.request.urlopen, sleep=time.sleep, limit=100):
    if format_type not in ('csljson', 'json'):
        raise ValueError('Unsupported Zotero format')
    if not 1 <= limit <= 100:
        raise ValueError('Zotero page size must be between 1 and 100')
    all_items = []
    keys = set()
    while True:
        query = urllib.parse.urlencode({
            'format': format_type, 'limit': limit, 'start': len(all_items),
            'sort': 'dateAdded', 'direction': 'asc',
        })
        payload, headers = fetch_url(f'{config.base_url}?{query}', config, opener=opener, sleep=sleep)
        snapshot.observe(headers)
        items = validate_items(payload, format_type)
        if len(items) > limit:
            raise RefreshError(f'{format_type} page exceeds requested limit')
        for item in items:
            key = csl_key(item) if format_type == 'csljson' else item['key']
            if key in keys:
                raise RefreshError(f'Duplicate {format_type} item key: {key}')
            keys.add(key)
        all_items.extend(items)
        if snapshot.total is not None:
            if len(all_items) > snapshot.total:
                raise RefreshError(f'{format_type} returned more items than Total-Results')
            if len(all_items) == snapshot.total:
                return all_items
        if len(items) < limit:
            if snapshot.total is not None and len(all_items) != snapshot.total:
                raise RefreshError(f'{format_type} ended before Total-Results was reached')
            return all_items


def merge_references(csl_data, zotero_data):
    metadata = {item['key']: item['data'] for item in zotero_data}
    csl_keys = {csl_key(item) for item in csl_data}
    if csl_keys != metadata.keys():
        missing = sorted(csl_keys - metadata.keys())
        extra = sorted(metadata.keys() - csl_keys)
        raise RefreshError(f'CSL/metadata item keys differ (missing metadata: {missing}; extra metadata: {extra})')
    cleaned = []
    for source in sorted(csl_data, key=csl_key):
        item = dict(source)
        data = metadata[csl_key(item)]
        item['tags'] = sorted({tag['tag'] for tag in data['tags'] if tag['tag'] != 'Non lu'})
        doi = data.get('DOI') or item.get('DOI')
        url = data.get('url') or item.get('URL')
        if doi:
            item['DOI'] = doi
        if url:
            item['URL'] = url
        elif doi:
            item['URL'] = f'https://doi.org/{doi}'
        cleaned.append(item)
    return cleaned


def atomic_write(output, data):
    """Serialize first, then replace from the same filesystem after a full write."""
    contents = json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True, allow_nan=False) + '\n'
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', newline='\n',
                                         dir=output.parent, prefix=f'.{output.name}.', suffix='.tmp', delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(contents)
            stream.flush()
            os.fsync(stream.fileno())
        if output.exists():
            temporary.chmod(output.stat().st_mode & 0o777)
        os.replace(temporary, output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def fetch_references(config, output=OUTPUT_FILE, *, allow_empty=False,
                     opener=urllib.request.urlopen, sleep=time.sleep, limit=100):
    snapshot = Snapshot()
    csl_data = fetch_all_items('csljson', config, snapshot, opener=opener, sleep=sleep, limit=limit)
    zotero_data = fetch_all_items('json', config, snapshot, opener=opener, sleep=sleep, limit=limit)
    cleaned = merge_references(csl_data, zotero_data)
    if not cleaned and not allow_empty:
        raise RefreshError('Refusing an empty bibliography; use --allow-empty only for an intentionally empty collection')
    atomic_write(output, cleaned)
    return len(cleaned)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--allow-empty', action='store_true', help='Allow an intentionally empty collection to replace the bibliography')
    parser.add_argument('--output', type=Path, default=OUTPUT_FILE, help='Destination JSON path')
    args = parser.parse_args(argv)
    try:
        count = fetch_references(load_config(), args.output, allow_empty=args.allow_empty)
    except (OSError, ValueError, urllib.error.URLError) as error:
        print(f'Reference refresh failed: {error}', file=sys.stderr)
        return 1
    print(f'Successfully saved {count} references with tags to {args.output}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
