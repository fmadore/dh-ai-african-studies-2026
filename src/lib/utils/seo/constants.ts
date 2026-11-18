import { workshopInfo } from '#lib/data/workshop-info';

import type { Author, CreateSeoMetaOptions } from './types';

export const SITE_NAME = 'Digital Humanities and AI in African Studies 2026';
/**
 * The fallback description of every page and the WebSite record. The site is
 * an archive of an event that has happened, so it says what took place and
 * what came of it; dates and place come from workshopInfo, which imports
 * nothing, so there is no cycle. Keep it within ~160 characters.
 */
export const SITE_DESCRIPTION = `Charting New Territory, a workshop on digital humanities and AI in African Studies held ${workshopInfo.dates.full} in ${workshopInfo.location.city}: position paper, interviews and photos.`;
export const SITE_BASE_URL = 'https://fmadore.github.io/dh-ai-african-studies-2026';

/**
 * Social card used by every page that does not pass its own `image`.
 * Regenerate with `npm run og:image` after changing the photo or the wording.
 */
export const DEFAULT_OG_IMAGE = '/images/og-image.jpg';
export const OG_IMAGE_WIDTH = '1200';
export const OG_IMAGE_HEIGHT = '630';
export const DEFAULT_OG_IMAGE_ALT =
	'Workshop participants at the Xplanatorium Herrenhausen, over the title "Charting New Territory: Digital Humanities and AI in African Studies".';
export const DEFAULT_LOCALE = 'en_US';

export const DEFAULT_AUTHORS: Author[] = [
	{ name: 'Frédérick Madore', url: 'https://www.frederickmadore.com/' },
	{ name: 'Vincent Hiribarren', url: 'https://www.kcl.ac.uk/people/vincent-hiribarren' }
];

export const DEFAULT_KEYWORDS = [
	'Digital Humanities',
	'Artificial Intelligence',
	'African Studies',
	'Workshop',
	'Conference',
	'Hanover',
	'Germany',
	'Volkswagen Foundation'
];

export const DEFAULT_OPTIONS: Required<
	Omit<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>
> = {
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	path: '/',
	type: 'website',
	robots: 'index,follow',
	appendSiteName: true,
	locale: DEFAULT_LOCALE
};
