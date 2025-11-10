<script lang="ts">
	import { Card, Heading, P, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { participants } from '$lib/data/participants';

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = 'none';
		const placeholder = img.nextElementSibling as HTMLElement;
		if (placeholder) {
			placeholder.style.display = 'flex';
		}
	}
</script>

<svelte:head>
	<title>Participants - DH & AI in African Studies</title>
	<meta name="description" content="Meet the international experts participating in the Digital Humanities and AI in African Studies workshop." />
</svelte:head>

<!-- Page Header -->
<section class="py-8 px-4 mx-auto max-w-7xl">
	<Heading tag="h1" class="mb-4 text-center">Participants</Heading>
	<P class="mb-8 text-lg text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
		Meet the international experts participating in this scoping workshop on Digital Humanities and AI in African Studies.
	</P>
</section>

<!-- Participants Grid -->
<section class="py-8 px-4 mx-auto max-w-7xl">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each participants as participant (participant.name)}
			<Card class="hover:shadow-xl transition-shadow flex flex-col p-6">
				<!-- Participant Photo -->
				<div class="flex justify-center mb-4">
					<div class="relative w-32 h-32">
						<img
							src={participant.photoUrl}
							alt={participant.name}
							class="w-32 h-32 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
							onerror={handleImageError}
						/>
						<!-- Placeholder for missing images -->
						<div class="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-primary-100 dark:border-primary-900 hidden items-center justify-center absolute top-0 left-0">
							<UserCircleSolid class="w-20 h-20 text-gray-400 dark:text-gray-500" />
						</div>
					</div>
				</div>

				<!-- Participant Name -->
				<Heading tag="h3" class="text-xl text-center mb-2">
					{participant.name}
				</Heading>

				<!-- Affiliation -->
				<P class="text-center text-primary-600 dark:text-primary-400 font-semibold mb-3">
					{participant.affiliation}
				</P>

				<!-- Role Badge -->
				<div class="flex justify-center mb-4">
					<Badge color="primary">{participant.role}</Badge>
				</div>

				<!-- Bio -->
				<P class="text-sm mb-4">
					{participant.bio}
				</P>

				<!-- Research Regions -->
				{#if participant.researchRegions.length > 0}
					<div class="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
						<P class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
							Research Regions:
						</P>
						<div class="flex flex-wrap gap-2">
							{#each participant.researchRegions.toSorted() as region (region)}
								<Badge color="secondary" class="text-xs">{region}</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</Card>
		{/each}
	</div>

	<!-- Empty State -->
	{#if participants.length === 0}
		<div class="text-center py-12">
			<P class="text-gray-500 dark:text-gray-400">
				Participant information will be added soon.
			</P>
		</div>
	{/if}
</section>
