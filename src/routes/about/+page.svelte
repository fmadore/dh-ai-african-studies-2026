<script lang="ts">
	import { Heading, P, Card, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';
	import { resolveAssetPath } from '$lib/utils/paths';

	function decorateWithPhotoUrl(participant: typeof participants[number]) {
		return {
			...participant,
			photoUrl: resolveAssetPath(participant.photoUrl)
		};
	}

	const coOrganizers = participants
		.filter((participant) => participant.role === 'Co-organizer')
		.map(decorateWithPhotoUrl);
	const studentAssistants = participants
		.filter((participant) => participant.role === 'Student assistant')
		.map(decorateWithPhotoUrl);

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

<section class="bg-page py-16 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>

	<div class="content-width surface-panel surface-padding stack-xl relative">
		<Heading tag="h1" class="text-center heading-display heading-xl text-gradient tracking-tight drop-shadow-md pb-2">About the Workshop</Heading>
		
		<div class="stack-md text-left">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">The Convergence of Technology and Epistemology</Heading>
			<P class="body-text text-lg leading-relaxed">
				The intersection of Digital Humanities (DH) and Artificial Intelligence (AI) is rapidly transforming knowledge production within African Studies. This technological shift offers unprecedented opportunities for innovative analysis, dynamic visualization, and the democratization of diverse narratives. However, this potential is inextricably linked to pressing challenges regarding equitable access, the representation of African languages, and the ethics of digital sovereignty.
			</P>
			<P class="body-text text-lg leading-relaxed">
				"Charting New Territory" is a dedicated scoping workshop designed to navigate this evolving terrain. We are convening international experts to move beyond describing current conditions and instead actively chart future pathways for the ethical, equitable development of DH and AI in African contexts.
			</P>
		</div>

		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Beyond the Hype: Addressing Structural Inequalities</Heading>
			<P class="body-text leading-relaxed">
				While Large Language Models (LLMs) and digitization efforts hold immense promise, their implementation often outpaces the necessary ethical frameworks. Digitization is inherently political; decisions about what is archived, how it is cataloged, and who controls access often reinforce existing global hierarchies.
			</P>
			<P class="body-text leading-relaxed">
				This workshop addresses the urgent need to prevent the exclusion of African voices and the reproduction of colonial biases in algorithmic systems. We recognize that Northern institutions often control the digital infrastructure and historical materials of the Global South. As such, our focus is on countering "techno-solutionism" by balancing computational innovation with critical humanistic inquiry and robust preservation protocols for born-digital records.
			</P>
		</div>

		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Format: A Working Meeting</Heading>
			<P class="body-text leading-relaxed">
				Unlike a traditional academic conference, this event prioritizes discussion over presentation. It is designed as a high-intensity scoping workshop employing an "assessment-to-action" methodology.
			</P>
			<P class="body-text leading-relaxed">
				Over the course of three days, participants will engage in facilitated discussions, collaborative exercises, and structured deliberation across three core work streams:
			</P>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
				{#each workStreams as stream (stream.id)}
					<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow border border-primary-100 dark:border-primary-900 h-full">
						<Heading tag="h3" class="mb-3 heading-sub text-lg">{stream.title}</Heading>
						<P class="body-text text-sm leading-relaxed">
							{stream.description}
						</P>
					</Card>
				{/each}
			</div>
		</div>

		<div class="stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Key Outcome: The Position Paper</Heading>
			<P class="body-text leading-relaxed">
				The primary goal of this workshop is to produce a co-authored Position Paper.
			</P>
			<P class="body-text leading-relaxed">
				Synthesizing the insights from our daily sessions, this document will serve as a foundational blueprint for the field. It will provide actionable recommendations for research funders, academic institutions, technology developers, and policymakers.
			</P>
			<P class="body-text leading-relaxed">
				By defining sustainable funding models, ethical protocols, and decolonized curricula, we aim to consolidate this emerging field and guide the next decade of DH and AI research in African Studies.
			</P>
		</div>

		<!-- Co-Organizers Section -->
		{#if coOrganizers.length > 0}
			<div class="stack-md">
				<Heading tag="h2" class="heading-section heading-lg heading-color-light">Co-Organizers</Heading>
				<div class="stack-md">
					{#each coOrganizers as organizer (organizer.name)}
						<div class="card-surface w-full transition-shadow hover:shadow-2xl">
							<div class="flex flex-col md:flex-row w-full items-center md:items-start gap-6 md:gap-10 p-6 md:p-10">
								<!-- Photo -->
								<div class="w-32 h-32 md:w-40 md:h-40 shrink-0">
									<div class="relative w-full h-full">
										{#if organizer.photoUrl}
											<img
												src={organizer.photoUrl}
												alt={organizer.name}
												class="w-full h-full rounded-full object-cover border-2 border-primary-100 dark:border-primary-700 shadow-md"
												onerror={handleImageError}
											/>
											<!-- Placeholder for missing images -->
											<div class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-primary-100 dark:border-primary-700 hidden items-center justify-center absolute top-0 left-0 shadow-md">
												<UserCircleSolid class="w-16 h-16 md:w-20 md:h-20 text-gray-400 dark:text-gray-500" />
											</div>
										{:else}
											<!-- Placeholder for organizers without photo -->
											<div class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-primary-100 dark:border-primary-700 flex items-center justify-center shadow-md">
												<UserCircleSolid class="w-16 h-16 md:w-20 md:h-20 text-gray-400 dark:text-gray-500" />
											</div>
										{/if}
									</div>
								</div>

								<!-- Content -->
								<div class="flex-1 text-center md:text-left stack-sm">
									<Heading tag="h3" class="heading-sub heading-color-light text-2xl md:text-3xl">
										{organizer.name}
									</Heading>
									<P class="text-primary-600 dark:text-primary-300 font-semibold">
										{organizer.affiliation}
									</P>
									{#if organizer.bio}
										<P class="body-text text-base md:text-lg leading-relaxed">
											{organizer.bio}
										</P>
									{/if}

									{#if organizer.researchRegions.length > 0}
										<div class="pt-2">
											<P class="body-text-muted text-sm font-semibold mb-2">
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
			<div class="stack-md">
				<Heading tag="h2" class="heading-section heading-lg heading-color-light">Student Assistants</Heading>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each studentAssistants as assistant (assistant.name)}
						<Card class="card-surface surface-padding-sm transition-shadow flex flex-col hover:shadow-xl h-full">
							<div class="flex flex-col items-center text-center stack-sm">
								<!-- Photo -->
								<div class="relative w-24 h-24">
									{#if assistant.photoUrl}
										<img
											src={assistant.photoUrl}
											alt={assistant.name}
											class="w-24 h-24 rounded-full object-cover border-2 border-secondary-100 dark:border-secondary-900 shadow-md"
											onerror={handleImageError}
										/>
										<!-- Placeholder for missing images -->
										<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-100 dark:border-secondary-900 hidden items-center justify-center absolute top-0 left-0 shadow-md">
											<UserCircleSolid class="w-16 h-16 text-gray-400 dark:text-gray-500" />
										</div>
									{:else}
										<!-- Placeholder for assistants without photo -->
										<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-100 dark:border-secondary-900 flex items-center justify-center shadow-md">
											<UserCircleSolid class="w-16 h-16 text-gray-400 dark:text-gray-500" />
										</div>
									{/if}
								</div>

								<!-- Name -->
								<Heading tag="h3" class="heading-sub heading-color-light text-lg">
									{assistant.name}
								</Heading>

								<!-- Affiliation -->
								<P class="text-secondary-600 dark:text-secondary-400 text-sm font-semibold">
									{assistant.affiliation}
								</P>

								<!-- Bio -->
								{#if assistant.bio}
									<P class="body-text text-sm leading-relaxed">
										{assistant.bio}
									</P>
								{/if}

								<!-- Research Regions -->
								{#if assistant.researchRegions.length > 0}
									<div class="pt-2 w-full">
										<P class="body-text-muted text-xs font-semibold mb-2 text-center">
											Research Regions
										</P>
										<div class="flex flex-wrap justify-center gap-2">
											{#each assistant.researchRegions.toSorted() as region (region)}
												<Badge color="secondary" class="text-xs">{region}</Badge>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		<div class="stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Funding</Heading>
			<P class="body-text">
				This scoping workshop is made possible by the generous support of the <a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="font-bold text-primary-700 dark:text-primary-400 hover:underline">Volkswagen Foundation</a>.
			</P>
		</div>
	</div>
</section>
