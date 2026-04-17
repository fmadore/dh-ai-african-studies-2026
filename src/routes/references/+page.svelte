<script lang="ts">
	import { Heading, P, Badge, Button } from 'flowbite-svelte';
	import {
		SearchOutline,
		CloseOutline,
		FilterOutline,
		ChevronLeftOutline,
		ChevronRightOutline
	} from 'flowbite-svelte-icons';
	import {
		createSeoMeta,
		createEventJsonLd,
		createWebPageJsonLd,
		jsonLdScript
	} from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import referencesData from '$lib/data/references.json';
	import { fade, slide } from 'svelte/transition';
	import ReferenceFacets from '$lib/components/ReferenceFacets.svelte';
	import ExportReferences from '$lib/components/ExportReferences.svelte';
	import { formatType, formatLanguage } from '$lib/utils/formatters';

	const seo = createSeoMeta({
		title: 'References',
		description:
			'A curated bibliography of works at the intersection of Digital Humanities, Artificial Intelligence, and African Studies.',
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

	const eventJsonLd = createEventJsonLd({
		name: 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: seo.description,
		startDate: workshopInfo.dates.startISO,
		endDate: workshopInfo.dates.endISO,
		locationName: workshopInfo.location.venue,
		locationAddress: workshopInfo.location.venue,
		locationCity: workshopInfo.location.city,
		locationCountry: workshopInfo.location.country,
		organizerName: workshopInfo.organizers.full,
		funderName: workshopInfo.funder.name,
		funderUrl: workshopInfo.funder.url,
		url: seo.canonical
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});

	// State
	let references = $state<any[]>(referencesData);
	let searchQuery = $state('');

	// Facets state
	let selectedTypes = $state<string[]>([]);
	let selectedYears = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let selectedLanguages = $state<string[]>([]);
	let selectedSort = $state('newest');
	let showMobileFilters = $state(false);
	let expandedReferences = $state(new Set<string>());

	// Pagination
	const PAGE_SIZE = 20;
	let currentPage = $state(1);
	let resultsEl: HTMLDivElement | undefined = $state();

	// Derived values
	let filteredReferences = $derived.by(() => {
		if (!references.length) return [];

		const filtered = references.filter((ref) => {
			// Search filter
			const searchContent =
				`${ref.title} ${ref.author?.map((a: any) => `${a.given} ${a.family}`).join(' ')}`.toLowerCase();
			const matchesSearch = searchContent.includes(searchQuery.toLowerCase());

			// Type filter
			const matchesType = selectedTypes.length === 0 || selectedTypes.includes(ref.type);

			// Year filter
			const year = ref.issued?.['date-parts']?.[0]?.[0]?.toString();
			const matchesYear = selectedYears.length === 0 || (year && selectedYears.includes(year));

			// Tag filter
			const refTags = ref.tags || [];
			const matchesTags =
				selectedTags.length === 0 || selectedTags.some((tag) => refTags.includes(tag));

			// Language filter
			const language = ref.language;
			const matchesLanguage =
				selectedLanguages.length === 0 || (language && selectedLanguages.includes(language));

			return matchesSearch && matchesType && matchesYear && matchesTags && matchesLanguage;
		});

		return filtered.sort((a, b) => {
			if (selectedSort === 'newest') {
				const yearA = a.issued?.['date-parts']?.[0]?.[0] || 0;
				const yearB = b.issued?.['date-parts']?.[0]?.[0] || 0;
				return yearB - yearA;
			}
			if (selectedSort === 'oldest') {
				const yearA = a.issued?.['date-parts']?.[0]?.[0] || 0;
				const yearB = b.issued?.['date-parts']?.[0]?.[0] || 0;
				return yearA - yearB;
			}
			if (selectedSort === 'title') {
				return (a.title || '').localeCompare(b.title || '');
			}
			if (selectedSort === 'author') {
				const authorA = a.author?.[0]?.family || '';
				const authorB = b.author?.[0]?.family || '';
				return authorA.localeCompare(authorB);
			}
			return 0;
		});
	});

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

	// Compact pagination model: first, last, current ±1, with ellipses
	let pageItems = $derived.by<(number | 'ellipsis')[]>(() => {
		const pages: (number | 'ellipsis')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
			return pages;
		}
		pages.push(1);
		if (clampedPage > 3) pages.push('ellipsis');
		const start = Math.max(2, clampedPage - 1);
		const end = Math.min(totalPages - 1, clampedPage + 1);
		for (let i = start; i <= end; i++) pages.push(i);
		if (clampedPage < totalPages - 2) pages.push('ellipsis');
		pages.push(totalPages);
		return pages;
	});

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
		const newSet = new Set(expandedReferences); // eslint-disable-line svelte/prefer-svelte-reactivity
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		expandedReferences = newSet;
	}

	function formatCitation(ref: any) {
		let authors = 'Unknown Author';

		if (ref.author && ref.author.length > 0) {
			authors = ref.author.map((a: any) => `${a.given} ${a.family}`).join(', ');
		} else if (ref.editor && ref.editor.length > 0) {
			const editorNames = ref.editor.map((e: any) => `${e.given} ${e.family}`).join(', ');
			authors = `${editorNames} (ed${ref.editor.length > 1 ? 's' : ''})`;
		}

		const year = ref.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
		return { authors, year };
	}

	function toggleTagFilter(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html jsonLdScript(eventJsonLd)}
	{@html jsonLdScript(webPageJsonLd)}
</svelte:head>

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
				Intelligence, and African Studies. This index is actively curated and will continue to
				expand over the coming weeks.
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
						{@const info = formatCitation(ref)}
						{@const accessLink = (() => {
							const doi = ref.DOI;
							if (doi) {
								return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
							}
							const url = ref.URL || ref.url || '';
							return /^https?:\/\//.test(url) ? url : '';
						})()}
						<div in:slide|local={{ duration: 300 }} out:fade|local={{ duration: 200 }}>
							<div
								class="card-surface group glow-border surface-padding w-full max-w-none cursor-pointer"
								onclick={(e: MouseEvent) => {
									if (
										e.target instanceof Element &&
										(e.target.closest('a') || e.target.closest('button'))
									)
										return;
									toggleReference(ref.id);
								}}
								role="button"
								tabindex="0"
								onkeydown={(e: KeyboardEvent) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										toggleReference(ref.id);
									}
								}}
							>
								<div class="stack-sm">
									<!-- Header: Type & Year -->
									<div
										class="body-text-muted flex items-start justify-between text-xs font-semibold tracking-wider uppercase"
									>
										<div class="gap-xs flex items-center">
											<span class="reference-type-pill">
												{formatType(ref.type)}
											</span>
											{#if ref['container-title']}
												<span class="text-subtle-ink hidden sm:inline">•</span>
												<span class="body-text-muted hidden italic sm:inline">
													{ref['container-title']}
												</span>
											{/if}
										</div>
										<span>{info.year}</span>
									</div>

									<!-- Title -->
									<Heading tag="h4" class="text-xl leading-tight font-bold">
										{#if accessLink}
											<a
												href={accessLink}
												target="_blank"
												rel="noopener noreferrer"
												class="group-hover:text-secondary-600 dark:group-hover:text-secondary-400 inline-flex items-center gap-1 text-left underline-offset-4 transition-colors hover:underline"
											>
												{ref.title}
											</a>
										{:else}
											<span>{ref.title}</span>
										{/if}
									</Heading>

									<!-- Authors -->
									<P
										class="body-text border-secondary-200 dark:border-secondary-700 border-l-2 pl-3 font-medium"
									>
										{info.authors}
									</P>

									<!-- Abstract (Truncated if needed, but showing full for now) -->
									{#if ref.abstract}
										<P
											class={'body-text-muted text-sm transition-all duration-500 ' +
												(expandedReferences.has(ref.id)
													? ''
													: 'line-clamp-3 group-hover:line-clamp-none')}
										>
											{ref.abstract}
										</P>
									{/if}

									<!-- Tags & Actions -->
									<div
										class="border-surface-300 dark:border-surface-dark-elevated mt-2 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div class="flex flex-wrap gap-2">
											{#if ref.tags && ref.tags.length > 0}
												{#each ref.tags as tag (tag)}
													<button
														type="button"
														onclick={() => toggleTagFilter(tag)}
														class="inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium transition-colors {selectedTags.includes(
															tag
														)
															? 'bg-secondary-200 text-secondary-800 border-secondary-300 dark:bg-secondary-800 dark:text-secondary-100 dark:border-secondary-600'
															: 'bg-secondary-50 text-secondary-700 border-secondary-100 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800 dark:hover:bg-secondary-900/50'}"
													>
														#{tag}
													</button>
												{/each}
											{/if}
										</div>

										{#if accessLink}
											<Button
												href={accessLink}
												target="_blank"
												rel="noopener noreferrer"
												size="xs"
												color="light"
												class="hover:text-secondary-600 dark:hover:text-secondary-400 font-medium sm:ml-auto"
											>
												Access publication
											</Button>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}

					{#if filteredReferences.length === 0}
						<div class="empty-state">
							<div class="empty-state__icon">
								<SearchOutline class="size-icon-md" />
							</div>
							<Heading tag="h4" class="body-text-strong text-lg font-medium"
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
					<nav class="pagination" aria-label="References pagination">
						<button
							type="button"
							class="pagination__nav"
							disabled={clampedPage === 1}
							aria-label="Previous page"
							onclick={() => goToPage(clampedPage - 1)}
						>
							<ChevronLeftOutline class="size-icon-sm" />
							<span class="pagination__nav-label">Previous</span>
						</button>

						<ul class="pagination__pages" role="list">
							{#each pageItems as item, i (i)}
								{#if item === 'ellipsis'}
									<li class="pagination__ellipsis" aria-hidden="true">…</li>
								{:else}
									<li>
										<button
											type="button"
											class="pagination__page"
											class:is-active={item === clampedPage}
											aria-current={item === clampedPage ? 'page' : undefined}
											aria-label="Page {item}"
											onclick={() => goToPage(item)}
										>
											{item}
										</button>
									</li>
								{/if}
							{/each}
						</ul>

						<button
							type="button"
							class="pagination__nav"
							disabled={clampedPage === totalPages}
							aria-label="Next page"
							onclick={() => goToPage(clampedPage + 1)}
						>
							<span class="pagination__nav-label">Next</span>
							<ChevronRightOutline class="size-icon-sm" />
						</button>
					</nav>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.reference-type-pill {
		background-color: var(--accent-soft);
		color: var(--text-link);
		border-radius: var(--radius-md);
		padding: var(--space-3xs) var(--space-xs);
	}

	.pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-subtle);
	}

	.pagination__nav {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-default);
		background: var(--bg-raised);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.pagination__nav:hover:not(:disabled) {
		background: var(--bg-sunken);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.pagination__nav:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	@media (max-width: 480px) {
		.pagination__nav-label {
			display: none;
		}
	}

	.pagination__pages {
		display: flex;
		align-items: center;
		gap: var(--space-3xs);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.pagination__page {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 var(--space-xs);
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.pagination__page:hover:not(.is-active) {
		background: var(--bg-sunken);
		color: var(--text-primary);
	}

	.pagination__page.is-active {
		background: var(--accent);
		color: var(--text-on-accent);
		border-color: var(--accent);
		box-shadow: var(--shadow-accent);
	}

	.pagination__ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		color: var(--text-subtle);
		font-size: var(--text-sm);
	}
</style>
