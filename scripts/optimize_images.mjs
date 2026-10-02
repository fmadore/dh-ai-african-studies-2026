/**
 * Hash-tracked image derivatives. Unchanged images retain their exact bytes.
 * New originals are retained under assets/image-originals/, outside static/.
 * --adopt-existing registers the legacy optimized corpus without recompression.
 * --offline skips YouTube poster downloads. Originals are required to rebuild
 * adopted derivatives when settings change; they are never recompressed blindly.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
	SETTINGS,
	adoptAsset,
	atomicWrite,
	loadManifest,
	optimizeAsset,
	outputUnchanged,
	relativePath
} from './image-pipeline.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const LOGO_SOURCES = [
	{ file: 'VWST-logo.png', slug: 'vwst' },
	{ file: 'ZMO-logo.png', slug: 'zmo' },
	{ file: 'uni-bayreuth-africa-multiple-logo.jpeg', slug: 'africa-multiple' }
];

function listImages(dir) {
	return existsSync(dir)
		? readdirSync(dir)
				.filter((file) => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
				.sort()
		: [];
}

async function fetchPosters(root) {
	const path = join(root, 'src/lib/data/interviews.ts');
	if (!existsSync(path)) return;
	const ids = [...readFileSync(path, 'utf8').matchAll(/youtubeId:\s*['"]([\w-]+)['"]/g)].map(
		(match) => match[1]
	);
	const directory = join(root, 'static/images/interviews');
	const have = new Set(listImages(directory).map((file) => basename(file, extname(file))));
	for (const id of new Set(ids.filter((value) => !have.has(value)))) {
		let saved = false;
		for (const size of ['maxresdefault', 'hqdefault']) {
			try {
				const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`, {
					signal: AbortSignal.timeout(15_000)
				});
				if (!response.ok) continue;
				const bytes = Buffer.from(await response.arrayBuffer());
				if (bytes.length > 10 * 1024 * 1024) throw new Error('Poster exceeds 10 MiB');
				await sharp(bytes).metadata();
				atomicWrite(join(directory, `${id}.jpg`), bytes);
				saved = true;
				break;
			} catch (error) {
				console.warn(`interviews: could not fetch ${size} for ${id}: ${error.message}`);
			}
		}
		if (!saved) console.warn(`interviews: no poster for ${id}; pages fall back to YouTube's`);
	}
}

export async function optimizeImages({ root = ROOT, adoptExisting = false, offline = false } = {}) {
	const manifest = loadManifest(root);
	const counts = { adopted: 0, optimized: 0, skipped: 0 };
	if (!offline && !adoptExisting) await fetchPosters(root);
	for (const category of ['participants', 'interviews', 'photos']) {
		const directory = join(root, 'static/images', category);
		const groups = new Map();
		for (const file of listImages(directory)) {
			const slug = basename(file, extname(file));
			if (!groups.has(slug)) groups.set(slug, []);
			groups.get(slug).push(relativePath(root, join(directory, file)));
		}
		// Missing outputs can be regenerated from an archived original.
		for (const key of Object.keys(manifest.assets).filter((key) =>
			key.startsWith(`${category}/`)
		)) {
			const slug = key.slice(category.length + 1);
			if (!groups.has(slug)) groups.set(slug, []);
		}
		for (const [slug, files] of [...groups].sort()) {
			const key = `${category}/${slug}`;
			const outputs = [
				`static/images/${category}/${slug}.${category === 'photos' ? 'jpg' : 'webp'}`
			];
			if (category === 'photos') outputs.push(`static/images/photos/thumbs/${slug}.webp`);
			const options = { root, manifest, key, outputs, settings: SETTINGS[category] };
			let status;
			if (adoptExisting && !manifest.assets[key]) {
				status = await adoptAsset(options);
			} else {
				const incoming = files.filter((path) => !outputUnchanged(root, manifest.assets[key], path));
				if (incoming.length > 1)
					throw new Error(`Conflicting inputs for ${key}: ${incoming.join(', ')}`);
				status = await optimizeAsset({ ...options, input: incoming[0] || files[0] });
			}
			counts[status]++;
		}
	}
	for (const { file, slug } of LOGO_SOURCES) {
		const source = `static/images/logo/${file}`;
		if (!existsSync(join(root, source))) continue;
		const key = `logos/${slug}`;
		const options = {
			root,
			manifest,
			key,
			outputs: [`static/images/logo/trimmed/${slug}.webp`],
			settings: SETTINGS.logos
		};
		const status =
			adoptExisting && !manifest.assets[key]
				? await adoptAsset({ ...options, source })
				: await optimizeAsset({ ...options, input: source, keepInput: true });
		counts[status]++;
	}
	return counts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const allowed = new Set(['--adopt-existing', '--offline']);
	for (const flag of process.argv.slice(2))
		if (!allowed.has(flag)) throw new Error(`Unknown option: ${flag}`);
	console.log(
		await optimizeImages({
			adoptExisting: process.argv.includes('--adopt-existing'),
			offline: process.argv.includes('--offline')
		})
	);
}
