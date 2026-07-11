/**
 * Pure filtering / sorting / pagination helpers for the references page.
 */

import type { CslReference } from '$lib/types/csl';
import { getCslYear } from '$lib/utils/citation-export';

/**
 * Zotero reading-status tags that are workflow metadata, not subject tags.
 * Matched exactly — prefix matching would swallow legitimate tags like
 * "Lusophone Africa".
 */
const READING_STATUS_TAGS = new Set(['Lu', 'Non lu', 'À lire', 'To read']);

export function stripReadingStatusTags(refs: CslReference[]): CslReference[] {
	return refs.map((ref) => ({
		...ref,
		tags: Array.isArray(ref.tags) ? ref.tags.filter((t) => !READING_STATUS_TAGS.has(t)) : ref.tags
	}));
}

export interface ReferenceFilters {
	searchQuery: string;
	selectedTypes: string[];
	selectedYears: string[];
	selectedTags: string[];
	selectedLanguages: string[];
}

export function filterReferences(
	references: CslReference[],
	filters: ReferenceFilters
): CslReference[] {
	const query = filters.searchQuery.toLowerCase();

	return references.filter((ref) => {
		const searchContent =
			`${ref.title} ${ref.author?.map((a) => `${a.given} ${a.family}`).join(' ')}`.toLowerCase();
		const matchesSearch = searchContent.includes(query);

		const matchesType =
			filters.selectedTypes.length === 0 || filters.selectedTypes.includes(ref.type);

		const year = getCslYear(ref.issued);
		const matchesYear =
			filters.selectedYears.length === 0 || (year !== null && filters.selectedYears.includes(year));

		const refTags = ref.tags || [];
		const matchesTags =
			filters.selectedTags.length === 0 || filters.selectedTags.some((tag) => refTags.includes(tag));

		const matchesLanguage =
			filters.selectedLanguages.length === 0 ||
			(ref.language != null && filters.selectedLanguages.includes(ref.language));

		return matchesSearch && matchesType && matchesYear && matchesTags && matchesLanguage;
	});
}

export type ReferenceSort = 'newest' | 'oldest' | 'title' | 'author';

export function sortReferences(references: CslReference[], sort: string): CslReference[] {
	const numericYear = (ref: CslReference) => ref.issued?.['date-parts']?.[0]?.[0] ?? 0;

	return [...references].sort((a, b) => {
		switch (sort) {
			case 'newest':
				return numericYear(b) - numericYear(a);
			case 'oldest':
				return numericYear(a) - numericYear(b);
			case 'title':
				return (a.title || '').localeCompare(b.title || '');
			case 'author': {
				const authorA = a.author?.[0]?.family || '';
				const authorB = b.author?.[0]?.family || '';
				return authorA.localeCompare(authorB);
			}
			default:
				return 0;
		}
	});
}

/** Compact pagination model: first, last, current ±1, with ellipses */
export function buildPageItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
	const pages: (number | 'ellipsis')[] = [];
	if (totalPages <= 7) {
		for (let i = 1; i <= totalPages; i++) pages.push(i);
		return pages;
	}
	pages.push(1);
	if (currentPage > 3) pages.push('ellipsis');
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);
	for (let i = start; i <= end; i++) pages.push(i);
	if (currentPage < totalPages - 2) pages.push('ellipsis');
	pages.push(totalPages);
	return pages;
}

export function formatCitation(ref: CslReference): { authors: string; year: string } {
	let authors = 'Unknown Author';

	if (ref.author && ref.author.length > 0) {
		authors = ref.author.map((a) => `${a.given} ${a.family}`).join(', ');
	} else if (ref.editor && ref.editor.length > 0) {
		const editorNames = ref.editor.map((e) => `${e.given} ${e.family}`).join(', ');
		authors = `${editorNames} (ed${ref.editor.length > 1 ? 's' : ''})`;
	}

	const year = getCslYear(ref.issued) ?? 'n.d.';
	return { authors, year };
}

export function getAccessLink(ref: CslReference): string {
	if (ref.DOI) {
		return ref.DOI.startsWith('http') ? ref.DOI : `https://doi.org/${ref.DOI}`;
	}
	const url = ref.URL || '';
	return /^https?:\/\//.test(url) ? url : '';
}
