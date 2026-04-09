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
	<div
		class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-700"
	>
		<div class="flex items-center gap-2">
			<FilterOutline class="text-accent h-5 w-5" />
			<span class="text-lg font-semibold text-gray-900 dark:text-white">Filters</span>
		</div>
		<div class="flex items-center gap-3">
			{#if activeFiltersCount > 0}
				<button
					onclick={resetFilters}
					class="text-xs font-medium text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
				>
					Reset ({activeFiltersCount})
				</button>
			{/if}
			{#if showCloseButton}
				<button
					type="button"
					onclick={handleClose}
					class="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase transition-colors dark:text-gray-400"
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
			<Label for="search" class="text-sm font-semibold text-gray-700 dark:text-gray-300"
				>Search</Label
			>
			<div class="relative">
				<SearchOutline class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
				<input
					id="search"
					type="text"
					placeholder="Title, author, keyword..."
					bind:value={searchQuery}
					class="focus:ring-secondary-500 focus:border-secondary-500 dark:focus:ring-secondary-400 dark:focus:border-secondary-400 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
				/>
			</div>
		</div>

		<!-- Sort -->
		<div class="space-y-2">
			<Label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by</Label>
			<Select items={sortOptions} bind:value={selectedSort} class="text-sm" />
		</div>

		<!-- Filter Sections -->
		<Accordion multiple class="facets-accordion">
			{#if availableTypes.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</span>
					{/snippet}
					<div class="space-y-2">
						{#each availableTypes as type (type)}
							<Checkbox color="teal" bind:group={selectedTypes} value={type}>
								<span class="text-sm text-gray-600 dark:text-gray-400">{formatType(type)}</span>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}

			{#if availableTags.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Keywords
							{#if selectedTags.length > 0}
								<span
									class="bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300 ml-1.5 rounded px-1.5 py-0.5 text-xs font-medium"
								>
									{selectedTags.length}
								</span>
							{/if}
						</span>
					{/snippet}
					<div class="space-y-3">
						<!-- Keyword search -->
						<div class="relative">
							<SearchOutline
								class="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
							/>
							<input
								type="text"
								placeholder="Filter keywords..."
								bind:value={keywordSearch}
								class="focus:ring-secondary-500 focus:border-secondary-500 w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:ring-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
							/>
						</div>
						<!-- Keywords list -->
						<div class="custom-scrollbar max-h-52 space-y-1.5 overflow-y-auto pr-1">
							{#each filteredTags as tag (tag)}
								<Checkbox color="teal" bind:group={selectedTags} value={tag}>
									<span class="truncate text-xs text-gray-600 dark:text-gray-400">{tag}</span>
								</Checkbox>
							{:else}
								<p class="text-xs text-gray-400 dark:text-gray-500 italic py-1">
									No keywords match "{keywordSearch}"
								</p>
							{/each}
						</div>
						{#if availableTags.length > 10}
							<p class="text-xs text-gray-400 dark:text-gray-500">
								{filteredTags.length} of {availableTags.length} keywords
							</p>
						{/if}
					</div>
				</AccordionItem>
			{/if}

			{#if availableLanguages.length > 0}
				<AccordionItem open>
					{#snippet header()}
						<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Language</span>
					{/snippet}
					<div class="space-y-2">
						{#each availableLanguages as language (language)}
							<Checkbox color="teal" bind:group={selectedLanguages} value={language}>
								<span class="text-sm text-gray-600 dark:text-gray-400"
									>{formatLanguage(language)}</span
								>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}

			{#if availableYears.length > 0}
				<AccordionItem>
					{#snippet header()}
						<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</span>
					{/snippet}
					<div class="custom-scrollbar max-h-40 space-y-2 overflow-y-auto pr-1">
						{#each availableYears as year (year)}
							<Checkbox color="teal" bind:group={selectedYears} value={year}>
								<span class="text-sm text-gray-600 dark:text-gray-400">{year}</span>
							</Checkbox>
						{/each}
					</div>
				</AccordionItem>
			{/if}
		</Accordion>
	</div>
</div>

<style>
	/* Override default Accordion borders to blend with card-surface */
	:global(.facets-accordion) {
		border: none !important;
		border-radius: 0 !important;
	}

	:global(.facets-accordion > div > h2 > button) {
		padding: 0.75rem 0 !important;
		background-color: transparent !important;
		border: none !important;
		border-top: 1px solid var(--color-gray-200) !important;
		border-radius: 0 !important;
	}

	:global(.dark .facets-accordion > div > h2 > button) {
		background-color: transparent !important;
		border-top-color: var(--color-gray-700) !important;
	}

	:global(.facets-accordion > div > h2 > button:hover) {
		background-color: transparent !important;
	}

	:global(.dark .facets-accordion > div > h2 > button:hover) {
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
		background-color: var(--color-gray-300);
		border-radius: 9999px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-gray-400);
	}

	:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: var(--color-gray-600);
	}

	:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-gray-500);
	}
</style>
