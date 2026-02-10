<script lang="ts">
	import { Heading, P, Badge } from 'flowbite-svelte';
	import { UsersGroupSolid, UsersGroupOutline } from 'flowbite-svelte-icons';
	import ParticipantAvatar from '$lib/components/ParticipantAvatar.svelte';
	import { participants } from '$lib/data/participants';
	import { thematicGroups } from '$lib/data/thematic-groups';
	import { createSeoMeta, createEventJsonLd, createWebPageJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import ParticipantsMap from '$lib/components/ParticipantsMap.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import UrlTabs from '$lib/components/UrlTabs.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';

	let searchQuery = $state('');

	// Define tabs for URL-synced navigation
	const viewTabs = [
		{ id: 'all', label: 'All Participants', icon: UsersGroupOutline },
		{ id: 'groups', label: 'By Thematic Group', icon: UsersGroupSolid }
	];

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

	const seo = createSeoMeta({
		title: 'Participants',
		description:
			'Meet the international experts shaping the Digital Humanities and AI in African Studies scoping workshop.',
		path: '/participants',
		keywords: [
			'Workshop Participants',
			'African Studies Scholars',
			'Digital Humanities Researchers',
			'AI Experts',
			'International Experts',
			'Africa',
			'Academic Conference'
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
		url: seo.canonical,
	});
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html `<script type="application/ld+json">${serializeJsonLd(eventJsonLd)}</script>`}
	{@html `<script type="application/ld+json">${serializeJsonLd(webPageJsonLd)}</script>`}
</svelte:head>

<!-- Page Header -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading tag="h1" class="heading-display heading-xl text-gradient-teal drop-shadow-md pb-2 tracking-tight animate-hero-title">Participants</Heading>
		<P class="text-lead mx-auto max-w-3xl animate-hero-subtitle">
			Meet the {totalParticipants} international experts from {totalCountries} countries participating in this scoping workshop on Digital Humanities and AI in African Studies.
		</P>
	</div>
</section>

<!-- Tabs Section -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide relative">
		<UrlTabs tabs={viewTabs} paramName="view" defaultTab="all" tabStyle="underline" class="mb-xl">
			{#snippet children(activeTab)}
				{#if activeTab === 'all'}
					<!-- All Participants View -->
					<div class="surface-panel surface-padding stack-lg relative">
						<div class="w-full max-w-md mx-auto mb-lg">
							<SearchFilter bind:value={searchQuery} placeholder="Search by name, affiliation, or region..." />
						</div>

						{#if displayedParticipants.length > 0}
							<div class="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
								{#each displayedParticipants as participant (participant.name)}
									<div class="card-surface surface-padding-sm h-full glow-border">
										<div class="flex flex-col items-center text-center stack-xs">
											<!-- Participant Photo -->
											<ParticipantAvatar src={participant.photoUrl} alt={participant.name} size="md" />

											<!-- Participant Name -->
											<Heading tag="h3" class="heading-sub heading-color-light heading-sm">
												{#if participant.website}
													<a
														href={participant.website}
														target="_blank"
														rel="noopener noreferrer"
														class="link-secondary hover:underline"
													>
														{participant.name}
													</a>
												{:else}
													{participant.name}
												{/if}
											</Heading>

											<!-- Affiliation -->
											<P class="text-body-sm font-medium text-gray-600 dark:text-gray-400">
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
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-lg">
								<P class="text-lead">
									No participants found matching your search.
								</P>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'groups'}
					<!-- Thematic Groups View -->
					<div class="stack-xl">
						{#each thematicGroups as group, index (group.id)}
							{@const groupParticipants = getGroupParticipants(group.name)}
							<div class="surface-panel surface-padding stack-md ">
								<!-- Group Header -->
								<div class="stack-sm">
									<div class="flex flex-wrap items-center gap-sm">
										<Badge color="primary" class="text-sm font-semibold">Group {index + 1}</Badge>
										<Heading tag="h2" class="heading-section heading-md heading-color-light">
											{group.name}
										</Heading>
									</div>
									<P class="body-text max-w-4xl">
										{group.description}
									</P>
								</div>

								<!-- Guiding Questions -->
								<div class="stack-sm">
									<Heading tag="h3" class="heading-sub heading-sm heading-color-light">
										Guiding Questions
									</Heading>
									<div class="grid gap-md sm:grid-cols-3">
										{#each group.guidingQuestions as question (question.category)}
											<div class="card-surface surface-padding-sm stack-xs">
												<p class="font-medium text-primary-600 dark:text-primary-400 text-sm uppercase tracking-wider">{question.category}</p>
												<P class="text-body-sm">{question.question}</P>
											</div>
										{/each}
									</div>
								</div>

								<!-- Group Participants -->
								<div class="stack-sm">
									<Heading tag="h3" class="heading-sub heading-sm heading-color-light">
										Participants ({groupParticipants.length})
									</Heading>
									{#if groupParticipants.length > 0}
										<div class="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
											{#each groupParticipants as participant (participant.name)}
												<div class="card-surface surface-padding-sm glow-border">
													<div class="flex items-center gap-sm">
														<!-- Participant Photo (smaller) -->
														<div class="shrink-0">
															<ParticipantAvatar src={participant.photoUrl} alt={participant.name} size="sm" />
														</div>
														<!-- Participant Info -->
														<div class="min-w-0">
															<P class="font-semibold heading-color-light truncate">
																{#if participant.website}
																	<a
																		href={participant.website}
																		target="_blank"
																		rel="noopener noreferrer"
																		class="link-secondary hover:underline"
																	>
																		{participant.name}
																	</a>
																{:else}
																	{participant.name}
																{/if}
															</P>
															<P class="text-body-sm text-gray-600 dark:text-gray-400 truncate">
																{participant.affiliation}
															</P>
														</div>
													</div>
												</div>
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
			{/snippet}
		</UrlTabs>
	</div>
</section>

<!-- Interactive Map -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="bg-radial-glow-bottom"></div>
	<div class="content-width-wide surface-panel surface-padding stack-md relative ">
		<Heading tag="h2" class="heading-section heading-lg heading-color-light text-center accent-underline">Global Distribution</Heading>
		<P class="text-lead text-center max-w-2xl mx-auto">
			Explore where our participants are based around the world.
		</P>
		<ParticipantsMap participants={displayedParticipants} />
	</div>
</section>

