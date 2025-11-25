<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem, Hr } from 'flowbite-svelte';
	import { FileDocOutline, UsersGroupOutline, LightbulbOutline, BookOpenOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';

	const seo = createSeoMeta({
		path: '/position-paper',
		title: 'Position Paper',
		description:
			'The position paper synthesises workshop insights into a strategic roadmap for Digital Humanities and AI in African studies, foregrounding equitable collaboration, decolonial ethics, and actionable recommendations for stakeholders.',
		type: 'article'
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

<!-- Hero Section -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>
	<div class="content-width surface-panel surface-padding text-center stack-md relative">
		<div class="stack-sm">
			<Heading tag="h1" class="heading-display heading-xl text-gradient drop-shadow-md pb-2 tracking-tight">
				Position Paper
			</Heading>
			<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto">
				The main outcome of the “Charting New Territory” workshop will be a jointly authored position paper. Designed to serve as both a manifesto and a practical blueprint, this document will help define the emerging field at the intersection of digital humanities (DH), artificial intelligence (AI) and African Studies.
			</P>
			<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto">
				Moving beyond a summary of our discussions, this paper will translate our collective insights into a strategic roadmap. This will offer concrete guidance on how to advance research, funding and policy in an ethical and sustainable way.
			</P>
		</div>
	</div>
</section>

<!-- Core Objectives -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-secondary top-1/4 -right-20"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Core Objectives</Heading>
			<P class="text-lead">
				The paper will present a transformative vision, informed by decolonial thinking and African knowledge systems. It will identify key intersections between methodological innovation, equitable partnerships and culturally responsive ethics. Key components will include:
			</P>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full">
				<div class="flex flex-col items-start gap-4">
					<div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30">
						<LightbulbOutline size="xl" class="text-primary-600 dark:text-primary-400" />
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm">Methodological Pathways</Heading>
						<P class="text-body-sm">
							Prioritized strategies for integrating AI with African linguistic diversity and historical archives.
						</P>
					</div>
				</div>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full">
				<div class="flex flex-col items-start gap-4">
					<div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30">
						<UsersGroupOutline size="xl" class="text-primary-600 dark:text-primary-400" />
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm">Equitable Frameworks</Heading>
						<P class="text-body-sm">
							Defined mechanisms for North-South and South-South collaboration that ensure resource sharing and data sovereignty.
						</P>
					</div>
				</div>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow h-full">
				<div class="flex flex-col items-start gap-4">
					<div class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30">
						<BookOpenOutline size="xl" class="text-primary-600 dark:text-primary-400" />
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm">Ethical Principles</Heading>
						<P class="text-body-sm">
							A core set of guidelines addressing algorithmic bias, community consent, and digital preservation.
						</P>
					</div>
				</div>
			</Card>
		</div>
	</div>
</section>

<!-- Targeted Recommendations -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-20 -left-20"></div>
	<div class="content-width surface-panel surface-padding stack-lg relative">
		<div class="stack-md">
			<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">Targeted Recommendations</Heading>
			<P class="text-lead text-center max-w-3xl mx-auto">
				To ensure a lasting impact, the position paper will provide specific, actionable recommendations tailored to key stakeholders:
			</P>
		</div>

		<Timeline>
			<TimelineItem title="Research Funders" date="">
				<P class="text-body-lg">
					Proposals for sustainable funding models that support long-term maintenance and equitable collaboration.
				</P>
			</TimelineItem>

			<TimelineItem title="Academic Institutions" date="">
				<P class="text-body-lg">
					Strategies for decolonizing curricula and integrating ethical DH training.
				</P>
			</TimelineItem>

			<TimelineItem title="Technology Developers" date="">
				<P class="text-body-lg">
					Guidelines for designing tools that are linguistically inclusive and culturally responsive.
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
