<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import {
		CalendarMonthOutline,
		MapPinAltOutline,
		CameraPhotoOutline,
		VideoCameraOutline,
		ShareNodesOutline,
		FileLinesOutline
	} from 'flowbite-svelte-icons';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FundingNote from '$lib/components/FundingNote.svelte';
	import AppButton from '$lib/components/AppButton.svelte';

	const seo = createSeoMeta({ path: '/' });
	const eventJsonLd = createWorkshopEventJsonLd({
		description: seo.description,
		url: seo.canonical
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
	const aboutHref = resolveAppPath('/about');
	const positionPaperHref = resolveAppPath('/position-paper');
	const photosHref = resolveAppPath('/photos');

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
				'We prioritised production over presentation. Each day, participants progressed from mapping current barriers to co-designing actionable strategies, ensuring that African epistemologies remained at the centre of this process. Daily synthesis sessions connected insights across groups.'
		},
		{
			title: 'Structured Work Streams',
			description:
				'Three integrated work streams tackled critical intersections through facilitated dialogue rather than traditional panels: Methodological Integration, Equitable North–South/South–South Collaboration and Ethical Frameworks.'
		},
		{
			title: 'Position Paper',
			description:
				'The workshop culminated in the drafting of a co-authored strategic roadmap. This document outlines the future direction of the field, providing practical recommendations to inform future research, funding policies and institutional decision-making.'
		}
	];

	const outcomes = [
		{
			title: 'Position Paper',
			description: 'A co-authored roadmap for the field, to be published open access.',
			icon: FileLinesOutline,
			href: resolveAppPath('/position-paper')
		},
		{
			title: 'Photos',
			description: 'Three days of collaboration captured in the workshop gallery.',
			icon: CameraPhotoOutline,
			href: resolveAppPath('/photos')
		},
		{
			title: 'Interviews',
			description: 'Participants share their perspectives in short video interviews.',
			icon: VideoCameraOutline,
			href: resolveAppPath('/interviews')
		},
		{
			title: 'Concept Map',
			description: "An interactive network of ideas from the workshop's bibliography.",
			icon: ShareNodesOutline,
			href: resolveAppPath('/concepts')
		}
	];
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Hero Section - Future Forward -->
<section class="gradient-hero-future hero-viewport relative flex items-center overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow animate-pulse-glow"></div>
	<div class="bg-radial-glow-bottom"></div>

	<!-- A single, larger decorative circle keeps depth without visual noise -->
	<div
		class="decorative-circle animate-float -top-32 -right-40 h-96 w-96 opacity-40"
		aria-hidden="true"
	></div>

	<div class="content-width-wide relative py-16 md:py-24">
		<div class="gap-xl grid items-center lg:grid-cols-12">
			<div class="stack-xl lg:col-span-8 xl:col-span-7">
				<div class="stack-sm">
					<p class="text-accent animate-hero-eyebrow text-label">
						A Scoping Workshop · 18–20 February 2026 · Hanover
					</p>
					<h1
						class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight"
					>
						Charting New Territory
					</h1>
					<p class="heading-sub animate-hero-subtitle text-secondary-ink max-w-2xl">
						Digital Humanities and AI in African Studies
					</p>
				</div>

				<p class="text-lead animate-hero-lede max-w-2xl">
					A working meeting that brought together researchers from Africa, Europe, and beyond.
					Through facilitated discussions and structured deliberation—prioritising collaboration
					over presentations—participants moved from assessing current practices to developing
					actionable strategies. The outcome: a co-authored position paper guiding the ethical
					integration of digital humanities and AI in African studies.
				</p>

				<div class="gap-md flex flex-col sm:flex-row">
					<div class="animate-hero-cta">
						<AppButton href={positionPaperHref} size="xl">Position Paper</AppButton>
					</div>
					<div class="animate-hero-cta-2">
						<AppButton variant="secondary" href={photosHref} size="xl">Photos</AppButton>
					</div>
					<div class="animate-hero-cta-3">
						<AppButton variant="secondary" href={aboutHref} size="xl">About</AppButton>
					</div>
				</div>
			</div>

			<!-- Decorative accent panel on right (visible on lg+) -->
			<div class="hero-accent-panel" aria-hidden="true">
				<div class="hero-accent-panel__back"></div>
				<div class="hero-accent-panel__front"></div>
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
				workshop brought together international experts to move beyond describing these challenges
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

<!-- Workshop Outcomes -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-40"></div>
	<div class="bg-radial-glow opacity-40"></div>

	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		<div class="stack-sm animate-section-reveal text-center" use:reveal>
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Workshop Outcomes</Heading
			>
			<P class="text-lead mx-auto max-w-3xl">Explore what came out of the three days in Hanover.</P>
		</div>

		<div class="auto-grid auto-grid-sm stagger-children animate-section-reveal" use:reveal>
			{#each outcomes as outcome (outcome.title)}
				{@const Icon = outcome.icon}
				<a href={outcome.href} class="outcome-link">
					<article class="highlight-card card-surface surface-padding-sm glow-border h-full">
						<div class="highlight-card__icon glow-teal" aria-hidden="true">
							<Icon size="lg" aria-hidden="true" />
						</div>
						<div class="stack-xs">
							<Heading tag="h3" class="heading-sub heading-sm">{outcome.title}</Heading>
							<P class="text-body-sm">{outcome.description}</P>
						</div>
					</article>
				</a>
			{/each}
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
								alt="Portrait of {organizer.name}"
								width="112"
								height="112"
								loading="lazy"
								decoding="async"
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
						<P class="text-body-sm body-text-strong">
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
			<FundingNote />
		</P>
	</div>
</section>

<style>
	.outcome-link {
		display: block;
		height: 100%;
		text-decoration: none;
		color: inherit;
		border-radius: var(--radius-xl);
	}

	.hero-accent-panel {
		position: relative;
		display: none;
	}

	@media (min-width: 1024px) {
		.hero-accent-panel {
			display: block;
			grid-column: span 4;
			min-height: 22rem;
		}
	}

	@media (min-width: 1280px) {
		.hero-accent-panel {
			grid-column: span 5;
		}
	}

	.hero-accent-panel__back,
	.hero-accent-panel__front {
		position: absolute;
		border-radius: var(--radius-2xl);
		filter: blur(32px);
		will-change: transform;
	}

	.hero-accent-panel__back {
		inset: -2rem;
		transform: rotate(8deg);
		background: radial-gradient(
			ellipse 75% 65% at 35% 35%,
			color-mix(in srgb, var(--color-secondary-400) 28%, transparent) 0%,
			color-mix(in srgb, var(--color-secondary-500) 10%, transparent) 45%,
			transparent 75%
		);
		opacity: 0.9;
	}

	.hero-accent-panel__front {
		inset: 2rem;
		transform: rotate(-5deg);
		background: radial-gradient(
			ellipse 70% 60% at 65% 60%,
			color-mix(in srgb, var(--color-primary-300) 22%, transparent) 0%,
			color-mix(in srgb, var(--color-primary-400) 7%, transparent) 50%,
			transparent 80%
		);
		opacity: 0.8;
		animation: heroAccentDrift 14s ease-in-out infinite;
	}

	@keyframes heroAccentDrift {
		0%,
		100% {
			transform: rotate(-5deg) translate3d(0, 0, 0);
		}
		50% {
			transform: rotate(-3deg) translate3d(6px, -8px, 0);
		}
	}

	:global(.dark) .hero-accent-panel__back {
		background: radial-gradient(
			ellipse 75% 65% at 35% 35%,
			color-mix(in srgb, var(--color-secondary-400) 38%, transparent) 0%,
			color-mix(in srgb, var(--color-secondary-500) 14%, transparent) 45%,
			transparent 75%
		);
		opacity: 0.7;
	}

	:global(.dark) .hero-accent-panel__front {
		background: radial-gradient(
			ellipse 70% 60% at 65% 60%,
			color-mix(in srgb, var(--color-primary-400) 26%, transparent) 0%,
			color-mix(in srgb, var(--color-primary-500) 10%, transparent) 50%,
			transparent 80%
		);
		opacity: 0.6;
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-accent-panel__front {
			animation: none;
		}
	}
</style>
