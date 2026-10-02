<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { SearchOutline, CloseOutline, FilterOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { fade, slide } from 'svelte/transition';
	import type { CslReference } from '$lib/types/csl';
	import type { PageData } from './$types';
	import { filterReferences, sortReferences } from '$lib/utils/references';
	import { ReferenceFilterState } from '$lib/utils/reference-filters.svelte';
	import { resolveAppPath } from '$lib/utils/paths';
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

	let { data }: { data: PageData } = $props();

	// The lean index, derived at prerender time in +page.server.ts — the full
	// 437 KB of CSL records never enters the client bundle.
	let references = $derived(data.referenceIndex);

	/**
	 * The complete records, fetched once from the prerendered
	 * /references/data.json — on the first abstract expansion that outgrows its
	 * preview, or on export. Concurrent requests share one promise; a failed
	 * fetch resets it so the next expansion retries.
	 */
	let fullRecords = $state<Map<string, CslReference> | null>(null);
	let fullRecordsFailed = $state(false);
	let fullRecordsPromise: Promise<Map<string, CslReference>> | null = null;

	function ensureFullRecords(): Promise<Map<string, CslReference>> {
		fullRecordsPromise ??= fetch(resolveAppPath('/references/data.json'))
			.then((res) => {
				if (!res.ok) throw new Error(`references data: HTTP ${res.status}`);
				return res.json() as Promise<CslReference[]>;
			})
			.then((records) => {
				const map = new Map(records.map((r) => [r.id, r]));
				fullRecords = map;
				fullRecordsFailed = false;
				return map;
			})
			.catch((error) => {
				fullRecordsPromise = null;
				fullRecordsFailed = true;
				throw error;
			});
		return fullRecordsPromise;
	}

	/** Export needs every field, in the filtered list's own order. */
	async function getExportRecords(): Promise<CslReference[]> {
		const map = await ensureFullRecords();
		return filteredReferences
			.map((r) => map.get(r.id))
			.filter((r): r is CslReference => Boolean(r));
	}

	// Filters, sort, page size and page live in the query string (see
	// reference-filters.svelte.ts). They are read after hydration, so the
	// prerendered markup and the first client render still agree; the concept
	// map's `?q=` links arrive the same way.
	const filters = new ReferenceFilterState();
	let showMobileFilters = $state(false);
	let mobileFiltersEl: HTMLDivElement | undefined = $state();
	let expandedReferences = new SvelteSet<string>();

	/**
	 * Pagination. For a bibliography the browser's own find-in-page is often the
	 * fastest tool, and pagination defeats it — so "All" is a first-class option.
	 */
	const PAGE_SIZE_OPTIONS = [20, 50, 0] as const;
	const DEFAULT_PAGE_SIZE = 20;
	let pageSize = $state<number>(DEFAULT_PAGE_SIZE);
	let resultsEl: HTMLDivElement | undefined = $state();

	let filteredReferences = $derived(
		sortReferences(filterReferences(references, filters.criteria), filters.selectedSort)
	);

	/** One accent for every filter chip; the label carries the category. */
	let activeFilters = $derived([
		...(filters.searchQuery
			? [
					{
						key: `q:${filters.searchQuery}`,
						label: `Search: ${filters.searchQuery}`,
						clear: () => (filters.searchQuery = '')
					}
				]
			: []),
		...filters.selectedTypes.map((type) => ({
			key: `type:${type}`,
			label: `Type: ${formatType(type)}`,
			clear: () => (filters.selectedTypes = filters.selectedTypes.filter((t) => t !== type))
		})),
		...filters.selectedTags.map((tag) => ({
			key: `tag:${tag}`,
			label: `Keyword: ${tag}`,
			clear: () => filters.toggleTag(tag)
		})),
		...filters.selectedLanguages.map((lang) => ({
			key: `lang:${lang}`,
			label: `Language: ${formatLanguage(lang)}`,
			clear: () => (filters.selectedLanguages = filters.selectedLanguages.filter((l) => l !== lang))
		})),
		...filters.selectedYears.map((year) => ({
			key: `year:${year}`,
			label: `Year: ${year}`,
			clear: () => (filters.selectedYears = filters.selectedYears.filter((y) => y !== year))
		}))
	]);

	/*
	 * The chosen page belongs to one result set. Tagging it with the set's key
	 * sends any filter, sort or page-size change back to page 1 as a plain
	 * derivation, where an effect used to write the reset back into state.
	 */
	let resultsKey = $derived(`${filters.key}|${pageSize}`);
	let chosenPage = $state({ key: '', page: 1 });
	let currentPage = $derived(chosenPage.key === resultsKey ? chosenPage.page : 1);

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
		chosenPage = { key: resultsKey, page: target };
		// Instant, not smooth: html:focus-within scopes smooth scrolling to
		// genuine anchor navigation, and a filter re-render is not that.
		resultsEl?.scrollIntoView({ block: 'start' });
	}

	// --- Query string ---
	let urlSynced = $state(false);

	// SvelteKit can reuse this page when only its query changes. Read every
	// completed navigation, not just the first mount, so shared links stay true.
	afterNavigate(() => {
		const params = page.url.searchParams;
		filters.readFrom(params);
		const size = params.get('per');
		pageSize = DEFAULT_PAGE_SIZE;
		if (size !== null && (PAGE_SIZE_OPTIONS as readonly number[]).includes(Number(size))) {
			pageSize = Number(size);
		}
		const requested = Number.parseInt(params.get('page') ?? '', 10);
		chosenPage = { key: resultsKey, page: requested > 1 ? requested : 1 };
		urlSynced = true;
	});

	// Replace, not push: refining a filter shouldn't make Back step through
	// every keystroke. Defaults are omitted, so the plain list keeps a clean URL.
	$effect(() => {
		if (!urlSynced) return;
		const params = new URLSearchParams(); // eslint-disable-line svelte/prefer-svelte-reactivity -- built and discarded per run
		filters.writeTo(params);
		if (pageSize !== DEFAULT_PAGE_SIZE) params.set('per', String(pageSize));
		if (clampedPage > 1) params.set('page', String(clampedPage));
		const query = params.toString();
		const search = query ? `?${query}` : '';
		if (search === location.search) return;
		untrack(() => replaceState(`${location.pathname}${search}${location.hash}`, page.state));
	});

	function resetFilters() {
		filters.reset();
	}

	function toggleMobileFilters() {
		showMobileFilters = !showMobileFilters;
	}

	/** The sheet's close button disappears with it, so hand focus back. */
	function closeMobileFilters() {
		showMobileFilters = false;
		mobileFiltersEl?.querySelector('button')?.focus();
	}

	function toggleReference(id: string) {
		if (expandedReferences.has(id)) {
			expandedReferences.delete(id);
			return;
		}
		expandedReferences.add(id);
		// The bundled preview covers the collapsed clamp; the first expansion
		// past it pulls the complete records in. Failure keeps the preview and
		// the card shows a quiet note; re-expanding retries.
		const ref = references.find((r) => r.id === id);
		if (ref && !ref.abstractIsComplete && !fullRecords) {
			ensureFullRecords().catch(() => {});
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
		<!-- Small screens only (CSS): the same facets panel below doubles as the
		     filter sheet this button opens. -->
		<div class="mobile-filters" bind:this={mobileFiltersEl}>
			<Button
				color="light"
				onclick={toggleMobileFilters}
				class="w-full items-center justify-between text-left"
				aria-expanded={showMobileFilters}
				aria-controls="reference-filters"
			>
				<span class="flex items-center gap-2 font-semibold">
					<FilterOutline class="h-4 w-4" />
					Filters
				</span>
				<span class="flex items-center gap-1 text-xs font-medium">
					{#if filters.activeCount > 0}
						<span class="filter-count">{filters.activeCount}</span>
					{/if}
					<span>{showMobileFilters ? 'Hide' : 'Show'}</span>
				</span>
			</Button>
		</div>

		<div class="reference-layout gap-xl grid grid-cols-1 items-start lg:grid-cols-12">
			<!-- One facets tree, laid out by CSS: the sidebar from lg up, the sheet
			     below. Deciding in script (matchMedia) left it out of the
			     prerendered page, so on desktop it popped in after hydration and
			     shoved the results sideways. -->
			<aside
				id="reference-filters"
				class="reference-sidebar lg:col-span-3"
				class:is-open={showMobileFilters}
				aria-label="Filters"
			>
				<ReferenceFacets
					{references}
					{filters}
					fillHeight
					showCloseButton
					onclose={closeMobileFilters}
				/>
			</aside>

			<!-- Main Content -->
			<div class="lg:col-span-9">
				<!-- Outside the stack on purpose: `.sr-only` is out of flow but still an
				     adjacent sibling, so as a stack child it pushed the toolbar down and
				     knocked the results column out of alignment with the facets panel. -->
				<h2 class="sr-only">Results</h2>

				<div class="stack-md">
					<!-- A status readout, not a card: this used to lift and glow on hover -->
					<div class="results-toolbar">
						<p class="text-body-sm">
							{#if paginated && filteredReferences.length > pageSize}
								Showing <span class="results-toolbar__figure">{pageStart + 1}–{pageEnd}</span>
								of <span class="results-toolbar__figure">{filteredReferences.length}</span> references
							{:else}
								Showing <span class="results-toolbar__figure">{filteredReferences.length}</span>
								references
							{/if}
						</p>

						<div class="results-toolbar__actions">
							<div class="page-size" role="group" aria-label="References per page">
								<span class="page-size__label">Per page</span>
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
								count={filteredReferences.length}
								getRecords={getExportRecords}
								filename="dh-ai-african-studies-references"
							/>
						</div>
					</div>

					{#if filters.activeCount > 0}
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

					<!-- `stack-lg`, not `stack-md`: the interval between two records has to
					     beat the 24px inside one, or twenty cards read as a single block. -->
					<div class="stack-lg" bind:this={resultsEl}>
						{#each pagedReferences as ref (ref.id)}
							<div
								class:reference-result={pageSize === 0}
								in:slide|local={{ duration: 200 }}
								out:fade|local={{ duration: 150 }}
							>
								<ReferenceCard
									reference={ref}
									selectedTags={filters.selectedTags}
									expanded={expandedReferences.has(ref.id)}
									fullAbstract={fullRecords?.get(ref.id)?.abstract ?? null}
									abstractFailed={fullRecordsFailed}
									ontoggleexpand={toggleReference}
									ontoggletag={(tag) => filters.toggleTag(tag)}
								/>
							</div>
						{/each}

						{#if filteredReferences.length === 0}
							<div class="empty-state">
								<div class="empty-state__icon">
									<SearchOutline class="size-icon-md" />
								</div>
								<h3 class="body-text-strong text-lg font-medium">No references match</h3>
								<p class="body-text-muted mx-auto max-w-xs text-sm">
									Adjust the search or filters, or clear them to see all {references.length} references.
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
	</div>
</section>

<style>
	/* Below lg the facets panel is a sheet the Filters button opens, above the
	 * results. The breakpoint matches the grid's lg:grid-cols-12. */
	@media (max-width: 1023.98px) {
		.reference-layout {
			row-gap: var(--space-md);
		}

		.reference-sidebar:not(.is-open) {
			display: none;
		}

		.reference-sidebar.is-open {
			animation: filters-sheet-in 200ms var(--ease-standard);
		}
	}

	@keyframes filters-sheet-in {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reference-sidebar.is-open {
			animation: none;
		}
	}

	/* Was `sticky top-24` — a magic number with no sticky header to clear.
	 * Capped to the viewport and turned into a flex column: the facets panel
	 * scrolls its own body rather than hanging below the fold for the length of
	 * the results list. */
	@media (min-width: 1024px) {
		.reference-sidebar {
			position: sticky;
			top: var(--scroll-offset);
			display: flex;
			flex-direction: column;
			max-height: calc(100dvh - var(--scroll-offset) - var(--space-lg));
		}

		.mobile-filters {
			display: none;
		}
	}

	/* The disclosure is a control for the results below it, not a page banner —
	   it used to sit flush against the results toolbar's top rule. */
	.mobile-filters {
		margin-bottom: var(--space-md);
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

	/* A running count that changes on every keystroke: tabular figures stop the
	   sentence around it from reflowing. Semibold, not bold — these are three
	   numerals inside a 15px muted line, not a headline. */
	.results-toolbar__figure {
		color: var(--text-accent);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
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

	/* Was `.text-caption` plus an inline `max-width:none` to undo the 42ch cap
	   that class carries for photo credits. This is a control label. */
	.page-size__label {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.page-size__option {
		min-width: 2.75rem;
		min-height: 2.75rem;
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

	/* "All" is deliberate, but a long bibliography should not continuously lay
	 * out and paint cards that remain far below the viewport. */
	.reference-result {
		content-visibility: auto;
		contain-intrinsic-size: auto 22rem;
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
			width: 2.75rem;
			height: 2.75rem;
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
