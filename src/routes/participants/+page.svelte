<script lang="ts">
	import { Card, Heading, P, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { participants } from '$lib/data/participants';
	import { createSeoMeta } from '$lib/utils/seo';
	import ParticipantsMap from '$lib/components/ParticipantsMap.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';

	const displayedParticipants = participants
		.filter((participant) => participant.role !== 'Student assistant')
		.map((participant) => ({
			...participant,
			photoUrl: resolveAssetPath(participant.photoUrl)
		}));

	const uniqueCountries = new Set(displayedParticipants.map((participant) => participant.country)).size;

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
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes, index (attributes.name ?? attributes.property ?? `meta-${index}`)}
		<meta {...attributes} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
</svelte:head>

<!-- Page Header -->
<section class="bg-page py-16 px-4">
	<div class="content-width surface-panel surface-padding text-center stack-sm">
		<Heading tag="h1" class="heading-display heading-xl heading-color-light">Participants</Heading>
		<P class="body-text text-lg mx-auto max-w-3xl">
			Meet the {displayedParticipants.length} international experts from {uniqueCountries} countries participating in this scoping workshop on Digital Humanities and AI in African Studies.
		</P>
	</div>
</section>

<!-- Participants Grid -->
<section class="bg-page py-16 px-4">
	<div class="content-width-wide surface-panel surface-padding stack-lg">
		{#if displayedParticipants.length > 0}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each displayedParticipants as participant (participant.name)}
					<Card class="card-surface surface-padding-sm transition-shadow flex flex-col hover:shadow-xl h-full">
						<div class="flex flex-col items-center text-center stack-sm">
							<!-- Participant Photo -->
							<div class="flex justify-center">
								<div class="relative w-32 h-32">
									{#if participant.photoUrl}
										<img
											src={participant.photoUrl}
											alt={participant.name}
											class="w-32 h-32 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
											onerror={handleImageError}
										/>
										<!-- Placeholder for missing images -->
										<div class="absolute inset-0 hidden items-center justify-center rounded-full border-4 border-primary-100 bg-gray-200 dark:border-primary-900 dark:bg-gray-700">
											<UserCircleSolid class="w-20 h-20 text-gray-400 dark:text-gray-500" />
										</div>
									{:else}
										<!-- Placeholder for participants without photo -->
										<div class="flex h-full w-full items-center justify-center rounded-full border-4 border-primary-100 bg-gray-200 dark:border-primary-900 dark:bg-gray-700">
											<UserCircleSolid class="w-20 h-20 text-gray-400 dark:text-gray-500" />
										</div>
									{/if}
								</div>
							</div>

							<!-- Participant Name -->
							<Heading tag="h3" class="heading-sub heading-color-light text-xl">
								{participant.name}
							</Heading>

							<!-- Affiliation -->
							<P class="body-text-strong text-center text-primary-600 dark:text-primary-400">
								{participant.affiliation}
							</P>

							<!-- Country Badge -->
							<div class="flex justify-center">
								<Badge color="secondary">{participant.country}</Badge>
							</div>

							<!-- Bio -->
							<P class="body-text text-sm leading-relaxed">
								{participant.bio}
							</P>
						</div>

						<!-- Research Regions -->
						{#if participant.researchRegions.length > 0}
							<div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 stack-sm">
								<P class="body-text-muted text-xs font-semibold uppercase tracking-wide">
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
				<P class="body-text-muted">
					Participant information will be added soon.
				</P>
			</div>
		{/if}
	</div>
</section>

<!-- Interactive Map -->
<section class="bg-page py-16 px-4">
	<div class="content-width-wide surface-panel surface-padding stack-md">
		<Heading tag="h2" class="heading-section heading-lg heading-color-light text-center">Global Distribution</Heading>
		<P class="body-text text-center">
			Explore where our participants are based around the world.
		</P>
		<ParticipantsMap participants={displayedParticipants} />
	</div>
</section>
