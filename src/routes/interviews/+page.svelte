<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { interviews } from '$lib/data/interviews';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import CreditLine from '$lib/components/CreditLine.svelte';
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
	title="Interviews"
	lede="Short interviews with workshop participants sharing their perspectives on Digital Humanities and AI in African Studies."
>
	<CreditLine prefix="Filmed by" />
</PageHero>

<!-- Interviews Grid -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide surface-panel surface-padding relative">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			{#each interviews as interview (interview.participantName)}
				<article
					class="card-surface surface-padding stack-md glow-border animate-section-reveal rounded-lg"
					use:reveal
				>
					<LiteYouTube
						videoId={interview.youtubeId}
						title="Interview with {interview.participantName}"
					/>
					<div class="stack-xs">
						<Heading tag="h2" class="heading-sub heading-color-light">
							{interview.participantName}
						</Heading>
						<p class="text-body-sm">
							{interview.affiliation}
						</p>
						<Heading tag="h3" class="text-accent text-base! font-medium!">
							{interview.topic}
						</Heading>
						<P class="body-text-muted text-sm">
							{interview.description}
						</P>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
