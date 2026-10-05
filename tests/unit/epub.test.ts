import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { positionPaperMeta } from '$lib/data/position-paper-meta';
import { processPaper } from '$lib/reader/process-paper';

const python =
	process.env.EPUB_PYTHON ||
	process.env.PYTHON ||
	(process.platform === 'win32' ? 'python' : 'python3');
const script = resolve('scripts/package-paper-epub.py');
const fixture = () => ({
	meta: { ...positionPaperMeta, language: 'fr', revisedDate: '2026-10-02' },
	paper: processPaper('## Introduction\n\nA short paper.', []),
	credit: { name: 'Photographer', url: 'https://example.org' },
	citation: 'Example citation.'
});

function inspect(code: string, data = fixture()) {
	// The harness decodes stdin as UTF-8 bytes, as the script's own main() does:
	// a text-mode `sys.stdin` uses the Windows code page and mangles non-ASCII.
	const result = spawnSync(
		python,
		[
			'-B',
			'-c',
			`import importlib.util,json,sys,io,zipfile,xml.etree.ElementTree as ET
spec=importlib.util.spec_from_file_location('epub',sys.argv[1])
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
data=json.loads(sys.stdin.buffer.read().decode('utf-8'))
${code}`,
			script
		],
		{ input: JSON.stringify(data), encoding: 'utf8' }
	);
	expect(result.error).toBeUndefined();
	expect(result.status, result.stderr).toBe(0);
	return JSON.parse(result.stdout);
}

describe('EPUB packaging', () => {
	it('produces deterministic bytes, declared language, stable revision metadata, and valid note-free navigation', () => {
		const result = inspect(`first=m.build_epub(data,b'photo'); second=m.build_epub(data,b'photo')
with zipfile.ZipFile(io.BytesIO(first)) as z:
    opf=ET.fromstring(z.read('EPUB/package.opf'))
    nav=ET.fromstring(z.read('EPUB/nav.xhtml'))
    print(json.dumps({'equal':first==second,'first':z.infolist()[0].filename,'stored':z.infolist()[0].compress_type==zipfile.ZIP_STORED,'dates':list(set(i.date_time for i in z.infolist())),'language':opf.find('.//{http://purl.org/dc/elements/1.1/}language').text,'modified':opf.find('.//{http://www.idpf.org/2007/opf}meta').text,'notes':'#reader-footnotes-heading' in z.read('EPUB/nav.xhtml').decode(),'lang':nav.get('lang')}))`);
		expect(result).toEqual({
			equal: true,
			first: 'mimetype',
			stored: true,
			dates: [[1980, 1, 1, 0, 0, 0]],
			language: 'fr',
			modified: '2026-10-02T00:00:00Z',
			notes: false,
			lang: 'fr'
		});
	});

	it('retains note locators and EPUB note semantics', () => {
		const data = fixture();
		data.paper = processPaper('Note[^ref:ABC, 12].', [{ id: 'ABC', type: 'book', title: 'Book' }]);
		const result = inspect(
			`payload=m.build_epub(data,b'photo')
with zipfile.ZipFile(io.BytesIO(payload)) as z:
    tree=ET.fromstring(z.read('EPUB/paper.xhtml'))
    print(json.dumps({'locator':'Cited location: 12.' in ''.join(tree.itertext()),'types':[n.get('{'+m.EPUB+'}type') for n in tree.iter() if n.get('{'+m.EPUB+'}type')]}))`,
			data
		);
		expect(result).toEqual({ locator: true, types: ['noteref', 'footnote'] });
	});

	it('rejects invalid internal targets and duplicate IDs before packaging', () => {
		const result = inspect(`errors=[]
for html in ['<p><a href="#missing">broken</a></p>','<h2 id="duplicate">One</h2><h2 id="duplicate">Two</h2>']:
    data['paper']={'html':html,'toc':[]}
    try: m.build_epub(data,b'photo')
    except ValueError as error: errors.append(str(error))
print(json.dumps(errors))`);
		expect(result).toEqual(['Broken internal link: #missing', 'Duplicate IDs in EPUB/paper.xhtml']);
	});

	it('checks freshness without modifying a missing, current, or stale publication', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'paper-epub-'));
		try {
			mkdirSync(join(cwd, 'static/images/photos'), { recursive: true });
			writeFileSync(join(cwd, 'static/images/photos/3V7A0875.jpg'), 'photo');
			const data = fixture();
			const run = (check: boolean) =>
				spawnSync(python, ['-B', script, ...(check ? ['--check'] : [])], {
					cwd,
					input: JSON.stringify(data),
					encoding: 'utf8'
				});
			expect(run(true).status).toBe(1);
			const generated = run(false);
			expect(generated.status, generated.stderr).toBe(0);
			const path = join(cwd, 'static/documents/position-paper.epub');
			const before = readFileSync(path);
			expect(run(true).status).toBe(0);
			data.meta.abstract += ' A new revision.';
			const stale = run(true);
			expect(stale.status).toBe(1);
			expect(stale.stderr).toContain('missing or stale');
			expect(readFileSync(path)).toEqual(before);
		} finally {
			rmSync(cwd, { recursive: true });
		}
	});
});
