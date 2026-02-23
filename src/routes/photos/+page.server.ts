import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { PageServerLoad } from './$types';
import type { Photo, PhotoCategory } from '$lib/types/photo';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const folderToCategory: Record<string, PhotoCategory> = {
	'day-1': 'Day 1',
	'day-2': 'Day 2',
	'day-3': 'Day 3'
};

export const load: PageServerLoad = async () => {
	const photosDir = join(process.cwd(), 'static', 'images', 'photos');
	const photos: Photo[] = [];

	if (!existsSync(photosDir)) {
		return { photos };
	}

	for (const folder of readdirSync(photosDir)) {
		const folderPath = join(photosDir, folder);
		if (!statSync(folderPath).isDirectory()) continue;

		const category = folderToCategory[folder];
		if (!category) continue;

		for (const file of readdirSync(folderPath)) {
			const ext = extname(file).toLowerCase();
			if (!IMAGE_EXTENSIONS.has(ext)) continue;

			const id = file.replace(/\.[^.]+$/, '');
			photos.push({
				id,
				src: `/images/photos/${folder}/${file}`,
				alt: id.replace(/[_-]/g, ' ').trim(),
				category
			});
		}
	}

	photos.sort((a, b) => a.id.localeCompare(b.id));

	return { photos };
};
