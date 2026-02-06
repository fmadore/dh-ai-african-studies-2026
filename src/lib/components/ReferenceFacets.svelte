<script lang="ts">
	import { Label, Input, Checkbox, Select } from "flowbite-svelte";
	import {
		FilterOutline,
		SearchOutline,
		CloseOutline,
		ChevronDownOutline,
		ChevronUpOutline,
	} from "flowbite-svelte-icons";
	import { slide } from "svelte/transition";
	import { formatType, formatLanguage } from "$lib/utils/formatters";

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
		closeLabel = "Close filters",
		onclose,
	}: Props = $props();

	// Collapsible section state
	let sectionsOpen = $state({
		type: true,
		keywords: true,
		language: true,
		year: false,
	});

	// Keyword search filter
	let keywordSearch = $state("");

	let availableTypes = $derived.by(() => {
		const types = new Set(references.map((r) => r.type).filter(Boolean));
		return Array.from(types).sort((a, b) =>
			formatType(a).localeCompare(formatType(b)),
		);
	});

	let availableYears = $derived.by(() => {
		const years = new Set(
			references
				.map((r) => r.issued?.["date-parts"]?.[0]?.[0]?.toString())
				.filter(Boolean),
		);
		return Array.from(years).sort().reverse();
	});

	let availableLanguages = $derived.by(() => {
		const languages = new Set(
			references.map((r) => r.language).filter(Boolean),
		);
		return Array.from(languages).sort();
	});

	let availableTags = $derived.by(() => {
		const tags = new Set<string>();
		references.forEach((r) => {
			if (r.tags && Array.isArray(r.tags)) {
				r.tags.forEach((t: string) => {
					if (t !== "Non lu") {
						tags.add(t);
					}
				});
			}
		});
		return Array.from(tags).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);
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
			selectedLanguages.length,
	);

	const sortOptions = [
		{ value: "newest", name: "Newest first" },
		{ value: "oldest", name: "Oldest first" },
		{ value: "title", name: "Title (A-Z)" },
		{ value: "author", name: "Author (A-Z)" },
	];

	function resetFilters() {
		searchQuery = "";
		selectedTypes = [];
		selectedYears = [];
		selectedTags = [];
		selectedLanguages = [];
		selectedSort = "newest";
		keywordSearch = "";
	}

	function handleClose() {
		onclose?.();
	}

	function toggleSection(section: keyof typeof sectionsOpen) {
		sectionsOpen[section] = !sectionsOpen[section];
	}
</script>

<div class="card-surface p-5 sm:p-6">
	<!-- Header -->
	<div class="flex flex-wrap gap-3 justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-2">
			<FilterOutline class="w-5 h-5 text-accent" />
			<span class="text-lg font-semibold text-gray-900 dark:text-white">Filters</span>
		</div>
		<div class="flex items-center gap-3">
			{#if activeFiltersCount > 0}
				<button
					onclick={resetFilters}
					class="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
				>
					Reset ({activeFiltersCount})
				</button>
			{/if}
			{#if showCloseButton}
				<button
					type="button"
					onclick={handleClose}
					class="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
					aria-label={closeLabel}
				>
					<CloseOutline class="w-4 h-4" />
				</button>
			{/if}
		</div>
	</div>

	<div class="space-y-5">
		<!-- Search -->
		<div class="space-y-2">
			<Label for="search" class="text-sm font-semibold text-gray-700 dark:text-gray-300">Search</Label>
			<div class="relative">
				<SearchOutline class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					id="search"
					type="text"
					placeholder="Title, author, keyword..."
					bind:value={searchQuery}
					class="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 dark:focus:ring-secondary-400 dark:focus:border-secondary-400 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
				/>
			</div>
		</div>

		<!-- Sort -->
		<div class="space-y-2">
			<Label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by</Label>
			<Select
				items={sortOptions}
				bind:value={selectedSort}
				class="text-sm"
			/>
		</div>

		<!-- Type Filter -->
		{#if availableTypes.length > 0}
			<div class="pt-3 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => toggleSection('type')}
					class="flex items-center justify-between w-full py-1 text-left group"
				>
					<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</span>
					{#if sectionsOpen.type}
						<ChevronUpOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{:else}
						<ChevronDownOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{/if}
				</button>
				{#if sectionsOpen.type}
					<div class="mt-3 space-y-2" transition:slide={{ duration: 200 }}>
						{#each availableTypes as type (type)}
							<label class="flex items-center gap-2.5 cursor-pointer group">
								<input
									type="checkbox"
									bind:group={selectedTypes}
									value={type}
									class="w-4 h-4 text-secondary-600 bg-white border-gray-300 rounded focus:ring-secondary-500 dark:focus:ring-secondary-400 dark:bg-gray-700 dark:border-gray-600"
								/>
								<span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">{formatType(type)}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Keywords Filter -->
		{#if availableTags.length > 0}
			<div class="pt-3 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => toggleSection('keywords')}
					class="flex items-center justify-between w-full py-1 text-left group"
				>
					<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
						Keywords
						{#if selectedTags.length > 0}
							<span class="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300 rounded">
								{selectedTags.length}
							</span>
						{/if}
					</span>
					{#if sectionsOpen.keywords}
						<ChevronUpOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{:else}
						<ChevronDownOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{/if}
				</button>
				{#if sectionsOpen.keywords}
					<div class="mt-3 space-y-3" transition:slide={{ duration: 200 }}>
						<!-- Keyword search -->
						<div class="relative">
							<SearchOutline class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
							<input
								type="text"
								placeholder="Filter keywords..."
								bind:value={keywordSearch}
								class="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
							/>
						</div>
						<!-- Keywords list -->
						<div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
							{#each filteredTags as tag (tag)}
								<label class="flex items-center gap-2 cursor-pointer group">
									<input
										type="checkbox"
										bind:group={selectedTags}
										value={tag}
										class="w-3.5 h-3.5 text-secondary-600 bg-white border-gray-300 rounded focus:ring-secondary-500 dark:focus:ring-secondary-400 dark:bg-gray-700 dark:border-gray-600"
									/>
									<span class="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 truncate">{tag}</span>
								</label>
							{:else}
								<p class="text-xs text-gray-400 dark:text-gray-500 italic py-1">No keywords match "{keywordSearch}"</p>
							{/each}
						</div>
						{#if availableTags.length > 10}
							<p class="text-xs text-gray-400 dark:text-gray-500">
								{filteredTags.length} of {availableTags.length} keywords
							</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Language Filter -->
		{#if availableLanguages.length > 0}
			<div class="pt-3 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => toggleSection('language')}
					class="flex items-center justify-between w-full py-1 text-left group"
				>
					<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Language</span>
					{#if sectionsOpen.language}
						<ChevronUpOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{:else}
						<ChevronDownOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{/if}
				</button>
				{#if sectionsOpen.language}
					<div class="mt-3 space-y-2" transition:slide={{ duration: 200 }}>
						{#each availableLanguages as language (language)}
							<label class="flex items-center gap-2.5 cursor-pointer group">
								<input
									type="checkbox"
									bind:group={selectedLanguages}
									value={language}
									class="w-4 h-4 text-secondary-600 bg-white border-gray-300 rounded focus:ring-secondary-500 dark:focus:ring-secondary-400 dark:bg-gray-700 dark:border-gray-600"
								/>
								<span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">{formatLanguage(language)}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Year Filter -->
		{#if availableYears.length > 0}
			<div class="pt-3 border-t border-gray-200 dark:border-gray-700">
				<button
					onclick={() => toggleSection('year')}
					class="flex items-center justify-between w-full py-1 text-left group"
				>
					<span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</span>
					{#if sectionsOpen.year}
						<ChevronUpOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{:else}
						<ChevronDownOutline class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
					{/if}
				</button>
				{#if sectionsOpen.year}
					<div class="mt-3 max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar" transition:slide={{ duration: 200 }}>
						{#each availableYears as year (year)}
							<label class="flex items-center gap-2.5 cursor-pointer group">
								<input
									type="checkbox"
									bind:group={selectedYears}
									value={year}
									class="w-4 h-4 text-secondary-600 bg-white border-gray-300 rounded focus:ring-secondary-500 dark:focus:ring-secondary-400 dark:bg-gray-700 dark:border-gray-600"
								/>
								<span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">{year}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
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
