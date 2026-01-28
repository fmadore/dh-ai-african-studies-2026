<script lang="ts">
	import {
		Card,
		Heading,
		P,
		Timeline,
		TimelineItem,
	} from "flowbite-svelte";
	import {
		FileDocOutline,
		UsersGroupOutline,
		LightbulbOutline,
		BookOpenOutline,
	} from "flowbite-svelte-icons";
	import {
		createSeoMeta,
		createEventJsonLd,
		serializeJsonLd,
	} from "$lib/utils/seo";
	import { workshopInfo } from "$lib/data/workshop-info";
	import { reveal } from "$lib/utils/reveal";

	const seo = createSeoMeta({
		path: "/position-paper",
		title: "Position Paper",
		description:
			"The position paper synthesises workshop insights into a strategic roadmap for Digital Humanities and AI in African studies, foregrounding equitable collaboration, decolonial ethics, and actionable recommendations for stakeholders.",
		type: "article",
	});

	const eventJsonLd = createEventJsonLd({
		name: "Charting New Territory: Digital Humanities and AI in African Studies",
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
		url: seo.canonical,
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

<!-- Hero Section -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div
		class="content-width surface-panel surface-padding text-center stack-md relative"
	>
		<div class="stack-sm">
			<Heading
				tag="h1"
				class="heading-display heading-xl text-gradient-teal drop-shadow-md pb-2 tracking-tight animate-hero-title"
			>
				Position Paper
			</Heading>
			<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto animate-hero-subtitle">
				The main outcome of the "Charting New Territory" workshop will
				be a jointly authored position paper. Designed to serve as both
				a manifesto and a practical blueprint, this document will help
				define the emerging field at the intersection of digital
				humanities (DH), artificial intelligence (AI) and African
				Studies.
			</P>
			<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto animate-hero-subtitle" style="animation-delay: 200ms;">
				Moving beyond a summary of our discussions, this paper will
				translate our collective insights into a strategic roadmap. This
				will offer concrete guidance on how to advance research, funding
				and policy in an ethical and sustainable way.
			</P>
		</div>
	</div>
</section>

<!-- Core Objectives -->
<section
	class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal"
		use:reveal
	>
		<div class="stack-md">
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Core Objectives</Heading
			>
			<P class="text-lead mt-4">
				The paper will present a transformative vision, informed by
				decolonial thinking and African knowledge systems. It will
				identify key intersections between methodological innovation,
				equitable partnerships and culturally responsive ethics. Key
				components will include:
			</P>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children" use:reveal>
			<Card
				class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full glow-border"
			>
				<div class="flex flex-col items-start gap-4">
					<div
						class="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/30 glow-teal"
					>
						<LightbulbOutline
							size="xl"
							class="text-secondary-600 dark:text-secondary-400"
						/>
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm"
							>Methodological Pathways</Heading
						>
						<P class="text-body-sm">
							Prioritized strategies for integrating AI with
							African linguistic diversity and historical
							archives.
						</P>
					</div>
				</div>
			</Card>

			<Card
				class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full glow-border"
			>
				<div class="flex flex-col items-start gap-4">
					<div
						class="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/30 glow-teal"
					>
						<UsersGroupOutline
							size="xl"
							class="text-secondary-600 dark:text-secondary-400"
						/>
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm"
							>Equitable Frameworks</Heading
						>
						<P class="text-body-sm">
							Defined mechanisms for North-South and South-South
							collaboration that ensure resource sharing and data
							sovereignty.
						</P>
					</div>
				</div>
			</Card>

			<Card
				class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full glow-border"
			>
				<div class="flex flex-col items-start gap-4">
					<div
						class="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/30 glow-teal"
					>
						<BookOpenOutline
							size="xl"
							class="text-secondary-600 dark:text-secondary-400"
						/>
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm"
							>Ethical Principles</Heading
						>
						<P class="text-body-sm">
							A core set of guidelines addressing algorithmic
							bias, community consent, and digital preservation.
						</P>
					</div>
				</div>
			</Card>
		</div>
	</div>
</section>

<!-- Targeted Recommendations -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-radial-glow-bottom"></div>
	<div class="content-width surface-panel surface-padding stack-lg relative animate-section-reveal" use:reveal>
		<div class="stack-md">
			<Heading
				tag="h2"
				class="text-center heading-section heading-lg heading-color-light accent-underline"
				>Targeted Recommendations</Heading
			>
			<P class="text-lead text-center max-w-3xl mx-auto mt-4">
				To ensure a lasting impact, the position paper will provide
				specific, actionable recommendations tailored to key
				stakeholders:
			</P>
		</div>

		<Timeline>
			<TimelineItem title="Research Funders" date="">
				<P class="text-body-lg">
					Proposals for sustainable funding models that support
					long-term maintenance and equitable collaboration.
				</P>
			</TimelineItem>

			<TimelineItem title="Academic Institutions" date="">
				<P class="text-body-lg">
					Strategies for decolonizing curricula and integrating
					ethical DH training.
				</P>
			</TimelineItem>

			<TimelineItem title="Technology Developers" date="">
				<P class="text-body-lg">
					Guidelines for designing tools that are linguistically
					inclusive and culturally responsive.
				</P>
			</TimelineItem>

			<TimelineItem title="Policymakers" date="">
				<P class="text-body-lg">
					Frameworks for data governance and digital sovereignty.
				</P>
			</TimelineItem>
		</Timeline>
	</div>
</section>

<!-- Publication -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width surface-panel surface-padding stack-lg relative animate-section-reveal" use:reveal>
		<div class="stack-md text-center">
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Publication</Heading
			>
			<P class="text-lead max-w-3xl mx-auto mt-4">
				The position paper will be published in open access in the <a
					href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary">ZMO Programmatic Texts</a
				>.
			</P>
		</div>

		<Card class="card-surface surface-padding-sm mx-auto! max-w-3xl! glow-border">
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-center gap-3">
					<FileDocOutline
						size="xl"
						class="text-secondary-600 dark:text-secondary-400"
					/>
					<Heading tag="h3" class="heading-sub heading-md"
						>About the Series</Heading
					>
				</div>
				<P class="text-body-lg text-center">
					The series <strong>ZMO Programmatic Texts</strong> publish wider
					conceptual articles engaging with the interdisciplinary and inter-regional
					research conducted at ZMO. The series provide a platform for
					authors to present and discuss innovative contributions to current
					theoretical and comparative debates, in relation to ZMO's programmatic
					research agenda.
				</P>
			</div>
		</Card>
	</div>
</section>
