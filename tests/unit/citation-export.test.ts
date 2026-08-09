import { describe, expect, it } from 'vitest';
import type { CslReference } from '$lib/types/csl';
import {
	escapeBibtex,
	formatCslDate,
	generateBibtex,
	generateRis,
	getCslYear
} from '$lib/utils/citation-export';

const reference: CslReference = {
	id: 'example',
	type: 'article-journal',
	title: 'A 50% {test}',
	author: [{ given: 'Ada', family: 'Lovelace' }],
	issued: { 'date-parts': [[2024, 2, 9]] },
	'container-title': 'Journal of Examples',
	publisher: 'Example Press',
	page: '12-20',
	DOI: '10.1234/example',
	tags: ['AI']
};

describe('citation exports', () => {
	it('formats partial CSL dates and safely escapes BibTeX', () => {
		expect(formatCslDate(reference.issued)).toBe('2024-02-09');
		expect(getCslYear(reference.issued)).toBe('2024');
		expect(escapeBibtex('50% {test}')).toBe('50\\% \\{test\\}');
	});

	it('produces BibTeX and RIS records with standard terminators', () => {
		const bibtex = generateBibtex([reference]);
		const ris = generateRis([reference]);

		expect(bibtex).toContain('@article{Lovelace2024A,');
		expect(bibtex).toContain('title = {A 50\\% \\{test\\}}');
		expect(ris).toContain('TY  - JOUR');
		expect(ris).toContain('DA  - 2024/02/09');
		expect(ris).toMatch(/ER {2}- $/);
	});
});
