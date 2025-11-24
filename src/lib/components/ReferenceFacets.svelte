<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Card, Heading, Label, Input, Checkbox } from 'flowbite-svelte';
	import { FilterOutline, SearchOutline, CloseOutline } from 'flowbite-svelte-icons';

	interface Props {
		references: any[];
		searchQuery: string;
		selectedTypes: string[];
		selectedYears: string[];
		selectedTags: string[];
		showCloseButton?: boolean;
		closeLabel?: string;
	}

	const dispatch = createEventDispatcher<{ close: void }>();

	let { 
		references, 
		searchQuery = $bindable(), 
		selectedTypes = $bindable(), 
		selectedYears = $bindable(), 
		selectedTags = $bindable(),
		showCloseButton = false,
		closeLabel = 'Close filters'
	}: Props = $props();

	let availableTypes = $derived.by(() => {
		const types = new Set(references.map(r => r.type).filter(Boolean));
		return Array.from(types).sort();
	});

	let availableYears = $derived.by(() => {
		const years = new Set(references.map(r => r.issued?.['date-parts']?.[0]?.[0]?.toString()).filter(Boolean));
		return Array.from(years).sort().reverse();
	});

	let availableTags = $derived.by(() => {
		const tags = new Set<string>();
		references.forEach(r => {
			if (r.tags && Array.isArray(r.tags)) {
				r.tags.forEach((t: string) => tags.add(t));
			}
		});
		return Array.from(tags).sort();
	});

	let activeFiltersCount = $derived(
		(searchQuery ? 1 : 0) + 
		selectedTypes.length + 
		selectedYears.length + 
		selectedTags.length
	);

	function resetFilters() {
		searchQuery = '';
		selectedTypes = [];
		selectedYears = [];
		selectedTags = [];
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<Card class="card-surface w-full p-6 sm:p-7">
	<div class="stack-md">
		<div class="flex flex-wrap gap-3 justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
			<div class="flex items-center gap-2">
				<FilterOutline class="w-5 h-5 text-primary-600" />
				<Heading tag="h3" class="heading-sub text-lg m-0">Filters</Heading>
			</div>
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
					<CloseOutline class="w-3.5 h-3.5" />
					<span>{closeLabel}</span>
				</button>
			{/if}
		</div>
		
		<!-- Search -->
		<div>
			<Label for="search" class="mb-2 font-semibold body-text">Search</Label>
			<div class="relative">
				<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<SearchOutline class="w-4 h-4 text-gray-500 dark:text-gray-400" />
				</div>
				<Input 
					id="search" 
					type="text" 
					placeholder="Title, author, keyword..." 
					bind:value={searchQuery}
					class="ps-10"
				/>
			</div>
		</div>

		<!-- Type Filter -->
		{#if availableTypes.length > 0}
			<div class="stack-sm pt-2">
				<Label class="font-bold body-text">Type</Label>
				<div class="stack-xs">
					{#each availableTypes as type (type)}
						<Checkbox bind:group={selectedTypes} value={type} class="body-text-muted">
							<span class="capitalize">{type.replace('-', ' ')}</span>
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Tags Filter -->
		{#if availableTags.length > 0}
			<div class="stack-sm pt-2 border-t border-gray-100 dark:border-gray-700">
				<Label class="font-bold text-gray-700 dark:text-gray-300">Keywords</Label>
				<div class="max-h-60 overflow-y-auto stack-xs pr-2 custom-scrollbar">
					{#each availableTags as tag (tag)}
						<Checkbox bind:group={selectedTags} value={tag} class="text-gray-600 dark:text-gray-400">
							<span class="text-sm">{tag}</span>
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Year Filter -->
		{#if availableYears.length > 0}
			<div class="stack-sm pt-2 border-t border-gray-100 dark:border-gray-700">
				<Label class="font-bold text-gray-700 dark:text-gray-300">Year</Label>
				<div class="max-h-48 overflow-y-auto stack-xs pr-2 custom-scrollbar">
					{#each availableYears as year (year)}
						<Checkbox bind:group={selectedYears} value={year} class="text-gray-600 dark:text-gray-400">
							{year}
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</Card>

		<style>
			.custom-scrollbar::-webkit-scrollbar {
				width: 6px;
			}

			.custom-scrollbar::-webkit-scrollbar-track {
				background: transparent;
			}

			.custom-scrollbar::-webkit-scrollbar-thumb {
				background-color: rgba(156, 163, 175, 0.5);
				border-radius: 20px;
			}

			.custom-scrollbar::-webkit-scrollbar-thumb:hover {
				background-color: rgba(107, 114, 128, 0.8);
			}
		</style>
