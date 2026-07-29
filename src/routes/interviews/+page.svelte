<script lang="ts">
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { interviews, captionsUrl } from '$lib/data/interviews';
	import { mediaCredit } from '$lib/data/photos';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import LiteYouTube from '$lib/components/LiteYouTube.svelte';

	const seo = createSeoMeta({
		title: 'Interviews',
		description:
			'Short video interviews with participants of the Charting New Territory workshop on Digital Humanities and AI in African Studies, held 18–20 February 2026 in Hanover, Germany.',
		path: '/interviews',
		keywords: [
			'Workshop Interviews',
			'Participant Videos',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Hanover',
			'Workshop 2026',
			...interviews.map((i) => i.participantName)
		]
	});

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<PageHero
	eyebrow="Outcomes"
	title="Interviews"
	lede="Workshop participants on what digital humanities and AI change for African studies — and what they do not."
	width="wide"
	size="compact"
>
	<p class="text-caption">
		Filmed by
		<a href={mediaCredit.url} target="_blank" rel="noopener noreferrer" class="link-secondary"
			>{mediaCredit.name}</a
		>
	</p>
</PageHero>

<section class="band-tight padding-inline-section">
	<div class="content-width-wide">
		<div class="interview-grid">
			{#each interviews as interview (interview.participantName)}
				<article class="interview animate-section-reveal" use:reveal>
					<!-- No card, no glow border, no hover lift: the 16:9 thumbnail is
					     already the card. -->
					<LiteYouTube
						videoId={interview.youtubeId}
						title="Interview with {interview.participantName}"
					/>

					<!-- Topic first: it is why anyone clicks. The name and affiliation
					     are the attribution line beneath it. -->
					<h2 class="interview__topic">{interview.topic}</h2>
					<p class="interview__byline">
						{interview.participantName} · {interview.affiliation}
					</p>
					<p class="prose-serif-sm">{interview.description}</p>
					<p class="interview__meta">
						{#if interview.durationMinutes}
							<span>{interview.durationMinutes} min</span>
							<span aria-hidden="true">·</span>
						{/if}
						<a
							href={captionsUrl(interview)}
							target="_blank"
							rel="noopener noreferrer"
							class="link-secondary">Captions on YouTube</a
						>
					</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.interview-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
	}

	@media (min-width: 768px) {
		.interview-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.interview {
		display: grid;
		gap: var(--space-2xs);
		align-content: start;
	}

	.interview__topic {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-xl);
		line-height: var(--leading-heading);
		color: var(--text-primary);
		margin-top: var(--space-sm);
		max-width: var(--measure-prose);
	}

	.interview__byline {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-accent);
	}

	.interview__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs);
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
</style>
