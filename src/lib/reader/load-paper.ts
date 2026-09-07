import referencesData from '$lib/data/references.json';
import { positionPaperMeta } from '$lib/data/position-paper-meta';
import { processPaper } from './process-paper';
import type { CslReference, PositionPaperMeta, ProcessedPaper } from './types';

import source from '../content/position-paper.md?raw';

export interface PositionPaperData {
	paper: ProcessedPaper;
	meta: PositionPaperMeta;
}

/**
 * Build the reader's page data. Called from the public reader route at
 * `src/routes/position-paper/read/+page.server.ts` during prerendering.
 */
export function loadPositionPaper(): PositionPaperData {
	const paper = processPaper(source, referencesData as unknown as CslReference[]);

	// The paper's citations are plain text extracted from the PDF, so the only
	// check that an in-text citation matches the reference list is this one.
	// Printed at build time rather than thrown: a mismatch is the author's to
	// fix in the manuscript, not a reason to fail the build.
	const { linked, issues } = paper.citations;
	if (issues.length > 0) {
		console.warn(
			`[position paper] linked ${linked} citations; ${issues.length} need attention:\n` +
				issues
					.map((issue) => {
						const detail =
							issue.reason === 'partial-author-match'
								? ` (linked to ${issue.slug}; not in that entry: ${issue.unmatchedNames?.join(', ')})`
								: '';
						return `  • ${issue.reason}: "${issue.text}"${detail}`;
					})
					.join('\n')
		);
	}

	return { paper, meta: positionPaperMeta };
}
