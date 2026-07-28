import referencesData from '$lib/data/references.json';
import { positionPaperMeta } from '$lib/data/position-paper-meta';
import { processPaper } from './process-paper';
import type { CslReference, PositionPaperMeta, ProcessedPaper } from './types';

/**
 * Markdown sources resolved at build time.
 *
 * `position-paper.md` holds the real, unpublished draft and is gitignored —
 * this repository is public, so the draft must never be committed.
 * `position-paper.example.md` is the committed placeholder that keeps the
 * reader runnable on a fresh clone. The draft wins when present.
 *
 * Note: `import.meta.glob` patterns must be relative or root-absolute —
 * Vite does not resolve `$lib` inside them.
 */
const sources = import.meta.glob('../content/position-paper*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function resolveSource(): string {
	const entries = Object.entries(sources);
	const draft = entries.find(([path]) => path.endsWith('/position-paper.md'));
	const example = entries.find(([path]) => path.endsWith('/position-paper.example.md'));
	const chosen = draft ?? example;

	if (!chosen) {
		throw new Error(
			'No position paper markdown found in src/lib/content/ ' +
				'(expected position-paper.md or position-paper.example.md).'
		);
	}

	return chosen[1];
}

export interface PositionPaperData {
	paper: ProcessedPaper;
	meta: PositionPaperMeta;
}

/**
 * Build the reader's page data. Called from the generated route stub at
 * `src/routes/position-paper/read/+page.ts` (see `npm run paper:on`).
 */
export function loadPositionPaper(): PositionPaperData {
	return {
		paper: processPaper(resolveSource(), referencesData as unknown as CslReference[]),
		meta: positionPaperMeta
	};
}
