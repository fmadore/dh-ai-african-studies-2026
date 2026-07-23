<script lang="ts">
	import { Heading, P, Badge, Button } from 'flowbite-svelte';
	import { SearchOutline, CloseOutline, FilterOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import referencesData from '$lib/data/references.json';
	import { fade, slide } from 'svelte/transition';
	import type { CslReference } from '$lib/types/csl';
	import { stripReadingStatusTags, filterReferences, sortReferences } from '$lib/utils/references';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ReferenceFacets from '$lib/components/ReferenceFacets.svelte';
	import ReferenceCard from '$lib/components/ReferenceCard.svelte';
	import ExportReferences from '$lib/components/ExportReferences.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { formatLanguage } from '$lib/utils/formatters';

	const seo = createSeoMeta({
		title: 'References',
		description:
			'A curated bibliography of works at the intersection of Digital Humanities, Artificial Intelligence, and African Studies, compiled for the Charting New Territory workshop.',
		path: '/references',
		keywords: [
			'Bibliography',
			'References',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Academic Literature',
			'Research Resources',
			'Scholarly Articles'
		]
	});

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});

	// Static data — computed once, no reactivity needed
	const references = stripReadingStatusTags(referencesData as unknown as CslReference[]);

	// Filter state
	let searchQuery = $state('');
	let selectedTypes = $state<string[]>([]);
	let selectedYears = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let selectedLanguages = $state<string[]>([]);
	let selectedSort = $state('newest');
	let showMobileFilters = $state(false);
	let expandedReferences = new SvelteSet<string>();

	// Pagination
	const PAGE_SIZE = 20;
	let currentPage = $state(1);
	let resultsEl: HTMLDivElement | undefined = $state();

	let filteredReferences = $derived(
		sortReferences(
			filterReferences(references, {
				searchQuery,
				selectedTypes,
				selectedYears,
				selectedTags,
				selectedLanguages
			}),
			selectedSort
		)
	);

	let activeFiltersCount = $derived(
		(searchQuery ? 1 : 0) +
			selectedTypes.length +
			selectedYears.length +
			selectedTags.length +
			selectedLanguages.length
	);

	// Reset pagination whenever the result set changes (filters, sort, search)
	let resultsKey = $derived(
		`${searchQuery}|${selectedTypes.join(',')}|${selectedYears.join(',')}|${selectedTags.join(',')}|${selectedLanguages.join(',')}|${selectedSort}`
	);

	$effect(() => {
		// Track the key so the effect re-runs on any filter change
		resultsKey;
		currentPage = 1;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredReferences.length / PAGE_SIZE)));
	let clampedPage = $derived(Math.min(currentPage, totalPages));
	let pageStart = $derived((clampedPage - 1) * PAGE_SIZE);
	let pageEnd = $derived(Math.min(pageStart + PAGE_SIZE, filteredReferences.length));
	let pagedReferences = $derived(filteredReferences.slice(pageStart, pageEnd));

	function goToPage(p: number) {
		const target = Math.max(1, Math.min(totalPages, p));
		if (target === clampedPage) return;
		currentPage = target;
		// Scroll to top of results for context continuity
		if (typeof window !== 'undefined' && resultsEl) {
			resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function resetFilters() {
		searchQuery = '';
		selectedTypes = [];
		selectedYears = [];
		selectedTags = [];
		selectedLanguages = [];
		selectedSort = 'newest';
	}

	function toggleMobileFilters() {
		showMobileFilters = !showMobileFilters;
	}

	function toggleReference(id: string) {
		if (expandedReferences.has(id)) {
			expandedReferences.delete(id);
		} else {
			expandedReferences.add(id);
		}
	}

	function toggleTagFilter(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<section
	class="bg-page padding-block-section padding-inline-section relative min-h-screen overflow-hidden"
>
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>

	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		<!-- Header -->
		<div class="stack-sm relative z-10 text-center">
			<Heading
				tag="h1"
				class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
				>References</Heading
			>
			<P class="text-lead animate-hero-subtitle mx-auto max-w-3xl">
				A curated bibliography of works at the intersection of Digital Humanities, Artificial
				Intelligence, and African Studies, compiled to inform the workshop's discussions and
				position paper.
			</P>
		</div>

		<div class="lg:hidden">
			<Button
				color="light"
				onclick={toggleMobileFilters}
				class="w-full items-center justify-between text-left"
				aria-expanded={showMobileFilters}
			>
				<span class="flex items-center gap-2 font-semibold">
					<FilterOutline class="h-4 w-4" />
					Filters
				</span>
				<span class="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
					{#if activeFiltersCount > 0}
						<span
							class="bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-200 inline-flex items-center justify-center rounded-full px-2 py-0.5"
						>
							{activeFiltersCount}
						</span>
					{/if}
					<span>{showMobileFilters ? 'Hide' : 'Show'}</span>
				</span>
			</Button>

			{#if showMobileFilters}
				<div class="mt-4" in:slide={{ duration: 200 }} out:fade={{ duration: 150 }}>
					<ReferenceFacets
						{references}
						bind:searchQuery
						bind:selectedTypes
						bind:selectedYears
						bind:selectedTags
						bind:selectedLanguages
						bind:selectedSort
						showCloseButton
						onclose={() => (showMobileFilters = false)}
					/>
				</div>
			{/if}
		</div>

		<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
			<!-- Sidebar / Facets -->
			<aside class="stack-md sticky top-24 hidden lg:col-span-3 lg:block">
				<ReferenceFacets
					{references}
					bind:searchQuery
					bind:selectedTypes
					bind:selectedYears
					bind:selectedTags
					bind:selectedLanguages
					bind:selectedSort
				/>
			</aside>

			<!-- Main Content -->
			<div class="stack-md lg:col-span-9">
				<h2 class="sr-only">Results</h2>
				<div
					class="card-surface surface-padding-sm relative z-20 flex flex-wrap items-center justify-between gap-3"
				>
					<div class="gap-md flex items-center">
						<P class="body-text text-sm font-medium">
							{#if filteredReferences.length > PAGE_SIZE}
								Showing
								<span class="text-accent font-bold">{pageStart + 1}–{pageEnd}</span>
								of
								<span class="text-accent font-bold">{filteredReferences.length}</span>
								references
							{:else}
								Showing
								<span class="text-accent font-bold">{filteredReferences.length}</span>
								references
							{/if}
						</P>
						<ExportReferences
							references={filteredReferences}
							filename="dh-ai-african-studies-references"
						/>
					</div>

					<!-- Active Filters Display (Mobile/Desktop) -->
					{#if activeFiltersCount > 0}
						<div class="hidden flex-wrap justify-end gap-2 sm:flex">
							{#each selectedTypes as type (type)}
								<Badge color="primary" class="flex items-center gap-1 pr-1">
									{type.replace('-', ' ')}
									<button
										type="button"
										aria-label="Remove type filter: {type}"
										onclick={() => (selectedTypes = selectedTypes.filter((t) => t !== type))}
										class="text-primary-300 hover:text-primary-700 dark:hover:text-primary-200"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</Badge>
							{/each}
							{#each selectedTags as tag (tag)}
								<Badge color="teal" class="flex items-center gap-1 pr-1">
									{tag}
									<button
										type="button"
										aria-label="Remove tag filter: {tag}"
										onclick={() => (selectedTags = selectedTags.filter((t) => t !== tag))}
										class="text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</Badge>
							{/each}
							{#each selectedYears as year (year)}
								<Badge color="gray" class="flex items-center gap-1 pr-1">
									{year}
									<button
										type="button"
										aria-label="Remove year filter: {year}"
										onclick={() => (selectedYears = selectedYears.filter((y) => y !== year))}
										class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</Badge>
							{/each}
							{#each selectedLanguages as lang (lang)}
								<Badge color="purple" class="flex items-center gap-1 pr-1">
									{formatLanguage(lang)}
									<button
										type="button"
										aria-label="Remove language filter: {formatLanguage(lang)}"
										onclick={() =>
											(selectedLanguages = selectedLanguages.filter((l) => l !== lang))}
										class="text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
									>
										<CloseOutline class="h-3 w-3" />
									</button>
								</Badge>
							{/each}
						</div>
					{/if}
				</div>

				<div class="stack-md" bind:this={resultsEl}>
					{#each pagedReferences as ref (ref.id)}
						<div in:slide|local={{ duration: 300 }} out:fade|local={{ duration: 200 }}>
							<ReferenceCard
								reference={ref}
								{selectedTags}
								expanded={expandedReferences.has(ref.id)}
								ontoggleexpand={toggleReference}
								ontoggletag={toggleTagFilter}
							/>
						</div>
					{/each}

					{#if filteredReferences.length === 0}
						<div class="empty-state">
							<div class="empty-state__icon">
								<SearchOutline class="size-icon-md" />
							</div>
							<Heading tag="h3" class="body-text-strong text-lg font-medium"
								>No references found</Heading
							>
							<P class="body-text-muted mx-auto max-w-xs text-sm">
								Try adjusting your search terms or filters to find what you're looking for.
							</P>
							<Button color="primary" outline size="sm" onclick={resetFilters}>
								Clear all filters
							</Button>
						</div>
					{/if}
				</div>

				{#if totalPages > 1}
					<Pagination
						currentPage={clampedPage}
						{totalPages}
						label="References pagination"
						onnavigate={goToPage}
					/>
				{/if}
			</div>
		</div>
	</div>
</section>
