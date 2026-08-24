import { describe, expect, it } from 'vitest';
import type { CslReference } from '$lib/types/csl';
import {
	buildPageItems,
	filterReferences,
	formatCitation,
	getAccessLink,
	sortReferences,
	stripReadingStatusTags
} from '$lib/utils/references';
import { toReferenceListItem } from '$lib/utils/reference-index';

const references: CslReference[] = [
	{
		id: 'one',
		type: 'book',
		title: 'African Archives',
		author: [{ given: 'Ada', family: 'Lovelace' }],
		issued: { 'date-parts': [[2024]] },
		tags: ['Archives', 'Lu'],
		language: 'en',
		DOI: '10.1234/example'
	},
	{
		id: 'two',
		type: 'article-journal',
		title: 'Machine Learning in Dakar',
		author: [{ given: 'Grace', family: 'Hopper' }],
		issued: { 'date-parts': [[2022]] },
		tags: ['AI'],
		language: 'fr',
		URL: 'https://example.org/article'
	},
	{
		id: 'three',
		type: 'report',
		title: 'A local report',
		editor: [{ given: 'Pat', family: 'Editor' }]
	}
];

describe('reference utilities', () => {
	it('removes only exact reading-status workflow tags', () => {
		const cleaned = stripReadingStatusTags(references);

		expect(cleaned[0].tags).toEqual(['Archives']);
		expect(references[0].tags).toEqual(['Archives', 'Lu']);
	});

	it('combines search, type, year, tag, and language filters', () => {
		const result = filterReferences(references, {
			searchQuery: 'lovelace',
			selectedTypes: ['book'],
			selectedYears: ['2024'],
			selectedTags: ['Archives'],
			selectedLanguages: ['en']
		});

		expect(result.map((ref) => ref.id)).toEqual(['one']);
	});

	it('sorts a copy of references and keeps the source order intact', () => {
		const sorted = sortReferences(references, 'newest');

		expect(sorted.map((ref) => ref.id)).toEqual(['one', 'two', 'three']);
		expect(references.map((ref) => ref.id)).toEqual(['one', 'two', 'three']);
	});

	it('builds compact pagination with ellipses', () => {
		expect(buildPageItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
	});

	it('formats citations and normalises access links', () => {
		expect(formatCitation(references[2])).toEqual({ authors: 'Pat Editor (ed)', year: 'n.d.' });
		expect(getAccessLink(references[0])).toBe('https://doi.org/10.1234/example');
		expect(getAccessLink(references[1])).toBe('https://example.org/article');
		expect(getAccessLink(references[2])).toBe('');
	});
});

describe('toReferenceListItem', () => {
	it('keeps a short abstract whole and marks it complete', () => {
		const item = toReferenceListItem({
			id: 'short',
			type: 'book',
			abstract: 'A brief note.'
		});

		expect(item.abstractPreview).toBe('A brief note.');
		expect(item.abstractIsComplete).toBe(true);
	});

	it('truncates a long abstract at a word boundary with an ellipsis', () => {
		const abstract = `${'word '.repeat(80)}final`;
		const item = toReferenceListItem({ id: 'long', type: 'book', abstract });

		expect(item.abstractIsComplete).toBe(false);
		expect(item.abstractPreview!.length).toBeLessThanOrEqual(301);
		expect(item.abstractPreview!.endsWith('…')).toBe(true);
		expect(item.abstractPreview).not.toMatch(/wor…$/);
	});

	it('omits the preview when there is no abstract and drops heavy fields', () => {
		const item = toReferenceListItem({
			id: 'bare',
			type: 'report',
			note: 'internal note',
			accessed: { 'date-parts': [[2026, 1, 1]] }
		});

		expect(item.abstractPreview).toBeUndefined();
		expect(item.abstractIsComplete).toBe(true);
		expect('note' in item).toBe(false);
		expect('accessed' in item).toBe(false);
	});
});
