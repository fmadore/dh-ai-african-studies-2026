<script lang="ts">
	import { Card, Heading, P, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { participants } from '$lib/data/participants';
	import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import ParticipantsMap from '$lib/components/ParticipantsMap.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';

	let searchQuery = $state('');

	const baseParticipants = participants.filter((participant) => participant.role !== 'Student assistant');
	const totalParticipants = baseParticipants.length;
	const totalCountries = new Set(baseParticipants.map((participant) => participant.country)).size;

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

		<div class="mt-6 w-full max-w-md mx-auto">
			<SearchFilter bind:value={searchQuery} placeholder="Search by name, affiliation, or region..." />
		</div>
	</div>
</section>

<!-- Participants Grid -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="decorative-blob decorative-blob-secondary top-0 right-0 opacity-50"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
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
