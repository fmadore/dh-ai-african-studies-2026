<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import {
		Card,
		Heading,
		Label,
		Input,
		Checkbox,
		Select,
	} from "flowbite-svelte";
	import {
		FilterOutline,
		SearchOutline,
		CloseOutline,
	} from "flowbite-svelte-icons";

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
	}

	const dispatch = createEventDispatcher<{ close: void }>();

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
	}: Props = $props();

	function formatType(type: string): string {
		const typeMap: Record<string, string> = {
			"article-magazine": "Magazine article",
			"article-newspaper": "Newspaper article",
			"article-journal": "Journal article",
			"entry-encyclopedia": "Encyclopedia entry",
			motion_picture: "Video",
			"paper-conference": "Conference paper",
			"post-weblog": "Blog post",
			song: "Podcast",
			speech: "Presentation",
			article: "Preprint",
		};
		return typeMap[type] || type.replace(/-|_/g, " ");
	}

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
	}

	function handleClose() {
		dispatch("close");
	}

	function formatLanguage(langCode: string): string {
		const languageMap: Record<string, string> = {
			en: "English",
			fr: "French",
			es: "Spanish",
			pt: "Portuguese",
			ar: "Arabic",
			sw: "Swahili",
			de: "German",
		};
		return languageMap[langCode.toLowerCase()] || langCode.toUpperCase();
	}
</script>

<Card class="card-surface w-full p-6 sm:p-7">
	<div class="stack-md">
		<div
			class="flex flex-wrap gap-3 justify-between items-center border-b border-surface-300 dark:border-surface-dark-overlay pb-4"
		>
			<div class="flex items-center gap-2">
				<FilterOutline class="size-icon-md text-primary-600" />
				<Heading tag="h3" class="heading-sub text-lg m-0"
					>Filters</Heading
				>
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
					<CloseOutline class="size-icon-sm" />
					<span>{closeLabel}</span>
				</button>
			{/if}
		</div>

		<!-- Search -->
		<div>
			<Label for="search" class="mb-2 font-semibold body-text"
				>Search</Label
			>
			<div class="relative">
				<div
					class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
				>
					<SearchOutline
						class="size-icon-sm text-gray-500 dark:text-gray-400"
					/>
				</div>
				<Input
					id="search"
					type="text"
					placeholder="Title, author, keyword..."
					bind:value={searchQuery}
					class="ps-10 py-3"
				/>
			</div>
		</div>

		<!-- Sort -->
		<div>
			<Label class="mb-2 font-semibold body-text">Sort by</Label>
			<Select
				items={sortOptions}
				bind:value={selectedSort}
				class="body-text"
			/>
		</div>

		<!-- Type Filter -->
		{#if availableTypes.length > 0}
			<div class="stack-sm pt-2">
				<Label class="font-bold body-text-strong">Type</Label>
				<div class="stack-xs pl-1">
					{#each availableTypes as type (type)}
						<Checkbox
							bind:group={selectedTypes}
							value={type}
							class="body-text-muted"
						>
							<span class="capitalize">{formatType(type)}</span>
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Tags Filter -->
		{#if availableTags.length > 0}
			<div
				class="stack-sm pt-2 border-t border-surface-200 dark:border-surface-dark-elevated"
			>
				<Label class="font-bold body-text-strong">Keywords</Label>
				<div
					class="max-h-60 overflow-y-auto stack-xs pl-1 pr-2 custom-scrollbar keyword-stack"
				>
					{#each availableTags as tag (tag)}
						<Checkbox
							bind:group={selectedTags}
							value={tag}
							class="body-text-muted"
						>
							<span class="text-sm">{tag}</span>
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Language Filter -->
		{#if availableLanguages.length > 0}
			<div
				class="stack-sm pt-2 border-t border-surface-200 dark:border-surface-dark-elevated"
			>
				<Label class="font-bold body-text-strong">Language</Label>
				<div class="stack-xs pl-1">
					{#each availableLanguages as language (language)}
						<Checkbox
							bind:group={selectedLanguages}
							value={language}
							class="body-text-muted"
						>
							<span>{formatLanguage(language)}</span>
						</Checkbox>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Year Filter -->
		{#if availableYears.length > 0}
			<div
				class="stack-sm pt-2 border-t border-surface-200 dark:border-surface-dark-elevated"
			>
				<Label class="font-bold body-text-strong">Year</Label>
				<div
					class="max-h-48 overflow-y-auto stack-xs pl-1 pr-2 custom-scrollbar"
				>
					{#each availableYears as year (year)}
						<Checkbox
							bind:group={selectedYears}
							value={year}
							class="body-text-muted"
						>
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
		background-color: var(--color-gray-400);
		border-radius: var(--radius-full);
		opacity: 0.5;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-gray-500);
		opacity: 0.8;
	}

	:global(.keyword-stack > * + *) {
		margin-top: 0.125rem;
	}
</style>
