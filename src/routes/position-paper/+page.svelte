<script lang="ts">
	import { Heading, P, Li, List } from 'flowbite-svelte';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SeriesNote from '$lib/components/SeriesNote.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';
	import { positionPaperAbout } from '$lib/data/position-paper-about';

	const seo = createSeoMeta({
		path: '/position-paper',
		title: 'Position Paper',
		description:
			"The workshop's main output is a co-authored position paper, to be published in open access in the ZMO Programmatic Texts series.",
		type: 'article',
		keywords: [
			'Position Paper',
			'ZMO Programmatic Texts',
			'Open Access',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Policy Recommendations',
			'Research Framework'
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

	const { purpose, contentsIntro, audienceIntro, audiences, process, series } = positionPaperAbout;
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Hero Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="content-width surface-panel surface-padding stack-md relative text-center">
		<div class="stack-md">
			<Heading
				tag="h1"
				class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
			>
				Position Paper
			</Heading>
			<P class="body-text animate-hero-subtitle mx-auto max-w-3xl text-lg leading-relaxed">
				The main output of the workshop is a co-authored position paper, to be published in open
				access in the <a
					href={series.url}
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary">{series.name}</a
				> series.
			</P>
			<P class="body-text animate-hero-lede mx-auto max-w-3xl text-lg leading-relaxed">
				As digital humanities and AI are reshaping the landscape of African studies research, there
				is a growing need for shared frameworks that address questions of equity, methodology and
				ethics. This paper responds to that need.
			</P>
		</div>
	</div>
</section>

<!-- Purpose -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-lg animate-section-reveal relative"
		use:reveal
	>
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Purpose</Heading
			>
			<P class="body-text">{purpose}</P>
		</div>
	</div>
</section>

<!-- Contents -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow-bottom"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-lg animate-section-reveal relative"
		use:reveal
	>
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Contents</Heading
			>
			<P class="body-text">{contentsIntro}</P>
		</div>

		<WorkStreamCards />
	</div>
</section>

<!-- Audience -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width surface-panel surface-padding stack-lg animate-section-reveal relative"
		use:reveal
	>
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Audience</Heading
			>
			<P class="body-text">{audienceIntro}</P>
			<List tag="ul" class="mt-4 space-y-3">
				{#each audiences as audience (audience.title)}
					<Li class="body-text">
						<strong>{audience.title}</strong>
						{audience.description}
					</Li>
				{/each}
			</List>
		</div>
	</div>
</section>

<!-- Process -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow-bottom"></div>
	<div
		class="content-width surface-panel surface-padding stack-lg animate-section-reveal relative"
		use:reveal
	>
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline"
				>Process</Heading
			>
			<P class="body-text">{process.forthcoming}</P>
		</div>

		<SeriesNote />
	</div>
</section>
