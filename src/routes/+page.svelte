<script lang="ts">
	import { CalendarMonthOutline, MapPinAltOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';
	import { workStreams } from '$lib/data/work-streams';
	import { interviews } from '$lib/data/interviews';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import FundingNote from '$lib/components/FundingNote.svelte';
	import AppButton from '$lib/components/AppButton.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';

	let { data } = $props();
	let stripPhotos = $derived(data.stripPhotos);

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
	const interviewsHref = resolveAppPath('/interviews');
	const conceptsHref = resolveAppPath('/concepts');
	const referencesHref = resolveAppPath('/references');
	const participantsHref = resolveAppPath('/participants');

	const attendees = participants.filter((p) => p.role !== 'Student assistant');
	const organiserNames = participants
		.filter((p) => p.role === 'Co-organizer')
		.map((p) => `${p.name} (${p.affiliation})`);

	/** The hero's right-hand column used to be two rotated, 32px-blurred radial
	 *  gradients — the "blurry blob" this project's own design philosophy says
	 *  it replaced with grids. These are the same five columns, saying something. */
	const heroFacts = [
		{ value: String(attendees.length), label: 'participants' },
		{ value: String(new Set(attendees.map((p) => p.country)).size), label: 'countries' },
		{ value: String(workStreams.length), label: 'work streams' },
		/* Four things the archive actually holds. The paper is still forthcoming,
		   so counting it here made the grid promise something it cannot deliver. */
		{ value: String(interviews.length), label: 'video interviews' }
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

	const firstInterview = interviews[0];
	/* Saved locally rather than hotlinked from i.ytimg.com — this was the only
	   third-party request the homepage made. Regenerate with
	   `npm run optimize:images` if the featured interview changes. */
	const interviewPoster = firstInterview
		? resolveAssetPath(`/images/interviews/${firstInterview.youtubeId}.webp`)
		: undefined;

	const outcomes = [
		{
			title: 'Position Paper',
			description: 'A co-authored roadmap for the field, forthcoming in open access.',
			href: positionPaperHref,
			media: 'paper' as const
		},
		{
			title: 'Photos',
			description: 'Three days of collaboration captured in the workshop gallery.',
			href: photosHref,
			media: 'photo' as const
		},
		{
			title: 'Interviews',
			description: 'Participants shared their perspectives in short video interviews.',
			href: interviewsHref,
			media: 'video' as const
		},
		{
			title: 'Concept Map',
			description: "An interactive network of ideas from the workshop's bibliography.",
			href: conceptsHref,
			media: 'graph' as const
		},
		{
			title: 'References',
			description: 'The bibliography the workshop read from, kept as an open Zotero library.',
			href: referencesHref,
			media: 'references' as const
		}
	];
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Hero -->
<section class="gradient-hero-future hero-viewport relative flex items-center overflow-hidden">
	<div class="bg-radial-glow animate-pulse-glow"></div>

	<div class="content-width-wide padding-inline-section relative py-16 md:py-24">
		<div class="gap-2xl grid items-center lg:grid-cols-12">
			<div class="stack-xl lg:col-span-7">
				<div class="stack-sm">
					<p class="text-accent animate-hero-eyebrow text-label">
						A Scoping Workshop · {workshopInfo.dates.full} · {workshopInfo.location.city}
					</p>
					<h1
						class="heading-display text-gradient-teal animate-hero-title pb-2 tracking-tight text-balance"
					>
						Charting New Territory
					</h1>
					<p class="heading-sub animate-hero-subtitle text-secondary-ink max-w-2xl">
						Digital Humanities and AI in African Studies
					</p>
				</div>

				<p class="text-lead animate-hero-lede">
					A working meeting that brought together researchers from Africa, Europe and beyond.
					Prioritising collaboration over presentations, participants moved from assessing current
					practices to developing actionable strategies. The outcome: a co-authored position paper
					guiding the ethical integration of digital humanities and AI in African studies —
					<a href={aboutHref} class="link-secondary">more about the workshop</a>.
				</p>

				<!-- Date and location, formerly a whole full-width panel for two facts -->
				<div class="gap-lg text-body-sm animate-hero-lede flex flex-wrap items-center">
					<span class="gap-xs flex items-center">
						<CalendarMonthOutline class="size-icon-md text-accent" aria-hidden="true" />
						{workshopInfo.dates.full}
					</span>
					<span class="gap-xs flex items-center">
						<MapPinAltOutline class="size-icon-md text-accent" aria-hidden="true" />
						<a
							href={workshopInfo.location.url}
							target="_blank"
							rel="noopener noreferrer"
							class="link-secondary">{workshopInfo.location.full}</a
						>
					</span>
				</div>

				<!-- The terracotta goes to the outcome that exists and can be read
				     today; the paper is named honestly rather than promised. -->
				<div class="gap-md flex flex-col sm:flex-row">
					<div class="animate-hero-cta">
						<AppButton href={conceptsHref} size="xl">Explore the concept map</AppButton>
					</div>
					<div class="animate-hero-cta-2">
						<AppButton variant="secondary" href={positionPaperHref} size="xl">
							Position paper — forthcoming
						</AppButton>
					</div>
				</div>
			</div>

			<div class="animate-hero-cta-3 lg:col-span-5">
				<dl class="hero-facts">
					{#each heroFacts as fact (fact.label)}
						<div class="hero-fact">
							<dt class="hero-fact__label">{fact.label}</dt>
							<dd class="hero-fact__value">{fact.value}</dd>
						</div>
					{/each}
				</dl>
				<!-- The two people-shaped facts above are the only ones with nowhere
				     to go; this is their destination. -->
				<p class="hero-facts__more">
					<a href={participantsHref} class="link-secondary tap-target"
						>Meet the {attendees.length} participants</a
					>
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Purpose -->
<section class="band padding-inline-section" aria-labelledby="workshop-purpose">
	<div class="content-width-wide animate-section-reveal" use:reveal>
		<div class="section-head">
			<p class="section-head__eyebrow">01 — Why we met</p>
			<h2 class="heading-section" id="workshop-purpose">Workshop Purpose</h2>
		</div>
		<p class="prose-serif mb-xl">
			Although digital humanities and AI offer transformative potential for African studies, rapid
			adoption has outpaced critical reflection. Most AI tools remain optimised for Western
			languages, digitisation decisions often reinforce who controls historical materials, and
			African institutions frequently lack the infrastructure to participate on equal terms. This
			workshop brought together international experts to move beyond describing these challenges and
			develop concrete strategies that keep African perspectives at the forefront.
		</p>

		<div class="stagger-children grid gap-4 md:grid-cols-3" use:reveal>
			{#each workshopGoals as goal (goal.title)}
				<article class="theme-card card-surface surface-padding-sm">
					<h3 class="heading-sub heading-sm">{goal.title}</h3>
					<p class="text-body-sm">{goal.description}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- Work streams — the sunken band -->
<section class="band band-sunken padding-inline-section" aria-labelledby="work-streams">
	<div class="content-width-wide animate-section-reveal" use:reveal>
		<div class="section-head">
			<p class="section-head__eyebrow">02 — How we worked</p>
			<h2 class="heading-section" id="work-streams">Three Work Streams</h2>
		</div>
		<p class="prose-serif mb-xl">
			Three integrated streams ran in parallel across the three days, each moving from documenting
			current practice to drafting concrete recommendations.
		</p>
		<WorkStreamCards />
	</div>
</section>

<!-- Photo strip: the archive, at the edges of the viewport -->
{#if stripPhotos.length > 0}
	<a
		href={photosHref}
		class="photo-strip band-bleed"
		aria-label="Browse the workshop photo gallery"
	>
		{#each stripPhotos as photo (photo.id)}
			<img
				src={resolveAssetPath(photo.thumbnail ?? photo.src)}
				alt={photo.alt}
				width={photo.width}
				height={photo.height}
				loading="lazy"
				decoding="async"
			/>
		{/each}
		<span class="photo-strip__label">Workshop gallery →</span>
	</a>
{/if}

<!-- Outcomes — the page's dark band: the most important section on a
     post-event archive, and formerly indistinguishable from its neighbours -->
<section class="band band-ink padding-inline-section" aria-labelledby="workshop-outcomes">
	<div class="content-width-wide animate-section-reveal" use:reveal>
		<div class="section-head">
			<p class="section-head__eyebrow">03 — What came of it</p>
			<h2 class="heading-section" id="workshop-outcomes">Workshop Outcomes</h2>
		</div>
		<p class="prose-serif mb-xl">Explore what came out of the three days in Hanover.</p>

		<div class="outcome-grid stagger-children" use:reveal>
			{#each outcomes as outcome (outcome.title)}
				<a href={outcome.href} class="outcome-link card-surface card-surface--link">
					<span class="outcome-media">
						{#if outcome.media === 'photo' && stripPhotos.length > 0}
							<img
								src={resolveAssetPath(stripPhotos[0].thumbnail ?? stripPhotos[0].src)}
								alt=""
								width={stripPhotos[0].width}
								height={stripPhotos[0].height}
								loading="lazy"
								decoding="async"
							/>
						{:else if outcome.media === 'video' && interviewPoster}
							<img
								src={interviewPoster}
								alt=""
								width="640"
								height="360"
								loading="lazy"
								decoding="async"
							/>
						{:else if outcome.media === 'graph'}
							<svg viewBox="0 0 160 90" aria-hidden="true" class="outcome-motif">
								<g stroke="currentColor" stroke-width="0.8" opacity="0.5">
									<path
										d="M30 60 80 30 130 55 80 72 30 60 80 72M80 30 80 72M30 60 55 22M80 30 55 22"
									/>
								</g>
								<g fill="currentColor">
									<circle cx="80" cy="30" r="7" />
									<circle cx="30" cy="60" r="4.5" />
									<circle cx="130" cy="55" r="5" />
									<circle cx="80" cy="72" r="4" />
									<circle cx="55" cy="22" r="3" />
								</g>
							</svg>
						{:else if outcome.media === 'references'}
							<!-- Stacked bibliographic records: a hanging-indent entry repeated
							     down the tile, which is what the page itself looks like. -->
							<svg viewBox="0 0 160 90" aria-hidden="true" class="outcome-motif">
								<g stroke="currentColor" stroke-width="2" opacity="0.75" stroke-linecap="round">
									<path d="M34 22h54M34 46h62M34 70h46" />
								</g>
								<g stroke="currentColor" stroke-width="1.4" opacity="0.4" stroke-linecap="round">
									<path d="M42 30h72M42 36h50M42 54h72M42 60h38M42 78h66" />
								</g>
								<g stroke="currentColor" stroke-width="1.4" opacity="0.55">
									<path d="M26 16v20M26 40v20M26 64v20" />
								</g>
							</svg>
						{:else if outcome.media === 'video'}
							<svg viewBox="0 0 160 90" aria-hidden="true" class="outcome-motif">
								<g stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6">
									<rect x="34" y="17" width="92" height="56" rx="4" />
								</g>
								<path d="M72 33 96 45 72 57Z" fill="currentColor" opacity="0.8" />
							</svg>
						{:else if outcome.media === 'photo'}
							<svg viewBox="0 0 160 90" aria-hidden="true" class="outcome-motif">
								<g stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6">
									<rect x="34" y="17" width="92" height="56" rx="4" />
								</g>
								<circle cx="60" cy="36" r="6" fill="currentColor" opacity="0.7" />
								<path
									d="M38 65 66 44l17 13 14-10 21 18Z"
									fill="currentColor"
									opacity="0.45"
									stroke="none"
								/>
							</svg>
						{:else}
							<svg viewBox="0 0 160 90" aria-hidden="true" class="outcome-motif">
								<g stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.75">
									<rect x="34" y="16" width="44" height="58" rx="2" />
									<rect x="82" y="16" width="44" height="58" rx="2" />
								</g>
								<g stroke="currentColor" stroke-width="1.6" opacity="0.45" stroke-linecap="round">
									<path d="M42 30h28M42 38h28M42 46h20M90 30h28M90 38h28M90 46h28M90 54h18" />
								</g>
							</svg>
						{/if}
					</span>
					<div class="outcome-body">
						<h3 class="heading-sub heading-sm">{outcome.title}</h3>
						<p class="text-body-sm">{outcome.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Funding + organisers, in one line: About owns the biographies -->
<section class="band-tight padding-inline-section">
	<div class="content-width-wide stack-2xs">
		<p class="text-body-sm">
			<FundingNote />
		</p>
		<p class="text-body-sm text-subtle-ink">
			Convened by {organiserNames.join(' and ')}.
		</p>
	</div>
</section>

<style>
	/* ---------- Hero facts ---------- */
	.hero-facts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1px;
		margin: 0;
		background-color: var(--border-subtle);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-panel);
		overflow: hidden;
	}

	.hero-fact {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--space-3xs);
		padding: var(--space-lg);
		background-color: color-mix(in srgb, var(--surface-2) 72%, transparent);
	}

	.hero-fact__value {
		margin: 0;
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-extrabold);
		font-size: var(--text-4xl);
		line-height: 1;
		letter-spacing: var(--tracking-tight);
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.hero-fact__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.hero-facts__more {
		margin-top: var(--space-sm);
		font-size: var(--text-sm);
	}

	/* ---------- Full-bleed photo strip ----------
	 * Width and offset come from `.band-bleed`; this only shapes the grid. */
	.photo-strip {
		position: relative;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		text-decoration: none;
	}

	@media (min-width: 768px) {
		.photo-strip {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.photo-strip img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		filter: saturate(0.92);
		transition:
			filter var(--transition-base),
			opacity var(--transition-base);
	}

	.photo-strip:hover img,
	.photo-strip:focus-visible img {
		filter: saturate(1);
	}

	.photo-strip__label {
		position: absolute;
		right: var(--space-md);
		bottom: var(--space-md);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-full);
		background-color: var(--bg-scrim);
		color: var(--text-on-accent);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wide);
	}

	/* ---------- Outcome tiles ----------
	 * 13rem, not 15rem: five destinations sit on one row at desktop width
	 * instead of four plus an orphan. */
	.outcome-grid {
		display: grid;
		gap: var(--space-lg);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
	}

	.outcome-link {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		text-decoration: none;
		color: inherit;
	}

	/* `--bg-sunken` resolves to the ink band's own recessed step, so the media
	   well reads one tone below the card it sits in. */
	.outcome-media {
		display: block;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background-color: var(--bg-sunken);
		color: var(--color-secondary-300);
	}

	.outcome-media :global(img),
	.outcome-media :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.outcome-motif {
		padding: var(--space-sm);
	}

	.outcome-body {
		display: grid;
		gap: var(--space-3xs);
		padding: var(--space-md);
	}
</style>
