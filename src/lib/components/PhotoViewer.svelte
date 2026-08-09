<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import type { Photo, PhotoCategory } from '$lib/types/photo';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { reveal } from '$lib/utils/reveal';
	import PhotoLightbox from '$lib/components/photo-viewer/PhotoLightbox.svelte';
	import { Heading, P, Button } from 'flowbite-svelte';
	import { ImageOutline } from 'flowbite-svelte-icons';

	let {
		photos,
		categories,
		initialCategory = 'All'
	}: {
		photos: Photo[];
		categories: PhotoCategory[];
		/** Seeded from `?day=` so the schedule can deep-link a single day. */
		initialCategory?: string;
	} = $props();

	/**
	 * Starts at 'All' so the prerendered markup and the first client render
	 * agree; the URL-derived category is applied after hydration. Seeding it
	 * during initialisation would render a different photo list on the client
	 * than the server produced.
	 */
	let activeCategory = $state<string>('All');

	onMount(() => {
		const seed = untrack(() => initialCategory);
		if (seed && seed !== 'All') activeCategory = seed;
	});
	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	let gridButtonRefs: HTMLButtonElement[] = $state([]);

	let filteredPhotos = $derived(
		activeCategory === 'All' ? photos : photos.filter((p) => p.category === activeCategory)
	);

	let currentPhoto = $derived(filteredPhotos[lightboxIndex]);

	let categoryCounts = $derived.by(() => {
		const counts: Record<string, number> = { All: photos.length };
		for (const cat of categories) {
			counts[cat] = photos.filter((p) => p.category === cat).length;
		}
		return counts;
	});

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
		const btn = gridButtonRefs[lightboxIndex];
		if (btn) {
			requestAnimationFrame(() => btn.focus());
		}
	}

	function prevPhoto() {
		lightboxIndex = lightboxIndex <= 0 ? filteredPhotos.length - 1 : lightboxIndex - 1;
	}

	function nextPhoto() {
		lightboxIndex = lightboxIndex >= filteredPhotos.length - 1 ? 0 : lightboxIndex + 1;
	}

	// Preload adjacent images
	$effect(() => {
		if (!lightboxOpen || filteredPhotos.length <= 1) return;
		const prevIdx = lightboxIndex <= 0 ? filteredPhotos.length - 1 : lightboxIndex - 1;
		const nextIdx = lightboxIndex >= filteredPhotos.length - 1 ? 0 : lightboxIndex + 1;
		for (const idx of [prevIdx, nextIdx]) {
			const img = new Image();
			img.src = resolveAssetPath(filteredPhotos[idx].src) ?? '';
		}
	});

	function setCategory(cat: string) {
		activeCategory = cat;
		lightboxIndex = 0;
		if (typeof window === 'undefined') return;
		// SvelteKit's own replaceState — the native one conflicts with its router
		const url = new URL(window.location.href);
		if (cat === 'All') url.searchParams.delete('day');
		else url.searchParams.set('day', cat);
		replaceState(url.pathname + url.search, {});
	}

	/**
	 * A uniform thumbnail grid flattens 65 images into wallpaper. Portraits keep
	 * their shape, and one frame per day is given a wide span, so the gallery
	 * reads with an editorial rhythm instead of a single repeating tile.
	 */
	function spanClass(photo: Photo, index: number): string {
		const portrait = photo.width && photo.height ? photo.height > photo.width : false;
		if (portrait) return 'is-portrait';
		return index % 7 === 0 ? 'is-wide' : '';
	}

	/** Grouped by day, so the scroll always has a date attached. */
	let groupedPhotos = $derived.by(() => {
		const groups: { category: string; photos: { photo: Photo; index: number }[] }[] = [];
		filteredPhotos.forEach((photo, index) => {
			const last = groups.at(-1);
			if (last && last.category === photo.category) last.photos.push({ photo, index });
			else groups.push({ category: photo.category, photos: [{ photo, index }] });
		});
		return groups;
	});
</script>

<!-- Category filter pills (toggle buttons — not a tablist, which would require
     full tab keyboard semantics) -->
<div class="photo-filters" role="group" aria-label="Filter photos by day">
	<Button
		pill
		size="sm"
		color={activeCategory === 'All' ? 'secondary' : 'alternative'}
		outline={activeCategory === 'All'}
		aria-pressed={activeCategory === 'All'}
		onclick={() => setCategory('All')}
	>
		All <span class="ml-1 text-xs font-semibold">{categoryCounts.All}</span>
	</Button>
	{#each categories as cat (cat)}
		{@const count = categoryCounts[cat] ?? 0}
		{#if count > 0}
			<Button
				pill
				size="sm"
				color={activeCategory === cat ? 'secondary' : 'alternative'}
				outline={activeCategory === cat}
				aria-pressed={activeCategory === cat}
				onclick={() => setCategory(cat)}
			>
				{cat} <span class="ml-1 text-xs font-semibold">{count}</span>
			</Button>
		{/if}
	{/each}
</div>

<!-- Gallery -->
{#if filteredPhotos.length > 0}
	{#each groupedPhotos as group (group.category)}
		<section class="photo-day" aria-label={group.category}>
			<h2 class="photo-day__header">
				{group.category}
				<span class="photo-day__count">{group.photos.length}</span>
			</h2>
			<div class="photo-grid">
				{#each group.photos as { photo, index } (photo.id)}
					{@const delay = Math.min((index % 8) * 40, 320)}
					<div
						class="photo-cell animate-section-reveal {spanClass(photo, index)}"
						use:reveal
						style="transition-delay: {delay}ms"
					>
						<button
							type="button"
							class="photo-card"
							onclick={() => openLightbox(index)}
							bind:this={gridButtonRefs[index]}
							aria-label="View {photo.alt}"
						>
							<img
								src={resolveAssetPath(photo.thumbnail ?? photo.src)}
								alt={photo.alt}
								width={photo.width}
								height={photo.height}
								loading="lazy"
								decoding="async"
								class="photo-card-image"
							/>
							{#if photo.caption}
								<span class="photo-card-overlay">{photo.caption}</span>
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</section>
	{/each}
{:else}
	<div class="empty-state">
		<div class="empty-state__icon">
			<ImageOutline class="size-icon-md" />
		</div>
		<Heading tag="h4" class="body-text-strong text-lg font-medium"
			>No photos in this category yet</Heading
		>
		<P class="body-text-muted mx-auto max-w-xs text-sm">
			Photos will be added here soon. Check back later!
		</P>
	</div>
{/if}

{#if lightboxOpen && currentPhoto}
	<PhotoLightbox
		photo={currentPhoto}
		index={lightboxIndex}
		total={filteredPhotos.length}
		onclose={closeLightbox}
		onprevious={prevPhoto}
		onnext={nextPhoto}
	/>
{/if}

<style>
	.photo-filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		margin-bottom: var(--space-lg);
	}

	/* Day markers: the grouping already existed; making the label sticky keeps a
	   date attached to wherever the scroll happens to be. */
	.photo-day + .photo-day {
		margin-top: var(--space-xl);
	}

	.photo-day__header {
		position: sticky;
		top: var(--scroll-offset);
		z-index: var(--z-sticky);
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
		padding: var(--space-3xs) var(--space-sm);
		border-radius: var(--radius-full);
		background-color: var(--bg-glass);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		border: 1px solid var(--border-subtle);
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.photo-day__count {
		font-variant-numeric: tabular-nums;
		font-weight: var(--font-weight-regular);
		color: var(--text-subtle);
	}

	/* Mixed-span grid */
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
		gap: var(--space-2xs);
	}

	.photo-cell {
		min-width: 0;
		content-visibility: auto;
		contain-intrinsic-size: auto 18rem;
	}

	@media (min-width: 768px) {
		.photo-cell.is-wide {
			grid-column: span 2;
		}
	}

	/* Card — no border, no radius, no shadow: the photograph is the object */
	.photo-card {
		position: relative;
		display: block;
		width: 100%;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		border: none;
		background: var(--bg-sunken);
		text-align: left;
		aspect-ratio: 4 / 3;
	}

	.is-portrait .photo-card {
		aspect-ratio: 3 / 4;
	}

	.is-wide .photo-card {
		aspect-ratio: 16 / 9;
	}

	.photo-card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-slow);
	}

	.photo-card:hover .photo-card-image,
	.photo-card:focus-visible .photo-card-image {
		transform: scale(1.04);
	}

	.photo-card-overlay {
		position: absolute;
		inset: auto 0 0 0;
		background: linear-gradient(transparent, var(--bg-scrim));
		padding: var(--space-xl) var(--space-sm) var(--space-sm);
		color: #ffffff;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		opacity: 0;
		transition: opacity var(--transition-base);
	}

	.photo-card:hover .photo-card-overlay,
	.photo-card:focus-visible .photo-card-overlay {
		opacity: 1;
	}
</style>
