import { describe, expect, it } from 'vitest';
import {
	createEventJsonLd,
	createImageGalleryJsonLd,
	createSeoMeta,
	createScholarlyArticleJsonLd,
	createVideoObjectJsonLd,
	createWebPageJsonLd,
	createWebSiteJsonLd,
	createWorkshopEventJsonLd,
	jsonLdScript
} from '#lib/utils/seo';
import { SITE_DESCRIPTION } from '#lib/utils/seo/constants';
import { paperSummary } from '#lib/data/position-paper-meta';
import { workshopInfo } from '#lib/data/workshop-info';

const SITE = 'https://fmadore.github.io/dh-ai-african-studies-2026';

describe('SEO utilities', () => {
	it('normalises canonical URLs and generates absolute social images', () => {
		const result = createSeoMeta({
			title: 'Schedule',
			path: 'schedule/',
			image: '/images/schedule.jpg'
		});

		expect(result.title).toMatch(/^Schedule \| /);
		expect(result.canonical).toBe('https://fmadore.github.io/dh-ai-african-studies-2026/schedule');
		expect(result.meta.find((tag) => tag.key === 'og:image')?.content).toBe(
			'https://fmadore.github.io/dh-ai-african-studies-2026/images/schedule.jpg'
		);
	});

	it('adds sensible times and structured location fields to events', () => {
		const event = createEventJsonLd({
			startDate: '2026-02-18',
			endDate: '2026-02-20',
			locationName: 'Venue',
			locationCity: 'Hanover',
			locationCountry: 'Germany'
		});

		expect(event.startDate).toBe('2026-02-18T09:00:00+01:00');
		expect(event.endDate).toBe('2026-02-20T17:00:00+01:00');
		expect(event.location?.address).toMatchObject({ addressLocality: 'Hanover' });
	});

	it('escapes script-closing markup in JSON-LD payloads', () => {
		const article = createScholarlyArticleJsonLd({
			title: 'A <script> title',
			authors: [{ name: 'Ada Lovelace' }],
			publicationDate: '2026-02-18',
			abstract: 'An abstract',
			keywords: ['AI'],
			language: 'en',
			publisher: 'Example Press',
			abstractUrl: 'https://example.org/article'
		});

		expect(jsonLdScript(article)).not.toContain('<script> title');
		expect(jsonLdScript(article)).toContain('\\u003Cscript>');
	});

	it('emits the workshop organisers as people and no invented street address', () => {
		const event = createWorkshopEventJsonLd({ description: 'd', url: `${SITE}/` });

		expect(event.organizer).toEqual([
			{ '@type': 'Person', name: 'Frédérick Madore', url: 'https://www.frederickmadore.com/' },
			{
				'@type': 'Person',
				name: 'Vincent Hiribarren',
				url: 'https://www.kcl.ac.uk/people/vincent-hiribarren'
			}
		]);
		expect(event.location).toEqual({
			'@type': 'Place',
			name: 'Xplanatorium Herrenhausen',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Hanover',
				addressCountry: 'Germany'
			}
		});
		expect(JSON.parse(JSON.stringify(event)).location.address).not.toHaveProperty('streetAddress');
		expect(event.image).toBe(`${SITE}/images/og-image.jpg`);
	});

	it('marks pages and the site as English and points WebSite at the home canonical', () => {
		const site = createWebSiteJsonLd();
		const page = createWebPageJsonLd({ name: 'P', url: `${SITE}/p` });

		expect(site).toMatchObject({ inLanguage: 'en', url: `${SITE}/` });
		expect(page).toMatchObject({ '@type': 'WebPage', inLanguage: 'en' });
		expect(page.isPartOf?.url).toBe(site.url);
		expect(createImageGalleryJsonLd({ name: 'Photos', url: `${SITE}/photos` })['@type']).toBe(
			'ImageGallery'
		);
	});

	it('builds VideoObjects without inventing an upload date', () => {
		const video = createVideoObjectJsonLd({
			name: 'Topic',
			description: 'About it',
			youtubeId: 'abc123',
			thumbnail: '/images/interviews/abc123.webp'
		});

		expect(video).toMatchObject({
			'@type': 'VideoObject',
			thumbnailUrl: `${SITE}/images/interviews/abc123.webp`,
			embedUrl: 'https://www.youtube-nocookie.com/embed/abc123',
			url: 'https://www.youtube.com/watch?v=abc123'
		});
		expect(video).not.toHaveProperty('uploadDate');
		expect(
			createVideoObjectJsonLd({ name: 'T', description: 'D', youtubeId: 'xyz' }).thumbnailUrl
		).toBe('https://i.ytimg.com/vi/xyz/hqdefault.jpg');
		expect(
			createVideoObjectJsonLd({
				name: 'T',
				description: 'D',
				youtubeId: 'x',
				uploadDate: '2026-03-01'
			}).uploadDate
		).toBe('2026-03-01');
	});

	it('keeps search descriptions within what results pages show', () => {
		for (const description of [SITE_DESCRIPTION, paperSummary]) {
			expect(description.length, description).toBeLessThanOrEqual(160);
		}
		// An archive: the workshop is described as having taken place.
		expect(SITE_DESCRIPTION).toContain(`held ${workshopInfo.dates.full}`);
		expect(SITE_DESCRIPTION).not.toMatch(/funded by/i);
	});
});
