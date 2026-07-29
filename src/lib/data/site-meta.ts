/**
 * Site-level provenance: how to cite this archive, and under what terms its
 * material may be reused.
 *
 * The site publishes photographs, video interviews and a bibliography, so a
 * licence statement is not optional. Photographs stay with their photographer
 * (see `mediaCredit` in ./photos.ts) — the site licence covers the written
 * content and the compiled data, not third-party media.
 */

import { workshopInfo } from './workshop-info';

export const siteCitation = {
	authors: 'Madore, Frédérick & Hiribarren, Vincent',
	year: 2026,
	title: 'Charting New Territory: Digital Humanities and AI in African Studies',
	publisher: 'Leibniz-Zentrum Moderner Orient',
	url: 'https://fmadore.github.io/dh-ai-african-studies-2026/'
} as const;

/**
 * Attribution required, commercial reuse not permitted.
 *
 * This covers the site only. The position paper carries whatever licence the
 * ZMO Programmatic Texts series applies on publication — see
 * `positionPaperMeta.licence` in ./position-paper-meta.ts, which is deliberately
 * separate so the two can never drift into each other.
 */
export const siteLicence = {
	name: 'CC BY-NC 4.0',
	fullName: 'Creative Commons Attribution-NonCommercial 4.0 International',
	url: 'https://creativecommons.org/licenses/by-nc/4.0/',
	/** What the licence does and does not cover. */
	scope: 'Text and data on this site',
	summary: 'Reuse and adapt with attribution, for non-commercial purposes.',
	exception: 'Photographs and video interviews remain © their author.'
} as const;

/** Rendered in the footer and copyable as a single line. */
export const citationString = `${siteCitation.authors} (${siteCitation.year}). ${siteCitation.title}. ${siteCitation.publisher}. ${siteCitation.url}`;

export const organiserCredit = workshopInfo.organizers.full;
