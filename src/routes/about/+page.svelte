<script lang="ts">
	import { Heading, P, Card, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { participants } from '$lib/data/participants';

	const coOrganizers = participants.filter((p) => p.role === 'Co-organizer');
	const studentAssistants = participants.filter((p) => p.role === 'Student assistant');

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = 'none';
		const placeholder = img.nextElementSibling as HTMLElement;
		if (placeholder) {
			placeholder.style.display = 'flex';
		}
	}

	const seo = createSeoMeta({
		title: 'About the Workshop',
		description:
			'This scoping workshop convenes international experts to map the intersection of digital humanities and AI within African studies, highlighting opportunities and challenges across equity, linguistics, and methodology.',
		path: '/about'
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

<section class="bg-page py-12 px-4">
	<div class="surface-panel surface-padding space-y-10 content-width">
		<Heading tag="h1" class="text-center heading-display heading-xl heading-color-light">About the Workshop</Heading>
		
		<div class="space-y-6 text-left">
			<P class="text-lg text-gray-700 dark:text-gray-300">
				This scoping workshop addresses the critical convergence of digital humanities (DH) and artificial intelligence (AI) within African studies. While this intersection offers transformative potential, it also poses pressing challenges in terms of equity, linguistic diversity and methodology.
			</P>
			<P class="text-lg text-gray-700 dark:text-gray-300">
				This three-day working meeting will provide a dedicated space for international experts from Africa, Europe, and other regions to assess the current state of the field and collaboratively shape its future.
			</P>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow border border-primary-100 dark:border-primary-900">
				<Heading tag="h3" class="mb-3 heading-sub">Objectives</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 [&>li::marker]:text-primary-500">
					<li>Assess the current state of DH/AI in African studies</li>
					<li>Explore methodological integration</li>
					<li>Foster equitable collaboration</li>
					<li>Develop ethical frameworks</li>
				</ul>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow border border-secondary-100 dark:border-secondary-900">
				<Heading tag="h3" class="mb-3 heading-sub">Expected Outcomes</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 [&>li::marker]:text-secondary-500">
					<li>Co-authored position paper</li>
					<li>Strategic recommendations</li>
					<li>Research network formation</li>
					<li>Future collaboration pathways</li>
				</ul>
			</Card>
		</div>

		<!-- Co-Organizers Section -->
		{#if coOrganizers.length > 0}
			<div class="space-y-6">
				<Heading tag="h2" class="heading-section heading-lg heading-color-light">Co-Organizers</Heading>
				<div class="space-y-6">
					{#each coOrganizers as organizer (organizer.name)}
						<div class="card-surface w-full transition-shadow hover:shadow-2xl">
							<div class="flex flex-col md:flex-row w-full items-center md:items-start gap-6 md:gap-10 p-6 md:p-10">
								<!-- Photo -->
								<div class="w-32 h-32 md:w-40 md:h-40 shrink-0">
									<div class="relative w-full h-full">
										<img
											src={organizer.photoUrl}
											alt={organizer.name}
											class="w-full h-full rounded-full object-cover border-4 border-primary-100 dark:border-primary-700 shadow-md"
											onerror={handleImageError}
										/>
										<!-- Placeholder for missing images -->
										<div class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-primary-100 dark:border-primary-700 hidden items-center justify-center absolute top-0 left-0">
											<UserCircleSolid class="w-16 h-16 md:w-20 md:h-20 text-gray-400 dark:text-gray-500" />
										</div>
									</div>
								</div>

								<!-- Content -->
								<div class="flex-1 text-center md:text-left space-y-3 md:space-y-4">
									<Heading tag="h3" class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
										{organizer.name}
									</Heading>
									<P class="text-primary-600 dark:text-primary-300 font-semibold">
										{organizer.affiliation}
									</P>
									{#if organizer.bio}
										<P class="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
											{organizer.bio}
										</P>
									{/if}

									{#if organizer.researchRegions.length > 0}
										<div class="pt-2">
											<P class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
												Research Regions
											</P>
											<div class="flex flex-wrap justify-center md:justify-start gap-2">
												{#each organizer.researchRegions.toSorted() as region (region)}
													<Badge color="secondary" class="text-xs">{region}</Badge>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Student Assistants Section -->
		{#if studentAssistants.length > 0}
			<div class="space-y-6">
				<Heading tag="h2" class="heading-section heading-lg heading-color-light">Student Assistants</Heading>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each studentAssistants as assistant (assistant.name)}
						<Card class="card-surface surface-padding-sm transition-shadow flex flex-col hover:shadow-xl h-full">
							<!-- Photo -->
							<div class="flex justify-center mb-4">
								<div class="relative w-24 h-24">
									<img
										src={assistant.photoUrl}
										alt={assistant.name}
										class="w-24 h-24 rounded-full object-cover border-4 border-secondary-100 dark:border-secondary-900"
										onerror={handleImageError}
									/>
									<!-- Placeholder for missing images -->
									<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-secondary-100 dark:border-secondary-900 hidden items-center justify-center absolute top-0 left-0">
										<UserCircleSolid class="w-16 h-16 text-gray-400 dark:text-gray-500" />
									</div>
								</div>
							</div>

							<!-- Name -->
							<Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
								{assistant.name}
							</Heading>

							<!-- Affiliation -->
							<P class="text-center text-secondary-600 dark:text-secondary-400 text-sm font-semibold">
								{assistant.affiliation}
							</P>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		<div class="space-y-3">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Funding</Heading>
			<P class="text-gray-700 dark:text-gray-300">
				This scoping workshop is made possible by the generous support of the <strong class="text-primary-700 dark:text-primary-400">Volkswagen Foundation</strong>.
			</P>
		</div>
	</div>
</section>
