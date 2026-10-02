/** Content-addressed derivatives; originals stay outside public static assets. */
import sharp from 'sharp';
import exifr from 'exifr';
import { createHash, randomUUID } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export const MANIFEST_PATH = 'scripts/image-optimization-manifest.json';
export const SETTINGS = {
	participants: { version: 1, format: 'webp', size: 640, quality: 82 },
	interviews: { version: 1, format: 'webp', size: 640, quality: 82 },
	photos: {
		version: 1,
		format: 'jpeg',
		size: 1920,
		quality: 80,
		thumbSize: 640,
		thumbQuality: 75,
		metadata: 'capture-and-credit'
	},
	logos: { version: 1, format: 'webp', size: 600, quality: 92, trim: 12 }
};

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const portable = (path) => path.split(sep).join('/');
const signature = (settings) => sha256(JSON.stringify(settings));

export function atomicWrite(path, bytes) {
	mkdirSync(dirname(path), { recursive: true });
	const temporary = `${path}.${randomUUID()}.tmp`;
	try {
		writeFileSync(temporary, bytes, { flag: 'wx' });
		renameSync(temporary, path);
	} finally {
		if (existsSync(temporary)) unlinkSync(temporary);
	}
}

export function loadManifest(root) {
	const path = join(root, MANIFEST_PATH);
	if (!existsSync(path)) return { version: 1, assets: {} };
	const manifest = JSON.parse(readFileSync(path, 'utf8'));
	if (manifest.version !== 1 || !manifest.assets || typeof manifest.assets !== 'object') {
		throw new Error('Unsupported image manifest; preserve it and migrate explicitly.');
	}
	return manifest;
}

function manifestBytes(manifest) {
	return `${JSON.stringify(
		{ ...manifest, assets: Object.fromEntries(Object.entries(manifest.assets).sort()) },
		null,
		2
	)}\n`;
}

function matches(root, outputs) {
	return Object.entries(outputs).every(
		([path, hash]) =>
			existsSync(join(root, path)) && sha256(readFileSync(join(root, path))) === hash
	);
}

/** Prepare every buffer before replacing anything; restore replaced files on an I/O failure. */
function commitFiles(root, writes) {
	const previous = new Map();
	try {
		for (const [path, bytes] of writes) {
			const fullPath = join(root, path);
			previous.set(path, existsSync(fullPath) ? readFileSync(fullPath) : null);
			atomicWrite(fullPath, bytes);
		}
	} catch (error) {
		for (const [path, bytes] of [...previous].reverse()) {
			const fullPath = join(root, path);
			if (bytes === null) {
				if (existsSync(fullPath)) unlinkSync(fullPath);
			} else atomicWrite(fullPath, bytes);
		}
		throw error;
	}
}

async function render(bytes, settings, outputs) {
	let full = sharp(bytes).rotate();
	if (settings.trim) {
		const { hasAlpha } = await sharp(bytes).metadata();
		if (!hasAlpha) full = full.flatten({ background: '#ffffff' });
		full = full.trim({ threshold: settings.trim });
	}
	full = full.resize(settings.size, settings.size, { fit: 'inside', withoutEnlargement: true });
	full =
		settings.format === 'jpeg'
			? full.jpeg({ quality: settings.quality, mozjpeg: true })
			: full.webp({ quality: settings.quality, ...(settings.trim ? { alphaQuality: 100 } : {}) });
	if (settings.format === 'jpeg') {
		// Preserve capture dates and attribution used by the gallery, without
		// carrying camera serial numbers, GPS or unrelated private metadata.
		const metadata = await exifr.parse(bytes, {
			pick: [
				'DateTimeOriginal',
				'CreateDate',
				'OffsetTimeOriginal',
				'OffsetTimeDigitized',
				'Artist',
				'Copyright'
			],
			reviveValues: false,
			translateValues: false
		});
		const exif = {};
		for (const [directory, fields] of Object.entries({
			IFD0: { Artist: 'Artist', Copyright: 'Copyright' },
			IFD2: {
				DateTimeOriginal: 'DateTimeOriginal',
				DateTimeDigitized: 'CreateDate',
				OffsetTimeOriginal: 'OffsetTimeOriginal',
				OffsetTimeDigitized: 'OffsetTimeDigitized'
			}
		})) {
			const values = Object.fromEntries(
				Object.entries(fields)
					.filter(([, field]) => typeof metadata?.[field] === 'string')
					.map(([tag, field]) => [tag, metadata[field]])
			);
			if (Object.keys(values).length) exif[directory] = values;
		}
		if (Object.keys(exif).length) full = full.withExif(exif);
	}
	const writes = [[outputs[0], await full.toBuffer()]];
	if (settings.thumbSize) {
		writes.push([
			outputs[1],
			await sharp(bytes)
				.rotate()
				.resize(settings.thumbSize, settings.thumbSize, {
					fit: 'inside',
					withoutEnlargement: true
				})
				.webp({ quality: settings.thumbQuality })
				.toBuffer()
		]);
	}
	return writes;
}

/**
 * Bootstrap only known existing derivatives explicitly. This preserves their
 * bytes; subsequent runs are governed by hashes, never by dimensions alone.
 */
export async function adoptAsset({ root, manifest, key, outputs, settings, source }) {
	if (manifest.assets[key]) throw new Error(`Already registered: ${key}`);
	const hashes = {};
	for (const [index, path] of outputs.entries()) {
		const bytes = readFileSync(join(root, path));
		const meta = await sharp(bytes).metadata();
		const size = index === 1 ? settings.thumbSize : settings.size;
		const format = index === 1 ? 'webp' : settings.format;
		if (
			meta.format !== format ||
			!meta.width ||
			!meta.height ||
			Math.max(meta.width, meta.height) > size
		) {
			throw new Error(`Cannot adopt ${path}: expected ${format} at most ${size}px`);
		}
		hashes[path] = sha256(bytes);
	}
	const entry = {
		settingsHash: signature(settings),
		settings: { ...settings },
		source: source ? { path: source, sha256: sha256(readFileSync(join(root, source))) } : null,
		outputs: hashes,
		adopted: true
	};
	manifest.assets[key] = entry;
	atomicWrite(join(root, MANIFEST_PATH), manifestBytes(manifest));
	return 'adopted';
}

export async function optimizeAsset({
	root,
	manifest,
	key,
	input,
	outputs,
	settings,
	keepInput = false
}) {
	const previous = manifest.assets[key];
	const sourceMatches =
		!previous?.source ||
		!existsSync(join(root, previous.source.path)) ||
		sha256(readFileSync(join(root, previous.source.path))) === previous.source.sha256;
	const incomingHash =
		input && existsSync(join(root, input)) ? sha256(readFileSync(join(root, input))) : null;
	const incomingIsOutput = Boolean(input && previous?.outputs[input] === incomingHash);
	const incomingIsOriginal = Boolean(incomingHash && previous?.source?.sha256 === incomingHash);
	const unchanged =
		previous &&
		matches(root, previous.outputs) &&
		sourceMatches &&
		(!input || incomingIsOutput || incomingIsOriginal);
	if (unchanged && previous.settingsHash === signature(settings)) return 'skipped';

	let source = input;
	if (!source || incomingIsOutput) {
		if (!previous?.source || !existsSync(join(root, previous.source.path))) {
			throw new Error(
				`Original required for ${key}: existing derivative cannot be recompressed. Restore an original to its image folder.`
			);
		}
		source = previous.source.path;
	}
	const bytes = readFileSync(join(root, source));
	const sourceHash = sha256(bytes);
	const sourceName = source.split('/').pop();
	const archived =
		keepInput || source.startsWith(`assets/image-originals/${key}/`)
			? source
			: `assets/image-originals/${key}/${sourceHash}-${sourceName}`;
	// Render can fail without touching either the source or the public files.
	const writes = await render(bytes, settings, outputs);
	const entry = {
		settingsHash: signature(settings),
		settings: { ...settings },
		source: { path: archived, sha256: sourceHash },
		outputs: Object.fromEntries(writes.map(([path, buffer]) => [path, sha256(buffer)])),
		adopted: false
	};
	const next = { ...manifest, assets: { ...manifest.assets, [key]: entry } };
	if (!keepInput && source !== archived && !existsSync(join(root, archived)))
		writes.unshift([archived, bytes]);
	writes.push([MANIFEST_PATH, manifestBytes(next)]);
	commitFiles(root, writes);
	manifest.assets[key] = entry;
	// Keep originals in assets/, outside Vite's public static tree. Delete the
	// incoming duplicate only after outputs and their manifest have committed.
	if (!keepInput && source !== archived && !outputs.includes(source))
		unlinkSync(join(root, source));
	return 'optimized';
}

export function outputUnchanged(root, entry, path) {
	return Boolean(entry?.outputs[path] && matches(root, { [path]: entry.outputs[path] }));
}

export const relativePath = (root, path) => portable(relative(root, path));
