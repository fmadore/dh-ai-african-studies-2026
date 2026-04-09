<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline } from 'flowbite-svelte-icons';
	import {
		createSeoMeta,
		createEventJsonLd,
		createWebPageJsonLd,
		jsonLdScript
	} from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';
	import { reveal } from '$lib/utils/reveal';
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
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
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
			title: 'From Assessment to Action',
			description:
				'We prioritise production over presentation. Each day, participants progress from mapping current barriers to co-designing actionable strategies, ensuring that African epistemologies remain at the centre of this process. Daily synthesis sessions connect insights across groups.'
		},
		{
			title: 'Structured Work Streams',
			description:
				'Three integrated work streams will tackle critical intersections through facilitated dialogue rather than traditional panels: Methodological Integration, Equitable North–South/South–South Collaboration and Ethical Frameworks.'
		},
		{
			title: 'Position Paper',
			description:
				'The workshop will culminate in the creation of a co-authored strategic roadmap. This document will outline the future direction of the field, providing practical recommendations to inform future research, funding policies and institutional decision-making.'
		}
	];
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html jsonLdScript(eventJsonLd)}
	{@html jsonLdScript(webPageJsonLd)}
</svelte:head>

<!-- Hero Section - Future Forward -->
<section class="gradient-hero-future relative flex min-h-[85vh] items-center overflow-hidden">
	<!-- Grid mesh background -->
	<div class="bg-grid-mesh"></div>

	<!-- Radial glow effects -->
	<div class="bg-radial-glow animate-pulse-glow"></div>
	<div class="bg-radial-glow-bottom"></div>

	<!-- Decorative elements -->
	<div
		class="decorative-circle animate-float top-20 -left-32 h-64 w-64 opacity-50"
		aria-hidden="true"
	></div>
	<div
		class="decorative-circle animate-float-delayed -right-24 bottom-32 h-48 w-48 opacity-40"
		aria-hidden="true"
	></div>
	<div class="decorative-line top-1/3 left-0 w-96 opacity-60" aria-hidden="true"></div>
	<div class="decorative-line right-0 bottom-1/4 w-64 opacity-40" aria-hidden="true"></div>

	<div class="content-width-wide relative py-16 md:py-24">
		<!-- Asymmetric layout container -->
		<div class="grid items-center gap-8 lg:grid-cols-12">
			<!-- Main content - takes more space on left -->
			<div class="stack-lg lg:col-span-8 xl:col-span-7">
				<div class="stack-md">
					<h1
						class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
					>
						Charting New Territory
					</h1>
					<p class="heading-sub animate-hero-subtitle max-w-2xl opacity-90 drop-shadow-sm">
						Digital Humanities and AI in African Studies
					</p>
					<p
						class="text-accent animate-hero-subtitle text-sm font-bold tracking-widest uppercase"
						style="animation-delay: 200ms;"
					>
						A Scoping Workshop
					</p>
				</div>

				<p
					class="text-lead animate-hero-subtitle max-w-2xl drop-shadow-sm"
					style="animation-delay: 180ms;"
				>
					A working meeting bringing together researchers from Africa, Europe, and beyond. Through
					facilitated discussions and structured deliberation—prioritising collaboration over
					presentations—participants will move from assessing current practices to developing
					actionable strategies. The outcome: a co-authored position paper guiding the ethical
					integration of digital humanities and AI in African studies.
				</p>

				<div class="flex flex-col gap-4 sm:flex-row">
					<div class="animate-hero-cta">
						<PrimaryButton href={aboutHref} size="xl">About</PrimaryButton>
					</div>
					<div class="animate-hero-cta-2">
						<SecondaryButton href={participantsHref} size="xl">Participants</SecondaryButton>
					</div>
					<div class="animate-hero-cta-3">
						<SecondaryButton href={positionPaperHref} size="xl">Position Paper</SecondaryButton>
					</div>
				</div>
			</div>

			<!-- Decorative accent panel on right (visible on lg+) -->
			<div class="relative hidden lg:col-span-4 lg:block xl:col-span-5">
				<div
					class="from-secondary-100/40 to-primary-100/20 dark:from-secondary-900/30 dark:to-primary-900/20 glow-teal absolute inset-0 rotate-3 transform rounded-3xl bg-linear-to-br"
					aria-hidden="true"
				></div>
				<div
					class="from-secondary-50/60 dark:from-secondary-950/40 absolute inset-4 -rotate-1 transform rounded-2xl bg-linear-to-tr to-white/80 dark:to-gray-900/60"
					aria-hidden="true"
				></div>
			</div>
		</div>
	</div>
</section>

<!-- Key Information -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-50"></div>

	<div
		class="content-width-wide surface-panel surface-padding animate-section-reveal stagger-children relative"
		use:reveal
	>
		<div class="auto-grid auto-grid-sm">
			{#each keyHighlights as highlight (highlight.title)}
				{@const Icon = highlight.icon}
				<article class="highlight-card card-surface surface-padding-sm glow-border">
					<div class="highlight-card__icon glow-teal" aria-hidden="true">
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
									class="link-secondary"
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
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow opacity-50"></div>

	<div class="content-width-wide surface-panel surface-padding stack-xl relative">
		<div class="stack-md animate-section-reveal text-center" use:reveal>
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Workshop Purpose</Heading
			>
			<P class="text-lead mx-auto max-w-4xl">
				Although digital humanities and AI offer transformative potential for African studies, rapid
				adoption has outpaced critical reflection. Most AI tools remain optimised for Western
				languages, digitisation decisions often reinforce who controls historical materials, and
				African institutions frequently lack the infrastructure to participate on equal terms. This
				workshop brings together international experts to move beyond describing these challenges
				and develop concrete strategies that keep African perspectives at the forefront.
			</P>
		</div>

		<!-- Asymmetric card grid with varied sizing -->
		<div
			class="animate-section-reveal stagger-children grid gap-4 md:grid-cols-2 lg:grid-cols-3"
			use:reveal
		>
			{#each workshopGoals as goal, index (goal.title)}
				<article
					class="theme-card card-surface surface-padding-sm glow-border {index === 0
						? 'md:col-span-2 lg:col-span-1'
						: ''}"
				>
					<Heading tag="h3" class="heading-sub heading-sm">{goal.title}</Heading>
					<P class="body-text">{goal.description}</P>
				</article>
			{/each}
		</div>

		<!-- Work Streams with decorative connector -->
		<div class="stack-md animate-section-reveal" use:reveal>
			<div class="relative">
				<Heading
					tag="h2"
					class="heading-sub heading-lg heading-color-light accent-underline text-center"
					>Three Work Streams</Heading
				>
				<!-- Decorative line below heading -->
				<div
					class="from-secondary-400 absolute top-full left-1/2 hidden h-8 w-px -translate-x-1/2 transform bg-linear-to-b to-transparent md:block"
					aria-hidden="true"
				></div>
			</div>

			<div class="mt-6">
				<Timeline>
					{#each workStreams as stream (stream.id)}
						<TimelineItem title={`Work Stream ${stream.id}: ${stream.title}`} date="">
							<P class="body-text">
								{stream.description}
							</P>
						</TimelineItem>
					{/each}
				</Timeline>
			</div>
		</div>
	</div>
</section>

<!-- Organisers Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>

	<div
		class="content-width-wide surface-panel surface-padding stack-lg animate-section-reveal relative"
		use:reveal
	>
		<div class="stack-sm text-center">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Workshop Organisers</Heading
			>
		</div>

		<div
			class="stagger-children mx-auto grid max-w-3xl grid-cols-1 justify-items-center gap-4 sm:grid-cols-2"
			use:reveal
		>
			{#each organizers as organizer (organizer.name)}
				<Card
					class="card-surface surface-padding-sm glow-border flex w-full flex-col items-center gap-4 text-center"
				>
					{#if organizer.photoUrl}
						<div class="relative">
							<img
								src={organizer.photoUrl}
								alt={organizer.name}
								class="border-secondary-200 dark:border-secondary-700 h-28 w-28 rounded-full border-2 object-cover shadow-md"
							/>
							<!-- Subtle glow ring behind photo -->
							<div
								class="glow-teal absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100"
								aria-hidden="true"
							></div>
						</div>
					{/if}
					<div class="stack-xs">
						<Heading tag="h3" class="heading-sub heading-color-light text-xl">
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
						<P class="text-body-sm font-medium text-gray-600 dark:text-gray-400">
							{organizer.affiliation}
						</P>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="bg-page padding-block-section-sm padding-inline-section">
	<div class="content-width-narrow surface-panel surface-padding-sm text-center">
		<P class="body-text-muted text-sm">
			This scoping workshop is made possible by the generous support of the
			<a
				href="https://www.volkswagenstiftung.de/en"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary font-semibold">Volkswagen Foundation</a
			>
		</P>
	</div>
</section>
