import { describe, expect, it } from 'vitest';
import {
	createEventJsonLd,
	createSeoMeta,
	createScholarlyArticleJsonLd,
	jsonLdScript
} from '$lib/utils/seo';

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
});
