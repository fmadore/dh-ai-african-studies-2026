import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	mkdtempSync,
	mkdirSync,
	readFileSync,
	existsSync,
	writeFileSync,
	rmSync,
	readdirSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import sharp from 'sharp';
import exifr from 'exifr';
import { optimizeImages } from '../../scripts/optimize_images.mjs';
import {
	SETTINGS,
	MANIFEST_PATH,
	optimizeAsset,
	adoptAsset,
	loadManifest,
	atomicWrite,
	sha256
} from '../../scripts/image-pipeline.mjs';

function workspace(t) {
	const root = mkdtempSync(join(tmpdir(), 'dh-media-test-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	return root;
}
async function picture(root, path, options = {}) {
	const output = join(root, path);
	mkdirSync(dirname(output), { recursive: true });
	await sharp({
		create: { width: options.width || 800, height: 500, channels: 3, background: '#785ac8' }
	})
		.png()
		.toFile(output);
	return readFileSync(output);
}

const portrait = 'static/images/participants/person.png';
const portraitOutput = 'static/images/participants/person.webp';

test('new portrait keeps an original outside static and skips byte-for-byte on rerun', async (t) => {
	const root = workspace(t);
	const original = await picture(root, portrait);
	assert.deepEqual(await optimizeImages({ root, offline: true }), {
		adopted: 0,
		optimized: 1,
		skipped: 0
	});
	assert.equal(existsSync(join(root, portrait)), false);
	const manifest = loadManifest(root);
	const entry = manifest.assets['participants/person'];
	assert.match(entry.source.path, /^assets\/image-originals\//);
	assert.deepEqual(readFileSync(join(root, entry.source.path)), original);
	const derivative = readFileSync(join(root, portraitOutput));
	const manifestBytes = readFileSync(join(root, MANIFEST_PATH));
	assert.deepEqual(await optimizeImages({ root, offline: true }), {
		adopted: 0,
		optimized: 0,
		skipped: 1
	});
	assert.deepEqual(readFileSync(join(root, portraitOutput)), derivative);
	assert.deepEqual(readFileSync(join(root, MANIFEST_PATH)), manifestBytes);
	assert.equal((await sharp(derivative).metadata()).width, 640);
});

test('adoption preserves legacy bytes and refuses settings changes without an original', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	const legacy = await sharp(readFileSync(join(root, portrait)))
		.resize(640)
		.webp()
		.toBuffer();
	atomicWrite(join(root, portraitOutput), legacy);
	rmSync(join(root, portrait));
	assert.deepEqual(await optimizeImages({ root, offline: true, adoptExisting: true }), {
		adopted: 1,
		optimized: 0,
		skipped: 0
	});
	assert.deepEqual(await optimizeImages({ root, offline: true }), {
		adopted: 0,
		optimized: 0,
		skipped: 1
	});
	assert.deepEqual(readFileSync(join(root, portraitOutput)), legacy);
	await assert.rejects(
		optimizeAsset({
			root,
			manifest: loadManifest(root),
			key: 'participants/person',
			input: portraitOutput,
			outputs: [portraitOutput],
			settings: { ...SETTINGS.participants, quality: 70 }
		}),
		/Original required/
	);
	assert.deepEqual(readFileSync(join(root, portraitOutput)), legacy);
});

test('changed original rebuilds only its own outputs and can restore a deleted derivative', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	await optimizeImages({ root, offline: true });
	const originalEntry = loadManifest(root).assets['participants/person'];
	await picture(root, portrait, { width: 900 });
	assert.equal((await optimizeImages({ root, offline: true })).optimized, 1);
	const entry = loadManifest(root).assets['participants/person'];
	assert.notEqual(entry.source.sha256, originalEntry.source.sha256);
	assert.ok(existsSync(join(root, originalEntry.source.path)), 'older original retained');
	rmSync(join(root, portraitOutput));
	assert.equal((await optimizeImages({ root, offline: true })).optimized, 1);
	assert.equal(loadManifest(root).assets['participants/person'].source.path, entry.source.path);
});

test('photo keeps date/credit, strips private camera metadata and creates a thumbnail', async (t) => {
	const root = workspace(t);
	const input = 'static/images/photos/20260218_fixture.jpg';
	mkdirSync(dirname(join(root, input)), { recursive: true });
	await sharp({ create: { width: 2200, height: 1500, channels: 3, background: '#123456' } })
		.jpeg()
		.withExif({
			IFD0: { Artist: 'Photographer' },
			IFD2: { DateTimeOriginal: '2026:02:18 12:34:56', BodySerialNumber: 'private-camera-123' }
		})
		.toFile(join(root, input));
	const sourceExif = await exifr.parse(join(root, input));
	assert.equal(sourceExif.SerialNumber, 'private-camera-123');
	await optimizeImages({ root, offline: true });
	const full = await sharp(join(root, input)).metadata();
	assert.equal(full.width, 1920);
	const exif = await exifr.parse(join(root, input), { reviveValues: false });
	assert.equal(exif.DateTimeOriginal, '2026:02:18 12:34:56');
	assert.equal(exif.Artist, 'Photographer');
	assert.equal(exif.SerialNumber, undefined);
	const thumb = join(root, 'static/images/photos/thumbs/20260218_fixture.webp');
	assert.equal((await sharp(thumb).metadata()).width, 640);
	assert.equal((await optimizeImages({ root, offline: true })).skipped, 1);
});

test('invalid images cannot remove inputs or replace known derivatives', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	await optimizeImages({ root, offline: true });
	const derivative = readFileSync(join(root, portraitOutput));
	const manifest = readFileSync(join(root, MANIFEST_PATH));
	writeFileSync(join(root, portrait), 'not an image');
	await assert.rejects(optimizeImages({ root, offline: true }), /unsupported image format/i);
	assert.equal(readFileSync(join(root, portrait), 'utf8'), 'not an image');
	assert.deepEqual(readFileSync(join(root, portraitOutput)), derivative);
	assert.deepEqual(readFileSync(join(root, MANIFEST_PATH)), manifest);
});

test('ambiguous same-stem incoming images fail instead of silently choosing one', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	await picture(root, 'static/images/participants/person.jpg');
	await assert.rejects(optimizeImages({ root, offline: true }), /Conflicting inputs/);
	assert.ok(existsSync(join(root, portrait)));
});

test('atomic-write failure keeps prior destination and cleans the temporary file', (t) => {
	const root = workspace(t);
	const destination = join(root, 'directory');
	mkdirSync(destination);
	assert.throws(() => atomicWrite(destination, 'bytes'));
	assert.deepEqual(readdirSync(root), ['directory']);
});

test('legacy adoption validates actual format/dimensions before recording hashes', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	await assert.rejects(
		adoptAsset({
			root,
			manifest: loadManifest(root),
			key: 'participants/person',
			outputs: [portrait],
			settings: SETTINGS.participants
		}),
		/Cannot adopt/
	);
	assert.equal(existsSync(join(root, MANIFEST_PATH)), false);
});

test('committed legacy corpus still matches its recorded bytes', () => {
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const manifest = loadManifest(root);
	assert.ok(Object.keys(manifest.assets).length > 0);
	for (const entry of Object.values(manifest.assets)) {
		for (const [path, hash] of Object.entries(entry.outputs))
			assert.equal(sha256(readFileSync(join(root, path))), hash, path);
	}
});

test('photo transaction rolls back public output and retains original if a target is unwritable', async (t) => {
	const root = workspace(t);
	const input = 'static/images/photos/photo.jpg';
	await picture(root, input);
	const original = readFileSync(join(root, input));
	mkdirSync(join(root, 'static/images/photos/thumbs/photo.webp'), { recursive: true });
	await assert.rejects(optimizeImages({ root, offline: true }));
	assert.deepEqual(readFileSync(join(root, input)), original);
	assert.equal(existsSync(join(root, MANIFEST_PATH)), false);
});

test('a fresh checkout skips unchanged derivatives even without the private original archive', async (t) => {
	const root = workspace(t);
	await picture(root, portrait);
	await optimizeImages({ root, offline: true });
	const entry = loadManifest(root).assets['participants/person'];
	rmSync(join(root, entry.source.path));
	assert.equal((await optimizeImages({ root, offline: true })).skipped, 1);
	rmSync(join(root, portraitOutput));
	await assert.rejects(optimizeImages({ root, offline: true }), /Original required/);
});
