import { expect, it } from 'vitest';
import { positionPaperMeta } from '$lib/data/position-paper-meta';
import { createScholarlyMeta, createScholarlyArticleJsonLd } from '$lib/utils/seo';

it('exports the published issue and pagination without advertising an unavailable PDF', () => {
	const options = { ...positionPaperMeta, abstractUrl: 'https://example.org/position-paper' };
	const tags = createScholarlyMeta(options);
	const value = (name: string) => tags.find((tag) => tag.name === name)?.content;
	expect(value('citation_abstract')).toBe(positionPaperMeta.abstract);
	expect(value('DC.description')).toBe(positionPaperMeta.abstract);
	expect(value('citation_publication_date')).toBe('2026/09/08');
	expect(value('citation_issue')).toBe('16');
	expect(value('citation_firstpage')).toBe('1');
	expect(value('citation_lastpage')).toBe('24');
	expect(value('citation_pdf_url')).toBeUndefined();
	expect(createScholarlyArticleJsonLd(options)).toMatchObject({
		datePublished: '2026-09-08',
		pageStart: '1',
		pageEnd: '24',
		isPartOf: {
			'@type': 'PublicationIssue',
			issueNumber: '16',
			isPartOf: { '@type': 'Periodical' }
		}
	});
});
