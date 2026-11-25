"""Harvest candidate references from the ACL Anthology and arXiv, and record triage decisions.

The pipeline (orchestrated by the ``discover-references`` skill):

1. ``harvest`` downloads the ACL Anthology BibTeX dump (cached, conditional GET) and
   queries the arXiv API, keeps papers that are substantively about Africa or African
   languages, drops anything already in the bibliography, the review ledger or the
   current run, and writes batches to ``.cache/reference-discovery/run/``.
2. Haiku triage agents (``.claude/agents/reference-triage.md``), one per batch and in
   parallel, write ``decisions-NN.json``: include or exclude, score, reason, tags.
3. ``queue`` lists the inclusions not yet in Zotero in ``zotero-queue-NN.json``.
4. One Haiku writer agent (``.claude/agents/reference-zotero-writer.md``) adds them to
   Zotero's "À valider" subcollection through the Zotero MCP server, sequentially, and
   writes ``zotero-results-NN.json``.
5. ``record`` folds decisions and results into the committed ledger, so a paper is
   never triaged twice. An inclusion that never reached Zotero stays out of it.

Only the standard library is used. HTTP and sleep are injectable for offline tests.
arXiv asks for at most one request every three seconds: https://info.arxiv.org/help/api/tou.html
"""

import argparse
from dataclasses import dataclass, field
import datetime
import gzip
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
REFERENCES_FILE = ROOT / 'src/lib/data/references.json'
LEDGER_FILE = ROOT / 'scripts/reference-discovery-ledger.json'
CACHE_DIR = ROOT / '.cache/reference-discovery'
RUN_DIR = CACHE_DIR / 'run'
ACL_DUMP_URL = 'https://aclanthology.org/anthology+abstracts.bib.gz'
ARXIV_API_URL = 'https://export.arxiv.org/api/query'
USER_AGENT = 'dh-ai-african-studies-2026 reference discovery'
# arXiv throttles harder than its documented 3 s (429s even 5 s after a reply), and a page of
# this long query takes ~45 s to serve: ask for few, large pages and back off generously.
ARXIV_DELAY_SECONDS = 10
ARXIV_PAGE_SIZE = 500
ARXIV_BACKOFF_SECONDS = 30
ARXIV_MAX_WAIT_SECONDS = 300
ARXIV_MAX_RESULTS = 3000
ABSTRACT_LIMIT = 1800
MAX_AUTHORS = 12

ARXIV_CATEGORIES = ('cs.CL', 'cs.CY', 'cs.AI', 'cs.DL', 'cs.HC', 'cs.SD', 'eess.AS')

# Matched case-insensitively.
AFRICA_PATTERN = r'afric\w*|sub-saharan|pan-african\w*|afro-?\w+'
COUNTRIES = (
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cabo Verde',
    'Cape Verde', 'Chad', 'Comoros', 'Congo', "Côte d'Ivoire", 'Ivory Coast', 'Djibouti', 'Egypt',
    'Eritrea', 'Eswatini', 'Swaziland', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Kenya',
    'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius',
    'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé', 'Senegal',
    'Seychelles', 'Sierra Leone', 'Somalia', 'Somaliland', 'Sudan', 'Tanzania', 'Togo', 'Tunisia',
    'Uganda', 'Zambia', 'Zimbabwe', 'Maghreb', 'Sahel', 'Darija',
)
LANGUAGES = (
    'Swahili', 'Kiswahili', 'Yoruba', 'Yorùbá', 'Hausa', 'Igbo', 'Amharic', 'Tigrinya', 'Oromo',
    'Afaan Oromoo', 'Somali', 'Zulu', 'isiZulu', 'Xhosa', 'isiXhosa', 'Sesotho', 'Sotho', 'Setswana',
    'Tswana', 'Sepedi', 'Xitsonga', 'Tsonga', 'Tshivenda', 'Venda', 'Siswati', 'Ndebele', 'Shona',
    'chiShona', 'Chichewa', 'Nyanja', 'Bemba', 'Lingala', 'Kikongo', 'Kinyarwanda', 'Kirundi',
    'Luganda', 'Dholuo', 'Kikuyu', 'Gikuyu', 'Wolof', 'Bambara', 'Bamanankan', 'Fula', 'Fulfulde',
    'Pulaar', 'Fulani', 'Mandinka', 'Dyula', 'Mooré', 'Ewe', 'Fon', 'Twi', 'Akan', 'Fante',
    'Dagbani', 'Kanuri', 'Tamazight', 'Amazigh', 'Berber', 'Kabyle', 'Tamasheq', 'Malagasy',
    'Sango', 'Afrikaans', 'Efik', 'Ibibio', 'Krio', 'Ajami', "N'Ko", 'NKo', "Ge'ez", 'Tifinagh',
    'Zarma', 'Songhay', 'Medumba', 'Duala', 'Ewondo', 'Bamileke', 'Dinka', 'Nuer', 'Kalenjin',
    'Maasai', 'Tuareg', 'Coptic', 'Meroitic', 'Sidama', 'Wolaytta', 'Tigre', 'Kabiye', 'Mende',
    'Temne', 'Bassa', 'Kpelle', 'Dagaare', 'Gurune', 'Hadza', 'Khoekhoe', 'Khoisan', 'Nama',
    'Bantu', 'Nguni', 'Luo', 'Tiv', 'Ivorian', 'Burkinabe', 'Burkinabè',
)
# Proper nouns are matched case-sensitively so "fon" or "mali" in other senses stay out.
# Only demonym endings may follow ("Nigerian", "Ghanaian", "Togolese", "Maghrebi"), never
# an arbitrary stem: "Mali" must not match "Malicious". Papua New Guinea is excluded.
DEMONYM_SUFFIXES = ('', 'n', 'an', 'ian', 'ese', 'lese', 'i', 's')
_NAMES = '|'.join(re.escape(name) for name in sorted(COUNTRIES + LANGUAGES, key=len, reverse=True))
KEYWORDS = re.compile(
    rf'(?i:\b(?:{AFRICA_PATTERN})\b)|(?<!Papua New )\b(?:{_NAMES})(?:n|an|ian|ese|lese|i|s)?\b')
# KEYWORDS is slow over 78k Anthology entries; this token set rejects most of them first.
_SCREEN_WORDS = frozenset(
    word for name in COUNTRIES + LANGUAGES
    for word in ([name.split()[0]] if ' ' in name else [name + s for s in DEMONYM_SUFFIXES]))
_SCREEN_TOKEN = re.compile(r"[\w'’]+")


def may_mention_africa(text):
    """Cheap superset of KEYWORDS: False only when no keyword can match."""
    lowered = text.lower()
    if 'afric' in lowered or 'afro' in lowered or 'saharan' in lowered:
        return True
    return not _SCREEN_WORDS.isdisjoint(_SCREEN_TOKEN.findall(text))

ARXIV_TERMS = ('Africa', 'African', 'Swahili', 'Yoruba', 'Hausa', 'Igbo', 'Amharic', 'Tigrinya',
               'Oromo', 'Somali', 'isiZulu', 'Zulu', 'Xhosa', 'Wolof', 'Bambara', 'Kinyarwanda',
               'Luganda', 'Lingala', 'Shona', 'Twi', 'Akan', 'Ewe', 'Fon', 'Setswana', 'Sesotho',
               'Sepedi', 'Fulfulde', 'Tamazight', 'Amazigh', 'Malagasy', 'Nigerian', 'Kenyan',
               'Ethiopian', 'Ghanaian', 'Senegalese', 'Bantu', 'Ajami')

ATOM = {'a': 'http://www.w3.org/2005/Atom', 'arxiv': 'http://arxiv.org/schemas/atom',
        'os': 'http://a9.com/-/spec/opensearch/1.1/'}


class DiscoveryError(ValueError):
    """The harvest or the decisions cannot be trusted."""


# --- Text helpers -------------------------------------------------------------------------

_ACCENTS = {'"': '\u0308', "'": '\u0301', '`': '\u0300', '^': '\u0302', '~': '\u0303',
            '=': '\u0304', '.': '\u0307', 'c': '\u0327', 'v': '\u030c', 'u': '\u0306',
            'H': '\u030b', 'k': '\u0328', 'r': '\u030a', 'd': '\u0323', 'b': '\u0331'}
_SPECIALS = {r'\i': 'ı', r'\o': 'ø', r'\O': 'Ø', r'\ss': 'ß', r'\ae': 'æ', r'\AE': 'Æ',
             r'\oe': 'œ', r'\OE': 'Œ', r'\aa': 'å', r'\AA': 'Å', r'\l': 'ł', r'\L': 'Ł',
             r'\&': '&', r'\%': '%', r'\$': '$', r'\_': '_', r'\#': '#'}
_ACCENT_RE = re.compile(r"""\\(["'`^~=.]|[cvuHkrdb](?=[\s{]))\s*(?:\{\s*\\?([A-Za-z])\s*\}|\\?([A-Za-z]))""")


_TEXT_COMMANDS = {r'\texttimes': '×', r'\textendash': '–', r'\textemdash': '—', r'\ldots': '…',
                  r'\dots': '…', r'\textquoteright': '’', r'\textquoteleft': '‘',
                  r'\textquotedblleft': '“', r'\textquotedblright': '”', r'\textdegree': '°',
                  r'\textbullet': '•', r'\textpm': '±', r'\geq': '≥', r'\leq': '≤', r'\approx': '≈'}


def latex_to_text(value):
    """Turn the LaTeX the Anthology emits into plain Unicode for agents and logs."""
    text = _ACCENT_RE.sub(lambda m: (m.group(2) or m.group(3)) + _ACCENTS[m.group(1)], value)
    for command, char in _SPECIALS.items():
        # A letter command ends at a non-letter (\o vs \oe); a symbol escape ends at once.
        guard = r'(?![A-Za-z])' if command[-1].isalpha() else ''
        text = re.sub(re.escape(command) + guard, lambda _m, c=char: c, text)
    for command, char in _TEXT_COMMANDS.items():
        text = re.sub(re.escape(command) + r'(?![A-Za-z])\s*(?:\{\})?', lambda _m, c=char: c, text)
    text = text.replace('``', '“').replace("''", '”').replace('{--}', '–').replace('---', '—')
    text = text.replace('--', '–').replace("{'}", '’').replace('~', ' ')
    # Formatting commands (\emph{x}, \textit{x}, \url{x}) keep their argument.
    text = re.sub(r'\\[A-Za-z]+\*?\s*(?=\{)', '', text)
    text = text.replace('{', '').replace('}', '')
    return unicodedata.normalize('NFC', re.sub(r'\s+', ' ', text)).strip()


def normalize_title(title):
    folded = unicodedata.normalize('NFKD', title.casefold())
    return re.sub(r'[^a-z0-9]+', '', ''.join(c for c in folded if not unicodedata.combining(c)))


_TITLE_STOPWORDS = frozenset('a an the of for in and on to with from by via at is are'.split())


def title_words(title):
    folded = unicodedata.normalize('NFKD', title.casefold())
    folded = ''.join(c for c in folded if not unicodedata.combining(c))
    return set(re.findall(r'[a-z0-9]+', folded)) - _TITLE_STOPWORDS


def similar_titles(first, second, threshold):
    """Word-set overlap (Jaccard): a preprint's title is often reworded at publication."""
    a, b = title_words(first), title_words(second)
    return bool(a and b) and len(a & b) / len(a | b) >= threshold


def first_surname(authors):
    name = authors[0] if authors else ''
    folded = unicodedata.normalize('NFKD', name.split()[-1].casefold()) if name.split() else ''
    return ''.join(c for c in folded if not unicodedata.combining(c))


def keyword_hits(text):
    return len(KEYWORDS.findall(text or ''))


def relevance(title, abstract):
    """Return a prefilter score, or 0 when Africa is absent or only mentioned in passing."""
    in_title = keyword_hits(title)
    in_abstract = keyword_hits(abstract)
    if in_title == 0 and in_abstract < 3:
        return 0
    return 10 * in_title + in_abstract


# --- Known identifiers ------------------------------------------------------------------

ACL_URL_RE = re.compile(r'aclanthology\.org/([A-Za-z0-9.\-]+?)(?:\.pdf)?/?$')
# Anthology DOIs dropped the "v1/" segment in 2026: 10.18653/2026.findings-emnlp.1308.
ACL_DOI_RE = re.compile(r'^10\.18653/(?:v1/)?(.+)$', re.I)
ARXIV_RE = re.compile(r'arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5})|10\.48550/arxiv\.(\d{4}\.\d{4,5})', re.I)


def identifiers_for(doi=None, url=None, title=None):
    ids = set()
    if doi:
        doi = doi.strip().lower()
        ids.add(f'doi:{doi}')
        if match := ACL_DOI_RE.match(doi):
            ids.add(f'acl:{match.group(1)}')
    for value in (url, doi):
        if value and (match := ARXIV_RE.search(value)):
            ids.add(f'arxiv:{match.group(1) or match.group(2)}')
    if url and (match := ACL_URL_RE.search(url.strip())):
        ids.add(f'acl:{match.group(1).lower()}')
    if title and (norm := normalize_title(title)):
        ids.add(f'title:{norm}')
    return ids


def known_identifiers(references):
    known = set()
    for item in references:
        known |= identifiers_for(item.get('DOI'), item.get('URL'), item.get('title'))
    return known


# --- Candidates -------------------------------------------------------------------------

@dataclass
class Candidate:
    id: str
    source: str
    title: str
    authors: list
    year: int
    venue: str
    abstract: str
    url: str
    doi: str | None
    zotero_source: str
    zotero_source_type: str
    score: int
    identifiers: set = field(default_factory=set, repr=False)

    def to_json(self):
        data = {key: value for key, value in self.__dict__.items() if key != 'identifiers'}
        if len(data['abstract']) > ABSTRACT_LIMIT:
            data['abstract'] = data['abstract'][:ABSTRACT_LIMIT].rsplit(' ', 1)[0] + ' […]'
        if len(data['authors']) > MAX_AUTHORS:
            data['authors'] = data['authors'][:MAX_AUTHORS] + ['et al.']
        return data


# --- ACL Anthology ----------------------------------------------------------------------

BIB_ENTRY_RE = re.compile(r'^@(\w+)\{([^,\s]+),', re.M)
BIB_FIELD_RE = re.compile(r'\s*(\w+)\s*=\s*')
BIB_COMMA_RE = re.compile(r'\s*,')
BIB_BARE_RE = re.compile(r'[^,}\s]+')


def parse_bibtex(text):
    """Parse the Anthology's generated BibTeX into (type, key, fields, raw) tuples."""
    entries = []
    for match in BIB_ENTRY_RE.finditer(text):
        start = match.start()
        pos = match.end()
        fields = {}
        while True:
            field_match = BIB_FIELD_RE.match(text, pos)
            if not field_match:
                break
            name = field_match.group(1).lower()
            pos = field_match.end()
            value, pos = _read_value(text, pos)
            fields[name] = value
            comma = BIB_COMMA_RE.match(text, pos)
            if not comma:
                break
            pos = comma.end()
        end = text.find('}', pos)
        raw = text[start:end + 1] if end != -1 else text[start:]
        entries.append((match.group(1).lower(), match.group(2), fields, raw))
    return entries


def _read_value(text, pos):
    opener = text[pos] if pos < len(text) else ''
    if opener == '{':
        depth = 0
        for index in range(pos, len(text)):
            if text[index] == '{':
                depth += 1
            elif text[index] == '}':
                depth -= 1
                if depth == 0:
                    return text[pos + 1:index], index + 1
        raise DiscoveryError('Unterminated BibTeX value')
    if opener == '"':
        depth = 0
        for index in range(pos + 1, len(text)):
            char = text[index]
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
            elif char == '"' and depth == 0 and text[index - 1] != '\\':
                return text[pos + 1:index], index + 1
        raise DiscoveryError('Unterminated BibTeX value')
    bare = BIB_BARE_RE.match(text, pos)
    if not bare:
        raise DiscoveryError('Empty BibTeX value')
    return bare.group(0), bare.end()


def parse_names(value):
    """BibTeX "Family, Given and …" as CSL names; a single-part name is a literal."""
    names = []
    for name in re.split(r'\s+and\s+', value.strip()) if value.strip() else []:
        name = latex_to_text(name)
        if ', ' in name:
            family, given = name.split(', ', 1)
            names.append({'family': family, 'given': given})
        elif name:
            names.append({'literal': name})
    return names


def split_authors(value):
    return [name.get('literal') or f'{name["given"]} {name["family"]}' for name in parse_names(value)]


MONTHS = {name: number for number, name in enumerate(
    ('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'), start=1)}
CSL_TYPES = {'inproceedings': 'paper-conference', 'article': 'article-journal', 'book': 'book'}


def acl_csl(entry_type, fields, citation_key):
    """CSL-JSON for Zotero, in clean Unicode.

    Zotero's BibTeX import cuts an abstract at the first {\\%} ("88{\\%} of languages"
    becomes "88"), so ACL papers never reach Zotero as BibTeX.
    """
    clean = {name: latex_to_text(value) for name, value in fields.items()}
    month = MONTHS.get(fields.get('month', '').strip().lower()[:3])
    item = {
        'id': citation_key,
        'type': CSL_TYPES[entry_type],
        'title': clean.get('title'),
        'author': parse_names(fields.get('author', '')),
        'editor': parse_names(fields.get('editor', '')),
        'container-title': clean.get('booktitle') or clean.get('journal'),
        'publisher': clean.get('publisher'),
        'publisher-place': clean.get('address'),
        'issued': {'date-parts': [[int(fields['year'])] + ([month] if month else [])]},
        'page': fields.get('pages', '').replace('--', '-') or None,
        'volume': clean.get('volume'),
        'issue': clean.get('number'),
        'ISBN': clean.get('isbn'),
        'DOI': fields.get('doi', '').strip() or None,
        'URL': fields.get('url', '').strip() or None,
        'abstract': clean.get('abstract'),
    }
    return {key: value for key, value in item.items() if value not in (None, '', [])}


BIB_YEAR_RE = re.compile(r'^\s*year\s*=\s*["{]?(\d{4})', re.M)


def prefiltered_entries(text, since_year):
    """Parse only entries recent enough to keep that mention Africa somewhere (fast path)."""
    starts = [match.start() for match in BIB_ENTRY_RE.finditer(text)] + [len(text)]
    for start, end in zip(starts, starts[1:]):
        chunk = text[start:end]
        year = BIB_YEAR_RE.search(chunk)
        # The raw search can miss a LaTeX-accented name ("Yor{\`u}b{\'a}"), but the plain
        # spelling or "Africa" almost always appears too; relevance() then scores clean text.
        if year and int(year.group(1)) >= since_year and may_mention_africa(chunk):
            yield from parse_bibtex(chunk)


def acl_candidates(text, since_year):
    for entry_type, bibtex_key, fields, _raw in prefiltered_entries(text, since_year):
        if entry_type not in ('inproceedings', 'article', 'book'):
            continue
        year = fields.get('year', '')
        if not year.isdigit() or int(year) < since_year:
            continue
        title = latex_to_text(fields.get('title', ''))
        abstract = latex_to_text(fields.get('abstract', ''))
        score = relevance(title, abstract)
        url = fields.get('url', '').strip()
        acl_id = ACL_URL_RE.search(url)
        if not score or not title or not acl_id:
            continue
        doi = fields.get('doi', '').strip() or None
        candidate_id = f'acl:{acl_id.group(1).lower()}'
        yield Candidate(
            id=candidate_id, source='ACL Anthology', title=title,
            authors=split_authors(fields.get('author', '')), year=int(year),
            venue=latex_to_text(fields.get('booktitle') or fields.get('journal') or ''),
            abstract=abstract, url=url, doi=doi,
            # Zotero keeps the CSL id as the citation key: use the Anthology's own key.
            zotero_source=json.dumps([acl_csl(entry_type, fields, bibtex_key)], ensure_ascii=False, indent=2),
            zotero_source_type='csl_json', score=score,
            identifiers=identifiers_for(doi, url, title),
        )


def download_acl_dump(path, *, opener=urllib.request.urlopen):
    """Fetch the dump only when it changed; return its decompressed text."""
    path = Path(path)
    meta_path = path.with_suffix(path.suffix + '.etag')
    headers = {'User-Agent': USER_AGENT}
    if path.exists() and meta_path.exists():
        headers['If-None-Match'] = meta_path.read_text(encoding='utf-8').strip()
    request = urllib.request.Request(ACL_DUMP_URL, headers=headers)
    try:
        with opener(request, timeout=120) as response:
            path.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
                shutil.copyfileobj(response, stream)
                temporary = Path(stream.name)
            os.replace(temporary, path)
            etag = response.headers.get('ETag')
            if etag:
                meta_path.write_text(etag, encoding='utf-8')
            elif meta_path.exists():
                meta_path.unlink()
    except urllib.error.HTTPError as error:
        if error.code != 304:
            raise
        error.close()
    with gzip.open(path, 'rt', encoding='utf-8') as stream:
        return stream.read()


# --- arXiv ------------------------------------------------------------------------------

def arxiv_query():
    categories = ' OR '.join(f'cat:{category}' for category in ARXIV_CATEGORIES)
    terms = ' OR '.join(f'ti:{term} OR abs:{term}' for term in ARXIV_TERMS)
    return f'({categories}) AND ({terms})'


def parse_arxiv_feed(xml_text):
    """Return (entries, total) from one Atom page of the arXiv API."""
    root = ET.fromstring(xml_text)
    total_text = root.findtext('os:totalResults', default='', namespaces=ATOM)
    if not total_text.isdigit():
        raise DiscoveryError('arXiv response has no totalResults; it may be an error page')
    entries = []
    for node in root.findall('a:entry', ATOM):
        raw_id = node.findtext('a:id', default='', namespaces=ATOM)
        match = re.search(r'arxiv\.org/abs/(\d{4}\.\d{4,5})', raw_id)
        if not match:
            continue
        published = node.findtext('a:published', default='', namespaces=ATOM)
        entries.append({
            'arxiv_id': match.group(1),
            'title': re.sub(r'\s+', ' ', node.findtext('a:title', default='', namespaces=ATOM)).strip(),
            'abstract': re.sub(r'\s+', ' ', node.findtext('a:summary', default='', namespaces=ATOM)).strip(),
            'authors': [re.sub(r'\s+', ' ', a.findtext('a:name', default='', namespaces=ATOM)).strip()
                        for a in node.findall('a:author', ATOM)],
            'published': published[:10],
            'doi': node.findtext('arxiv:doi', default=None, namespaces=ATOM),
            'journal_ref': node.findtext('arxiv:journal_ref', default=None, namespaces=ATOM),
            'category': (node.find('arxiv:primary_category', ATOM).get('term')
                         if node.find('arxiv:primary_category', ATOM) is not None else ''),
        })
    return entries, int(total_text)


def fetch_arxiv_page(start, *, opener=urllib.request.urlopen, sleep=time.sleep, retries=4):
    query = urllib.parse.urlencode({
        'search_query': arxiv_query(), 'start': start, 'max_results': ARXIV_PAGE_SIZE,
        'sortBy': 'submittedDate', 'sortOrder': 'descending',
    })
    request = urllib.request.Request(f'{ARXIV_API_URL}?{query}', headers={'User-Agent': USER_AGENT})
    for attempt in range(retries + 1):
        wait = ARXIV_BACKOFF_SECONDS * 2 ** attempt
        try:
            with opener(request, timeout=180) as response:
                body = response.read().decode('utf-8')
            if 'Rate exceeded' in body[:200]:
                raise DiscoveryError('rate exceeded')
            return parse_arxiv_feed(body)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, DiscoveryError,
                ET.ParseError) as error:
            if isinstance(error, urllib.error.HTTPError):
                retryable = error.code == 429 or 500 <= error.code < 600
                retry_after = (error.headers or {}).get('Retry-After', '')
                if retry_after.isdigit():
                    wait = max(wait, int(retry_after))
                error.close()
            else:
                retryable = True
            if not retryable or attempt == retries:
                raise DiscoveryError(f'arXiv request failed: {error}') from None
            sleep(min(wait, ARXIV_MAX_WAIT_SECONDS))
    raise AssertionError('Unreachable retry state')


def arxiv_name(name):
    """arXiv gives "Given Family"; split at the last space, as Zotero's arXiv translator does."""
    given, _, family = name.rpartition(' ')
    return {'family': family, 'given': given} if given else {'literal': name}


def arxiv_csl(entry):
    """CSL-JSON for an arXiv preprint, built from the API data the harvest already holds.

    Handing Zotero an arXiv URL instead makes it fetch the metadata from arXiv, which
    throttles: about 3.5 minutes per paper. CSL "article" becomes a Zotero preprint.
    """
    arxiv_id = entry['arxiv_id']
    date = [int(part) for part in entry['published'].split('-') if part.isdigit()]
    item = {
        'id': f'arxiv-{arxiv_id}',
        'type': 'article',
        'title': entry['title'],
        'author': [arxiv_name(name) for name in entry['authors'] if name],
        'abstract': entry['abstract'],
        'issued': {'date-parts': [date]} if date else None,
        'publisher': 'arXiv',
        'number': f'arXiv:{arxiv_id}',
        'DOI': f'10.48550/arXiv.{arxiv_id}',
        'URL': f'https://arxiv.org/abs/{arxiv_id}',
        'note': f'Published as: {entry["journal_ref"]}' if entry.get('journal_ref') else None,
    }
    return {key: value for key, value in item.items() if value not in (None, '', [])}


def arxiv_candidates(since_year, *, opener=urllib.request.urlopen, sleep=time.sleep,
                     max_results=ARXIV_MAX_RESULTS, log=print):
    start = 0
    while start < max_results:
        if start:
            sleep(ARXIV_DELAY_SECONDS)
        entries, total = fetch_arxiv_page(start, opener=opener, sleep=sleep)
        log(f'  arXiv: {min(start + len(entries), total)} of {total} results read')
        reached_cutoff = False
        for entry in entries:
            year = int(entry['published'][:4]) if entry['published'][:4].isdigit() else 0
            if year < since_year:
                reached_cutoff = True
                continue
            score = relevance(entry['title'], entry['abstract'])
            if not score:
                continue
            url = f'https://arxiv.org/abs/{entry["arxiv_id"]}'
            venue = f'arXiv ({entry["category"]})'
            if entry['journal_ref']:
                venue += f'; published as {entry["journal_ref"]}'
            yield Candidate(
                id=f'arxiv:{entry["arxiv_id"]}', source='arXiv', title=entry['title'],
                authors=entry['authors'], year=year, venue=venue, abstract=entry['abstract'],
                url=url, doi=entry['doi'],
                zotero_source=json.dumps([arxiv_csl(entry)], ensure_ascii=False, indent=2),
                zotero_source_type='csl_json',
                score=score, identifiers=identifiers_for(entry['doi'], url, entry['title']),
            )
        start += len(entries)
        if reached_cutoff or not entries or start >= total:
            return


# --- Ledger and run files ---------------------------------------------------------------

def load_json(path, default):
    path = Path(path)
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    contents = json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True) + '\n'
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', newline='\n', dir=path.parent,
                                     prefix=f'.{path.name}.', delete=False) as stream:
        stream.write(contents)
        temporary = Path(stream.name)
    os.replace(temporary, path)


def load_ledger(path=LEDGER_FILE):
    ledger = load_json(path, {'entries': {}, 'version': 1})
    if not isinstance(ledger.get('entries'), dict):
        raise DiscoveryError(f'{path} has no entries object')
    return ledger


def tag_vocabulary(references):
    counts = {}
    for item in references:
        for tag in item.get('tags', []):
            counts[tag] = counts.get(tag, 0) + 1
    return dict(sorted(counts.items(), key=lambda pair: (-pair[1], pair[0].casefold())))


def ledger_titles(ledger):
    """Normalised title -> ledger id, so the arXiv twin of a triaged ACL paper is caught."""
    return {normalize_title(entry['title']): key for key, entry in ledger['entries'].items()
            if entry.get('title') and entry.get('status') != 'duplicate'}


def ledger_duplicates(candidates, ledger):
    """Candidates whose title is already in the ledger under another id (candidate -> original).

    Harvest filters these out; this catches any that slip through before Zotero gets a copy
    under a different DOI or arXiv id, which its own duplicate check would not recognise.
    """
    titles = ledger_titles(ledger)
    return {key: titles[title] for key, candidate in candidates.items()
            if (title := normalize_title(candidate['title'])) in titles and titles[title] != key}


def select_candidates(candidates, known, ledger_ids, limit):
    """Deduplicate across sources and against the library; rank title matches and recency first.

    ledger_ids holds ledger ids and their 'title:' identifiers. A skipped candidate still adds
    its identifiers to the seen set: otherwise an ACL paper skipped as already triaged would
    let its arXiv preprint through.
    """
    seen = set(known) | set(ledger_ids)
    # ACL first, so a paper on both keeps its published version.
    ordered = sorted(candidates, key=lambda c: c.source != 'ACL Anthology')
    selected = []
    skipped_known = 0
    for candidate in ordered:
        keys = candidate.identifiers | {candidate.id}
        if keys & seen:
            skipped_known += 1
            seen |= keys
            continue
        seen |= keys
        selected.append(candidate)
    selected.sort(key=lambda c: (c.score < 10, -c.year, -c.score, c.id))
    return selected[:limit], len(selected), skipped_known


PREPRINT_TWIN_THRESHOLD = 0.6
UPGRADE_THRESHOLD = 0.75


def drop_preprint_twins(candidates):
    """Keep the ACL version of a paper over its arXiv preprint, even under a reworded title.

    Exact titles are already caught by the 'title:' identifiers; this also requires the same
    first author, so two papers on one topic are not merged.
    """
    acl_by_author = {}
    for candidate in candidates:
        if candidate.source == 'ACL Anthology':
            acl_by_author.setdefault(first_surname(candidate.authors), []).append(candidate)
    kept, dropped = [], 0
    for candidate in candidates:
        twins = acl_by_author.get(first_surname(candidate.authors), []) if candidate.source == 'arXiv' else []
        if any(similar_titles(candidate.title, acl.title, PREPRINT_TWIN_THRESHOLD) for acl in twins):
            dropped += 1
            continue
        kept.append(candidate)
    return kept, dropped


def acl_upgrades(candidates, references, ledger):
    """ACL papers that publish an arXiv preprint already in the bibliography or proposed.

    These are not triaged again: they are reported so the user can swap in the ACL version,
    which this project prefers.
    """
    preprints = [(item.get('title', ''), 'bibliography') for item in references
                 if any(key.startswith('arxiv:') for key in identifiers_for(item.get('DOI'), item.get('URL')))]
    preprints += [(entry['title'], f'proposed as {key}' + (f' (Zotero {entry["zotero_key"]})' if entry.get('zotero_key') else ''))
                  for key, entry in ledger['entries'].items()
                  if key.startswith('arxiv:') and entry.get('status') == 'proposed']
    upgrades = []
    for candidate in candidates:
        if candidate.source != 'ACL Anthology':
            continue
        for title, where in preprints:
            if similar_titles(candidate.title, title, UPGRADE_THRESHOLD):
                upgrades.append({'id': candidate.id, 'title': candidate.title, 'url': candidate.url,
                                 'preprint_title': title, 'preprint': where})
                break
    return upgrades


def batch_entry(candidate, run_dir):
    """Serialize a candidate; a CSL-JSON record goes to a file so no agent ever retypes it.

    Zotero's add tool takes a .json path, and the writer agent copies only that short path:
    a model that retypes a whole record into a tool call can drop or alter text.
    """
    data = candidate.to_json()
    if candidate.zotero_source_type == 'csl_json':
        path = Path(run_dir).resolve() / 'csl' / (re.sub(r'[^A-Za-z0-9.-]', '_', candidate.id) + '.json')
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(candidate.zotero_source + '\n', encoding='utf-8', newline='\n')
        data['zotero_source'] = str(path)
    return data


def write_run(selected, vocabulary, batch_size, run_dir=RUN_DIR, *, since, totals):
    run_dir = Path(run_dir)
    if run_dir.exists():
        shutil.rmtree(run_dir)
    run_dir.mkdir(parents=True)
    batches = []
    for index in range(0, len(selected), batch_size):
        number = index // batch_size + 1
        name = f'batch-{number:02d}.json'
        write_json(run_dir / name, [batch_entry(c, run_dir) for c in selected[index:index + batch_size]])
        batches.append({'batch': name, 'decisions': f'decisions-{number:02d}.json',
                        'ids': [c.id for c in selected[index:index + batch_size]]})
    write_json(run_dir / 'vocabulary.json', vocabulary)
    manifest = {'created': datetime.date.today().isoformat(), 'since': since,
                'batches': batches, **totals}
    write_json(run_dir / 'manifest.json', manifest)
    return manifest


def harvest(args, *, opener=urllib.request.urlopen, sleep=time.sleep, log=print):
    references = load_json(args.references, [])
    ledger = load_ledger(args.ledger)
    candidates = []
    if 'acl' in args.sources:
        log('Reading the ACL Anthology dump…')
        text = download_acl_dump(Path(args.cache_dir) / 'anthology+abstracts.bib.gz', opener=opener)
        acl = list(acl_candidates(text, args.since))
        log(f'  ACL Anthology: {len(acl)} papers since {args.since} pass the Africa filter')
        candidates += acl
    warnings = []
    if 'arxiv' in args.sources:
        log('Querying arXiv (slow: it throttles hard)…')
        arxiv = []
        try:
            for found in arxiv_candidates(args.since, opener=opener, sleep=sleep, log=log):
                arxiv.append(found)
        except DiscoveryError as error:
            # Keep the ACL harvest; what arXiv did return is still usable, and the rest of
            # its results come back next run because nothing unseen is ledgered.
            warnings.append(f'arXiv incomplete: {error}')
            log(f'  Warning: {warnings[-1]}')
        log(f'  arXiv: {len(arxiv)} papers since {args.since} pass the Africa filter')
        candidates += arxiv
    candidates, twins = drop_preprint_twins(candidates)
    if twins:
        log(f'  {twins} arXiv preprints dropped in favour of their ACL versions')
    upgrades = acl_upgrades(candidates, references, ledger)
    upgrade_ids = {upgrade['id'] for upgrade in upgrades}
    for upgrade in upgrades:
        log(f'  ACL version available: {upgrade["id"]} "{upgrade["title"]}" for the arXiv preprint '
            f'{upgrade["preprint"]} ("{upgrade["preprint_title"]}")')
    selected, available, skipped = select_candidates(
        [c for c in candidates if c.id not in upgrade_ids], known_identifiers(references),
        set(ledger['entries']) | {f'title:{title}' for title in ledger_titles(ledger)}, args.max)
    totals = {'available': available, 'already_known': skipped, 'selected': len(selected),
              'warnings': warnings, 'acl_upgrades': upgrades}
    manifest = write_run(selected, tag_vocabulary(references), args.batch_size, args.run_dir,
                         since=args.since, totals=totals)
    log(f'{skipped} already in the bibliography or the ledger; {available} new candidates; '
        f'{len(selected)} written in {len(manifest["batches"])} batches to {args.run_dir}')
    if available > len(selected):
        log(f'{available - len(selected)} more remain for the next run (raise --max to take them now).')
    return manifest


# --- Decisions, Zotero queue and ledger -------------------------------------------------
#
# Triage agents run in parallel and only decide. Zotero writes then go through one agent,
# one at a time: parallel writers collide on the local API ("another operation is still in
# progress") and some writes fail even after a retry.

DECISIONS = {'include', 'exclude'}
ZOTERO_STATUSES = {'added', 'existing', 'failed'}


def validate_decisions(batch_ids, decisions, name):
    if not isinstance(decisions, list):
        raise DiscoveryError(f'{name} must contain an array')
    by_id = {}
    for decision in decisions:
        if not isinstance(decision, dict) or decision.get('id') not in batch_ids:
            raise DiscoveryError(f'{name} has a decision for an unknown candidate: {decision!r:.120}')
        if decision['id'] in by_id:
            raise DiscoveryError(f'{name} decides {decision["id"]} twice')
        if decision.get('decision') not in DECISIONS:
            raise DiscoveryError(f'{name}: {decision["id"]} has no include/exclude decision')
        score = decision.get('score')
        if not isinstance(score, int) or isinstance(score, bool) or not 1 <= score <= 5:
            raise DiscoveryError(f'{name}: {decision["id"]} needs a score from 1 to 5')
        if not isinstance(decision.get('reason'), str) or not decision['reason'].strip():
            raise DiscoveryError(f'{name}: {decision["id"]} needs a reason')
        if decision['decision'] == 'include':
            tags = decision.get('tags')
            if (not isinstance(tags, list) or not tags
                    or not all(isinstance(tag, str) and tag.strip() for tag in tags)):
                raise DiscoveryError(f'{name}: {decision["id"]} is included without tags')
        by_id[decision['id']] = decision
    missing = sorted(set(batch_ids) - by_id.keys())
    if missing:
        raise DiscoveryError(f'{name} is missing decisions for {", ".join(missing)}')
    return by_id


def load_run(run_dir):
    """Return (manifest, candidates by id, decisions by id, batches still without decisions)."""
    run_dir = Path(run_dir)
    manifest = load_json(run_dir / 'manifest.json', None)
    if manifest is None:
        raise DiscoveryError(f'No harvest found in {run_dir}; run the harvest first')
    candidates, decisions, pending = {}, {}, []
    for batch in manifest['batches']:
        for candidate in load_json(run_dir / batch['batch'], []):
            candidates[candidate['id']] = candidate
        decisions_path = run_dir / batch['decisions']
        if not decisions_path.exists():
            pending.append(batch['batch'])
            continue
        decisions.update(validate_decisions(batch['ids'], load_json(decisions_path, None), batch['decisions']))
    return manifest, candidates, decisions, pending


def load_zotero_results(run_dir, included_ids):
    """Merge zotero-results-NN.json files in order; a later attempt overrides an earlier one."""
    results = {}
    for path in sorted(Path(run_dir).glob('zotero-results-*.json')):
        rows = load_json(path, None)
        if not isinstance(rows, list):
            raise DiscoveryError(f'{path.name} must contain an array')
        for row in rows:
            if not isinstance(row, dict) or row.get('id') not in included_ids:
                raise DiscoveryError(f'{path.name} has a result for a paper nobody included: {row!r:.120}')
            if row.get('status') not in ZOTERO_STATUSES:
                raise DiscoveryError(f'{path.name}: {row["id"]} needs status added, existing or failed')
            if row['status'] != 'failed' and not (isinstance(row.get('key'), str) and row['key'].strip()):
                raise DiscoveryError(f'{path.name}: {row["id"]} was written but has no item key')
            results[row['id']] = row
    return results


def queue(args, *, log=print):
    """Write the next zotero-queue-NN.json: inclusions not yet written to Zotero."""
    run_dir = Path(args.run_dir)
    _manifest, candidates, decisions, pending = load_run(run_dir)
    if pending:
        log(f'Batches without decisions: {", ".join(pending)}. Triage them before queueing.')
        return {'pending': pending, 'queued': 0, 'queue': None}
    included = {key for key, decision in decisions.items() if decision['decision'] == 'include'}
    written = {key for key, row in load_zotero_results(run_dir, included).items() if row['status'] != 'failed'}
    duplicates = ledger_duplicates(candidates, load_ledger(args.ledger))
    for key in sorted(included & duplicates.keys()):
        log(f'Not queued: {key} duplicates {duplicates[key]}, already triaged ("{candidates[key]["title"]}")')
    rows = [{'id': key, 'title': candidates[key]['title'], 'source': candidates[key]['zotero_source'],
             'source_type': candidates[key]['zotero_source_type'], 'tags': decisions[key]['tags']}
            for key in sorted(included - written - duplicates.keys())]
    if not rows:
        log('Every inclusion is already in Zotero.')
        return {'pending': [], 'queued': 0, 'queue': None}
    number = len(list(run_dir.glob('zotero-queue-*.json'))) + 1
    queue_path = run_dir / f'zotero-queue-{number:02d}.json'
    write_json(queue_path, rows)
    log(f'{len(rows)} papers queued in {queue_path}; results go to {run_dir / f"zotero-results-{number:02d}.json"}')
    return {'pending': [], 'queued': len(rows), 'queue': str(queue_path)}


def record(args, *, log=print):
    run_dir = Path(args.run_dir)
    _manifest, candidates, decisions, pending = load_run(run_dir)
    included = {key for key, decision in decisions.items() if decision['decision'] == 'include'}
    results = load_zotero_results(run_dir, included)
    ledger = load_ledger(args.ledger)
    duplicates = ledger_duplicates(candidates, ledger)
    today = datetime.date.today().isoformat()
    proposed, retry, rejected, duplicated = [], [], 0, 0
    for candidate_id, decision in decisions.items():
        candidate = candidates[candidate_id]
        entry = {'date': today, 'title': candidate['title'], 'score': decision['score']}
        result = results.get(candidate_id, {'status': 'failed', 'error': 'not written to Zotero'})
        if candidate_id in duplicates and result['status'] == 'failed':
            ledger['entries'][candidate_id] = {**entry, 'status': 'duplicate',
                                               'duplicate_of': duplicates[candidate_id]}
            duplicated += 1
        elif decision['decision'] == 'exclude':
            ledger['entries'][candidate_id] = {**entry, 'status': 'rejected'}
            rejected += 1
        elif result['status'] != 'failed':
            ledger['entries'][candidate_id] = {**entry, 'status': 'proposed', 'zotero_key': result['key']}
            proposed.append((candidate, decision))
        else:
            # Not in Zotero: stay out of the ledger so the next run triages it again.
            retry.append((candidate, decision))
    write_json(args.ledger, ledger)
    lines = [f'# Reference discovery — {today}', '',
             f'{len(proposed)} proposed to Zotero, {rejected} rejected, {len(retry)} not in Zotero, '
             f'{duplicated} duplicates of papers already triaged.', '']
    if pending:
        lines += [f'Batches without decisions (left for a later record): {", ".join(pending)}', '']
    for heading, rows in (('Proposed (Zotero "À valider")', proposed),
                          ('Included but not in Zotero — triaged again next run', retry)):
        if rows:
            lines += [f'## {heading}', '']
            for candidate, decision in sorted(rows, key=lambda row: (-row[1]['score'], row[0]['title'])):
                lines.append(f'- **{candidate["title"]}** ({candidate["year"]}, {candidate["source"]}) '
                             f'— score {decision["score"]}. {decision["reason"]} '
                             f'Tags: {", ".join(decision["tags"])}. <{candidate["url"]}>')
            lines.append('')
    report = '\n'.join(lines)
    (run_dir / 'report.md').write_text(report, encoding='utf-8')
    log(report)
    return {'proposed': len(proposed), 'rejected': rejected, 'retry': len(retry),
            'duplicates': duplicated, 'pending': pending}


def main(argv=None):
    # Titles carry diacritics a Windows console code page cannot print.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='replace')
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ledger', type=Path, default=LEDGER_FILE)
    parser.add_argument('--run-dir', type=Path, default=RUN_DIR)
    commands = parser.add_subparsers(dest='command', required=True)
    harvest_parser = commands.add_parser('harvest', help='Collect new candidates into batches')
    harvest_parser.add_argument('--since', type=int, default=2020, help='Earliest publication year')
    harvest_parser.add_argument('--max', type=int, default=150, help='Candidates to triage this run')
    harvest_parser.add_argument('--batch-size', type=int, default=15)
    harvest_parser.add_argument('--sources', default='acl,arxiv', type=lambda v: set(v.split(',')))
    harvest_parser.add_argument('--references', type=Path, default=REFERENCES_FILE)
    harvest_parser.add_argument('--cache-dir', type=Path, default=CACHE_DIR)
    commands.add_parser('queue', help='List the inclusions still to write to Zotero')
    commands.add_parser('record', help='Fold decisions and Zotero results into the ledger')
    args = parser.parse_args(argv)
    if args.command == 'harvest' and (args.max < 1 or args.batch_size < 1 or not args.sources <= {'acl', 'arxiv'}):
        parser.error('--max and --batch-size must be positive; --sources takes acl and/or arxiv')
    try:
        if args.command == 'harvest':
            harvest(args)
        else:
            result = (queue if args.command == 'queue' else record)(args)
            return 2 if result['pending'] else 0
    except (OSError, ValueError, urllib.error.URLError) as error:
        print(f'Reference discovery failed: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
