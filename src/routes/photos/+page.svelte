<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import {
		createSeoMeta,
		createEventJsonLd,
		createWebPageJsonLd,
		serializeJsonLd
	} from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { photoCategories } from '$lib/data/photos';
	import PhotoViewer from '$lib/components/PhotoViewer.svelte';

	let { data } = $props();
	let photos = $derived(data.photos);

	const seo = createSeoMeta({
		title: 'Photos',
		description:
			'Photo gallery from the Charting New Territory workshop on Digital Humanities and AI in African Studies, held 18–20 February 2026 in Hanover, Germany.',
		path: '/photos',
		keywords: [
			'Workshop Photos',
			'Conference Gallery',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Hanover',
			'Workshop 2026'
		]
	});

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
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html `<script type="application/ld+json">${serializeJsonLd(eventJsonLd)}</script>`}
	{@html `<script type="application/ld+json">${serializeJsonLd(webPageJsonLd)}</script>`}
</svelte:head>

<!-- Page Header -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal drop-shadow-md pb-2 tracking-tight animate-hero-title"
		>
			Photos
		</Heading>
		<P class="text-lead mx-auto max-w-3xl animate-hero-subtitle">
			Moments captured during the workshop on Digital Humanities and AI in African Studies, held 18–20 February 2026 in Hanover, Germany.
		</P>
		<p class="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 animate-hero-subtitle" style="animation-delay: 100ms;">
			Photography by <a href="https://calumbrett.myportfolio.com/" target="_blank" rel="noopener noreferrer" class="text-secondary-500 dark:text-secondary-400 hover:text-secondary-400 dark:hover:text-secondary-300 transition-colors">Calum Houston</a>
		</p>
	</div>
</section>

<!-- Gallery -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-lg relative"
	>
		{#if photos.length > 0}
			<PhotoViewer {photos} categories={photoCategories} />
		{:else}
			<div class="text-center padding-block-xl card-surface surface-padding border border-dashed border-gray-300 dark:border-gray-700">
				<div class="stack-sm flex flex-col items-center">
					<CameraPhotoOutline class="w-16 h-16 text-surface-400 dark:text-surface-dark-overlay" />
					<Heading tag="h2" class="heading-section text-gradient-teal">Coming Soon</Heading>
					<P class="body-text-muted max-w-md mx-auto">
						Photos from the workshop will be added here shortly. Check back soon to relive the highlights from three days of engaging discussions and collaboration.
					</P>
				</div>
			</div>
		{/if}
	</div>
</section>
