<script lang="ts">
	import type { Photo, PhotoCategory } from '$lib/types/photo';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { reveal } from '$lib/utils/reveal';
	import { Heading, P } from 'flowbite-svelte';

	let {
		photos,
		categories
	}: {
		photos: Photo[];
		categories: PhotoCategory[];
	} = $props();

	let activeCategory = $state<string>('All');
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
	}

	/** Moves the node to document.body so it escapes overflow:hidden ancestors */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Category filter pills -->
<div class="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Photo categories">
	<button
		role="tab"
		aria-selected={activeCategory === 'All'}
		class="filter-pill {activeCategory === 'All' ? 'filter-pill-active' : ''}"
		onclick={() => setCategory('All')}
	>
		All <span class="filter-pill-count">{categoryCounts.All}</span>
	</button>
	{#each categories as cat (cat)}
		{@const count = categoryCounts[cat] ?? 0}
		{#if count > 0}
			<button
				role="tab"
				aria-selected={activeCategory === cat}
				class="filter-pill {activeCategory === cat ? 'filter-pill-active' : ''}"
				onclick={() => setCategory(cat)}
			>
				{cat} <span class="filter-pill-count">{count}</span>
			</button>
		{/if}
	{/each}
</div>

<!-- Gallery grid -->
{#if filteredPhotos.length > 0}
	<div class="photo-grid" role="tabpanel">
		{#each filteredPhotos as photo, i (photo.id)}
			{@const delay = Math.min(i * 40, 400)}
			<div
				class="animate-section-reveal"
				use:reveal
				style="transition-delay: {delay}ms"
			>
				<button
					type="button"
					class="photo-card card-surface glow-border group"
					onclick={() => openLightbox(i)}
					bind:this={gridButtonRefs[i]}
					aria-label="View {photo.alt}"
				>
					<div class="photo-card-image-wrapper">
						<img
							src={resolveAssetPath(photo.thumbnail ?? photo.src)}
							alt={photo.alt}
							loading="lazy"
							decoding="async"
							class="photo-card-image"
						/>
						{#if photo.caption}
							<div class="photo-card-overlay">
								<span class="text-sm font-medium text-white">{photo.caption}</span>
							</div>
						{/if}
					</div>
				</button>
			</div>
		{/each}
	</div>
{:else}
	<div class="text-center padding-block-xl card-surface surface-padding border border-dashed border-gray-300 dark:border-gray-700">
		<div class="stack-sm flex flex-col items-center">
			<svg class="w-12 h-12 text-surface-400 dark:text-surface-dark-overlay" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
			</svg>
			<Heading tag="h4" class="text-lg font-medium body-text-strong">No photos in this category yet</Heading>
			<P class="text-sm body-text-muted max-w-xs mx-auto">
				Photos will be added here soon. Check back later!
			</P>
		</div>
	</div>
{/if}

<!-- Lightbox — rendered via portal to body to escape all stacking contexts -->
{#if lightboxOpen && currentPhoto}
	{@const photoSrc = resolveAssetPath(currentPhoto.src)}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={lightboxEl}
		use:portal
		class="lightbox"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label="Photo viewer: {currentPhoto.alt}"
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
		}}
	>
		<!-- Backdrop -->
		<div
			class="lightbox-backdrop"
			onclick={closeLightbox}
			role="presentation"
		></div>

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
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Navigation + image area -->
		<div class="lightbox-stage">
			{#if filteredPhotos.length > 1}
				<button
					type="button"
					class="lightbox-btn lightbox-nav lightbox-nav-prev"
					onclick={prevPhoto}
					aria-label="Previous photo"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
			{/if}

			<div class="lightbox-image-container">
				{#key currentPhoto.id}
					<img
						src={photoSrc}
						alt={currentPhoto.alt}
						class="lightbox-image"
					/>
				{/key}
			</div>

			{#if filteredPhotos.length > 1}
				<button
					type="button"
					class="lightbox-btn lightbox-nav lightbox-nav-next"
					onclick={nextPhoto}
					aria-label="Next photo"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
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
					<span class="lightbox-credit">Photo: {currentPhoto.photographer}</span>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Filter pills */
	.filter-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		border: 1px solid var(--color-gray-200);
		background: var(--color-gray-50);
		color: var(--color-gray-700);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	:global(.dark) .filter-pill {
		border-color: var(--color-gray-700);
		background: var(--color-gray-800);
		color: var(--color-gray-300);
	}

	.filter-pill:hover {
		border-color: var(--color-secondary-300);
		color: var(--color-secondary-700);
	}

	:global(.dark) .filter-pill:hover {
		border-color: var(--color-secondary-600);
		color: var(--color-secondary-300);
	}

	.filter-pill-active {
		background: var(--color-secondary-100);
		border-color: var(--color-secondary-300);
		color: var(--color-secondary-800);
		box-shadow: var(--shadow-secondary);
	}

	:global(.dark) .filter-pill-active {
		background: rgba(13, 148, 136, 0.15);
		border-color: var(--color-secondary-600);
		color: var(--color-secondary-200);
		box-shadow: var(--shadow-dark-glow-secondary);
	}

	.filter-pill-count {
		font-size: var(--text-xs);
		opacity: 0.6;
	}

	/* Grid */
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: var(--space-lg);
	}

	/* Card */
	.photo-card {
		display: block;
		width: 100%;
		overflow: hidden;
		border-radius: var(--radius-lg);
		cursor: pointer;
		padding: 0;
		border: none;
		text-align: left;
	}

	.photo-card-image-wrapper {
		position: relative;
		overflow: hidden;
		aspect-ratio: 4 / 3;
	}

	.photo-card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-slow);
	}

	.photo-card:hover .photo-card-image,
	.photo-card:focus-visible .photo-card-image {
		transform: scale(1.05);
	}

	.photo-card-overlay {
		position: absolute;
		inset: auto 0 0 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		padding: var(--space-xl) var(--space-md) var(--space-md);
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
		z-index: 9999;
		display: flex;
		flex-direction: column;
		animation: lightbox-in 250ms var(--ease-out) both;
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
		background: rgba(0, 0, 0, 1);
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
		transition: background var(--transition-fast), color var(--transition-fast);
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
			display: none;
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
</style>
