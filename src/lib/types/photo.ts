export type PhotoCategory = 'Day 1' | 'Day 2' | 'Day 3';

export interface Photo {
	id: string;
	src: string;
	thumbnail?: string;
	alt: string;
	caption?: string;
	category: PhotoCategory;
	photographer?: string;
	photographerUrl?: string;
	/** Pixel dimensions, when readable — drives the gallery's mixed-span grid. */
	width?: number;
	height?: number;
}
