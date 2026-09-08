import { describe, expect, it } from 'vitest';
import { positionPaperMeta } from '$lib/data/position-paper-meta';
import {
	recommendedCitation,
	toApa,
	toBibtex,
	toChicago,
	toRis
} from '$lib/reader/citation-formatters';

describe('position paper publication details', () => {
	it('names every contributor and gives total pages in the recommended citation', () => {
		const citation = recommendedCitation(positionPaperMeta);
		expect(citation.text).toMatch(/^Madore, Frédérick,/);
		for (const author of positionPaperMeta.authors.slice(1)) {
			expect(citation.text).toContain(author.name);
		}
		expect(citation.text).not.toContain('et al.');
		expect(citation.series).toBe('ZMO Programmatic Texts');
		expect(citation.afterSeries).toBe(', no. 16. 24 p. https://doi.org/10.58144/20260827-000.');
	});
	it('includes the series number and printed page range in every export', () => {
		expect(toChicago(positionPaperMeta)).toContain('ZMO Programmatic Texts, no. 16: 1–24.');
		expect(toApa(positionPaperMeta)).toContain('ZMO Programmatic Texts (16), 1–24.');
		const bibtex = toBibtex(positionPaperMeta);
		expect(bibtex).toContain('number = {16}');
		expect(bibtex).toContain('pages = {1--24}');
		expect(bibtex).not.toContain('volume =');
		const ris = toRis(positionPaperMeta);
		expect(ris).toContain('IS  - 16\nSP  - 1\nEP  - 24');
		expect(ris).not.toContain('VL  -');
	});

	it('omits unknown issue and page details without dangling punctuation', () => {
		const meta = {
			...positionPaperMeta,
			issue: undefined,
			pageStart: undefined,
			pageEnd: undefined
		};
		expect(toChicago(meta)).toContain('ZMO Programmatic Texts. https://doi.org/');
		expect(toApa(meta)).toContain('ZMO Programmatic Texts. https://doi.org/');
		expect(toBibtex(meta)).not.toMatch(/number =|pages =/);
		expect(toRis(meta)).not.toMatch(/^(IS|SP|EP) {2}-/m);
	});
});
