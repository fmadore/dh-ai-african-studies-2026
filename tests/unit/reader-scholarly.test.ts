import { expect, it } from 'vitest';
import { positionPaperMeta as meta } from '#lib/data/position-paper-meta';
import { paperScholarlyOptions } from '#lib/utils/paper-scholarly';
import {
	createScholarlyArticleJsonLd,
	createScholarlyMeta,
	type ScholarlyMetaOptions
} from '#lib/utils/seo';

const canonical = 'https://example.org/position-paper/read';

/** The reader's options as they were listed field by field before the helper. */
const fieldByField: ScholarlyMetaOptions = {
	title: meta.title,
	authors: [...meta.authors],
	publicationDate: meta.publicationDate,
	revisedDate: meta.revisedDate,
	abstract: meta.abstract,
	keywords: [...meta.keywords],
	language: meta.language,
	publisher: meta.publisher,
	journalTitle: meta.journalTitle,
	issue: meta.issue,
	pageStart: meta.pageStart,
	pageEnd: meta.pageEnd,
	abstractUrl: canonical,
	fullTextUrl: canonical,
	doi: meta.doi,
	issn: meta.issn,
	licence: meta.licence
};

it('gives the reader the same scholarly meta and JSON-LD as its field-by-field list', () => {
	const spread = paperScholarlyOptions(meta, { abstractUrl: canonical, fullTextUrl: canonical });
	expect(createScholarlyMeta(spread)).toEqual(createScholarlyMeta(fieldByField));
	expect(JSON.stringify(createScholarlyArticleJsonLd(spread))).toBe(
		JSON.stringify(createScholarlyArticleJsonLd(fieldByField))
	);
});

it('gives the landing page the same options as its inline spread', () => {
	const urls = {
		abstractUrl: 'https://example.org/position-paper',
		fullTextUrl: 'https://example.org/position-paper/read'
	};
	const inline = { ...meta, ...urls };
	const helper = paperScholarlyOptions(meta, urls);
	expect(createScholarlyMeta(helper)).toEqual(createScholarlyMeta(inline));
	expect(createScholarlyArticleJsonLd(helper)).toEqual(createScholarlyArticleJsonLd(inline));
});
