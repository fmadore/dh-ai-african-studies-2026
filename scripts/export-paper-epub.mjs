#!/usr/bin/env node
// Uses the reader's own parser and metadata, then Python's standard-library ZIP writer.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check'))
	throw new Error('Usage: node scripts/export-paper-epub.mjs [--check]');
const source = resolve(root, 'src/lib/content/position-paper.md');
if (!existsSync(source))
	throw new Error('The final position-paper.md is required to export an EPUB.');
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
try {
	const { positionPaperMeta: meta } = await server.ssrLoadModule(
		'/src/lib/data/position-paper-meta.ts'
	);
	const { processPaper } = await server.ssrLoadModule('/src/lib/reader/process-paper.ts');
	const { toChicago } = await server.ssrLoadModule('/src/lib/reader/citation-formatters.ts');
	const { mediaCredit } = await server.ssrLoadModule('/src/lib/data/photos.ts');
	const refs = JSON.parse(readFileSync(resolve(root, 'src/lib/data/references.json'), 'utf8'));
	const paper = processPaper(readFileSync(source, 'utf8'), refs);
	const result = spawnSync(
		// Same default as scripts/python.mjs; EPUB_PYTHON predates the shared PYTHON
		process.env.EPUB_PYTHON ||
			process.env.PYTHON ||
			(process.platform === 'win32' ? 'python' : 'python3'),
		[resolve(root, 'scripts/package-paper-epub.py'), ...args],
		{
			cwd: root,
			input: JSON.stringify({ meta, paper, credit: mediaCredit, citation: toChicago(meta) }),
			encoding: 'utf8',
			maxBuffer: 1024 * 1024
		}
	);
	if (result.error)
		throw new Error('Python 3 is required. Set EPUB_PYTHON to its executable path.', {
			cause: result.error
		});
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
	if (result.status !== 0) throw new Error(`EPUB packaging failed (${result.status}).`);
} finally {
	await server.close();
}
