<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import type { Photo, PhotoCategory } from '$lib/types/photo';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { portal } from '$lib/utils/portal';
	import { reveal } from '$lib/utils/reveal';
	import { Heading, P, Button } from 'flowbite-svelte';
	import {
		CloseOutline,
		ChevronLeftOutline,
		ChevronRightOutline,
		ImageOutline
	} from 'flowbite-svelte-icons';

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
	let lightboxEl: HTMLDivElement | undefined = $state();

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

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		else if (e.key === 'ArrowLeft') prevPhoto();
		else if (e.key === 'ArrowRight') nextPhoto();
		else if (e.key === 'Tab') trapFocus(e);
	}

	/** Keep Tab focus cycling inside the modal while it is open */
	function trapFocus(e: KeyboardEvent) {
		if (!lightboxEl) return;
		const focusables = Array.from(
			lightboxEl.querySelectorAll<HTMLElement>('button, a[href]')
		).filter((el) => !el.hasAttribute('disabled'));
		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;
		const inside = active instanceof HTMLElement && lightboxEl.contains(active);

		if (e.shiftKey && (!inside || active === first)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && (!inside || active === last)) {
			e.preventDefault();
			first.focus();
		}
	}

	// Touch swipe support for mobile lightbox navigation.
	// Plain variables — never rendered, so reactivity would be wasted.
	let touchStartX = 0;
	let touchStartY = 0;
	let isSwiping = false;

	function handleTouchStart(e: TouchEvent) {
		if (!lightboxOpen || filteredPhotos.length <= 1) return;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		isSwiping = true;
	}

	function handleTouchEnd(e: TouchEvent) {
		if (!isSwiping) return;
		isSwiping = false;
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;

		// Only trigger if horizontal swipe is dominant and exceeds threshold
		if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
			if (deltaX < 0) nextPhoto();
			else prevPhoto();
		}
	}

	// Body scroll lock + focus trap
	$effect(() => {
		if (lightboxOpen) {
			document.body.style.overflow = 'hidden';
			requestAnimationFrame(() => lightboxEl?.focus());
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

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

<svelte:window onkeydown={handleKeydown} />

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
		All <span class="ml-1 text-xs opacity-60">{categoryCounts.All}</span>
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
				{cat} <span class="ml-1 text-xs opacity-60">{count}</span>
			</Button>
		{/if}
	{/each}
</div>

<!-- Gallery -->
{#if filteredPhotos.length > 0}
	{#each groupedPhotos as group (group.category)}
		<section class="photo-day" aria-label={group.category}>
			<h3 class="photo-day__header">
				{group.category}
				<span class="photo-day__count">{group.photos.length}</span>
			</h3>
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

<!-- Lightbox — rendered via portal to body to escape all stacking contexts -->
{#if lightboxOpen && currentPhoto}
	{@const photoSrc = resolveAssetPath(currentPhoto.src)}
	<div
		bind:this={lightboxEl}
		use:portal
		class="lightbox"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label="Photo viewer: {currentPhoto.alt}"
	>
		<!-- Backdrop -->
		<div class="lightbox-backdrop" onclick={closeLightbox} role="presentation"></div>

		<!-- Top bar with close + counter -->
		<div class="lightbox-topbar">
			<span class="lightbox-counter" aria-live="polite">
				{lightboxIndex + 1} / {filteredPhotos.length}
			</span>
			<button
				type="button"
				class="lightbox-btn lightbox-close"
				onclick={closeLightbox}
				aria-label="Close photo viewer"
			>
				<CloseOutline class="h-5 w-5" />
			</button>
		</div>

		<!-- Navigation + image area -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="lightbox-stage" ontouchstart={handleTouchStart} ontouchend={handleTouchEnd}>
			{#if filteredPhotos.length > 1}
				<button
					type="button"
					class="lightbox-btn lightbox-nav lightbox-nav-prev"
					onclick={prevPhoto}
					aria-label="Previous photo"
				>
					<ChevronLeftOutline class="h-6 w-6" />
				</button>
			{/if}

			<div class="lightbox-image-container">
				{#key currentPhoto.id}
					<img src={photoSrc} alt={currentPhoto.alt} class="lightbox-image" />
				{/key}
			</div>

			{#if filteredPhotos.length > 1}
				<button
					type="button"
					class="lightbox-btn lightbox-nav lightbox-nav-next"
					onclick={nextPhoto}
					aria-label="Next photo"
				>
					<ChevronRightOutline class="h-6 w-6" />
				</button>
			{/if}
		</div>

		<!-- Bottom bar with caption -->
		{#if currentPhoto.caption || currentPhoto.photographer || currentPhoto.category}
			<div class="lightbox-bottombar">
				<span class="lightbox-category">{currentPhoto.category}</span>
				{#if currentPhoto.caption}
					<span class="lightbox-caption">{currentPhoto.caption}</span>
				{/if}
				{#if currentPhoto.photographer}
					<span class="lightbox-credit">
						{#if currentPhoto.photographerUrl}
							Photo: <a
								href={currentPhoto.photographerUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="lightbox-credit-link">{currentPhoto.photographer}</a
							>
						{:else}
							Photo: {currentPhoto.photographer}
						{/if}
					</span>
				{/if}
			</div>
		{/if}
	</div>
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

	/* ========== Lightbox (global because portaled to body) ========== */
	:global(.lightbox) {
		position: fixed;
		inset: 0;
		z-index: var(--z-lightbox);
		display: flex;
		flex-direction: column;
		animation: lightbox-in 250ms var(--ease-standard) both;
	}

	@keyframes -global-lightbox-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	:global(.lightbox-backdrop) {
		position: absolute;
		inset: 0;
		background: var(--bg-scrim-strong);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	:global(.lightbox-btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-full);
		transition:
			background var(--transition-micro),
			color var(--transition-micro);
	}

	:global(.lightbox-btn:hover) {
		background: rgba(255, 255, 255, 0.18);
		color: white;
	}

	:global(.lightbox-topbar) {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
	}

	:global(.lightbox-counter) {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.5);
		font-variant-numeric: tabular-nums;
	}

	:global(.lightbox-close) {
		width: 2.5rem;
		height: 2.5rem;
	}

	:global(.lightbox-stage) {
		position: relative;
		z-index: 2;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: 0 var(--space-md);
		min-height: 0;
	}

	:global(.lightbox-nav) {
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		:global(.lightbox-nav) {
			width: 2.25rem;
			height: 2.25rem;
			opacity: 0.6;
		}
		:global(.lightbox-stage) {
			padding: 0 var(--space-xs);
		}
	}

	:global(.lightbox-image-container) {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		max-height: 100%;
	}

	:global(.lightbox-image) {
		max-width: 100%;
		max-height: calc(100vh - 10rem);
		object-fit: contain;
		border-radius: var(--radius-md);
		box-shadow: 0 25px 80px -15px rgba(0, 0, 0, 0.6);
	}

	:global(.lightbox-bottombar) {
		position: relative;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
	}

	:global(.lightbox-category) {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-secondary-400);
	}

	:global(.lightbox-caption) {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.7);
	}

	:global(.lightbox-credit) {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.4);
	}

	:global(.lightbox-credit-link) {
		color: rgba(255, 255, 255, 0.6);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--transition-micro);
	}

	:global(.lightbox-credit-link:hover) {
		color: white;
	}
</style>
