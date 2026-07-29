<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { SearchOutline, CloseOutline, FilterOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import referencesData from '$lib/data/references.json';
	import { fade, slide } from 'svelte/transition';
	import type { CslReference } from '$lib/types/csl';
	import { stripReadingStatusTags, filterReferences, sortReferences } from '$lib/utils/references';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import ReferenceFacets from '$lib/components/ReferenceFacets.svelte';
	import ReferenceCard from '$lib/components/ReferenceCard.svelte';
	import ExportReferences from '$lib/components/ExportReferences.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { formatLanguage, formatType } from '$lib/utils/formatters';

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

	// Filter state. `?q=` is honoured so the concept map (and any external link)
	// can hand the bibliography a starting query — applied after hydration, so
	// the prerendered markup and the first client render still agree.
	let searchQuery = $state('');

	onMount(() => {
		const q = page.url.searchParams.get('q');
		if (q) searchQuery = q;
	});
	let selectedTypes = $state<string[]>([]);
	let selectedYears = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let selectedLanguages = $state<string[]>([]);
	let selectedSort = $state('newest');
	let showMobileFilters = $state(false);
	let expandedReferences = new SvelteSet<string>();

	/**
	 * Pagination. For a bibliography the browser's own find-in-page is often the
	 * fastest tool, and pagination defeats it — so "All" is a first-class option.
	 */
	const PAGE_SIZE_OPTIONS = [20, 50, 0] as const;
	let pageSize = $state<number>(20);
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

	/** One accent for every filter chip; the label carries the category. */
	let activeFilters = $derived([
		...(searchQuery
			? [
					{
						key: `q:${searchQuery}`,
						label: `Search: ${searchQuery}`,
						clear: () => (searchQuery = '')
					}
				]
			: []),
		...selectedTypes.map((type) => ({
			key: `type:${type}`,
			label: `Type: ${formatType(type)}`,
			clear: () => (selectedTypes = selectedTypes.filter((t) => t !== type))
		})),
		...selectedTags.map((tag) => ({
			key: `tag:${tag}`,
			label: `Keyword: ${tag}`,
			clear: () => (selectedTags = selectedTags.filter((t) => t !== tag))
		})),
		...selectedLanguages.map((lang) => ({
			key: `lang:${lang}`,
			label: `Language: ${formatLanguage(lang)}`,
			clear: () => (selectedLanguages = selectedLanguages.filter((l) => l !== lang))
		})),
		...selectedYears.map((year) => ({
			key: `year:${year}`,
			label: `Year: ${year}`,
			clear: () => (selectedYears = selectedYears.filter((y) => y !== year))
		}))
	]);

	let activeFiltersCount = $derived(activeFilters.length);

	// Reset pagination whenever the result set changes (filters, sort, search)
	let resultsKey = $derived(
		`${searchQuery}|${selectedTypes.join(',')}|${selectedYears.join(',')}|${selectedTags.join(',')}|${selectedLanguages.join(',')}|${selectedSort}|${pageSize}`
	);

	$effect(() => {
		// Track the key so the effect re-runs on any filter change
		resultsKey;
		currentPage = 1;
	});

	let paginated = $derived(pageSize > 0);
	let totalPages = $derived(
		paginated ? Math.max(1, Math.ceil(filteredReferences.length / pageSize)) : 1
	);
	let clampedPage = $derived(Math.min(currentPage, totalPages));
	let pageStart = $derived(paginated ? (clampedPage - 1) * pageSize : 0);
	let pageEnd = $derived(
		paginated
			? Math.min(pageStart + pageSize, filteredReferences.length)
			: filteredReferences.length
	);
	let pagedReferences = $derived(
		paginated ? filteredReferences.slice(pageStart, pageEnd) : filteredReferences
	);

	function goToPage(p: number) {
		const target = Math.max(1, Math.min(totalPages, p));
		if (target === clampedPage) return;
		currentPage = target;
		// Instant, not smooth: html:focus-within scopes smooth scrolling to
		// genuine anchor navigation, and a filter re-render is not that.
		resultsEl?.scrollIntoView({ block: 'start' });
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

	function pageSizeLabel(size: number) {
		return size === 0 ? 'All' : String(size);
	}
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<PageHero
	eyebrow="Resources"
	title="References"
	lede="A curated bibliography of works at the intersection of Digital Humanities, Artificial Intelligence and African Studies, compiled to inform the workshop's discussions and position paper."
	width="wide"
	size="compact"
/>

<section class="band-tight padding-inline-section">
	<div class="content-width-wide">
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
				<span class="flex items-center gap-1 text-xs font-medium">
					{#if activeFiltersCount > 0}
						<span class="filter-count">{activeFiltersCount}</span>
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
			<aside class="reference-sidebar hidden lg:col-span-3 lg:block">
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

				<!-- A status readout, not a card: this used to lift and glow on hover -->
				<div class="results-toolbar">
					<p class="text-body-sm">
						{#if paginated && filteredReferences.length > pageSize}
							Showing <span class="text-accent font-bold">{pageStart + 1}–{pageEnd}</span>
							of <span class="text-accent font-bold">{filteredReferences.length}</span> references
						{:else}
							Showing <span class="text-accent font-bold">{filteredReferences.length}</span>
							references
						{/if}
					</p>

					<div class="results-toolbar__actions">
						<div class="page-size" role="group" aria-label="References per page">
							<span class="text-caption" style="max-width:none">Per page</span>
							{#each PAGE_SIZE_OPTIONS as size (size)}
								<button
									type="button"
									class="page-size__option"
									class:is-active={pageSize === size}
									aria-pressed={pageSize === size}
									onclick={() => (pageSize = size)}
								>
									{pageSizeLabel(size)}
								</button>
							{/each}
						</div>
						<ExportReferences
							references={filteredReferences}
							filename="dh-ai-african-studies-references"
						/>
					</div>
				</div>

				{#if activeFiltersCount > 0}
					<div class="active-filters">
						{#each activeFilters as filter (filter.key)}
							<span class="filter-chip tap-target-compact">
								{filter.label}
								<button
									type="button"
									aria-label="Remove filter: {filter.label}"
									onclick={filter.clear}
								>
									<CloseOutline class="h-3 w-3" />
								</button>
							</span>
						{/each}
						<button type="button" class="filter-reset" onclick={resetFilters}>Clear all</button>
					</div>
				{/if}

				<div class="stack-md" bind:this={resultsEl}>
					{#each pagedReferences as ref (ref.id)}
						<div in:slide|local={{ duration: 200 }} out:fade|local={{ duration: 150 }}>
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
							<h3 class="body-text-strong text-lg font-medium">No references found</h3>
							<p class="body-text-muted mx-auto max-w-xs text-sm">
								Try adjusting your search terms or filters to find what you're looking for.
							</p>
							<Button color="primary" outline size="sm" onclick={resetFilters}>
								Clear all filters
							</Button>
						</div>
					{/if}
				</div>

				{#if paginated && totalPages > 1}
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

<style>
	/* Was `sticky top-24` — a magic number with no sticky header to clear */
	.reference-sidebar {
		position: sticky;
		top: var(--scroll-offset);
	}

	.results-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding-block: var(--space-sm);
		border-block: 1px solid var(--border-subtle);
	}

	.results-toolbar__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
	}

	.page-size {
		display: flex;
		align-items: center;
		gap: var(--space-3xs);
	}

	.page-size__option {
		min-width: 2.25rem;
		padding: var(--space-3xs) var(--space-2xs);
		border-radius: var(--radius-control);
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background-color var(--transition-micro),
			color var(--transition-micro);
	}

	.page-size__option:hover {
		color: var(--text-link);
	}

	.page-size__option.is-active {
		background-color: var(--accent-soft);
		border-color: var(--border-accent);
		color: var(--text-link);
	}

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs);
	}

	/* One accent for all filter chips — there used to be four unrelated
	   palettes, including a purple that is not in the design system. */
	.filter-chip {
		gap: var(--space-3xs);
		padding: 0 var(--space-2xs) 0 var(--space-xs);
		border-radius: var(--radius-full);
		background-color: var(--accent-soft);
		border: 1px solid var(--border-accent);
		color: var(--text-link);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
	}

	/* Was a 12px cross — below any sane target size */
	.filter-chip button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-full);
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	@media (pointer: coarse) {
		.filter-chip button {
			width: 2.25rem;
			height: 2.25rem;
		}
	}

	.filter-chip button:hover {
		background-color: color-mix(in srgb, var(--accent) 18%, transparent);
	}

	.filter-reset {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-muted);
		background: transparent;
		border: none;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.filter-reset:hover {
		color: var(--text-primary);
	}

	.filter-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		padding: 0 var(--space-2xs);
		background-color: var(--accent-soft);
		color: var(--text-link);
	}
</style>
