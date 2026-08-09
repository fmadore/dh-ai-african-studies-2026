import { describe, expect, it } from 'vitest';
import { processPaper } from '../../src/lib/reader/process-paper';

describe('position-paper citation detection', () => {
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
