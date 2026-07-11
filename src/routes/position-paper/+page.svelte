<script lang="ts">
	import { Heading, P, Li, List, Alert } from 'flowbite-svelte';
	import { BookOpenOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { reveal } from '$lib/utils/reveal';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';

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

	const audiences = [
		{
			title: 'Research funders',
			description: 'seeking models for sustainable, equitable project support'
		},
		{
			title: 'Universities',
			description: 'developing curricula and training in digital methods'
		},
		{
			title: 'Technology developers',
			description: 'building tools for multilingual and cross-cultural research'
		},
		{
			title: 'Policy makers',
			description: 'working on data governance and digital infrastructure'
		}
	];
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
					href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary">ZMO Programmatic Texts</a
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
			<P class="body-text">
				The paper synthesises the discussions from the workshop into a set of recommendations for
				researchers, funders and institutions working at the intersection of digital humanities, AI
				and African studies. It aims to provide a strategic reference point for this emerging
				field, which currently lacks shared standards and clear direction. The paper centres
				African perspectives while addressing infrastructure gaps and linguistic diversity.
			</P>
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
			<P class="body-text">The paper addresses three areas:</P>
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
			<P class="body-text">The paper is addressed to:</P>
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
			<P class="body-text">
				A drafting committee has been preparing the paper since the workshop, incorporating
				participant feedback and professional editing. The goal is a document that is both rigorous
				and accessible to non-specialist readers in policy and funding contexts. Publication
				details will be announced on this page once the paper is released.
			</P>
		</div>

		<Alert color="teal" class="max-w-3xl">
			{#snippet icon()}
				<BookOpenOutline class="h-5 w-5" />
			{/snippet}
			<span class="font-semibold">About ZMO Programmatic Texts</span>
			<p class="mt-1 text-sm">
				This <a
					href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts"
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium underline hover:no-underline">series</a
				>
				publishes conceptual articles engaging with interdisciplinary and inter-regional research conducted
				at the
				<a
					href="https://www.zmo.de/en"
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium underline hover:no-underline">Leibniz-Zentrum Moderner Orient</a
				>.
			</p>
		</Alert>
	</div>
</section>
