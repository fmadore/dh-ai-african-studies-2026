import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const buildDirectory = path.resolve('build');
const budgets = {
	// ~54 KiB since Tailwind stopped scanning unused Flowbite folders (was ~70)
	cssGzipBytes: 62 * 1024,
	javascriptGzipBytes: 700 * 1024,
	// Static import descendants are eager even when absent from the HTML.
	// Dynamic imports have a separate ceiling; this does not imply that a
	// component waits for interaction before requesting them.
	largestEagerAssetGzipBytes: 60 * 1024,
	largestLazyAssetGzipBytes: 300 * 1024,
	largestRouteJavascriptGzipBytes: 180 * 1024
};

async function filesIn(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const file = path.join(directory, entry.name);
			return entry.isDirectory() ? filesIn(file) : [file];
		})
	);
	return files.flat();
}

const allFiles = await filesIn(buildDirectory);
const assets = allFiles.filter((file) => /\.(?:css|js)$/u.test(file));

const manifest = JSON.parse(
	await readFile('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
);
const byFile = new Map(Object.entries(manifest).map(([key, value]) => [value.file, key]));
const byBasename = new Map([...byFile].map(([file, key]) => [path.basename(file), key]));
function staticAssets(roots) {
	const seen = new Set();
	const files = new Set();
	function visit(key) {
		if (seen.has(key) || !manifest[key]) return;
		seen.add(key);
		const chunk = manifest[key];
		files.add(chunk.file);
		for (const file of [...(chunk.css || []), ...(chunk.assets || [])]) files.add(file);
		for (const imported of chunk.imports || []) visit(imported);
	}
	for (const root of roots) visit(root);
	return files;
}

const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const markup = await Promise.all(htmlFiles.map((file) => readFile(file, 'utf8')));
const eagerNames = new Set();
const routeAssets = markup.map((html) => {
	const roots = new Set();
	for (const match of html.matchAll(/[\w.-]+\.(?:css|js)/gu)) {
		eagerNames.add(match[0]);
		const key = byBasename.get(match[0]);
		if (key) roots.add(key);
	}
	// SvelteKit also lists its initially hydrated route modules by node ID.
	const nodeIds = html.match(/node_ids:\s*\[([\d,\s]*)\]/)?.[1];
	for (const id of nodeIds?.match(/\d+/g) || []) {
		for (const [key, chunk] of Object.entries(manifest)) {
			if (chunk.name === `nodes/${id}` || (/\/nodes\//.test(key) && key.endsWith(`/${id}.js`)))
				roots.add(key);
		}
	}
	const files = staticAssets(roots);
	for (const file of files) eagerNames.add(path.basename(file));
	return files;
});

const sizedAssets = await Promise.all(
	assets.map(async (file) => ({
		file: path.relative(buildDirectory, file),
		extension: path.extname(file),
		eager: eagerNames.has(path.basename(file)),
		gzipBytes: gzipSync(await readFile(file)).length,
		bytes: (await stat(file)).size
	}))
);

const total = (extension) =>
	sizedAssets
		.filter((asset) => asset.extension === extension)
		.reduce((sum, asset) => sum + asset.gzipBytes, 0);
const cssGzipBytes = total('.css');
const javascriptGzipBytes = total('.js');
const largestOf = (assetsToRank) =>
	assetsToRank.reduce((largest, asset) => (asset.gzipBytes > largest.gzipBytes ? asset : largest), {
		file: '(none)',
		gzipBytes: 0
	});
const largestEagerAsset = largestOf(sizedAssets.filter((asset) => asset.eager));
const largestLazyAsset = largestOf(sizedAssets.filter((asset) => !asset.eager));
const assetSizes = new Map(sizedAssets.map((asset) => [asset.file, asset]));
const routeSizes = await Promise.all(
	routeAssets.map(async (files, index) => {
		const javascript = [...files].filter((file) => file.endsWith('.js'));
		const fonts = [...files].filter((file) => /\.woff2?$/.test(file));
		return {
			route: path.relative(buildDirectory, htmlFiles[index]),
			javascriptGzipBytes: javascript.reduce(
				(sum, file) => sum + (assetSizes.get(file)?.gzipBytes || 0),
				0
			),
			htmlGzipBytes: gzipSync(markup[index]).length,
			// This is the complete referenced font inventory, not a claim that all
			// unicode-range subsets are downloaded by every browser.
			referencedFontBytes: (
				await Promise.all(fonts.map((file) => stat(path.join(buildDirectory, file))))
			).reduce((sum, file) => sum + file.size, 0)
		};
	})
);
console.table(routeSizes.sort((a, b) => b.javascriptGzipBytes - a.javascriptGzipBytes));

console.table(sizedAssets.sort((a, b) => b.gzipBytes - a.gzipBytes).slice(0, 12));
console.log(
	`CSS gzip: ${(cssGzipBytes / 1024).toFixed(1)} KiB / ${budgets.cssGzipBytes / 1024} KiB`
);
console.log(
	`JavaScript gzip: ${(javascriptGzipBytes / 1024).toFixed(1)} KiB / ${budgets.javascriptGzipBytes / 1024} KiB`
);
console.log(
	`Largest eager asset: ${(largestEagerAsset.gzipBytes / 1024).toFixed(1)} KiB / ${budgets.largestEagerAssetGzipBytes / 1024} KiB (${largestEagerAsset.file})`
);
console.log(
	`Largest lazy asset: ${(largestLazyAsset.gzipBytes / 1024).toFixed(1)} KiB / ${budgets.largestLazyAssetGzipBytes / 1024} KiB (${largestLazyAsset.file})`
);

const violations = [
	routeSizes.some((route) => route.javascriptGzipBytes > budgets.largestRouteJavascriptGzipBytes) &&
		'per-route static JavaScript gzip budget exceeded',
	cssGzipBytes > budgets.cssGzipBytes && 'total CSS gzip budget exceeded',
	javascriptGzipBytes > budgets.javascriptGzipBytes && 'total JavaScript gzip budget exceeded',
	largestEagerAsset.gzipBytes > budgets.largestEagerAssetGzipBytes &&
		`largest eager asset gzip budget exceeded: ${largestEagerAsset.file}`,
	largestLazyAsset.gzipBytes > budgets.largestLazyAssetGzipBytes &&
		`largest lazy asset gzip budget exceeded: ${largestLazyAsset.file}`
].filter(Boolean);

if (violations.length) {
	throw new Error(violations.join('; '));
}
