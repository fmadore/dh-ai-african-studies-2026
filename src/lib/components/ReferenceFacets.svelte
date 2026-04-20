<script lang="ts">
	import { Label, Checkbox, Select, Accordion, AccordionItem } from 'flowbite-svelte';
	import { FilterOutline, SearchOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { formatType, formatLanguage } from '$lib/utils/formatters';

	interface Props {
		references: any[];
		searchQuery: string;
		selectedTypes: string[];
		selectedYears: string[];
		selectedTags: string[];
		selectedLanguages: string[];
		selectedSort: string;
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
			references.map((r) => r.issued?.['date-parts']?.[0]?.[0]?.toString()).filter(Boolean)
		);
		return Array.from(years).sort().reverse();
	});

	let availableLanguages = $derived.by(() => {
		const languages = new Set(references.map((r) => r.language).filter(Boolean));
		return Array.from(languages).sort();
	});

	let availableTags = $derived.by(() => {
		const tags = new Set<string>(); // eslint-disable-line svelte/prefer-svelte-reactivity
		references.forEach((r) => {
			if (r.tags && Array.isArray(r.tags)) {
				r.tags.forEach((t: string) => {
					if (t !== 'Non lu') {
						tags.add(t);
					}
				});
			}
		});
		return Array.from(tags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
	});

	// Filtered keywords based on search
	let filteredTags = $derived.by(() => {
		if (!keywordSearch.trim()) return availableTags;
		const search = keywordSearch.toLowerCase();
		return availableTags.filter((tag) => tag.toLowerCase().includes(search));
	});

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

	function handleClose() {
		onclose?.();
	}
</script>

<div class="card-surface p-5 sm:p-6">
	<!-- Header -->
	<div class="facets-header mb-4 flex flex-wrap items-center justify-between gap-3 pb-4">
		<div class="flex items-center gap-2">
			<FilterOutline class="text-accent h-5 w-5" />
			<span class="text-primary-ink text-lg font-semibold">Filters</span>
		</div>
		<div class="gap-sm flex items-center">
			{#if activeFiltersCount > 0}
				<button onclick={resetFilters} class="text-danger text-xs font-medium">
					Reset ({activeFiltersCount})
				</button>
			{/if}
			{#if showCloseButton}
				<button
					type="button"
					onclick={handleClose}
					class="facets-close-btn text-subtle-ink flex items-center gap-1 text-xs font-semibold tracking-wide uppercase"
					aria-label={closeLabel}
				>
					<CloseOutline class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>

	<div class="space-y-5">
		<!-- Search -->
		<div class="space-y-2">
			<Label for="search" class="facets-label">Search</Label>
			<div class="relative">
				<SearchOutline class="text-subtle-ink absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<input
					id="search"
					type="text"
					placeholder="Title, author, keyword..."
					bind:value={searchQuery}
					class="facets-text-input w-full py-2.5 pr-4 pl-10 text-sm"
				/>
			</div>
		</div>

		<!-- Sort -->
		<div class="space-y-2">
			<Label class="facets-label">Sort by</Label>
			<Select items={sortOptions} bind:value={selectedSort} class="text-sm" />
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
						<div class="relative">
							<SearchOutline
								class="text-subtle-ink absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
							/>
							<input
								type="text"
								placeholder="Filter keywords..."
								bind:value={keywordSearch}
								class="facets-text-input facets-text-input--sm w-full py-1.5 pr-3 pl-8 text-xs"
							/>
						</div>
						<!-- Keywords list -->
						<div class="custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto pr-1">
							{#each filteredTags as tag (tag)}
								<Checkbox color="teal" bind:group={selectedTags} value={tag}>
									<span class="text-muted-ink truncate text-xs">{tag}</span>
								</Checkbox>
							{:else}
								<p class="text-subtle-ink py-1 text-xs italic">
									No keywords match "{keywordSearch}"
								</p>
							{/each}
						</div>
						{#if availableTags.length > 10}
							<p class="text-subtle-ink text-xs">
								{filteredTags.length} of {availableTags.length} keywords
							</p>
						{/if}
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
					<div class="custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-1">
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
	.facets-header {
		border-bottom: 1px solid var(--border-default);
	}

	.facets-close-btn {
		transition: color var(--transition-micro);
	}

	.facets-close-btn:hover {
		color: var(--accent);
	}

	/* Reusable label — replaces the repeated gray-700/gray-300 pair */
	:global(.facets-label) {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
	}

	:global(.facets-count-pill) {
		display: inline-block;
		margin-left: 0.375rem;
		padding: 0 0.375rem;
		border-radius: var(--radius-sm);
		background-color: var(--accent-soft);
		color: var(--text-accent);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
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

	:global(.facets-text-input:focus) {
		outline: none;
		border-color: var(--border-accent);
		box-shadow: 0 0 0 3px var(--focus-ring);
	}

	:global(.facets-text-input--sm) {
		background-color: var(--bg-sunken);
		border-radius: var(--radius-sm);
	}

	/* Override default Accordion borders to blend with card-surface */
	:global(.facets-accordion) {
		border: none !important;
		border-radius: 0 !important;
	}

	:global(.facets-accordion > div > h2 > button) {
		padding: 0.75rem 0 !important;
		background-color: transparent !important;
		border: none !important;
		border-top: 1px solid var(--border-default) !important;
		border-radius: 0 !important;
	}

	:global(.facets-accordion > div > h2 > button:hover) {
		background-color: transparent !important;
	}

	/* Remove body border and adjust padding */
	:global(.facets-accordion > div > div:not(:first-child)) {
		border: none !important;
	}

	:global(.facets-accordion > div > div:not(:first-child) > div) {
		padding: 0.5rem 0 0.25rem !important;
		border: none !important;
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
