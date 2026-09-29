/**
 * The references page's filter state, shared by the page (results, chips,
 * pagination) and the facets panel, and mirrored into the query string so a
 * filtered bibliography survives a round trip to a publisher's site and can
 * be linked to.
 */

import type { ReferenceFilters, ReferenceSort } from '$lib/utils/references';

export const SORT_OPTIONS: { value: ReferenceSort; name: string }[] = [
	{ value: 'newest', name: 'Newest first' },
	{ value: 'oldest', name: 'Oldest first' },
	{ value: 'title', name: 'Title (A-Z)' },
	{ value: 'author', name: 'Author (A-Z)' }
];

const DEFAULT_SORT: ReferenceSort = 'newest';

/** Query keys. Multi-select facets repeat theirs: `?tag=AI&tag=Archives`. */
const PARAMS = {
	search: 'q',
	types: 'type',
	years: 'year',
	tags: 'tag',
	languages: 'lang',
	sort: 'sort'
} as const;

function isSort(value: string | null): value is ReferenceSort {
	return SORT_OPTIONS.some((option) => option.value === value);
}

export class ReferenceFilterState {
	searchQuery = $state('');
	selectedTypes = $state<string[]>([]);
	selectedYears = $state<string[]>([]);
	selectedTags = $state<string[]>([]);
	selectedLanguages = $state<string[]>([]);
	selectedSort = $state<ReferenceSort>(DEFAULT_SORT);

	/** Chips and "Clear all" count the search as one filter; sort is not one. */
	activeCount = $derived(
		(this.searchQuery ? 1 : 0) +
			this.selectedTypes.length +
			this.selectedYears.length +
			this.selectedTags.length +
			this.selectedLanguages.length
	);

	/** Changes exactly when the result list does, so pagination can reset on it. */
	key = $derived(
		JSON.stringify([
			this.searchQuery,
			this.selectedTypes,
			this.selectedYears,
			this.selectedTags,
			this.selectedLanguages,
			this.selectedSort
		])
	);

	get criteria(): ReferenceFilters {
		return {
			searchQuery: this.searchQuery,
			selectedTypes: this.selectedTypes,
			selectedYears: this.selectedYears,
			selectedTags: this.selectedTags,
			selectedLanguages: this.selectedLanguages
		};
	}

	reset() {
		this.searchQuery = '';
		this.selectedTypes = [];
		this.selectedYears = [];
		this.selectedTags = [];
		this.selectedLanguages = [];
		this.selectedSort = DEFAULT_SORT;
	}

	toggleTag(tag: string) {
		this.selectedTags = this.selectedTags.includes(tag)
			? this.selectedTags.filter((t) => t !== tag)
			: [...this.selectedTags, tag];
	}

	/** Adopt whatever the query string specifies; anything absent keeps its default. */
	readFrom(params: URLSearchParams) {
		this.searchQuery = params.get(PARAMS.search) ?? '';
		this.selectedTypes = params.getAll(PARAMS.types);
		this.selectedYears = params.getAll(PARAMS.years);
		this.selectedTags = params.getAll(PARAMS.tags);
		this.selectedLanguages = params.getAll(PARAMS.languages);
		const sort = params.get(PARAMS.sort);
		this.selectedSort = isSort(sort) ? sort : DEFAULT_SORT;
	}

	/** Write the non-default state, so an unfiltered list keeps a clean URL. */
	writeTo(params: URLSearchParams) {
		if (this.searchQuery) params.set(PARAMS.search, this.searchQuery);
		for (const type of this.selectedTypes) params.append(PARAMS.types, type);
		for (const year of this.selectedYears) params.append(PARAMS.years, year);
		for (const tag of this.selectedTags) params.append(PARAMS.tags, tag);
		for (const language of this.selectedLanguages) params.append(PARAMS.languages, language);
		if (this.selectedSort !== DEFAULT_SORT) params.set(PARAMS.sort, this.selectedSort);
	}
}
