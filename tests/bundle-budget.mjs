import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const buildDirectory = path.resolve('build');
const budgets = {
	cssGzipBytes: 75 * 1024,
	javascriptGzipBytes: 700 * 1024,
	largestAssetGzipBytes: 150 * 1024
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

const assets = (await filesIn(buildDirectory)).filter((file) => /\.(?:css|js)$/u.test(file));
const sizedAssets = await Promise.all(
	assets.map(async (file) => ({
		file: path.relative(buildDirectory, file),
		extension: path.extname(file),
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
const largestAsset = sizedAssets.reduce((largest, asset) =>
	asset.gzipBytes > largest.gzipBytes ? asset : largest
);

console.table(sizedAssets.sort((a, b) => b.gzipBytes - a.gzipBytes).slice(0, 12));
console.log(
	`CSS gzip: ${(cssGzipBytes / 1024).toFixed(1)} KiB / ${budgets.cssGzipBytes / 1024} KiB`
);
console.log(
	`JavaScript gzip: ${(javascriptGzipBytes / 1024).toFixed(1)} KiB / ${budgets.javascriptGzipBytes / 1024} KiB`
);

const violations = [
	cssGzipBytes > budgets.cssGzipBytes && 'total CSS gzip budget exceeded',
	javascriptGzipBytes > budgets.javascriptGzipBytes && 'total JavaScript gzip budget exceeded',
	largestAsset.gzipBytes > budgets.largestAssetGzipBytes &&
		`largest asset gzip budget exceeded: ${largestAsset.file}`
].filter(Boolean);

if (violations.length) {
	throw new Error(violations.join('; '));
}
