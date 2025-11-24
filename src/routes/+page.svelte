<script lang="ts">
	import { Button, Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';

	const seo = createSeoMeta({ path: '/' });
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
				'Moving beyond describing current conditions to actively charting future pathways and collaborative strategies for ethical, equitable development of DH and AI in African studies.'
		},
		{
			title: 'Structured Work Streams',
			description:
				'Three thematic workstreams focusing on methodological integration, equitable collaboration, and ethical implementation through facilitated discussions and collaborative exercises.'
		},
		{
			title: 'Position Paper',
			description:
				'Co-authored output outlining key findings and strategic recommendations to guide future research, policy, and funding, serving as a foundational reference for the field.'
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
		<p class="body-text text-lg lg:text-xl leading-relaxed sm:px-16 xl:px-48 drop-shadow-sm animate-fade-in animate-delay-200">
			This scoping workshop addresses the critical convergence of digital humanities and artificial intelligence within African studies. Through intensive exchange—prioritising discussion over presentations—participants will explore methodological integration, equitable collaboration and ethical frameworks in structured work streams.
		</p>
		<div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4 animate-slide-up animate-delay-300">
			<Button href={aboutHref} size="xl" color="primary" class="shadow-lg hover:shadow-primary">
				About
			</Button>
			<Button href={participantsHref} size="xl" outline color="secondary" class="backdrop-blur-sm">
				Participants
			</Button>
			<Button href={positionPaperHref} size="xl" outline color="secondary" class="backdrop-blur-sm">
				Position Paper
			</Button>
		</div>
	</div>
</section>

<!-- Key Information -->
<section class="bg-page py-12 relative overflow-hidden">
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
						<P class="body-text text-base sm:text-lg leading-relaxed">
							{#if highlight.href}
								<a
									href={highlight.href}
									target="_blank"
									rel="noopener noreferrer"
									class="hover:underline hover:text-primary-600 dark:hover:text-primary-400"
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
<section class="bg-page py-16 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-0 -right-20"></div>
	<div class="content-width-wide surface-panel surface-padding stack-xl relative">
		<div class="stack-md text-center animate-fade-in">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Purpose</Heading>
			<P class="body-text text-lg leading-relaxed max-w-4xl mx-auto">
				The convergence of digital humanities and AI is transforming knowledge production in African studies, offering unprecedented opportunities for innovative analysis and cross-cultural research. However, this transformative potential is intertwined with pressing challenges regarding equitable access, linguistic representation, and methodological approaches. Our goal is to convene experts to assess this emerging interdisciplinary field and develop strategic pathways for its future.
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
					<P class="body-text text-base sm:text-lg leading-relaxed">{goal.description}</P>
				</article>
			{/each}
		</div>

		<div class="stack-md">
			<Heading tag="h3" class="text-center heading-section heading-lg heading-color-light">Three Work Streams</Heading>
			<Timeline>
				{#each workStreams as stream}
					<TimelineItem title={`Work Stream ${stream.id}: ${stream.title}`} date="">
						<P class="body-text text-base leading-relaxed">
							{stream.description}
						</P>
					</TimelineItem>
				{/each}
			</Timeline>
		</div>
	</div>
</section>

<!-- Organizers Section -->
<section class="bg-page py-16">
	<div class="content-width-wide surface-panel surface-padding stack-lg">
		<div class="text-center stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Organizers</Heading>
		</div>

		<div class="grid grid-cols-1 gap-6 justify-items-center md:grid-cols-2">
			{#each organizers as organizer (organizer.name)}
				<Card class="card-surface surface-padding-sm w-full flex flex-col items-center text-center gap-4 md:h-full md:justify-between">
					{#if organizer.photoUrl}
						<img
							src={organizer.photoUrl}
							alt={organizer.name}
							class="w-28 h-28 rounded-full object-cover border-2 border-primary-100 dark:border-primary-700 shadow-md"
						/>
					{/if}
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-color-light text-xl">
							{organizer.name}
						</Heading>
						<P class="text-primary-600 dark:text-primary-400 font-semibold">
							{organizer.affiliation}
						</P>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="bg-page py-16">
	<div class="content-width-narrow surface-panel surface-padding text-center stack-sm">
		<P class="body-text-muted text-sm">
			This scoping workshop is made possible by the generous support of the
			<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline">Volkswagen Foundation</a>
		</P>
	</div>
</section>
