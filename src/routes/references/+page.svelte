<script lang="ts">
	import { Heading, P, Card, Badge, Button } from 'flowbite-svelte';
	import { SearchOutline, CloseOutline, FilterOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import referencesData from '$lib/data/references.json';
	import { fade, slide } from 'svelte/transition';
	import ReferenceFacets from '$lib/components/ReferenceFacets.svelte';

	const seo = createSeoMeta({
		title: 'References - DH & AI in African Studies',
		description: 'Bibliography and references for the Digital Humanities and AI in African Studies workshop.',
		path: '/references'
	});

	// State
	let references = $state<any[]>(referencesData);
	let searchQuery = $state('');
	
	// Facets state
	let selectedTypes = $state<string[]>([]);
	let selectedYears = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let selectedSort = $state('newest');
	let showMobileFilters = $state(false);
	let expandedReferences = $state(new Set<string>());

	// Derived values
	let filteredReferences = $derived.by(() => {
		if (!references.length) return [];

		const filtered = references.filter(ref => {
			// Search filter
			const searchContent = `${ref.title} ${ref.author?.map((a: any) => `${a.given} ${a.family}`).join(' ')}`.toLowerCase();
			const matchesSearch = searchContent.includes(searchQuery.toLowerCase());

			// Type filter
			const matchesType = selectedTypes.length === 0 || selectedTypes.includes(ref.type);

			// Year filter
			const year = ref.issued?.['date-parts']?.[0]?.[0]?.toString();
			const matchesYear = selectedYears.length === 0 || (year && selectedYears.includes(year));

			// Tag filter
			const refTags = ref.tags || [];
			const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => refTags.includes(tag));

			return matchesSearch && matchesType && matchesYear && matchesTags;
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
		selectedTags.length
	);

	function resetFilters() {
		searchQuery = '';
		selectedTypes = [];
		selectedYears = [];
		selectedTags = [];
		selectedSort = 'newest';
	}

	function toggleMobileFilters() {
		showMobileFilters = !showMobileFilters;
	}

	function toggleReference(id: string) {
		const newSet = new Set(expandedReferences);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		expandedReferences = newSet;
	}

	function formatCitation(ref: any) {
		const authors = ref.author?.map((a: any) => `${a.given} ${a.family}`).join(', ') || 'Unknown Author';
		const year = ref.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
		return { authors, year };
	}

	function toggleTagFilter(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter(t => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes}
		<meta {...attributes} />
	{/each}
</svelte:head>

<section class="bg-page min-h-screen py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>

	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		<!-- Header -->
		<div class="stack-sm relative z-10 text-center">
			<Heading tag="h1" class="heading-display heading-xl text-gradient drop-shadow-md pb-2 tracking-tight">References</Heading>
			<P class="body-text text-lg mx-auto max-w-3xl">
				A curated bibliography of works at the intersection of Digital Humanities, Artificial Intelligence, and African Studies. This index is actively curated and will continue to expand over the coming weeks.
			</P>
		</div>

		<div class="lg:hidden">
			<Button 
				color="light"
				onclick={toggleMobileFilters}
				class="w-full justify-between items-center text-left"
				aria-expanded={showMobileFilters}
			>
				<span class="flex items-center gap-2 font-semibold">
					<FilterOutline class="w-4 h-4" />
					Filters
				</span>
				<span class="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
					{#if activeFiltersCount > 0}
						<span class="inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 px-2 py-0.5">
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
						bind:selectedSort
						showCloseButton
						on:close={() => (showMobileFilters = false)}
					/>
				</div>
			{/if}
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<!-- Sidebar / Facets -->
			<aside class="hidden lg:block lg:col-span-3 stack-md sticky top-24">
				<ReferenceFacets 
					{references}
					bind:searchQuery
					bind:selectedTypes
					bind:selectedYears
					bind:selectedTags
					bind:selectedSort
				/>
			</aside>

			<!-- Main Content -->
			<div class="lg:col-span-9 stack-md">
				<div class="flex justify-between items-center card-surface p-4 rounded-lg shadow-sm dark:bg-primary-900/20 dark:border-primary-800/30">
					<P class="text-sm font-medium body-text">
						Showing <span class="text-primary-600 dark:text-primary-400 font-bold">{filteredReferences.length}</span> references
					</P>
					
					<!-- Active Filters Display (Mobile/Desktop) -->
					{#if activeFiltersCount > 0}
						<div class="hidden sm:flex gap-2 flex-wrap justify-end">
							{#each selectedTypes as type}
								<Badge color="indigo" class="flex items-center gap-1 pr-1">
									{type.replace('-', ' ')}
									<button type="button" onclick={() => selectedTypes = selectedTypes.filter(t => t !== type)} class="text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
										<CloseOutline class="w-3 h-3" />
									</button>
								</Badge>
							{/each}
							{#each selectedTags as tag}
								<Badge color="green" class="flex items-center gap-1 pr-1">
									{tag}
									<button type="button" onclick={() => selectedTags = selectedTags.filter(t => t !== tag)} class="text-green-400 hover:text-green-900 dark:hover:text-green-300">
										<CloseOutline class="w-3 h-3" />
									</button>
								</Badge>
							{/each}
							{#each selectedYears as year}
								<Badge color="gray" class="flex items-center gap-1 pr-1">
									{year}
									<button type="button" onclick={() => selectedYears = selectedYears.filter(y => y !== year)} class="text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
										<CloseOutline class="w-3 h-3" />
									</button>
								</Badge>
							{/each}
						</div>
					{/if}
				</div>

				<div class="stack-md">
					{#each filteredReferences as ref (ref.id)}
						{@const info = formatCitation(ref)}
						{@const accessLink = (() => {
							const doi = ref.DOI;
							if (doi) {
								return doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
							}
							return ref.URL || ref.url || '';
						})()}
							<div in:slide|local={{ duration: 300 }} out:fade|local={{ duration: 200 }}>
								<Card 
									class="card-surface w-full max-w-none p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group cursor-pointer"
									onclick={(e: MouseEvent) => {
										if (e.target instanceof Element && (e.target.closest('a') || e.target.closest('button'))) return;
										toggleReference(ref.id);
									}}
								>
								<div class="stack-sm">
									<!-- Header: Type & Year -->
									<div class="flex justify-between items-start text-xs uppercase tracking-wider font-semibold body-text-muted">
										<div class="flex items-center gap-2">
											<span class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
												{ref.type.replace('-', ' ')}
											</span>
											{#if ref['container-title']}
												<span class="hidden sm:inline text-gray-400">•</span>
												<span class="hidden sm:inline italic body-text-muted">
													{ref['container-title']}
												</span>
											{/if}
										</div>
										<span>{info.year}</span>
									</div>

									<!-- Title -->
									<Heading tag="h4" class="text-xl font-bold leading-tight">
										{#if accessLink}
											<a
												href={accessLink}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1 text-left group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors underline-offset-4 hover:underline"
											>
												{ref.title}
											</a>
										{:else}
											<span>{ref.title}</span>
										{/if}
									</Heading>
									
									<!-- Authors -->
									<P class="body-text font-medium border-l-2 border-gray-200 dark:border-gray-600 pl-3">
										{info.authors}
									</P>
									
									<!-- Abstract (Truncated if needed, but showing full for now) -->
									{#if ref.abstract}
										<P class={'text-sm body-text-muted transition-all duration-500 ' + (expandedReferences.has(ref.id) ? '' : 'line-clamp-3 group-hover:line-clamp-none')}>
											{ref.abstract}
										</P>
									{/if}

									<!-- Tags & Actions -->
									<div class="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div class="flex flex-wrap gap-2">
											{#if ref.tags && ref.tags.length > 0}
												{#each ref.tags as tag}
													<button
														type="button"
														onclick={() => toggleTagFilter(tag)}
														class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium transition-colors border {selectedTags.includes(tag) ? 'bg-secondary-200 text-secondary-800 border-secondary-300 dark:bg-secondary-800 dark:text-secondary-100 dark:border-secondary-600' : 'bg-secondary-50 text-secondary-700 border-secondary-100 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800 dark:hover:bg-secondary-900/50'}"
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
												class="font-medium hover:text-primary-600 dark:hover:text-primary-400 sm:ml-auto"
											>
												Access publication
											</Button>
										{/if}
									</div>
								</div>
							</Card>
						</div>
					{/each}
					
					{#if filteredReferences.length === 0}
						<div class="text-center py-16 card-surface rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
							<div class="stack-sm flex flex-col items-center">
								<SearchOutline class="w-12 h-12 text-gray-300 dark:text-gray-600" />
								<Heading tag="h4" class="text-lg font-medium body-text-strong">No references found</Heading>
								<P class="text-sm body-text-muted max-w-xs mx-auto">
									Try adjusting your search terms or filters to find what you're looking for.
								</P>
								<Button color="primary" outline size="sm" onclick={resetFilters} class="mt-2">
									Clear all filters
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Custom scrollbar for filter lists */
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
