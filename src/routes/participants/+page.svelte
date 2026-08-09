<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { UsersGroupSolid, UsersGroupOutline, SearchOutline } from 'flowbite-svelte-icons';
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
	let directoryEl: HTMLElement | undefined = $state();

	/** Which cards have their bio and regions revealed. The whole card is the
	 *  trigger — a resting card carries only what you scan by. */
	let expanded = new SvelteSet<string>();

	function toggleCard(name: string) {
		if (expanded.has(name)) expanded.delete(name);
		else expanded.add(name);
	}

	/** Keep ARIA ID references valid even when a name contains spaces or accents. */
	function participantDetailId(name: string) {
		const slug = name
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		return `participant-detail-${slug}`;
	}

	const viewTabs = [
		{ id: 'all', label: 'All Participants', icon: UsersGroupOutline },
		{ id: 'groups', label: 'By Thematic Group', icon: UsersGroupSolid }
	];

	const baseParticipants = participants.filter(
		(participant) => participant.role !== 'Student assistant'
	);
	const totalParticipants = baseParticipants.length;
	const totalCountries = new Set(baseParticipants.map((participant) => participant.country)).size;

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

	/** A pin click filters the directory below rather than only opening a popup. */
	function filterByLocation(affiliation: string) {
		searchQuery = affiliation;
		directoryEl?.scrollIntoView({ block: 'start' });
	}

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
	eyebrow="Who was there"
	title="Participants"
	lede="The {totalParticipants} researchers from {totalCountries} countries who took part in this scoping workshop."
	size="compact"
/>

<!-- The map first: it is the most compelling artefact on the page, and it used
     to sit below roughly ten screens of cards. -->
<section class="participants-map band-bleed" aria-label="Global distribution of participants">
	<ParticipantsMap participants={mapParticipants} onselectlocation={filterByLocation} />
	<p class="participants-map__hint text-caption padding-inline-section content-width-wide">
		Select a pin to filter the directory below by institution.
	</p>
</section>

<section class="band-tight padding-inline-section" bind:this={directoryEl}>
	<div class="content-width-wide">
		<UrlTabs
			tabs={viewTabs}
			paramName="view"
			defaultTab="all"
			tabStyle="underline"
			activeClass="text-primary-700 border-primary-700 dark:text-primary-300 dark:border-primary-300"
			class="mb-xl"
		>
			{#snippet children(activeTab)}
				{#if activeTab === 'all'}
					<h2 class="sr-only">All participants</h2>

					<div class="directory-toolbar">
						<SearchFilter
							bind:value={searchQuery}
							label="Search participants"
							placeholder="Search by name, affiliation, or region..."
						/>
						<div class="directory-status">
							<p class="text-body-sm">
								<span class="text-accent font-bold">{displayedParticipants.length}</span>
								of {totalParticipants} participants
							</p>
							{#if searchQuery}
								<button
									type="button"
									class="directory-clear tap-target"
									onclick={() => (searchQuery = '')}
								>
									Clear search
								</button>
							{/if}
						</div>
					</div>

					{#if displayedParticipants.length > 0}
						<ul class="participant-grid">
							{#each displayedParticipants as participant (participant.name)}
								{@const isOpen = expanded.has(participant.name)}
								{@const hasDetail =
									Boolean(participant.bio) || participant.researchRegions.length > 0}
								{@const detailId = participantDetailId(participant.name)}
								<li class="card-surface participant-card" class:is-open={isOpen}>
									{#if hasDetail}
										<button
											type="button"
											class="participant-card__trigger"
											aria-expanded={isOpen}
											aria-controls={detailId}
											onclick={() => toggleCard(participant.name)}
										>
											<ParticipantAvatar
												src={participant.photoUrl}
												alt={participant.name}
												size="sm"
											/>
											<span class="participant-card__identity">
												<span class="participant-card__name">{participant.name}</span>
												<span class="text-body-sm body-text-muted">{participant.affiliation}</span>
												<span class="text-caption">{participant.country}</span>
											</span>
											<svg class="participant-card__chevron" viewBox="0 0 10 6" aria-hidden="true">
												<path
													d="M1 1l4 4 4-4"
													fill="none"
													stroke="currentColor"
													stroke-width="1.5"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
										</button>
									{:else}
										<div class="participant-card__trigger participant-card__trigger--static">
											<ParticipantAvatar
												src={participant.photoUrl}
												alt={participant.name}
												size="sm"
											/>
											<span class="participant-card__identity">
												<span class="participant-card__name">{participant.name}</span>
												<span class="text-body-sm body-text-muted">{participant.affiliation}</span>
												<span class="text-caption">{participant.country}</span>
											</span>
										</div>
									{/if}

									{#if hasDetail}
										<div class="participant-card__detail" id={detailId} hidden={!isOpen}>
											{#if participant.bio}
												<p class="prose-serif-sm">{participant.bio}</p>
											{/if}
											{#if participant.researchRegions.length > 0}
												<p class="text-caption">
													{participant.researchRegions.toSorted().join(' · ')}
												</p>
											{/if}
											{#if participant.website}
												<a
													href={participant.website}
													target="_blank"
													rel="noopener noreferrer"
													class="link-secondary text-body-sm">Personal website</a
												>
											{/if}
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<div class="empty-state">
							<div class="empty-state__icon">
								<SearchOutline class="size-icon-md" />
							</div>
							<h3 class="body-text-strong text-lg font-medium">No participants found</h3>
							<p class="body-text-muted mx-auto max-w-xs text-sm">
								Try a different name, institution or region.
							</p>
							<Button color="primary" outline size="sm" onclick={() => (searchQuery = '')}>
								Clear search
							</Button>
						</div>
					{/if}
				{:else if activeTab === 'groups'}
					<!-- Flattened: the guiding questions are a definition list on the
					     panel, and the participant chips lost their cards. Panel →
					     card → card was three nested surfaces deep. -->
					<div class="stack-2xl">
						{#each thematicGroups as group, index (group.id)}
							{@const groupParticipants = getGroupParticipants(group.name)}
							<section class="thematic-group">
								<div class="section-head">
									<p class="section-head__eyebrow">Group {index + 1}</p>
									<h2 class="heading-section heading-md">{group.name}</h2>
								</div>
								<p class="prose-serif">{group.description}</p>

								<dl class="guiding-questions">
									{#each group.guidingQuestions as question (question.category)}
										<div>
											<dt class="text-label text-accent">{question.category}</dt>
											<dd class="text-body-sm">{question.question}</dd>
										</div>
									{/each}
								</dl>

								<h3 class="text-label thematic-group__people-heading">
									Participants ({groupParticipants.length})
								</h3>
								{#if groupParticipants.length > 0}
									<ul class="group-people">
										{#each groupParticipants as participant (participant.name)}
											<li class="group-person">
												<ParticipantAvatar
													src={participant.photoUrl}
													alt={participant.name}
													size="sm"
												/>
												<span class="min-w-0">
													<span class="participant-card__name block truncate">
														{#if participant.website}
															<a
																href={participant.website}
																target="_blank"
																rel="noopener noreferrer"
																class="link-secondary">{participant.name}</a
															>
														{:else}
															{participant.name}
														{/if}
													</span>
													<span class="text-body-sm body-text-muted block truncate"
														>{participant.affiliation}</span
													>
												</span>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="text-body-sm body-text-muted italic">
										No participants were assigned to this group.
									</p>
								{/if}
							</section>
						{/each}
					</div>
				{/if}
			{/snippet}
		</UrlTabs>
	</div>
</section>

<style>
	.participants-map {
		border-block: 1px solid var(--border-subtle);
		background-color: var(--bg-sunken);
	}

	.participants-map__hint {
		padding-block: var(--space-xs);
		max-width: none;
	}

	.directory-toolbar {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-bottom: var(--space-md);
		margin-bottom: var(--space-lg);
		border-bottom: 1px solid var(--border-subtle);
	}

	@media (min-width: 640px) {
		.directory-toolbar {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.directory-status {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.directory-clear {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.directory-clear:hover {
		color: var(--text-link-hover);
	}

	.participant-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
		gap: var(--space-md);
		list-style: none;
		margin: 0;
		padding: 0;
		align-items: start;
	}

	.participant-card {
		overflow: hidden;
	}

	.participant-card.is-open {
		border-color: var(--border-accent);
	}

	.participant-card__trigger {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm);
		background: transparent;
		border: none;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.participant-card__trigger--static {
		cursor: default;
	}

	.participant-card__identity {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.participant-card__name {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-base);
		line-height: var(--leading-snug);
		color: var(--text-primary);
	}

	.participant-card__chevron {
		width: 0.75rem;
		height: 0.45rem;
		flex-shrink: 0;
		color: var(--text-subtle);
		transition: transform var(--transition-micro);
	}

	.is-open .participant-card__chevron {
		transform: rotate(180deg);
	}

	.participant-card__detail {
		display: grid;
		gap: var(--space-xs);
		padding: 0 var(--space-sm) var(--space-sm);
		border-top: 1px solid var(--border-subtle);
		padding-top: var(--space-sm);
	}

	/* ---------- Thematic groups ----------
	 * The rhythm is a grid gap rather than per-child margin utilities, so it
	 * cannot quietly collapse if one of those classes stops resolving. */
	.thematic-group {
		display: grid;
		gap: var(--space-lg);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--border-subtle);
	}

	.thematic-group__people-heading {
		margin-top: var(--space-sm);
		margin-bottom: calc(var(--space-lg) * -1 + var(--space-2xs));
	}

	.guiding-questions {
		display: grid;
		gap: var(--space-md);
		margin: 0;
	}

	@media (min-width: 640px) {
		.guiding-questions {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.guiding-questions dd {
		margin: var(--space-3xs) 0 0;
	}

	.group-people {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
		gap: var(--space-sm) var(--space-md);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.group-person {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}
</style>
