<script lang="ts">
	import { Card, Heading, P, Badge, Tabs, TabItem, Accordion, AccordionItem } from 'flowbite-svelte';
	import { UserCircleSolid, UsersGroupSolid, UsersGroupOutline } from 'flowbite-svelte-icons';
	import { participants } from '$lib/data/participants';
	import { thematicGroups } from '$lib/data/thematic-groups';
	import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import ParticipantsMap from '$lib/components/ParticipantsMap.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';

	let searchQuery = $state('');
	let activeTab = $state<'all' | 'groups'>('all');

	const baseParticipants = participants.filter((participant) => participant.role !== 'Student assistant');
	const totalParticipants = baseParticipants.length;
	const totalCountries = new Set(baseParticipants.map((participant) => participant.country)).size;

	// Get participants for a specific thematic group
	function getGroupParticipants(groupName: string) {
		return baseParticipants
			.filter((p) => p.thematicGroup === groupName)
			.map((participant) => ({
				...participant,
				photoUrl: resolveAssetPath(participant.photoUrl)
			}));
	}

	let displayedParticipants = $derived(baseParticipants
		.filter((participant) => {
			const query = searchQuery.toLowerCase();
			return (
				participant.name.toLowerCase().includes(query) ||
				participant.affiliation.toLowerCase().includes(query) ||
				participant.country.toLowerCase().includes(query) ||
				participant.researchRegions.some((region) => region.toLowerCase().includes(query))
			);
		})
		.map((participant) => ({
			...participant,
			photoUrl: resolveAssetPath(participant.photoUrl)
		})));

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = 'none';
		const placeholder = img.nextElementSibling as HTMLElement;
		if (placeholder) {
			placeholder.style.display = 'flex';
		}
	}

	const seo = createSeoMeta({
		title: 'Participants',
		description:
			'Meet the international experts shaping the Digital Humanities and AI in African Studies scoping workshop.',
		path: '/participants'
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
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes, index (attributes.name ?? attributes.property ?? `meta-${index}`)}
		<meta {...attributes} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html `<script type="application/ld+json">${serializeJsonLd(eventJsonLd)}</script>`}
</svelte:head>

<!-- Page Header -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading tag="h1" class="heading-display heading-xl text-gradient drop-shadow-md pb-2 tracking-tight">Participants</Heading>
		<P class="text-lead mx-auto max-w-3xl">
			Meet the {totalParticipants} international experts from {totalCountries} countries participating in this scoping workshop on Digital Humanities and AI in African Studies.
		</P>
	</div>
</section>

<!-- Tabs Section -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="content-width-wide">
		<Tabs tabStyle="underline" class="mb-8">
			<TabItem open={activeTab === 'all'} onclick={() => activeTab = 'all'}>
				{#snippet titleSlot()}
					<div class="flex items-center gap-2">
						<UsersGroupOutline class="w-5 h-5" />
						<span>All Participants</span>
					</div>
				{/snippet}
			</TabItem>
			<TabItem open={activeTab === 'groups'} onclick={() => activeTab = 'groups'}>
				{#snippet titleSlot()}
					<div class="flex items-center gap-2">
						<UsersGroupSolid class="w-5 h-5" />
						<span>By Thematic Group</span>
					</div>
				{/snippet}
			</TabItem>
		</Tabs>

		{#if activeTab === 'all'}
			<!-- All Participants View -->
			<div class="surface-panel surface-padding stack-lg relative">
				<div class="w-full max-w-md mx-auto mb-6">
					<SearchFilter bind:value={searchQuery} placeholder="Search by name, affiliation, or region..." />
				</div>

				{#if displayedParticipants.length > 0}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each displayedParticipants as participant (participant.name)}
							<Card class="card-surface surface-padding-sm h-full">
								<div class="flex flex-col items-center text-center stack-xs">
									<!-- Participant Photo -->
									<div class="relative w-24 h-24">
										{#if participant.photoUrl}
											<img
												src={participant.photoUrl}
												alt={participant.name}
												class="w-24 h-24 rounded-full object-cover border-2 border-primary-100 dark:border-primary-800 shadow-md"
												onerror={handleImageError}
											/>
											<!-- Placeholder for missing images -->
											<div class="absolute inset-0 hidden items-center justify-center rounded-full border-2 border-primary-100 bg-gray-200 dark:border-primary-800 dark:bg-gray-700 shadow-md">
												<UserCircleSolid class="w-14 h-14 text-gray-400 dark:text-gray-500" />
											</div>
										{:else}
											<!-- Placeholder for participants without photo -->
											<div class="flex h-full w-full items-center justify-center rounded-full border-2 border-primary-100 bg-gray-200 dark:border-primary-800 dark:bg-gray-700 shadow-md">
												<UserCircleSolid class="w-14 h-14 text-gray-400 dark:text-gray-500" />
											</div>
										{/if}
									</div>

									<!-- Participant Name -->
									<Heading tag="h3" class="heading-sub heading-color-light heading-sm">
										{participant.name}
									</Heading>

									<!-- Affiliation -->
									<P class="text-body-sm text-primary-600 dark:text-primary-400 font-medium">
										{participant.affiliation}
									</P>

									<!-- Country Badge -->
									<Badge color="secondary">{participant.country}</Badge>

									<!-- Bio -->
									<P class="text-body-sm">
										{participant.bio}
									</P>
								</div>

								<!-- Research Regions -->
								{#if participant.researchRegions.length > 0}
									<div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700/50 stack-xs">
										<P class="text-caption font-medium uppercase tracking-wider text-center">
											Research Regions
										</P>
										<div class="flex flex-wrap justify-center gap-2">
											{#each participant.researchRegions.toSorted() as region (region)}
												<Badge color="secondary" class="text-xs">{region}</Badge>
											{/each}
										</div>
									</div>
								{/if}
							</Card>
						{/each}
					</div>
				{:else}
					<div class="text-center py-12">
						<P class="text-lead">
							No participants found matching your search.
						</P>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Thematic Groups View -->
			<div class="stack-xl">
				{#each thematicGroups as group, index (group.id)}
					{@const groupParticipants = getGroupParticipants(group.name)}
					<div class="surface-panel surface-padding stack-md">
						<!-- Group Header -->
						<div class="stack-sm">
							<div class="flex flex-wrap items-center gap-3">
								<Badge color="primary" class="text-sm font-semibold">Group {index + 1}</Badge>
								<Heading tag="h2" class="heading-section heading-md heading-color-light">
									{group.name}
								</Heading>
							</div>
							<P class="text-body max-w-4xl">
								{group.description}
							</P>
						</div>

						<!-- Guiding Questions -->
						<div class="stack-sm">
							<Heading tag="h3" class="heading-sub heading-sm heading-color-light">
								Guiding Questions
							</Heading>
							<Accordion class="guiding-questions">
								{#each group.guidingQuestions as question (question.category)}
									<AccordionItem>
										{#snippet header()}
											<span class="font-medium text-primary-700 dark:text-primary-300">{question.category}</span>
										{/snippet}
										<P class="text-body-sm">{question.question}</P>
									</AccordionItem>
								{/each}
							</Accordion>
						</div>

						<!-- Group Participants -->
						<div class="stack-sm">
							<Heading tag="h3" class="heading-sub heading-sm heading-color-light">
								Participants ({groupParticipants.length})
							</Heading>
							{#if groupParticipants.length > 0}
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{#each groupParticipants as participant (participant.name)}
										<Card class="card-surface surface-padding-sm">
											<div class="flex items-center gap-3">
												<!-- Participant Photo (smaller) -->
												<div class="relative w-12 h-12 shrink-0">
													{#if participant.photoUrl}
														<img
															src={participant.photoUrl}
															alt={participant.name}
															class="w-12 h-12 rounded-full object-cover border-2 border-primary-100 dark:border-primary-800"
															onerror={handleImageError}
														/>
														<div class="absolute inset-0 hidden items-center justify-center rounded-full border-2 border-primary-100 bg-gray-200 dark:border-primary-800 dark:bg-gray-700">
															<UserCircleSolid class="w-8 h-8 text-gray-400 dark:text-gray-500" />
														</div>
													{:else}
														<div class="flex h-full w-full items-center justify-center rounded-full border-2 border-primary-100 bg-gray-200 dark:border-primary-800 dark:bg-gray-700">
															<UserCircleSolid class="w-8 h-8 text-gray-400 dark:text-gray-500" />
														</div>
													{/if}
												</div>
												<!-- Participant Info -->
												<div class="min-w-0">
													<P class="font-semibold text-gray-900 dark:text-white truncate">
														{participant.name}
													</P>
													<P class="text-body-sm text-primary-600 dark:text-primary-400 truncate">
														{participant.affiliation}
													</P>
												</div>
											</div>
										</Card>
									{/each}
								</div>
							{:else}
								<P class="text-body-sm text-gray-500 dark:text-gray-400 italic">
									No participants assigned to this group yet.
								</P>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Interactive Map -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-0 left-0 opacity-50"></div>
	<div class="content-width-wide surface-panel surface-padding stack-md relative">
		<Heading tag="h2" class="heading-section heading-lg heading-color-light text-center">Global Distribution</Heading>
		<P class="text-lead text-center max-w-2xl mx-auto">
			Explore where our participants are based around the world.
		</P>
		<ParticipantsMap participants={displayedParticipants} />
	</div>
</section>

<style>
	:global(.guiding-questions) {
		--accordion-border-color: var(--color-gray-200);
	}

	:global(.dark .guiding-questions) {
		--accordion-border-color: var(--color-gray-700);
	}
</style>
