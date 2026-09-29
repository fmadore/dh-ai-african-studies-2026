import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { expect, it } from 'vitest';

/**
 * app.css scans only the flowbite-svelte folders the site uses. This walks the
 * real import graph from every `flowbite-svelte` import in src/ and fails when
 * it reaches a folder that isn't scanned, since that component's classes
 * would silently be missing from the build.
 */
const DIST = resolve('node_modules/flowbite-svelte/dist');

function filesUnder(directory: string, pattern: RegExp): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return filesUnder(path, pattern);
		return pattern.test(entry.name) ? [path] : [];
	});
}

function scannedFolders(): string[] {
	const css = readFileSync('src/app.css', 'utf8');
	const match = css.match(/@source '\.\.\/node_modules\/flowbite-svelte\/dist\/\{([^}]+)\}'/);
	if (!match) throw new Error('app.css has no brace-listed flowbite-svelte @source');
	return match[1].split(',').map((folder) => folder.trim());
}

/** Component name → file, from every folder's `export { default as X }` lines. */
function exportedComponents(): Map<string, string> {
	const components = new Map<string, string>();
	for (const index of filesUnder(DIST, /^index\.js$/)) {
		for (const [, file, name] of readFileSync(index, 'utf8')
			.matchAll(/export \{ default as (\w+) \} from "(\.\/[^"]+)"/g)
			.map((m) => [m[0], m[2], m[1]])) {
			components.set(name, resolve(dirname(index), file));
		}
	}
	return components;
}

function importedNames(): Set<string> {
	const names = new Set<string>();
	for (const file of filesUnder('src', /\.(svelte|ts)$/)) {
		const source = readFileSync(file, 'utf8');
		for (const [, list] of source.matchAll(/import \{([^}]+)\} from 'flowbite-svelte'/g)) {
			for (const name of list.split(',')) names.add(name.trim());
		}
	}
	names.delete('');
	return names;
}

function resolveImport(from: string, specifier: string): string | null {
	const target = resolve(dirname(from), specifier);
	for (const candidate of [target, `${target}.js`, join(target, 'index.js')]) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	return null;
}

/** Every flowbite-svelte file reachable through value (not type-only) imports. */
function reachableFiles(entries: string[]): Set<string> {
	const seen = new Set<string>();
	const queue = [...entries];
	while (queue.length) {
		const file = queue.pop()!;
		if (seen.has(file)) continue;
		seen.add(file);
		const source = readFileSync(file, 'utf8');
		for (const [statement, specifier] of source
			.matchAll(/import\s+([^'"]*?)\s*from\s+"(\.{1,2}\/[^"]*|\.{1,2})"/g)
			.map((m) => [m[1], m[2]])) {
			if (/^type\s/.test(statement)) continue;
			const specifiers = statement
				.match(/\{([^}]*)\}/)?.[1]
				.split(',')
				.map((s) => s.trim());
			if (specifiers?.every((s) => !s || s.startsWith('type '))) continue;
			const next = resolveImport(file, specifier);
			// The package barrel re-exports everything; nothing here imports a value from it
			if (next && next !== join(DIST, 'index.js')) queue.push(next);
		}
	}
	return seen;
}

it('scans every flowbite-svelte folder the site bundles', () => {
	const components = exportedComponents();
	const names = [...importedNames()];
	const unknown = names.filter((name) => !components.has(name));
	expect(unknown, 'flowbite-svelte imports this test cannot resolve').toEqual([]);

	const folders = scannedFolders();
	const unscanned = new Set<string>();
	for (const file of reachableFiles(names.map((name) => components.get(name)!))) {
		const path = relative(DIST, file).split(sep).join('/');
		// Root helpers and the theme plumbing carry no class strings
		if (!path.includes('/') || path.startsWith('theme/')) continue;
		if (!folders.some((folder) => path.startsWith(`${folder}/`))) {
			unscanned.add(path.slice(0, path.lastIndexOf('/')));
		}
	}

	expect([...unscanned], 'add these folders to the @source list in src/app.css').toEqual([]);
});
