import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const buildDirectory = path.resolve('build');
const budgets = {
	cssGzipBytes: 75 * 1024,
	javascriptGzipBytes: 700 * 1024,
	// Split by whether an asset is on a page's critical path. An asset named in
	// a prerendered page's markup is fetched before that page can settle, so it
	// keeps the original tight ceiling. A chunk reachable only through a dynamic
	// import downloads when a component asks for it and never blocks first
	// paint, which is what buys the MapLibre basemap engine (~270 KiB gzip on
	// /participants alone) its larger allowance.
	largestEagerAssetGzipBytes: 150 * 1024,
	largestLazyAssetGzipBytes: 300 * 1024
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

// Every basename mentioned anywhere in the prerendered HTML: SvelteKit writes
// the entry and route chain into each page as script/modulepreload/stylesheet
// links, so appearing there is the same thing as being on that page's critical
// path. Anything else in the graph is only reachable through import().
const markup = await Promise.all(
	allFiles.filter((file) => file.endsWith('.html')).map((file) => readFile(file, 'utf8'))
);
const eagerNames = new Set();
for (const html of markup) {
	for (const match of html.matchAll(/[\w.-]+\.(?:css|js)/gu)) eagerNames.add(match[0]);
}

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
