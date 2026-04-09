import type { ConceptGroup } from '$lib/types/concept-graph';

export const GROUP_COLORS: Record<ConceptGroup, { light: string; dark: string }> = {
	'Infrastructure, Governance & Access': { light: '#0d9488', dark: '#2dd4bf' },
	'Cross-cutting': { light: '#059669', dark: '#34d399' },
	Extended: { light: '#64748b', dark: '#94a3b8' },
	'Language Technologies, NLP & Corpora': { light: '#dc2626', dark: '#f87171' },
	'The Archive': { light: '#d97706', dark: '#fbbf24' },
	'Epistemologies, Decoloniality & Ethical Frameworks': { light: '#7c3aed', dark: '#a78bfa' }
};

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
