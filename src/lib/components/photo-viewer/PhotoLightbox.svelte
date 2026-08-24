<script lang="ts">
	import type { Photo } from '$lib/types/photo';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { portal } from '$lib/utils/portal';
	import { ChevronLeftOutline, ChevronRightOutline, CloseOutline } from 'flowbite-svelte-icons';

	interface Props {
		photo: Photo;
		index: number;
		total: number;
		onclose: () => void;
		onprevious: () => void;
		onnext: () => void;
	}

	let { photo, index, total, onclose, onprevious, onnext }: Props = $props();
	let lightboxEl: HTMLDivElement;
	let closeButtonEl: HTMLButtonElement;
	let touchStartX = 0;
	let touchStartY = 0;
	let isSwiping = false;

	const photoSrc = $derived(resolveAssetPath(photo.src));
	const hasMultiple = $derived(total > 1);

	// Tracked per photo id so navigating away from a broken image clears the
	// message, and coming back to it shows it again without a re-request loop.
	let failedPhotoId = $state<string | null>(null);
	const imageFailed = $derived(failedPhotoId === photo.id);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
		else if (event.key === 'ArrowLeft' && hasMultiple) onprevious();
		else if (event.key === 'ArrowRight' && hasMultiple) onnext();
		else if (event.key === 'Tab') trapFocus(event);
	}

	function trapFocus(event: KeyboardEvent) {
		const focusables = Array.from(
			lightboxEl.querySelectorAll<HTMLElement>(
				'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"])'
			)
		).filter((element) => !element.hasAttribute('hidden'));
		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;
		const inside = active instanceof HTMLElement && lightboxEl.contains(active);

		if (event.shiftKey && (!inside || active === lightboxEl || active === first)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (!inside || active === lightboxEl || active === last)) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleTouchStart(event: TouchEvent) {
		if (!hasMultiple) return;
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
		isSwiping = true;
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!isSwiping) return;
		isSwiping = false;
		const deltaX = event.changedTouches[0].clientX - touchStartX;
		const deltaY = event.changedTouches[0].clientY - touchStartY;
		if (Math.abs(deltaX) <= 50 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.5) return;
		if (deltaX < 0) onnext();
		else onprevious();
	}

	$effect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		requestAnimationFrame(() => closeButtonEl?.focus());
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	bind:this={lightboxEl}
	use:portal
	class="lightbox"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	aria-label="Photo viewer: {photo.alt}"
>
	<button
		type="button"
		class="lightbox-backdrop"
		tabindex="-1"
		onclick={onclose}
		aria-label="Close photo viewer"
	></button>

	<div class="lightbox-topbar">
		<span class="lightbox-counter" aria-live="polite">{index + 1} / {total}</span>
		<button
			bind:this={closeButtonEl}
			type="button"
			class="lightbox-btn lightbox-close"
			onclick={onclose}
			aria-label="Close photo viewer"
		>
			<CloseOutline class="h-5 w-5" />
		</button>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="lightbox-stage" ontouchstart={handleTouchStart} ontouchend={handleTouchEnd}>
		{#if hasMultiple}
			<button
				type="button"
				class="lightbox-btn lightbox-nav lightbox-nav-prev"
				onclick={onprevious}
				aria-label="Previous photo"
			>
				<ChevronLeftOutline class="h-6 w-6" />
			</button>
		{/if}

		<div class="lightbox-image-container">
			{#key photo.id}
				{#if imageFailed}
					<div class="lightbox-image-failed" role="status">
						<p>This photo could not be loaded.</p>
						{#if hasMultiple}
							<p class="lightbox-image-failed__hint">The arrows still move through the rest.</p>
						{/if}
					</div>
				{:else}
					<img
						src={photoSrc}
						alt={photo.alt}
						width={photo.width}
						height={photo.height}
						decoding="async"
						onerror={() => (failedPhotoId = photo.id)}
						class="lightbox-image"
					/>
				{/if}
			{/key}
		</div>

		{#if hasMultiple}
			<button
				type="button"
				class="lightbox-btn lightbox-nav lightbox-nav-next"
				onclick={onnext}
				aria-label="Next photo"
			>
				<ChevronRightOutline class="h-6 w-6" />
			</button>
		{/if}
	</div>

	{#if photo.caption || photo.photographer || photo.category}
		<div class="lightbox-bottombar">
			<span class="lightbox-category">{photo.category}</span>
			{#if photo.caption}
				<span class="lightbox-caption">{photo.caption}</span>
			{/if}
			{#if photo.photographer}
				<span class="lightbox-credit">
					{#if photo.photographerUrl}
						Photo: <a
							href={photo.photographerUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="lightbox-credit-link">{photo.photographer}</a
						>
					{:else}
						Photo: {photo.photographer}
					{/if}
				</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: var(--z-lightbox);
		display: flex;
		flex-direction: column;
		animation: lightbox-in 250ms var(--ease-standard) both;
	}

	@keyframes lightbox-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background: var(--bg-scrim-strong);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.lightbox-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.88);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-full);
		transition:
			background var(--transition-micro),
			color var(--transition-micro);
	}

	.lightbox-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.lightbox-topbar {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
	}

	.lightbox-counter {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.76);
		font-variant-numeric: tabular-nums;
	}

	.lightbox-close {
		width: 2.75rem;
		height: 2.75rem;
	}

	.lightbox-stage {
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

	.lightbox-nav {
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
	}

	.lightbox-image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		max-height: 100%;
	}

	.lightbox-image {
		max-width: 100%;
		max-height: calc(100vh - 10rem);
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: var(--radius-md);
		box-shadow: 0 25px 80px -15px rgba(0, 0, 0, 0.6);
	}

	/* Stands where the photo would: same footprint class of treatment as the
	   site's other empty states, adapted to the lightbox's dark stage. */
	.lightbox-image-failed {
		display: grid;
		gap: var(--space-2xs);
		place-content: center;
		min-width: min(24rem, 80vw);
		min-height: 16rem;
		border: 1px dashed rgba(255, 255, 255, 0.35);
		border-radius: var(--radius-md);
		text-align: center;
		padding: var(--space-lg);
		color: var(--color-gray-100);
		font-weight: var(--font-weight-medium);
	}

	.lightbox-image-failed__hint {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-regular);
		color: var(--color-gray-400);
	}

	.lightbox-bottombar {
		position: relative;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
	}

	.lightbox-category {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-secondary-300);
	}

	.lightbox-caption {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.86);
	}

	.lightbox-credit {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.72);
	}

	.lightbox-credit-link {
		color: rgba(255, 255, 255, 0.86);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color var(--transition-micro);
	}

	.lightbox-credit-link:hover {
		color: white;
	}

	@media (max-width: 640px) {
		.lightbox-stage {
			gap: var(--space-3xs);
			padding: 0 var(--space-3xs);
		}

		.lightbox-nav {
			width: 2.75rem;
			height: 2.75rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lightbox {
			animation: none;
		}

		.lightbox-backdrop {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	}
</style>
