<script lang="ts">
	import ReaderPopover from './ReaderPopover.svelte';

	interface Props {
		/** The prose container to delegate click events from. */
		container: HTMLElement | null;
	}

	let { container }: Props = $props();

	/** Reference-list entry markup, lifted straight out of the rendered page. */
	let entryHtml = $state('');
	let targetId = $state('');

	function clearState() {
		entryHtml = '';
		targetId = '';
	}

	function claim(target: HTMLElement): boolean {
		const link = target.closest<HTMLElement>('a[data-cite]');
		if (!link) return false;

		const slug = link.dataset.cite;
		if (!slug) return false;
		const entry = document.getElementById(`bib-${slug}`);
		// Without the entry on the page the href still works — leave it alone.
		if (!entry) return false;

		entryHtml = entry.innerHTML;
		targetId = `bib-${slug}`;
		return true;
	}

	/** Follow through to the reference list, for readers who want the full list. */
	function jumpToEntry(close: () => void) {
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
</script>

<ReaderPopover {container} {claim} active={entryHtml !== ''} onclear={clearState}>
	{#snippet body()}
		<p class="footnote-popover-panel__full">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- lifted from this page's own prerendered reference list -->
			{@html entryHtml}
		</p>
	{/snippet}
	{#snippet footer(close)}
		<button
			type="button"
			class="footnote-popover-panel__link link-secondary"
			onclick={() => jumpToEntry(close)}
		>
			Show in the reference list →
		</button>
	{/snippet}
</ReaderPopover>
