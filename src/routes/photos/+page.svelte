<script lang="ts">
	import { CameraPhotoOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { photoCategories, mediaCredit } from '$lib/data/photos';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import PhotoViewer from '$lib/components/PhotoViewer.svelte';

	let { data } = $props();
	let photos = $derived(data.photos);

	/**
	 * `?day=Day 2` — the schedule links each day header into the gallery.
	 * PhotoViewer applies this after hydration, so the prerendered markup and
	 * the first client render still agree.
	 */
	let initialCategory = $derived(
		browser ? (photoCategories.find((c) => c === page.url.searchParams.get('day')) ?? 'All') : 'All'
	);

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

<PageHero title="Photos" width="wide" size="compact">
	<p class="text-body-sm">
		{photos.length} images from the workshop, 18–20 February 2026, Hanover. Photography by
		<a href={mediaCredit.url} target="_blank" rel="noopener noreferrer" class="link-secondary"
			>{mediaCredit.name}</a
		>.
	</p>
</PageHero>

<!-- Full bleed: photographs are the one thing on this site that should touch
     the edges of the viewport. -->
<section class="gallery band-bleed">
	<div class="gallery__inner padding-inline-section">
		{#if photos.length > 0}
			<PhotoViewer {photos} categories={photoCategories} {initialCategory} />
		{:else}
			<div class="empty-state">
				<div class="empty-state__icon">
					<CameraPhotoOutline class="size-icon-lg" />
				</div>
				<h2 class="heading-sub">Coming Soon</h2>
				<p class="body-text-muted mx-auto max-w-md">
					Photos from the workshop will be added here shortly.
				</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.gallery {
		padding-bottom: var(--space-3xl);
	}

	.gallery__inner {
		width: 100%;
	}
</style>
