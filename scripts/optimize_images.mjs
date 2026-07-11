/**
 * One-shot / repeatable image optimization for the static assets.
 *
 * - static/images/participants/*  → resized (max 640px) WebP portraits
 * - static/images/photos/*        → resized (max 1920px) JPEGs, EXIF preserved
 *                                   (the photos page reads DateTimeOriginal to
 *                                   group by workshop day) + 640px WebP thumbs
 *                                   in static/images/photos/thumbs/
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

await optimizeParticipants();
await optimizePhotos();
console.log('done');
