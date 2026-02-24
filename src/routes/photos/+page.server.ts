import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import exifr from 'exifr';
import type { PageServerLoad } from './$types';
import type { Photo, PhotoCategory } from '$lib/types/photo';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** Workshop day boundaries (local dates in Hanover, CET = UTC+1) */
const WORKSHOP_DAYS: { date: string; category: PhotoCategory }[] = [
	{ date: '2026-02-18', category: 'Day 1' },
	{ date: '2026-02-19', category: 'Day 2' },
	{ date: '2026-02-20', category: 'Day 3' }
];

/**
 * Determine the workshop day from a photo's EXIF date.
 * Compares only the date portion (YYYY-MM-DD) to handle timezone differences.
 */
function getCategoryFromDate(date: Date): PhotoCategory | null {
	const isoDate = date.toISOString().slice(0, 10);
	const match = WORKSHOP_DAYS.find((d) => d.date === isoDate);
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

			try {
				const buffer = readFileSync(filePath);
				const exif = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate']);
				const dateTaken = exif?.DateTimeOriginal ?? exif?.CreateDate;
				if (dateTaken instanceof Date) {
					category = getCategoryFromDate(dateTaken);
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

			return {
				id,
				src: `/images/photos/${file}`,
				alt: id.replace(/[_-]/g, ' ').trim(),
				category,
				photographer: 'Calum Houston',
				photographerUrl: 'https://calumbrett.myportfolio.com/'
			} satisfies Photo;
		})
	);

	for (const photo of results) {
		if (photo) photos.push(photo);
	}

	photos.sort((a, b) => a.id.localeCompare(b.id));

	return { photos };
};
