<script lang="ts">
	import type { ResolvedReference } from '#lib/reader/types';
	import { resolveAppPath } from '#lib/utils/paths';
	import ReaderPopover from './ReaderPopover.svelte';

	interface Props {
		/** The prose container to delegate click events from. */
		container: HTMLElement | null;
		/** slug → resolved reference map. */
		resolvedRefs: Record<string, ResolvedReference>;
	}

	let { container, resolvedRefs }: Props = $props();

	let activeRef = $state<ResolvedReference | null>(null);
	let locator = $state<string | null>(null);

	function clearState() {
		activeRef = null;
		locator = null;
	}

	function claim(target: HTMLElement): boolean {
		const sup = target.closest('sup[data-footnote-ref]') as HTMLElement | null;
		if (!sup) return false;
		const slug = sup.dataset.refSlug;
		if (!slug) return false; // Unresolved footnote — let default behaviour run.

		const ref = resolvedRefs[slug];
		if (!ref) return false;

		// Claiming prevents the jump-to-footnote default; the backref link still works.
		activeRef = ref;
		locator = sup.dataset.refLocator ?? null;
		return true;
	}

	let bibLink = $derived(
		activeRef
			? `${resolveAppPath('/references')}?q=${encodeURIComponent(activeRef.csl.title || activeRef.refId)}`
			: '#'
	);
</script>

<ReaderPopover {container} {claim} active={activeRef !== null} onclear={clearState}>
	{#snippet body()}
		{#if activeRef}
			<p class="footnote-popover-panel__short">
				{activeRef.short}{#if locator}, {locator}{/if}
			</p>
			<p class="footnote-popover-panel__full">{activeRef.full}</p>
		{/if}
	{/snippet}
	{#snippet footer(close)}
		<a class="footnote-popover-panel__link link-secondary" href={bibLink} onclick={close}
			>View in bibliography →</a
		>
	{/snippet}
</ReaderPopover>
