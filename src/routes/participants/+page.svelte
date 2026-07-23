<script lang="ts">
	import { Heading, P, Badge } from 'flowbite-svelte';
	import { UsersGroupSolid, UsersGroupOutline } from 'flowbite-svelte-icons';
	import { SvelteSet } from 'svelte/reactivity';
	import ParticipantAvatar from '$lib/components/ParticipantAvatar.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { participants } from '$lib/data/participants';
	import { thematicGroups } from '$lib/data/thematic-groups';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import ParticipantsMap from '$lib/components/ParticipantsMap.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import UrlTabs from '$lib/components/UrlTabs.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';

	let searchQuery = $state('');

	/** Bios longer than this get clamped with a "Read more" toggle */
	const BIO_CLAMP_THRESHOLD = 260;
	let expandedBios = new SvelteSet<string>();

	function toggleBio(name: string) {
		if (expandedBios.has(name)) {
			expandedBios.delete(name);
		} else {
			expandedBios.add(name);
		}
	}

	// Define tabs for URL-synced navigation
	const viewTabs = [
		{ id: 'all', label: 'All Participants', icon: UsersGroupOutline },
		{ id: 'groups', label: 'By Thematic Group', icon: UsersGroupSolid }
	];

	const baseParticipants = participants.filter(
		(participant) => participant.role !== 'Student assistant'
	);
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

	let displayedParticipants = $derived(
		baseParticipants
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
			}))
	);

	// The world map always shows everyone — it lives outside the search context
	const mapParticipants = baseParticipants.map((participant) => ({
		...participant,
		photoUrl: resolveAssetPath(participant.photoUrl)
	}));

	const seo = createSeoMeta({
		title: 'Participants',
		description:
			'Meet the international experts who shaped the Digital Humanities and AI in African Studies scoping workshop.',
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

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<PageHero
	title="Participants"
	lede="Meet the {totalParticipants} international experts from {totalCountries} countries who took part in this scoping workshop on Digital Humanities and AI in African Studies."
/>

<!-- Tabs Section -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide relative">
		<UrlTabs tabs={viewTabs} paramName="view" defaultTab="all" tabStyle="underline" class="mb-xl">
			{#snippet children(activeTab)}
				{#if activeTab === 'all'}
					<!-- All Participants View -->
					<div class="surface-panel surface-padding stack-lg relative">
						<h2 class="sr-only">All participants</h2>
						<div class="mb-lg mx-auto w-full max-w-md">
							<SearchFilter
								bind:value={searchQuery}
								placeholder="Search by name, affiliation, or region..."
							/>
						</div>

						{#if displayedParticipants.length > 0}
							<div class="gap-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
								{#each displayedParticipants as participant (participant.name)}
									<div class="card-surface surface-padding-sm glow-border h-full">
										<div class="stack-xs flex flex-col items-center text-center">
											<!-- Participant Photo -->
											<ParticipantAvatar
												src={participant.photoUrl}
												alt={participant.name}
												size="md"
											/>

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
											<P class="text-body-sm body-text-muted font-medium">
												{participant.affiliation}
											</P>

											<!-- Country Badge -->
											<Badge color="secondary">{participant.country}</Badge>

											<!-- Bio (clamped, with expand toggle for long bios) -->
											{#if participant.bio}
												{@const isLong = participant.bio.length > BIO_CLAMP_THRESHOLD}
												{@const isExpanded = expandedBios.has(participant.name)}
												<P
													id="bio-{participant.name}"
													class="text-body-sm {isLong && !isExpanded ? 'line-clamp-4' : ''}"
												>
													{participant.bio}
												</P>
												{#if isLong}
													<button
														type="button"
														class="bio-toggle"
														aria-expanded={isExpanded}
														aria-controls="bio-{participant.name}"
														onclick={() => toggleBio(participant.name)}
													>
														{isExpanded ? 'Show less' : 'Read more'}
													</button>
												{/if}
											{/if}
										</div>

										<!-- Research Regions -->
										{#if participant.researchRegions.length > 0}
											<div
												class="stack-xs mt-auto border-t border-gray-200 pt-4 dark:border-gray-700/50"
											>
												<P class="text-caption text-center font-medium tracking-wider uppercase">
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
							<div class="py-lg text-center">
								<P class="text-lead">No participants found matching your search.</P>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'groups'}
					<!-- Thematic Groups View -->
					<div class="stack-xl">
						{#each thematicGroups as group, index (group.id)}
							{@const groupParticipants = getGroupParticipants(group.name)}
							<div class="surface-panel surface-padding stack-md">
								<!-- Group Header -->
								<div class="stack-sm">
									<div class="gap-sm flex flex-wrap items-center">
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
									<div class="gap-md grid sm:grid-cols-3">
										{#each group.guidingQuestions as question (question.category)}
											<div class="card-surface surface-padding-sm stack-xs">
												<p
													class="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wider uppercase"
												>
													{question.category}
												</p>
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
										<div
											class="gap-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
										>
											{#each groupParticipants as participant (participant.name)}
												<div class="card-surface surface-padding-sm glow-border">
													<div class="gap-sm flex items-center">
														<!-- Participant Photo (smaller) -->
														<div class="shrink-0">
															<ParticipantAvatar
																src={participant.photoUrl}
																alt={participant.name}
																size="sm"
															/>
														</div>
														<!-- Participant Info -->
														<div class="min-w-0">
															<P class="heading-color-light truncate font-semibold">
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
															<P class="text-body-sm body-text-muted truncate">
																{participant.affiliation}
															</P>
														</div>
													</div>
												</div>
											{/each}
										</div>
									{:else}
										<P class="text-body-sm body-text-muted italic">
											No participants were assigned to this group.
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
	<div class="content-width-wide surface-panel surface-padding stack-md relative">
		<Heading
			tag="h2"
			class="heading-section heading-lg heading-color-light accent-underline text-center"
			>Global Distribution</Heading
		>
		<P class="text-lead mx-auto max-w-2xl text-center">
			Explore where our participants are based around the world.
		</P>
		<ParticipantsMap participants={mapParticipants} />
	</div>
</section>

<style>
	.bio-toggle {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--transition-micro);
	}

	.bio-toggle:hover {
		color: var(--text-link-hover);
	}
</style>
