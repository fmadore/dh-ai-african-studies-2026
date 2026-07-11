<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { photoCategories } from '$lib/data/photos';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import CreditLine from '$lib/components/CreditLine.svelte';
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

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<PageHero
	title="Photos"
	lede="Moments captured during the workshop on Digital Humanities and AI in African Studies, held 18–20 February 2026 in Hanover, Germany."
>
	<CreditLine prefix="Photography by" />
</PageHero>

<!-- Gallery -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		{#if photos.length > 0}
			<PhotoViewer {photos} categories={photoCategories} />
		{:else}
			<div class="empty-state">
				<div class="empty-state__icon">
					<CameraPhotoOutline class="size-icon-lg" />
				</div>
				<Heading tag="h2" class="heading-section text-gradient-teal">Coming Soon</Heading>
				<P class="body-text-muted mx-auto max-w-md">
					Photos from the workshop will be added here shortly. Check back soon to relive the
					highlights from three days of engaging discussions and collaboration.
				</P>
			</div>
		{/if}
	</div>
</section>
