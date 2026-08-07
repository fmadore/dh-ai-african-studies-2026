<script lang="ts">
	import { tick } from 'svelte';

	interface Props {
		/** The prose container to delegate click events from. */
		container: HTMLElement | null;
	}

	let { container }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	/** Reference-list entry markup, lifted straight out of the rendered page. */
	let entryHtml = $state('');
	let targetId = $state('');

	function clearState() {
		entryHtml = '';
		targetId = '';
	}

	function close() {
		dialogEl?.close();
		// Escape dismisses the dialog without routing through here, so `onclose`
		// clears state as well.
		clearState();
	}

	async function onProseClick(event: MouseEvent) {
		// Let modified clicks and middle-clicks behave like ordinary link clicks.
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const link = (event.target as HTMLElement | null)?.closest<HTMLElement>('a[data-cite]');
		if (!link) return;

		const slug = link.dataset.cite;
		if (!slug) return;
		const entry = document.getElementById(`bib-${slug}`);
		// Without the entry on the page the href still works — leave it alone.
		if (!entry) return;

		event.preventDefault();
		entryHtml = entry.innerHTML;
		targetId = `bib-${slug}`;

		// Render before opening so focus has somewhere to land.
		await tick();
		dialogEl?.showModal();
	}

	/** Close when the click lands on the backdrop rather than the panel. */
	function onDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}

	/** Follow through to the reference list, for readers who want the full list. */
	function jumpToEntry() {
		const id = targetId;
		close();
		// Set the fragment rather than calling scrollIntoView, so this behaves
		// exactly like clicking the citation link with JavaScript off: the entry
		// becomes `:target`, which is what drives the highlight.
		//
		// Order matters and is safe: `close()` drops the `open` attribute
		// synchronously, so the `overflow: hidden` the open modal puts on the
		// document is gone by the time the browser runs the queued scroll-to-
		// fragment task. Doing this in a rAF callback instead would strand the
		// jump whenever frames are not being produced, as in a background tab.
		window.location.hash = id;
	}

	$effect(() => {
		if (!container) return;
		container.addEventListener('click', onProseClick);
		return () => {
			container.removeEventListener('click', onProseClick);
		};
	});
</script>

<dialog
	bind:this={dialogEl}
	class="footnote-popover-panel"
	aria-label="Reference"
	onclick={onDialogClick}
	onclose={clearState}
>
	{#if entryHtml}
		<button
			type="button"
			class="footnote-popover-panel__close"
			aria-label="Close reference"
			onclick={close}
		>
			×
		</button>
		<p class="footnote-popover-panel__full">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- lifted from this page's own prerendered reference list -->
			{@html entryHtml}
		</p>
		<button type="button" class="footnote-popover-panel__link link-secondary" onclick={jumpToEntry}>
			Show in the reference list →
		</button>
	{/if}
</dialog>
