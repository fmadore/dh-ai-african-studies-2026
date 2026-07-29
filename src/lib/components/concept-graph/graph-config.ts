import type { ConceptGroup } from '$lib/types/concept-graph';

/**
 * One palette, not a light/dark pair: the graph always paints on its own dark
 * stage (see the note above `.graph-stage` in /concepts), so a second set of
 * tones could only ever be wrong. These used to switch on the *page* theme,
 * which meant the light-mode tones — chosen for a white card — were being
 * drawn on a near-black band at 2.7:1 to 4.8:1, with labels at 1.05:1.
 *
 * Every tone below clears 7:1 against `--graph-surface`.
 */
export const GROUP_COLORS: Record<ConceptGroup, string> = {
	'Infrastructure, Governance & Access': '#2dd4bf',
	'Cross-cutting': '#34d399',
	Extended: '#94a3b8',
	'Language Technologies, NLP & Corpora': '#f87171',
	'The Archive': '#fbbf24',
	'Epistemologies, Decoloniality & Ethical Frameworks': '#a78bfa'
};

/** Node labels and edges, both measured against the same dark stage. */
export const LABEL_COLOR = '#e8ecf1';
export const EDGE_COLOR = '#9aa8bd';

export const ALL_GROUPS: ConceptGroup[] = [
	'Cross-cutting',
	'The Archive',
	'Epistemologies, Decoloniality & Ethical Frameworks',
	'Infrastructure, Governance & Access',
	'Language Technologies, NLP & Corpora',
	'Extended'
];

export function getNodeRadius(degree: number): number {
	return Math.max(6, Math.min(22, 6 + degree * 0.55));
}
