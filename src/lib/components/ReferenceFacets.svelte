<script lang="ts">
	import { Label, Checkbox, Select, Accordion, AccordionItem } from 'flowbite-svelte';
	import { FilterOutline, SearchOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { formatType, formatLanguage } from '$lib/utils/formatters';
	import type { CslReference } from '$lib/types/csl';

	/* Structural: the facets only read classification fields, so both the full
	 * CSL records and the lean list index satisfy this. */
	type FacetSource = Pick<CslReference, 'type' | 'issued' | 'tags' | 'language'>;

	interface Props {
		references: FacetSource[];
		searchQuery: string;
		selectedTypes: string[];
		selectedYears: string[];
		selectedTags: string[];
		selectedLanguages: string[];
		selectedSort: string;
		idPrefix?: string;
		/**
		 * Sidebar mode: the panel fills its (viewport-capped) container and scrolls
		 * its own body, so every facet is reachable without scrolling the results.
		 */
		fillHeight?: boolean;
		showCloseButton?: boolean;
		closeLabel?: string;
		onclose?: () => void;
	}

	let {
		references,
		searchQuery = $bindable(),
		selectedTypes = $bindable(),
		selectedYears = $bindable(),
		selectedTags = $bindable(),
		selectedLanguages = $bindable(),
		selectedSort = $bindable(),
		idPrefix = 'reference-facets',
		fillHeight = false,
		showCloseButton = false,
		closeLabel = 'Close filters',
		onclose
	}: Props = $props();

	// Keyword search filter
	let keywordSearch = $state('');

	let availableTypes = $derived.by(() => {
		const types = new Set(references.map((r) => r.type).filter(Boolean));
		return Array.from(types).sort((a, b) => formatType(a).localeCompare(formatType(b)));
	});

	let availableYears = $derived.by(() => {
		const years = new Set(
			references
				.map((r) => r.issued?.['date-parts']?.[0]?.[0]?.toString())
				.filter((y): y is string => Boolean(y))
		);
		return Array.from(years).sort().reverse();
	});

	let availableLanguages = $derived.by(() => {
		const languages = new Set(
			references.map((r) => r.language).filter((l): l is string => Boolean(l))
		);
		return Array.from(languages).sort();
	});

	let tagCounts = $derived.by(() => {
		const counts: Record<string, number> = Object.create(null) as Record<string, number>;
		references.forEach((r) => {
			if (r.tags && Array.isArray(r.tags)) {
				r.tags.forEach((tag) => (counts[tag] = (counts[tag] ?? 0) + 1));
			}
		});
		return counts;
	});

	let availableTags = $derived(
		Object.keys(tagCounts).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
	);

	const DEFAULT_TAG_LIMIT = 16;
	const SEARCH_TAG_LIMIT = 24;

	let matchingTags = $derived.by(() => {
		const search = keywordSearch.trim().toLowerCase();
		return search ? availableTags.filter((tag) => tag.toLowerCase().includes(search)) : [];
	});

	let popularTags = $derived(
		[...availableTags]
			.sort(
				(a, b) =>
					(tagCounts[b] ?? 0) - (tagCounts[a] ?? 0) ||
					a.toLowerCase().localeCompare(b.toLowerCase())
			)
			.slice(0, DEFAULT_TAG_LIMIT)
	);

	/**
	 * A checkbox for every one of the 944 keywords created a very large hidden
	 * DOM tree on every route visit. Keep chosen keywords visible, then offer a
	 * bounded useful starting set or a bounded type-ahead result set instead.
	 */
	let visibleTags = $derived.by(() => {
		const candidates = keywordSearch.trim() ? matchingTags : popularTags;
		const limit = keywordSearch.trim() ? SEARCH_TAG_LIMIT : DEFAULT_TAG_LIMIT;
		const tags = [...selectedTags];

		for (const tag of candidates) {
			if (tags.length >= limit && !selectedTags.includes(tag)) break;
			if (!tags.includes(tag)) tags.push(tag);
		}

		return tags;
	});

	let searchInputId = $derived(`${idPrefix}-search`);
	let sortInputId = $derived(`${idPrefix}-sort`);
	let keywordInputId = $derived(`${idPrefix}-keyword-search`);

	let activeFiltersCount = $derived(
		(searchQuery ? 1 : 0) +
			selectedTypes.length +
			selectedYears.length +
			selectedTags.length +
			selectedLanguages.length
	);

	const sortOptions = [
		{ value: 'newest', name: 'Newest first' },
		{ value: 'oldest', name: 'Oldest first' },
		{ value: 'title', name: 'Title (A-Z)' },
		{ value: 'author', name: 'Author (A-Z)' }
	];

	function resetFilters() {
		searchQuery = '';
		selectedTypes = [];
		selectedYears = [];
		selectedTags = [];
		selectedLanguages = [];
		selectedSort = 'newest';
		keywordSearch = '';
	}
</script>

<div class="card-surface facets-panel" class:facets-panel--fill={fillHeight}>
	<!-- Header -->
	<div class="facets-header flex flex-wrap items-center justify-between gap-3">
		<div class="gap-2xs flex items-center">
			<FilterOutline class="text-accent size-icon-md" />
			<span class="facets-panel__title">Filters</span>
		</div>
		<div class="gap-2xs flex items-center">
			{#if activeFiltersCount > 0}
				<button
					type="button"
					onclick={resetFilters}
					class="text-danger tap-target tap-target-flush text-xs font-semibold"
				>
					Reset ({activeFiltersCount})
				</button>
			{/if}
			{#if showCloseButton}
				<button
					type="button"
					onclick={() => onclose?.()}
					class="facets-close-btn text-subtle-ink"
					aria-label={closeLabel}
				>
					<CloseOutline class="size-icon-sm" />
				</button>
			{/if}
		</div>
	</div>

	<div class="facets-body custom-scrollbar space-y-5">
		<!-- Search -->
		<div class="space-y-2">
			<Label for={searchInputId} class="facets-label">Search</Label>
			<div class="relative">
				<SearchOutline class="text-subtle-ink absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<input
					id={searchInputId}
					type="search"
					placeholder="Title, author, keyword..."
					bind:value={searchQuery}
					class="facets-text-input w-full py-2.5 pr-4 pl-10 text-sm"
				/>
			</div>
		</div>

		<!-- Sort -->
		<div class="space-y-2">
			<Label for={sortInputId} class="facets-label">Sort by</Label>
			<Select id={sortInputId} items={sortOptions} bind:value={selectedSort} class="text-sm" />
		</div>

		<!-- Filter Sections -->
		<Accordion multiple class="facets-accordion">
			{#if availableTypes.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="facets-label">Type</span>
					{/snippet}
					<div class="space-y-2">
						{#each availableTypes as type (type)}
							<Checkbox color="teal" bind:group={selectedTypes} value={type}>
								<span class="text-muted-ink text-sm">{formatType(type)}</span>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}

			{#if availableTags.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="facets-label">
							Keywords
							{#if selectedTags.length > 0}
								<span class="facets-count-pill">
									{selectedTags.length}
								</span>
							{/if}
						</span>
					{/snippet}
					<div class="space-y-3">
						<!-- Keyword search -->
						<div class="space-y-1.5">
							<Label for={keywordInputId} class="facets-keyword-label">Find a keyword</Label>
							<div class="relative">
								<SearchOutline
									class="text-subtle-ink absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
								/>
								<input
									id={keywordInputId}
									type="search"
									placeholder="Search all keywords..."
									bind:value={keywordSearch}
									class="facets-text-input facets-text-input--sm w-full py-1.5 pr-3 pl-8 text-xs"
								/>
							</div>
						</div>
						<!-- Keywords list -->
						<div class="facets-list custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto pr-1">
							{#each visibleTags as tag (tag)}
								<Checkbox color="teal" bind:group={selectedTags} value={tag}>
									<span class="text-muted-ink truncate text-xs">{tag}</span>
								</Checkbox>
							{:else}
								<p class="text-subtle-ink py-1 text-xs italic">
									No keywords match "{keywordSearch.trim()}"
								</p>
							{/each}
						</div>
						<p class="text-subtle-ink text-xs" aria-live="polite">
							{#if keywordSearch.trim()}
								{#if matchingTags.length > 0}
									Showing {visibleTags.length} of {matchingTags.length} matching keywords. Refine the
									search to narrow the list.
								{:else}
									No additional keywords match this search.
								{/if}
							{:else}
								{#if selectedTags.length > 0}
									Showing {visibleTags.length} selected and frequently used keywords.
								{:else}
									Showing the {Math.min(DEFAULT_TAG_LIMIT, availableTags.length)} most-used keywords.
								{/if}
								Search all {availableTags.length} keywords to find another.
							{/if}
						</p>
					</div>
				</AccordionItem>
			{/if}

			{#if availableLanguages.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="facets-label">Language</span>
					{/snippet}
					<div class="space-y-2">
						{#each availableLanguages as language (language)}
							<Checkbox color="teal" bind:group={selectedLanguages} value={language}>
								<span class="text-muted-ink text-sm">{formatLanguage(language)}</span>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}

			{#if availableYears.length > 0}
				<AccordionItem>
					{#snippet header()}
						<span class="facets-label">Year</span>
					{/snippet}
					<div
						class="facets-list facets-list--years custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-1"
					>
						{#each availableYears as year (year)}
							<Checkbox color="teal" bind:group={selectedYears} value={year}>
								<span class="text-muted-ink text-sm">{year}</span>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}
		</Accordion>
	</div>
</div>

<style>
	/* Token padding, matching the reference card it sits beside. `p-5 sm:p-6`
	   resolved through this project's fluid `--spacing-6` override to 15px —
	   the tightest surface on the page, next to a 24px card. */
	.facets-panel {
		padding: var(--space-md);
	}

	@media (min-width: 640px) {
		.facets-panel {
			padding: var(--space-lg);
		}
	}

	.facets-header {
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--border-default);
	}

	/* The panel's own name, not a section heading: `text-lg` made it the largest
	   type in a 303px column of 13–15px controls. */
	.facets-panel__title {
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	/* Sidebar mode. The panel is capped to the viewport by its container, so the
	 * body — not the page — is what scrolls: a pinned panel taller than the
	 * viewport hid its lower facets until you reached the end of the results. */
	.facets-panel--fill {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.facets-panel--fill .facets-header {
		flex: 0 0 auto;
	}

	.facets-panel--fill .facets-body {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		/* Room for focus outlines against the scroll edge */
		padding-inline-end: var(--space-2xs);
		margin-inline-end: calc(var(--space-2xs) * -1);
	}

	/* One scroll region, not three. The keyword list is already bounded to
	 * 16–24 entries, so it can flow; only the year list stays capped. */
	.facets-panel--fill .facets-list:not(.facets-list--years) {
		max-height: none;
		overflow-y: visible;
	}

	/* This panel is the mobile filter sheet: its dismiss control was a bare 16px
	   icon. The target is a full 2.75rem square, pulled back out to the panel's
	   padding edge so the glyph still sits where the eye expects it. */
	.facets-close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-inline-end: calc(var(--space-sm) * -1);
		border-radius: var(--radius-control);
		transition: color var(--transition-micro);
	}

	.facets-close-btn:hover {
		color: var(--accent);
	}

	/* The group headings take the system's label role. At 15px/600 they were the
	   same size as the option rows beneath them and separated only by weight,
	   so nothing in the panel told you which line was the question and which
	   were the answers. */
	:global(.facets-label) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		line-height: var(--leading-ui);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	:global(.facets-keyword-label) {
		display: block;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--text-muted);
	}

	:global(.facets-count-pill) {
		display: inline-block;
		margin-left: var(--space-3xs);
		padding: 0 var(--space-3xs);
		border-radius: var(--radius-sm);
		background-color: var(--accent-soft);
		color: var(--text-accent);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-normal);
	}

	/* Text inputs (shared look for search + keyword filter) */
	:global(.facets-text-input) {
		border: 1px solid var(--border-default);
		background-color: var(--bg-raised);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		transition:
			border-color var(--transition-micro),
			box-shadow var(--transition-micro);
	}

	:global(.facets-text-input::placeholder) {
		color: var(--text-subtle);
	}

	:global(.facets-text-input:focus-visible) {
		border-color: var(--border-accent);
		outline: var(--focus-ring-width) solid var(--focus-ring);
		outline-offset: var(--focus-ring-offset);
	}

	:global(.facets-text-input:focus:not(:focus-visible)) {
		outline: none;
		border-color: var(--border-accent);
	}

	:global(.facets-text-input--sm) {
		background-color: var(--bg-sunken);
		border-radius: var(--radius-sm);
	}

	/* One form-control vocabulary in the panel. The sort <select> arrived with
	   Flowbite's own 14px radius and gray-600 border, sitting directly under a
	   10px search field on the semantic border — two controls, two looks. */
	.facets-body :global(select) {
		border-radius: var(--radius-md);
		border-color: var(--border-default);
		background-color: var(--bg-raised);
		color: var(--text-primary);
	}

	/* A 21px label is a fine mouse target and a poor thumb one. */
	@media (pointer: coarse) {
		.facets-body :global(label:has(input[type='checkbox'])) {
			min-height: 2.75rem;
		}
	}

	/* Strip the Flowbite accordion's own chrome so the facet groups read as rules
	   inside this panel rather than as a second, nested card.
	 *
	 * These selectors were `> div > h2 > button`, matching a per-item wrapper
	 * that the current Flowbite markup does not emit — so none of them applied
	 * and every group header shipped as a filled grey bar with a 20px radius,
	 * 20px padding and a full border, inside a card that already has one. */
	:global(.facets-accordion) {
		border: none !important;
		border-radius: 0 !important;
	}

	:global(.facets-accordion h2 > button) {
		padding: var(--space-sm) 0 !important;
		background-color: transparent !important;
		border: none !important;
		border-top: 1px solid var(--border-default) !important;
		border-radius: 0 !important;
		color: var(--text-secondary) !important;
	}

	:global(.facets-accordion h2 > button:hover) {
		background-color: transparent !important;
		color: var(--text-primary) !important;
	}

	/* Remove body border and adjust padding */
	:global(.facets-accordion h2 + div),
	:global(.facets-accordion h2 + div > div) {
		border: none !important;
		border-radius: 0 !important;
		background-color: transparent !important;
	}

	:global(.facets-accordion h2 + div > div) {
		padding: var(--space-xs) 0 var(--space-sm) !important;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: var(--border-strong);
		border-radius: var(--radius-full);
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: var(--text-subtle);
	}
</style>
