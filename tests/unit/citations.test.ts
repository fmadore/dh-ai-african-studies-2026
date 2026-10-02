import { describe, expect, it } from 'vitest';
import { processPaper } from '../../src/lib/reader/process-paper';

describe('position-paper citation detection', () => {
	const smithReferences =
		'## References\n\nSmith, John. 2023. *Earlier*.\n\nSmith, John. 2024. *One*.\n\nSmith, Jane. 2024. *Two*.';

	it('reports ambiguous citations without guessing a bibliography target', () => {
		const paper = processPaper(`Claim (Smith 2024).\n\n${smithReferences}`, []);
		expect(paper.citations).toEqual({
			linked: 0,
			issues: [{ text: 'Smith 2024', reason: 'ambiguous' }]
		});
		expect(paper.html).not.toContain('data-cite=');
		expect(paper.html).toContain('Claim (Smith 2024).');
	});

	it('reports ambiguity and missing works in a second cited year', () => {
		const paper = processPaper(
			`Claim (Smith 2023, 2024). Another (Smith 2023, 2025).\n\n${smithReferences}`,
			[]
		);
		expect(paper.citations).toEqual({
			linked: 2,
			issues: [
				{ text: 'Smith 2024', reason: 'ambiguous' },
				{ text: 'Smith 2025', reason: 'no-match' }
			]
		});
		expect(paper.html).not.toContain('href="#bib-smith-2024"');
	});

	it('checks every year when the same author has more than two cited works', () => {
		const paper = processPaper(`Claim (Smith 2023, 2024, 2025).\n\n${smithReferences}`, []);
		expect(paper.citations).toEqual({
			linked: 1,
			issues: [
				{ text: 'Smith 2024', reason: 'ambiguous' },
				{ text: 'Smith 2025', reason: 'no-match' }
			]
		});
	});

	it('does not take the author of an ordinary date from the preceding block', () => {
		for (const separator of ['\n\n', '\n\n- ']) {
			const paper = processPaper(
				`Smith studied archives.${separator}The unrelated project (2023) is available.\n\n${smithReferences}`,
				[]
			);
			expect(paper.citations).toEqual({ linked: 0, issues: [] });
		}
	});

	it('keeps narrative references across inline emphasis and links within a paragraph', () => {
		const paper = processPaper(
			`Smith argues in *Earlier* (2023). [Smith](https://example.org/) (2023) agrees.\n\n${smithReferences}`,
			[]
		);
		expect(paper.citations).toEqual({ linked: 2, issues: [] });
	});

	it('links diacritics, compound surnames, and distinct consecutive years', () => {
		const paper = processPaper(
			'Claim (Ngué Um 2022; Błoch 2024, 2025).\n\n## References\n\nNgué Um, Emmanuel. 2022. *One*.\n\nBłoch, Agata. 2024. *Two*.\n\nBłoch, Agata. 2025. *Three*.',
			[]
		);
		expect(paper.citations).toEqual({ linked: 3, issues: [] });
		expect(paper.html).toContain('href="#bib-ngue-um-2022"');
		expect(paper.html).toContain('href="#bib-błoch-2025"');
	});

	it('does not report a standalone publication date as a broken citation', () => {
		const paper = processPaper(
			'# Paper\n\nThe linked archive project (2025) is available online.\n\n## References\n\nAdebara, Ife. 2025. *A Reference Work*.',
			[]
		);

		expect(paper.citations).toEqual({ linked: 0, issues: [] });
	});

	it('continues to report explicit author-date citations that cannot be resolved', () => {
		const paper = processPaper(
			'# Paper\n\nThe claim remains contested (Missing 2025).\n\n## References\n\nAdebara, Ife. 2025. *A Reference Work*.',
			[]
		);

		expect(paper.citations.issues).toEqual([{ text: 'Missing 2025', reason: 'no-match' }]);
	});
});
