<script lang="ts">
	import type { Photo, PhotoCategory } from '$lib/types/photo';
	import { resolveAssetPath } from '$lib/utils/paths';
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

	// Touch swipe support for mobile lightbox navigation
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let isSwiping = $state(false);

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
<div class="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Photo categories">
	<Button
		pill
		size="sm"
		color={activeCategory === 'All' ? 'secondary' : 'alternative'}
		outline={activeCategory === 'All'}
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
				onclick={() => setCategory(cat)}
			>
				{cat} <span class="ml-1 text-xs opacity-60">{count}</span>
			</Button>
		{/if}
	{/each}
</div>

<!-- Gallery grid -->
{#if filteredPhotos.length > 0}
	<div class="photo-grid" role="tabpanel">
		{#each filteredPhotos as photo, i (photo.id)}
			{@const delay = Math.min(i * 40, 400)}
			<div class="animate-section-reveal" use:reveal style="transition-delay: {delay}ms">
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
	<div
		class="padding-block-xl card-surface surface-padding border border-dashed border-gray-300 text-center dark:border-gray-700"
	>
		<div class="stack-sm flex flex-col items-center">
			<ImageOutline class="text-surface-400 dark:text-surface-dark-overlay h-12 w-12" />
			<Heading tag="h4" class="body-text-strong text-lg font-medium"
				>No photos in this category yet</Heading
			>
			<P class="body-text-muted mx-auto max-w-xs text-sm">
				Photos will be added here soon. Check back later!
			</P>
		</div>
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
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
		}}
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
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
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
		transition: color var(--transition-fast);
	}

	:global(.lightbox-credit-link:hover) {
		color: white;
	}
</style>
