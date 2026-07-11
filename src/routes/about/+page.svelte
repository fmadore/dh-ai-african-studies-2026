<script lang="ts">
	import { Heading, P, Card, Badge } from 'flowbite-svelte';
	import ParticipantAvatar from '$lib/components/ParticipantAvatar.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';
	import FundingNote from '$lib/components/FundingNote.svelte';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { participants } from '$lib/data/participants';
	import { resolveAssetPath, resolveAppPath } from '$lib/utils/paths';
	import { reveal } from '$lib/utils/reveal';

	function decorateWithPhotoUrl(participant: (typeof participants)[number]) {
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

	const seo = createSeoMeta({
		title: 'About the Workshop',
		description:
			'This scoping workshop convened international experts to map the intersection of digital humanities and AI within African studies, highlighting opportunities and challenges across equity, linguistics, and methodology.',
		path: '/about',
		keywords: [
			'Digital Humanities',
			'African Studies',
			'AI',
			'Workshop',
			'Scoping Workshop',
			'Position Paper',
			'Methodology',
			'Equity',
			'Linguistics',
			'Decolonization'
		]
	});

	const eventJsonLd = createWorkshopEventJsonLd({
		description: seo.description,
		url: seo.canonical
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<PageHero
	title="About the Workshop"
	lede="A scoping workshop held 18–20 February 2026 in Hanover, Germany, bringing together researchers from Africa, Europe, and beyond."
/>

<!-- Background -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width surface-panel surface-padding stack-md animate-section-reveal relative"
		use:reveal
	>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
			>Background</Heading
		>
		<P class="body-text">
			Digital humanities has a long—and often overlooked—history in African studies, from early
			databases such as the <a
				href="https://www.slavevoyages.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary"><em>Transatlantic Slave Trade Database</em></a
			>, to more recent projects like the
			<a
				href="https://open.bu.edu/handle/2144/1896"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary"><em>African Ajami Library</em></a
			>,
			<a
				href="https://openrestitution.africa/"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary"><em>Open Restitution Africa</em></a
			>, and
			<a
				href="https://archivi.ng/"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary"><em>Archivi.ng</em></a
			>. AI tools, particularly large language models, add new possibilities for textual analysis
			and cross-cultural research.
		</P>
		<P class="body-text">
			But implementation raises difficult questions. Decisions about what gets digitised, how it is
			catalogued and who controls access are not neutral; they often favour institutions that
			already have resources in place. Most AI systems still underperform on African languages. And
			the pace of adoption frequently outstrips attention to long-term preservation and local
			capacity.
		</P>
		<P class="body-text">
			Critics have described some digital initiatives as a form of "<a
				href="https://doi.org/10.1080/13696815.2018.1555749"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary">digital saviour complex</a
			>," where Northern-led projects reproduce colonial dynamics even while claiming to
			democratise access. This workshop took these critiques seriously.
		</P>
	</div>
</section>

<!-- Format -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow opacity-50"></div>
	<div
		class="content-width surface-panel surface-padding stack-md animate-section-reveal relative"
		use:reveal
	>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
			>Format</Heading
		>
		<P class="body-text">
			This was not a traditional conference. There were no paper presentations. Instead,
			participants worked intensively across three days in structured sessions designed to produce
			tangible outputs. Daily synthesis sessions connected insights across the three work streams,
			feeding directly into the <a
				href={resolveAppPath('/position-paper')}
				class="link-secondary">position paper</a
			>.
		</P>

		<WorkStreamCards />
	</div>
</section>

<!-- Key Outcome -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width surface-panel surface-padding stack-md animate-section-reveal relative"
		use:reveal
	>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
			>Key Outcome: The Position Paper</Heading
		>
		<P class="body-text">
			The primary goal of the workshop was to produce a jointly authored
			<a href={resolveAppPath('/position-paper')} class="link-secondary">position paper</a>.
		</P>
		<P class="body-text">
			Drawing on insights from the daily sessions, this document provides a strategic reference
			point for the field, offering actionable recommendations for research funders, academic
			institutions, technology developers, and policymakers.
		</P>
		<P class="body-text">
			By addressing sustainable funding models, ethical protocols, and decolonised curricula, it
			aims to support the consolidation of this emerging field and inform its future direction.
		</P>
	</div>
</section>

<!-- People -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow-bottom"></div>
	<div class="content-width surface-panel surface-padding stack-xl relative">
		<!-- Co-Organisers Section -->
		{#if coOrganizers.length > 0}
			<div class="stack-md animate-section-reveal" use:reveal>
				<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
					>Co-Organisers</Heading
				>
				<div class="stack-md stagger-children" use:reveal>
					{#each coOrganizers as organizer (organizer.name)}
						<div class="card-surface glow-border w-full">
							<div
								class="flex w-full flex-col items-center gap-4 p-6 md:flex-row md:items-start md:gap-8 md:p-8"
							>
								<!-- Photo -->
								<div class="shrink-0">
									<ParticipantAvatar src={organizer.photoUrl} alt={organizer.name} size="lg" />
								</div>

								<!-- Content -->
								<div class="stack-xs flex-1 text-center md:text-left">
									<Heading tag="h3" class="heading-sub heading-color-light heading-md">
										{#if organizer.website}
											<a
												href={organizer.website}
												target="_blank"
												rel="noopener noreferrer"
												class="link-secondary hover:underline"
											>
												{organizer.name}
											</a>
										{:else}
											{organizer.name}
										{/if}
									</Heading>
									<P class="body-text-muted font-medium">
										{organizer.affiliation}
									</P>
									{#if organizer.bio}
										<P class="body-text mt-2">
											{organizer.bio}
										</P>
									{/if}

									{#if organizer.researchRegions.length > 0}
										<div class="pt-3">
											<P class="text-caption mb-2 font-medium">Research Regions</P>
											<div class="flex flex-wrap justify-center gap-2 md:justify-start">
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
			<div class="stack-md animate-section-reveal" use:reveal>
				<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
					>Student Assistants</Heading
				>
				<div
					class="stagger-children mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
					use:reveal
				>
					{#each studentAssistants as assistant (assistant.name)}
						<Card class="card-surface surface-padding-sm glow-border h-full">
							<div class="stack-xs flex flex-col items-center text-center">
								<!-- Photo -->
								<ParticipantAvatar src={assistant.photoUrl} alt={assistant.name} size="md" />

								<!-- Name -->
								<Heading tag="h3" class="heading-sub heading-color-light heading-sm">
									{assistant.name}
								</Heading>

								<!-- Affiliation -->
								<P class="text-body-sm body-text-muted font-medium">
									{assistant.affiliation}
								</P>

								<!-- Bio -->
								{#if assistant.bio}
									<P class="text-body-sm">
										{assistant.bio}
									</P>
								{/if}

								<!-- Research Regions -->
								{#if assistant.researchRegions.length > 0}
									<div class="w-full pt-2">
										<P class="text-caption mb-2 text-center font-medium">Research Regions</P>
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
	</div>
</section>

<!-- Funding -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div
		class="content-width surface-panel surface-padding stack-sm animate-section-reveal relative"
		use:reveal
	>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
			>Funding</Heading
		>
		<P class="body-text">
			<FundingNote />
		</P>
	</div>
</section>
