<script lang="ts">
	import type { ResolvedReference } from '$lib/reader/types';
	import { resolveAppPath } from '$lib/utils/paths';

	interface Props {
		/** The prose container to delegate click/keyboard events from. */
		container: HTMLElement | null;
		/** slug → resolved reference map. */
		resolvedRefs: Record<string, ResolvedReference>;
	}

	let { container, resolvedRefs }: Props = $props();

	let open = $state(false);
	let activeRef = $state<ResolvedReference | null>(null);
	let locator = $state<string | null>(null);
	let popoverEl = $state<HTMLDivElement | null>(null);
	let triggerEl: HTMLElement | null = null;

	function close() {
		open = false;
		activeRef = null;
		locator = null;
		if (triggerEl) {
			// Return focus to the originating element for keyboard users.
			triggerEl.focus?.();
			triggerEl = null;
		}
	}

	function onProseClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!target) return;
		const sup = target.closest('sup[data-footnote-ref]') as HTMLElement | null;
		if (!sup) return;
		const slug = sup.dataset.refSlug;
		if (!slug) return; // Unresolved footnote — let default behaviour run.

		const ref = resolvedRefs[slug];
		if (!ref) return;

		// Prevent default jump-to-footnote; user can still use the backref link to jump.
		event.preventDefault();

		triggerEl = sup;
		activeRef = ref;
		locator = sup.dataset.refLocator ?? null;
		open = true;
	}

	function onGlobalClick(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node | null;
		if (!target) return;
		if (popoverEl && popoverEl.contains(target)) return;
		if (triggerEl && triggerEl.contains(target)) return;
		close();
	}

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	$effect(() => {
		if (!container) return;
		container.addEventListener('click', onProseClick);
		return () => {
			container.removeEventListener('click', onProseClick);
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('click', onGlobalClick);
		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('click', onGlobalClick);
		};
	});

	let bibLink = $derived(
		activeRef ? `${resolveAppPath('/references')}#ref-${activeRef.slug}` : '#'
	);
</script>

{#if open && activeRef}
	<!-- Scrim + centered dialog for all viewport sizes -->
	<div
		class="footnote-popover-scrim"
		onclick={close}
		onkeydown={(e) => {
			if (e.key === 'Escape') close();
		}}
		role="presentation"
	></div>
	<div
		bind:this={popoverEl}
		class="footnote-popover-panel footnote-popover-panel--centered"
		role="dialog"
		aria-modal="true"
		aria-label="Reference"
	>
		<button
			type="button"
			class="footnote-popover-panel__close"
			aria-label="Close reference"
			onclick={close}
		>
			×
		</button>
		<p class="footnote-popover-panel__short">
			{activeRef.short}{#if locator}, {locator}{/if}
		</p>
		<p class="footnote-popover-panel__full">{activeRef.full}</p>
		<a class="footnote-popover-panel__link link-secondary" href={bibLink} onclick={close}
			>View in bibliography →</a
		>
	</div>
{/if}

<style>
	.footnote-popover-panel--centered {
		position: fixed;
		inset-block-start: 50%;
		inset-inline-start: 50%;
		transform: translate(-50%, -50%);
		width: min(32rem, calc(100vw - 2rem));
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
		z-index: var(--z-popover);
	}
	.footnote-popover-scrim {
		position: fixed;
		inset: 0;
		background: var(--bg-scrim);
		z-index: calc(var(--z-popover) - 1);
	}
	.footnote-popover-panel__close {
		position: absolute;
		inset-block-start: var(--space-xs);
		inset-inline-end: var(--space-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: 0;
		background: transparent;
		color: var(--text-muted);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		border-radius: var(--radius-full);
		transition:
			background var(--transition-micro),
			color var(--transition-micro);
	}
	.footnote-popover-panel__close:hover {
		background: var(--bg-sunken);
		color: var(--text-primary);
	}
</style>
