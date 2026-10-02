/**
 * Build-time photo index.
 *
 * Scans `static/images/photos/`, reads each file's EXIF capture time and maps
 * it onto a workshop day. Runs at prerender time only — shared by `/photos`
 * (the full gallery) and `/` (the homepage strip), which previously had no
 * access to the gallery at all.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import exifr from 'exifr';
import type { Photo, PhotoCategory } from '$lib/types/photo';
import { mediaCredit } from '$lib/data/photos';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Workshop day boundaries (local dates in Hanover, CET = UTC+1) */
const WORKSHOP_DAYS: { date: string; category: PhotoCategory }[] = [
	{ date: '2026-02-18', category: 'Day 1' },
	{ date: '2026-02-19', category: 'Day 2' },
	{ date: '2026-02-20', category: 'Day 3' }
];

/**
 * Determine the workshop day from a photo's EXIF date.
 * exifr returns capture times as naive local dates, so compare local date
 * components — converting via toISOString() (UTC) would shift photos taken
 * shortly after midnight CET to the previous day and silently drop them.
 */
function getCategoryFromDate(date: Date): PhotoCategory | null {
	const localDate = [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-');
	const match = WORKSHOP_DAYS.find((d) => d.date === localDate);
	return match?.category ?? null;
}

let cached: Photo[] | null = null;
let inFlight: Promise<Photo[]> | null = null;

/** Concurrent prerenders share one bounded scan, including while it is running. */
export function loadWorkshopPhotos(): Promise<Photo[]> {
	if (cached) return Promise.resolve(cached);
	if (!inFlight) {
		inFlight = indexWorkshopPhotos()
			.then((photos) => (cached = photos))
			.finally(() => {
				inFlight = null;
			});
	}
	return inFlight;
}

async function indexWorkshopPhotos(): Promise<Photo[]> {
	const photosDir = join(process.cwd(), 'static', 'images', 'photos');
	if (!existsSync(photosDir)) {
		return [];
	}

	const files = (await readdir(photosDir)).filter((file) => {
		const ext = extname(file).toLowerCase();
		return IMAGE_EXTENSIONS.has(ext);
	});

	// Bound buffer allocation and EXIF work even as the gallery grows.
	type IndexedPhoto = { photo: Photo; takenAt: number | null };
	async function readPhoto(file: string): Promise<IndexedPhoto | null> {
		const filePath = join(photosDir, file);
		const id = file.replace(/\.[^.]+$/, '');
		let category: PhotoCategory | null = null;
		let takenAt: number | null = null;
		let width: number | undefined;
		let height: number | undefined;

		try {
			const buffer = await readFile(filePath);
			const exif = await exifr.parse(buffer, [
				'DateTimeOriginal',
				'CreateDate',
				'ExifImageWidth',
				'ExifImageHeight',
				'Orientation'
			]);
			const dateTaken = exif?.DateTimeOriginal ?? exif?.CreateDate;
			if (dateTaken instanceof Date) {
				category = getCategoryFromDate(dateTaken);
				takenAt = dateTaken.getTime();
			}
			if (exif?.ExifImageWidth && exif?.ExifImageHeight) {
				// Orientation 5–8 means the stored frame is rotated 90°
				const rotated = typeof exif.Orientation === 'number' && exif.Orientation >= 5;
				width = rotated ? exif.ExifImageHeight : exif.ExifImageWidth;
				height = rotated ? exif.ExifImageWidth : exif.ExifImageHeight;
			}
		} catch {
			// No EXIF data — will fall through to filename-based detection
		}

		// Fallback: try to extract date from filename (e.g., 20260218_095747.jpg)
		if (!category) {
			const dateMatch = file.match(/^(\d{4})(\d{2})(\d{2})/);
			if (dateMatch) {
				const fileDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
				const match = WORKSHOP_DAYS.find((d) => d.date === fileDate);
				if (match) category = match.category;
			}
		}

		if (!category) return null;

		const thumbPath = join(photosDir, 'thumbs', `${id}.webp`);
		const photo: Photo = {
			id,
			src: `/images/photos/${file}`,
			thumbnail: existsSync(thumbPath) ? `/images/photos/thumbs/${id}.webp` : undefined,
			alt: `Workshop participants during ${category} of Digital Humanities and AI in African Studies`,
			category,
			photographer: mediaCredit.name,
			photographerUrl: mediaCredit.url,
			width,
			height
		};

		return { photo, takenAt };
	}

	const results: (IndexedPhoto | null)[] = new Array(files.length);
	let nextIndex = 0;
	await Promise.all(
		Array.from({ length: Math.min(4, files.length) }, async () => {
			while (nextIndex < files.length) {
				const index = nextIndex++;
				results[index] = await readPhoto(files[index]);
			}
		})
	);

	// Sort chronologically (EXIF capture time), falling back to day + filename
	// so mixed filename schemes (camera vs. phone) don't interleave wrongly.
	const kept = results.filter((r) => r !== null);
	kept.sort((a, b) => {
		const dayDiff = a.photo.category.localeCompare(b.photo.category);
		if (dayDiff !== 0) return dayDiff;
		if (a.takenAt !== null && b.takenAt !== null) return a.takenAt - b.takenAt;
		return a.photo.id.localeCompare(b.photo.id);
	});

	return kept.map(({ photo }) => photo);
}

/**
 * An evenly-spaced sample across the whole gallery — used for the homepage
 * strip, so it reads as three days rather than the first four frames of Day 1.
 */
export async function loadPhotoSample(count: number): Promise<Photo[]> {
	if (!Number.isInteger(count) || count < 0)
		throw new RangeError('Photo sample count must be a non-negative integer');
	if (count === 0) return [];
	const photos = await loadWorkshopPhotos();
	if (photos.length <= count) return photos;
	const step = photos.length / count;
	return Array.from({ length: count }, (_, i) => photos[Math.floor(i * step)]);
}
