"""Package the reader export as EPUB 3; no third-party Python packages required."""
import json
import sys
import zipfile
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

XHTML = 'http://www.w3.org/1999/xhtml'
EPUB = 'http://www.idpf.org/2007/ops'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class XhtmlParser(HTMLParser):
    """Serialize HTML as well-formed XHTML, including EPUB note semantics."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = ET.Element('body')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        attrs = {key: value or '' for key, value in attrs}
        if tag == 'a' and attrs.get('href', '').startswith('#fn') and not attrs['href'].startswith('#fnref'):
            attrs['epub:type'] = 'noteref'
        if tag == 'li' and 'footnote-item' in attrs.get('class', '').split():
            attrs['epub:type'] = 'footnote'
        node = ET.SubElement(self.stack[-1], tag, attrs)
        if tag not in VOID:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack[-1].tag != tag:
            raise ValueError(f'Unbalanced HTML: {tag}')
        self.stack.pop()

    def handle_data(self, data):
        node = self.stack[-1]
        if len(node):
            node[-1].tail = (node[-1].tail or '') + data
        else:
            node.text = (node.text or '') + data


def xhtml(title, body):
    return (f'<?xml version="1.0" encoding="utf-8"?>\n'
            f'<html xmlns="{XHTML}" xmlns:epub="{EPUB}" xml:lang="en" lang="en">'
            f'<head><title>{escape(title)}</title><link rel="stylesheet" href="style.css" /></head>'
            f'{body}</html>')


def main():
    data = json.loads(sys.stdin.buffer.read().decode('utf-8'))
    meta, paper = data['meta'], data['paper']
    title = escape(meta['title'])
    authors = ', '.join(a['name'] for a in meta['authors'])
    credit = data['credit']
    intro = (f'<header><h1>{title}</h1><p>{escape(authors)}</p>'
             f'<p>{escape(meta["journalTitle"])}, no. {escape(meta["issue"])} · '
             f'{escape(meta["publicationDate"])} · pp. {meta["pageStart"]}–{meta["pageEnd"]}</p>'
             f'<p><a href="https://doi.org/{escape(meta["doi"])}">DOI: {escape(meta["doi"])}</a></p>'
             f'<section id="abstract"><h2>Abstract</h2><p>{escape(meta["abstract"])}</p></section>'
             '<figure><img src="group-photo.jpg" width="1920" height="1280" '
             'alt="Workshop participants on the outdoor steps at Xplanatorium Herrenhausen on Day 3." />'
             '<figcaption>Some of the workshop participants at Xplanatorium Herrenhausen. Photo by '
             f'<a href="{escape(credit["url"])}">{escape(credit["name"])}</a>.</figcaption></figure></header>')
    rights = f'Text: {meta["licence"]["name"]}. The photograph is not covered by this licence.'
    colophon = (f'<section id="publication"><h2>Publication details</h2><p>{escape(data["citation"])}</p>'
                f'<p>{escape(rights)} <a href="{escape(meta["licence"]["url"])}">Licence terms</a>.</p>'
                '<p>This reflowable edition follows the final PDF; its screen pagination varies with the reading device.</p></section>')
    parser = XhtmlParser()
    parser.feed(intro + paper['html'] + colophon)
    if len(parser.stack) != 1:
        raise ValueError('Unclosed HTML elements')
    body = xhtml(meta['title'], ET.tostring(parser.root, encoding='unicode'))
    toc = [{'id': 'abstract', 'text': 'Abstract'}, *paper['toc'],
           {'id': 'reader-footnotes-heading', 'text': 'Notes'},
           {'id': 'publication', 'text': 'Publication details'}]
    nav = xhtml('Contents', '<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>' + ''.join(
        f'<li><a href="paper.xhtml#{escape(item["id"])}">{escape(item["text"])}</a></li>' for item in toc
    ) + '</ol></nav></body>')
    modified = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    opf = (f'<?xml version="1.0" encoding="utf-8"?>'
           '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">'
           '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'
           f'<dc:identifier id="pub-id">https://doi.org/{escape(meta["doi"])}</dc:identifier>'
           f'<dc:title>{title}</dc:title><dc:language>en</dc:language>'
           + ''.join(f'<dc:creator>{escape(a["name"])}</dc:creator>' for a in meta['authors'])
           + f'<dc:publisher>{escape(meta["publisher"])}</dc:publisher>'
           f'<dc:date>{escape(meta["publicationDate"])}</dc:date>'
           f'<dc:description>{escape(meta["abstract"])}</dc:description>'
           f'<dc:source>{escape(data["citation"])}</dc:source><dc:rights>{escape(rights)}</dc:rights>'
           + ''.join(f'<dc:subject>{escape(k)}</dc:subject>' for k in meta['keywords'])
           + f'<meta property="dcterms:modified">{modified}</meta></metadata>'
           '<manifest><item id="paper" href="paper.xhtml" media-type="application/xhtml+xml" />'
           '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />'
           '<item id="style" href="style.css" media-type="text/css" />'
           '<item id="photo" href="group-photo.jpg" media-type="image/jpeg" /></manifest>'
           '<spine><itemref idref="paper" /></spine></package>')
    container = ('<?xml version="1.0"?><container version="1.0" '
                 'xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles>'
                 '<rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml" />'
                 '</rootfiles></container>')
    css = ('body {font-family:serif; line-height:1.55; margin:1em;}'
           'h1,h2,h3,h4 {line-height:1.2; break-after:avoid;}'
           'h2 {margin-top:2em;} p {margin:0 0 1em;} figure {margin:1.5em 0;}'
           'img {max-width:100%; height:auto;} figcaption {font-size:.85em;}'
           'a {overflow-wrap:anywhere;} .footnotes-list {list-style:decimal; padding-left:2em;}'
           '.footnote-item {margin-bottom:1em;} .footnote-ref {font-size:.75em;}'
           '#publication {break-before:page;}')
    files = {'META-INF/container.xml': container, 'EPUB/package.opf': opf,
             'EPUB/paper.xhtml': body, 'EPUB/nav.xhtml': nav, 'EPUB/style.css': css}
    # Fail before writing if XML or any internal hyperlink/resource is broken.
    trees = {name: ET.fromstring(text) for name, text in files.items() if name.endswith(('.xml', '.opf', '.xhtml'))}
    ids = {}
    for name, tree in trees.items():
        all_ids = [n.attrib['id'] for n in tree.iter() if 'id' in n.attrib]
        if len(all_ids) != len(set(all_ids)):
            raise ValueError(f'Duplicate IDs in {name}')
        ids[name] = set(all_ids)
    assets = set(files) | {'EPUB/group-photo.jpg'}
    for name, tree in trees.items():
        if not name.endswith('.xhtml'):
            continue
        for node in tree.iter():
            target = node.get('href') or node.get('src')
            if not target or urlsplit(target).scheme:
                continue
            url = urlsplit(target)
            dest = 'EPUB/' + url.path if url.path else name
            if dest not in assets or (url.fragment and unquote(url.fragment) not in ids.get(dest, set())):
                raise ValueError(f'Broken internal link: {target}')
    output = Path('static/documents/position-paper.epub')
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        for name, content in files.items():
            archive.writestr(name, content.encode('utf-8'))
        archive.write('static/images/photos/3V7A0875.jpg', 'EPUB/group-photo.jpg')
    with zipfile.ZipFile(output) as archive:
        assert archive.testzip() is None
        assert archive.infolist()[0].filename == 'mimetype'
        assert archive.infolist()[0].compress_type == zipfile.ZIP_STORED
    notes = sum(n.get('epub:type') == 'footnote' for n in parser.root.iter())
    print(f'Created {output} ({output.stat().st_size:,} bytes); {notes} notes; XML and internal links verified.')


if __name__ == '__main__':
    main()
