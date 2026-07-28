<script lang="ts">
	import { tick } from 'svelte';
	import type { ResolvedReference } from '$lib/reader/types';
	import { resolveAppPath } from '$lib/utils/paths';

	interface Props {
		/** The prose container to delegate click events from. */
		container: HTMLElement | null;
		/** slug → resolved reference map. */
		resolvedRefs: Record<string, ResolvedReference>;
	}

	let { container, resolvedRefs }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let activeRef = $state<ResolvedReference | null>(null);
	let locator = $state<string | null>(null);

	function clearState() {
		activeRef = null;
		locator = null;
	}

	function close() {
		dialogEl?.close();
		// Cleared here as well as in `onclose`: Escape dismisses the dialog
		// without routing through this function, so both paths need covering.
		clearState();
	}

	async function onProseClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!target) return;
		const sup = target.closest('sup[data-footnote-ref]') as HTMLElement | null;
		if (!sup) return;
		const slug = sup.dataset.refSlug;
		if (!slug) return; // Unresolved footnote — let default behaviour run.

		const ref = resolvedRefs[slug];
		if (!ref) return;

		// Prevent the jump-to-footnote default; the backref link still works.
		event.preventDefault();

		activeRef = ref;
		locator = sup.dataset.refLocator ?? null;

		// Render the contents before opening, so the UA has something focusable
		// to move to and the dialog never paints an empty frame.
		await tick();

		// showModal() handles what a hand-rolled dialog has to reimplement:
		// moves focus inside, traps it, makes the rest of the page inert,
		// closes on Escape, and restores focus to the <sup> on close.
		dialogEl?.showModal();
	}

	/** Close when the click lands on the backdrop rather than the panel. */
	function onDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}

	$effect(() => {
		if (!container) return;
		container.addEventListener('click', onProseClick);
		return () => {
			container.removeEventListener('click', onProseClick);
		};
	});

	let bibLink = $derived(
		activeRef ? `${resolveAppPath('/references')}#ref-${activeRef.slug}` : '#'
	);
</script>

<dialog
	bind:this={dialogEl}
	class="footnote-popover-panel"
	aria-label="Reference"
	onclick={onDialogClick}
	onclose={clearState}
>
	{#if activeRef}
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
	{/if}
</dialog>
