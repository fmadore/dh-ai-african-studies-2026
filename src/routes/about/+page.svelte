<script lang="ts">
	import { Heading, P, Card, Badge } from 'flowbite-svelte';
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { participants } from '$lib/data/participants';
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

<section class="bg-page py-16">
	<div class="content-width surface-panel surface-padding stack-xl">
		<Heading tag="h1" class="text-center heading-display heading-xl heading-color-light">About the Workshop</Heading>
		
		<div class="stack-md text-left">
			<P class="body-text text-lg leading-relaxed">
				The convergence of digital humanities (DH) and artificial intelligence (AI) is transforming knowledge production in African studies, offering unprecedented opportunities for innovative analysis, dynamic visualisation, and cross-cultural research. This technological shift holds immense promise for reimagining cultural heritage, democratising access to diverse narratives, and amplifying marginalised voices.
			</P>
			<P class="body-text text-lg leading-relaxed">
				However, this transformative potential is intertwined with pressing challenges regarding equitable access, linguistic representation of African languages, and methodological approaches. To navigate this rapidly evolving terrain and proactively shape the future of the field, a dedicated and focused scoping effort is now essential.
			</P>
			<P class="body-text text-lg leading-relaxed">
				The urgency stems not only from rapid advances in AI, but also from the need to prevent the exclusion of African voices, that would perpetuate existing biases. By convening experts from Africa, Europe and beyond in the fields of metadata, AI, linguistics, literature, history, and digital ethics, the workshop will foster North-South and South-South dialogues at the intersection of African epistemologies and digital methodologies.
			</P>
		</div>

		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Context</Heading>
			
			<div class="stack-sm">
				<Heading tag="h3" class="heading-sub">Evolution of Digital Humanities</Heading>
				<P class="body-text leading-relaxed">
					DH has evolved tremendously from the punch cards of the 1930s to today's AI-driven approaches, expanding the academic toolkit and improving accessibility alongside traditional methods. The pandemic accelerated this digital shift, while advances in Large Language Models (LLMs) mark a significant leap forward. Although current LLMs under-represent African languages, their contextual capabilities have considerable potential. Refining these models to better reflect Africa's linguistic diversity could transform African studies research.
				</P>
			</div>

			<div class="stack-sm">
				<Heading tag="h3" class="heading-sub">Challenges and Inequalities</Heading>
				<P class="body-text leading-relaxed">
					Implementing AI in African contexts requires balancing computational approaches with interpretive practices amidst infrastructural inequalities. Many African institutions face limited resources, unstable funding and inadequate technical infrastructure. Digitisation is inherently political—decisions about what to digitise, how to catalogue and who controls access reflect and reinforce existing hierarchies. Northern institutions often control historical materials from the Global South and implement digital solutions with little regard for local contexts.
				</P>
				<P class="body-text leading-relaxed">
					A major obstacle to inclusivity is the dominance of Anglophone paradigms. African languages, French, Portuguese and Arabic remain underrepresented in digital scholarly spaces, as most tools are optimised for English-language materials. This technological hegemony reinforces Western epistemological frameworks and limits opportunities for truly global dialogue and innovation.
				</P>
			</div>

			<div class="stack-sm">
				<Heading tag="h3" class="heading-sub">Progress and Innovation</Heading>
				<P class="body-text leading-relaxed">
					Despite these challenges, DH in African studies has transformed the way African histories, cultures and knowledge systems are documented and analysed. Contemporary projects now foreground African experiences and challenge dominant epistemological frameworks. Diverse approaches have emerged—from spatial analyses of historical landscapes and computational literary studies to multilingual ontological frameworks, digital documentation of material culture and community-driven archives that emphasise collaborative knowledge production.
				</P>
				<P class="body-text leading-relaxed">
					South African universities have been at the forefront of reshaping digital archival practices, integrating local languages and cultural perspectives while addressing issues of representation, access and epistemic justice. Innovative African-based initiatives such as the <em>African Ajami Library</em> and <em>Open Restitution Africa</em> demonstrate the dynamism of the field, supported by growing institutional infrastructures such as the Centre for Digital Humanities at the University of Lagos and the Network for DH in Africa.
				</P>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow border border-primary-100 dark:border-primary-900">
				<Heading tag="h3" class="mb-3 heading-sub">Workshop Goals</Heading>
				<ul class="body-text list-disc list-inside stack-sm [&>li::marker]:text-primary-500">
					<li>Assess the current state of DH/AI in African studies</li>
					<li>Chart future pathways for ethical development</li>
					<li>Create actionable frameworks for next decade</li>
					<li>Consolidate this emerging interdisciplinary field</li>
				</ul>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow border border-secondary-100 dark:border-secondary-900">
				<Heading tag="h3" class="mb-3 heading-sub">Workshop Approach</Heading>
				<ul class="body-text list-disc list-inside stack-sm [&>li::marker]:text-secondary-500">
					<li>Assessment-to-action methodology</li>
					<li>Facilitated discussions over presentations</li>
					<li>Daily synthesis sessions across streams</li>
					<li>Collaborative exercises and structured deliberation</li>
				</ul>
			</Card>
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
												class="w-full h-full rounded-full object-cover border-4 border-primary-100 dark:border-primary-700 shadow-md"
												onerror={handleImageError}
											/>
											<!-- Placeholder for missing images -->
											<div class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-primary-100 dark:border-primary-700 hidden items-center justify-center absolute top-0 left-0">
												<UserCircleSolid class="w-16 h-16 md:w-20 md:h-20 text-gray-400 dark:text-gray-500" />
											</div>
										{:else}
											<!-- Placeholder for organizers without photo -->
											<div class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-primary-100 dark:border-primary-700 flex items-center justify-center shadow-md">
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
											class="w-24 h-24 rounded-full object-cover border-4 border-secondary-100 dark:border-secondary-900"
											onerror={handleImageError}
										/>
										<!-- Placeholder for missing images -->
										<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-secondary-100 dark:border-secondary-900 hidden items-center justify-center absolute top-0 left-0">
											<UserCircleSolid class="w-16 h-16 text-gray-400 dark:text-gray-500" />
										</div>
									{:else}
										<!-- Placeholder for assistants without photo -->
										<div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-secondary-100 dark:border-secondary-900 flex items-center justify-center">
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
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Outcomes</Heading>
			<P class="body-text leading-relaxed">
				The workshop will advance the field by identifying ways to consolidate this emerging research area, highlighting intersections between technological innovation and humanistic inquiry, and developing strategic recommendations for science policy and funding actors. This structured, collaborative environment aims to produce a position paper that will serve as a foundational reference for the development of DH and AI in African studies.
			</P>
		</div>

		<div class="stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Funding</Heading>
			<P class="body-text">
				This scoping workshop is made possible by the generous support of the <strong class="text-primary-700 dark:text-primary-400">Volkswagen Foundation</strong>.
			</P>
		</div>
	</div>
</section>
