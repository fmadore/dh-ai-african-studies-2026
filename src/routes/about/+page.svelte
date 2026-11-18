<script lang="ts">
	import ParticipantAvatar from '#lib/components/ParticipantAvatar.svelte';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import SectionNav from '#lib/components/SectionNav.svelte';
	import WorkStreamCards from '#lib/components/WorkStreamCards.svelte';
	import FundingNote from '#lib/components/FundingNote.svelte';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '#lib/utils/seo';
	import { mediaCredit } from '#lib/data/photos';
	import { workshopInfo } from '#lib/data/workshop-info';
	import { resolveAssetPath, resolveAppPath } from '#lib/utils/paths';
	import { reveal } from '#lib/utils/reveal';

	let { data } = $props();
	let backgroundPhoto = $derived(data.backgroundPhoto);
	// Reduced from the participant records at prerender time (+page.server.ts)
	let coOrganizers = $derived(data.coOrganizers);
	let studentAssistants = $derived(data.studentAssistants);

	type PersonCard = (typeof data.coOrganizers)[number];

	const sections = [
		{ id: 'background', label: 'Background' },
		{ id: 'format', label: 'Format' },
		{ id: 'key-outcome', label: 'Key outcome' },
		{ id: 'co-organisers', label: 'Co-organisers' },
		{ id: 'student-assistants', label: 'Student assistants' },
		{ id: 'funding', label: 'Funding' }
	];

	const seo = createSeoMeta({
		title: 'About the Workshop',
		description:
			'The scoping workshop convened international experts to map digital humanities and AI in African studies, across equity, linguistics and methodology.',
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
	eyebrow="The workshop"
	title="About the Workshop"
	lede="A scoping workshop held {workshopInfo.dates
		.full} in Hanover, Germany, bringing together researchers from Africa, Europe and beyond."
/>

<!-- One card for both people sections; the size of the portrait is the only
     difference between an organiser and an assistant. -->
{#snippet personCard(person: PersonCard, avatarSize: 'sm' | 'md')}
	<article class="card-surface surface-padding-sm person-card">
		<div class="person-card__head">
			<ParticipantAvatar
				src={resolveAssetPath(person.photoUrl)}
				alt={person.name}
				size={avatarSize}
			/>
			<div class="stack-3xs">
				<h3 class="person-card__name">
					{#if person.website}
						<a
							href={person.website}
							target="_blank"
							rel="noopener noreferrer"
							class="link-secondary">{person.name}</a
						>
					{:else}
						{person.name}
					{/if}
				</h3>
				<p class="text-body-sm body-text-muted">{person.affiliation}</p>
				{#if person.researchRegions.length > 0}
					<p class="text-caption">{person.researchRegions.join(' · ')}</p>
				{/if}
			</div>
		</div>
		{#if person.bio}
			<p class="prose-serif-sm">{person.bio}</p>
		{/if}
	</article>
{/snippet}

<div class="padding-inline-section band-tight">
	<div class="content-width-wide about-layout">
		<SectionNav {sections} />

		<div class="about-body print-expand-links">
			<!-- Background -->
			<section id="background" class="about-section">
				<div class="section-head">
					<p class="section-head__eyebrow">01 — Context</p>
					<h2 class="heading-section">Background</h2>
				</div>

				<div class="animate-section-reveal" use:reveal>
					<p class="prose-serif mb-md">
						Digital humanities has a long—and often overlooked—history in African studies, from
						early databases such as the <a
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
						>. AI tools, particularly large language models, add new possibilities for textual
						analysis and cross-cultural research.
					</p>

					{#if backgroundPhoto}
						<figure class="about-figure">
							<img
								src={resolveAssetPath(backgroundPhoto.thumbnail ?? backgroundPhoto.src)}
								alt={backgroundPhoto.alt}
								width={backgroundPhoto.width}
								height={backgroundPhoto.height}
								loading="lazy"
								decoding="async"
							/>
							<figcaption class="text-caption">
								Working sessions in Hanover, February 2026. Photography by
								<a
									href={mediaCredit.url}
									target="_blank"
									rel="noopener noreferrer"
									class="link-secondary">{mediaCredit.name}</a
								>.
							</figcaption>
						</figure>
					{/if}

					<p class="prose-serif mb-md">
						But implementation raises difficult questions. Decisions about what gets digitised, how
						it is catalogued and who controls access are not neutral; they often favour institutions
						that already have resources in place. Most AI systems still underperform on African
						languages. And the pace of adoption frequently outstrips attention to long-term
						preservation and local capacity.
					</p>
					<p class="prose-serif">
						Critics have described some digital initiatives as a form of "<a
							href="https://doi.org/10.1080/13696815.2018.1555749"
							target="_blank"
							rel="noopener noreferrer"
							class="link-secondary">digital saviour complex</a
						>," where Northern-led projects reproduce colonial dynamics even while claiming to
						democratise access. This workshop took these critiques seriously.
					</p>
				</div>
			</section>

			<!-- Format -->
			<section id="format" class="about-section">
				<div class="section-head">
					<p class="section-head__eyebrow">02 — Method</p>
					<h2 class="heading-section">Format</h2>
				</div>
				<div class="animate-section-reveal" use:reveal>
					<p class="prose-serif mb-xl">
						This was not a traditional conference. There were no paper presentations. Instead,
						participants worked intensively across three days in structured sessions designed to
						produce tangible outputs. Daily synthesis sessions connected insights across the three
						work streams, feeding directly into the <a
							href={resolveAppPath('/position-paper')}
							class="link-secondary">position paper</a
						>.
					</p>
					<WorkStreamCards />
				</div>
			</section>

			<!-- Key Outcome -->
			<section id="key-outcome" class="about-section">
				<div class="section-head">
					<p class="section-head__eyebrow">03 — Output</p>
					<h2 class="heading-section">Key Outcome: The Position Paper</h2>
				</div>
				<div class="animate-section-reveal stack-md" use:reveal>
					<p class="prose-serif">
						The workshop produced a jointly authored
						<a href={resolveAppPath('/position-paper')} class="link-secondary">position paper</a>,
						published open access on {data.paperPublishedOn} in
						<em>ZMO Programmatic Texts</em>, no. 16.
					</p>
					<p class="prose-serif">
						Drawing on insights from the daily sessions, this document provides a strategic
						reference point for the field, offering actionable recommendations for research funders,
						academic institutions, technology developers, and policymakers.
					</p>
					<p class="prose-serif">
						By addressing sustainable funding models, ethical protocols, and decolonised curricula,
						it aims to support the consolidation of this emerging field and inform its future
						direction.
					</p>
				</div>
			</section>

			<!-- Co-Organisers -->
			{#if coOrganizers.length > 0}
				<section id="co-organisers" class="about-section">
					<div class="section-head">
						<p class="section-head__eyebrow">04 — People</p>
						<h2 class="heading-section">Co-Organisers</h2>
					</div>
					<div class="people-grid stagger-children" use:reveal>
						{#each coOrganizers as organizer (organizer.name)}
							{@render personCard(organizer, 'md')}
						{/each}
					</div>
				</section>
			{/if}

			<!-- Student Assistants -->
			{#if studentAssistants.length > 0}
				<section id="student-assistants" class="about-section">
					<div class="section-head">
						<p class="section-head__eyebrow">05 — People</p>
						<h2 class="heading-section">Student Assistants</h2>
					</div>
					<div class="people-grid stagger-children" use:reveal>
						{#each studentAssistants as assistant (assistant.name)}
							{@render personCard(assistant, 'sm')}
						{/each}
					</div>
				</section>
			{/if}

			<!-- Funding -->
			<section id="funding" class="about-section">
				<div class="section-head">
					<p class="section-head__eyebrow">06 — Support</p>
					<h2 class="heading-section">Funding</h2>
				</div>
				<p class="prose-serif">
					<FundingNote />
				</p>
			</section>
		</div>
	</div>
</div>

<style>
	.about-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-xl);
		align-items: start;
	}

	@media (min-width: 1024px) {
		.about-layout {
			grid-template-columns: minmax(0, 13rem) minmax(0, 1fr);
			gap: var(--space-3xl);
		}
	}

	.about-body {
		display: grid;
		gap: var(--space-4xl);
		min-width: 0;
	}

	.about-section {
		scroll-margin-top: var(--scroll-offset);
	}

	.about-figure {
		margin: var(--space-xl) 0;
		max-width: var(--measure-prose);
	}

	.about-figure img {
		display: block;
		width: 100%;
		border-radius: var(--radius-card);
		border: 1px solid var(--border-subtle);
	}

	.about-figure figcaption {
		margin-top: var(--space-2xs);
		max-width: var(--measure-prose);
	}

	.people-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		max-width: 56rem;
	}

	@media (min-width: 640px) {
		.people-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.person-card {
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.person-card__head {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	/* A restrained title step: the bio is the content, not the frame. */
	.person-card__name {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-xl);
		line-height: var(--leading-heading);
		color: var(--text-primary);
	}

	.stack-3xs > * + * {
		margin-top: var(--space-3xs);
	}
</style>
