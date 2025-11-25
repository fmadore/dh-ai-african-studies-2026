<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/SecondaryButton.svelte';

	const seo = createSeoMeta({ path: '/' });
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
	const aboutHref = resolveAppPath('/about');
	const participantsHref = resolveAppPath('/participants');
	const positionPaperHref = resolveAppPath('/position-paper');

	const organizers = participants
		.filter((p) => p.role === 'Co-organizer')
		.map((p) => ({
			...p,
			photoUrl: resolveAssetPath(p.photoUrl)
		}));

	const keyHighlights = [
		{
			title: 'Date',
			description: workshopInfo.dates.full,
			icon: CalendarMonthOutline
		},
		{
			title: 'Location',
			description: workshopInfo.location.full,
			icon: MapPinAltOutline,
			href: workshopInfo.location.url
		}
	];

	const workshopGoals = [
		{
			title: 'Assessment to Action',
			description:
				'We prioritize production over presentation. Participants will move from assessing current barriers—infrastructure, language, and bias—to co-designing actionable strategies that ensure African epistemologies remain at the center of technological advancement.'
		},
		{
			title: 'Structured Work Streams',
			description:
				'Through facilitated dialogue rather than traditional panels, three integrated work streams will tackle critical intersections: Methodological Integration, Equitable North-South/South-South Collaboration, and Ethical Frameworks.'
		},
		{
			title: 'Position Paper',
			description:
				"The workshop will culminate in a co-authored strategic roadmap. This document will define the field's direction, offering concrete recommendations to guide future research, funding policies, and institutional decision-making."
		}
	];

	const cardAnimationDelays = ['animate-delay-100', 'animate-delay-200', 'animate-delay-300'];
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
<section class="relative overflow-hidden gradient-hero">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 gradient-overlay"></div>
	<div class="decorative-blob decorative-blob-primary top-0 left-1/4"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-0 right-1/4"></div>
	
	<div class="relative content-width-wide container-responsive py-16 text-center stack-lg">
		<div class="stack-sm animate-fade-in">
			<h1 class="heading-display heading-xl text-gradient tracking-tight drop-shadow-md pb-2">
				Charting New Territory
			</h1>
			<p class="heading-sub drop-shadow-sm opacity-90 max-w-2xl mx-auto">
				Digital Humanities and AI in African Studies
			</p>
			<p class="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-2">
				A Scoping Workshop
			</p>
		</div>
		<p class="text-lead sm:px-16 xl:px-48 drop-shadow-sm animate-fade-in animate-delay-200">
			A working meeting to shape the future of African Studies at the intersection of Digital Humanities and AI. Prioritizing collaborative dialogue over presentations, we convene to co-design the methodological, equitable, and ethical frameworks for this emerging field.
		</p>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center animate-slide-up animate-delay-300">
			<PrimaryButton href={aboutHref} size="xl">
				About
			</PrimaryButton>
			<SecondaryButton href={participantsHref} size="xl">
				Participants
			</SecondaryButton>
			<SecondaryButton href={positionPaperHref} size="xl">
				Position Paper
			</SecondaryButton>
		</div>
	</div>
</section>

<!-- Key Information -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-secondary top-1/2 -left-20 transform -translate-y-1/2"></div>
	<div class="content-width-wide surface-panel surface-padding relative">
		<div class="auto-grid auto-grid-sm">
			{#each keyHighlights as highlight, index (highlight.title)}
				{@const Icon = highlight.icon}
				<article
					class={[
						'highlight-card card-surface surface-padding-sm animate-scale-in',
						cardAnimationDelays[index] ?? 'animate-delay-100'
					]}
				>
					<div class="highlight-card__icon" aria-hidden="true">
						<Icon size="lg" aria-hidden="true" />
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm">{highlight.title}</Heading>
						<P class="text-body-lg">
							{#if highlight.href}
								<a
									href={highlight.href}
									target="_blank"
									rel="noopener noreferrer"
									class="underline decoration-primary-300 dark:decoration-primary-600 underline-offset-2 hover:decoration-primary-500 dark:hover:decoration-primary-400 transition-colors"
								>
									{highlight.description}
								</a>
							{:else}
								{highlight.description}
							{/if}
						</P>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- Conference Themes -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-0 -right-20"></div>
	<div class="content-width-wide surface-panel surface-padding stack-xl relative">
		<div class="stack-md text-center animate-fade-in">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Purpose</Heading>
			<P class="text-lead max-w-4xl mx-auto">
				The convergence of digital humanities (DH) and artificial intelligence (AI) offers transformative potential for African studies but risks perpetuating existing inequities in access and representation. This workshop convenes international experts to navigate this terrain, moving beyond observation to design strategic pathways for the field’s ethical and sustainable future.
			</P>
		</div>
		
		<div class="auto-grid auto-grid-lg">
			{#each workshopGoals as goal, index (goal.title)}
				<article
					class={[
						'theme-card card-surface surface-padding-sm animate-slide-up',
						cardAnimationDelays[index] ?? 'animate-delay-100'
					]}
				>
					<Heading tag="h3" class="heading-sub heading-sm">{goal.title}</Heading>
					<P class="body-text">{goal.description}</P>
				</article>
			{/each}
		</div>

		<div class="stack-md">
			<Heading tag="h2" class="text-center heading-sub heading-lg heading-color-light">Three Work Streams</Heading>
			<Timeline>
				{#each workStreams as stream}
					<TimelineItem title={`Work Stream ${stream.id}: ${stream.title}`} date="">
						<P class="body-text">
							{stream.description}
						</P>
					</TimelineItem>
				{/each}
			</Timeline>
		</div>
	</div>
</section>

<!-- Organizers Section -->
<section class="bg-page py-16 px-4">
	<div class="content-width-wide surface-panel surface-padding stack-lg">
		<div class="text-center stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Organizers</Heading>
		</div>

		<div class="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 max-w-3xl mx-auto">
			{#each organizers as organizer (organizer.name)}
				<Card class="card-surface surface-padding-sm w-full flex flex-col items-center text-center gap-4">
					{#if organizer.photoUrl}
						<img
							src={organizer.photoUrl}
							alt={organizer.name}
							class="w-28 h-28 rounded-full object-cover border-2 border-primary-100 dark:border-primary-700 shadow-md"
						/>
					{/if}
					<div class="stack-xs">
						<Heading tag="h3" class="heading-sub heading-color-light text-xl">
							{organizer.name}
						</Heading>
						<P class="text-body-sm text-primary-600 dark:text-primary-400 font-medium">
							{organizer.affiliation}
						</P>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="bg-page py-12 px-4">
	<div class="content-width-narrow surface-panel surface-padding-sm text-center">
		<P class="body-text-muted text-sm">
			This scoping workshop is made possible by the generous support of the
			<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline">Volkswagen Foundation</a>
		</P>
	</div>
</section>
