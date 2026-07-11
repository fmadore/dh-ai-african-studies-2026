import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import exifr from 'exifr';
import type { PageServerLoad } from './$types';
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

export const load: PageServerLoad = async () => {
	const photosDir = join(process.cwd(), 'static', 'images', 'photos');
	const photos: Photo[] = [];

	if (!existsSync(photosDir)) {
		return { photos };
	}

	const files = readdirSync(photosDir).filter((file) => {
		const ext = extname(file).toLowerCase();
		return IMAGE_EXTENSIONS.has(ext);
	});

	// Read EXIF data from all photos in parallel
	const results = await Promise.all(
		files.map(async (file) => {
			const filePath = join(photosDir, file);
			const id = file.replace(/\.[^.]+$/, '');
			let category: PhotoCategory | null = null;
			let takenAt: number | null = null;

			try {
				const buffer = readFileSync(filePath);
				const exif = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate']);
				const dateTaken = exif?.DateTimeOriginal ?? exif?.CreateDate;
				if (dateTaken instanceof Date) {
					category = getCategoryFromDate(dateTaken);
					takenAt = dateTaken.getTime();
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
				photographerUrl: mediaCredit.url
			};

			return { photo, takenAt };
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

	for (const { photo } of kept) {
		photos.push(photo);
	}

	return { photos };
};
