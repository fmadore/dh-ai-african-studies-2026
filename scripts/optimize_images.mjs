/**
 * One-shot / repeatable image optimization for the static assets.
 *
 * - static/images/participants/*  → resized (max 640px) WebP portraits
 * - static/images/photos/*        → resized (max 1920px) JPEGs, EXIF preserved
 *                                   (the photos page reads DateTimeOriginal to
 *                                   group by workshop day) + 640px WebP thumbs
 *                                   in static/images/photos/thumbs/
 * - static/images/logo/*          → whitespace-trimmed WebP marks in
 *                                   static/images/logo/trimmed/
 *
 * Run with: npm run optimize:images
 * Idempotent: already-small images are only re-encoded, never upscaled.
 */

import sharp from 'sharp';
import { readdirSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PARTICIPANTS_DIR = join(ROOT, 'static', 'images', 'participants');
const PHOTOS_DIR = join(ROOT, 'static', 'images', 'photos');
const THUMBS_DIR = join(PHOTOS_DIR, 'thumbs');
const LOGO_DIR = join(ROOT, 'static', 'images', 'logo');
const LOGO_TRIMMED_DIR = join(LOGO_DIR, 'trimmed');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

function listImages(dir) {
	return readdirSync(dir).filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()));
}

async function optimizeParticipants() {
	let before = 0;
	let after = 0;

	for (const file of listImages(PARTICIPANTS_DIR)) {
		const input = join(PARTICIPANTS_DIR, file);
		const slug = basename(file, extname(file));
		const output = join(PARTICIPANTS_DIR, `${slug}.webp`);

		before += statSync(input).size;
		const buffer = await sharp(input)
			.rotate()
			.resize(640, 640, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 82 })
			.toBuffer();
		if (input !== output) unlinkSync(input);
		writeFileSync(output, buffer);
		after += statSync(output).size;
	}

	console.log(`participants: ${kb(before)} → ${kb(after)}`);
}

async function optimizePhotos() {
	mkdirSync(THUMBS_DIR, { recursive: true });
	let before = 0;
	let after = 0;

	for (const file of listImages(PHOTOS_DIR)) {
		const input = join(PHOTOS_DIR, file);
		const id = basename(file, extname(file));
		const output = join(PHOTOS_DIR, `${id}.jpg`);

		before += statSync(input).size;

		// Full-size image for the lightbox — EXIF kept for day categorisation
		const fullBuffer = await sharp(input)
			.rotate()
			.resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: 80, mozjpeg: true })
			.withMetadata()
			.toBuffer();

		// Grid thumbnail (no EXIF needed)
		await sharp(input)
			.rotate()
			.resize(640, 640, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 75 })
			.toFile(join(THUMBS_DIR, `${id}.webp`));

		if (input !== output) unlinkSync(input);
		writeFileSync(output, fullBuffer);
		after += statSync(output).size;
	}

	console.log(`photos: ${kb(before)} → ${kb(after)} (+ thumbs)`);
}

/**
 * Funder marks carry a lot of baked-in whitespace — the Africa Multiple JPEG is
 * 2250x1175 for 2105x524 of actual logo, so at a fixed box height the mark
 * rendered at less than half the size of its neighbours. Trimming lets the
 * footer size every mark by its real ink rather than its canvas.
 *
 * Sources with alpha keep it. Opaque sources are flattened onto white, which is
 * the footer plate's colour, so no seam is visible where the two meet.
 */
const LOGO_SOURCES = [
	{ file: 'VWST-logo.png', slug: 'vwst' },
	{ file: 'ZMO-logo.png', slug: 'zmo' },
	{ file: 'uni-bayreuth-africa-multiple-logo.jpeg', slug: 'africa-multiple' }
];

async function optimizeLogos() {
	mkdirSync(LOGO_TRIMMED_DIR, { recursive: true });
	let before = 0;
	let after = 0;

	for (const { file, slug } of LOGO_SOURCES) {
		const input = join(LOGO_DIR, file);
		const output = join(LOGO_TRIMMED_DIR, `${slug}.webp`);

		before += statSync(input).size;

		const { hasAlpha } = await sharp(input).metadata();
		let pipeline = sharp(input);
		// Flatten first: trim() keys off the top-left pixel, and a transparent
		// canvas round-trips differently from a white one.
		if (!hasAlpha) pipeline = pipeline.flatten({ background: '#ffffff' });

		await pipeline
			.trim({ threshold: 12 })
			.resize(600, 600, { fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 92, alphaQuality: 100 })
			.toFile(output);

		after += statSync(output).size;
	}

	console.log(`logos: ${kb(before)} → ${kb(after)} (trimmed)`);
}

await optimizeParticipants();
await optimizePhotos();
await optimizeLogos();
console.log('done');
