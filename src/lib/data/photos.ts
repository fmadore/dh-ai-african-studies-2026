import type { PhotoCategory } from '#lib/types/photo';

export const photoCategories: PhotoCategory[] = ['Day 1', 'Day 2', 'Day 3'];

/** Credit for workshop photography and interview films */
export const mediaCredit = {
	name: 'Calum Houston',
	url: 'https://calumbrett.myportfolio.com/'
} as const;

/**
 * A position-based name for a gallery photo, e.g. "photo 12 of 65, Day 1".
 * Every photo of a day shares one descriptive `alt`, so a control or dialog
 * named from it alone gave ~20 identical buttons per day.
 */
export function photoPositionLabel(index: number, total: number, category: string): string {
	return `photo ${index + 1} of ${total}, ${category}`;
}
