<script lang="ts">
	import type { ResolvedReference } from '#lib/reader/types';
	import { copyToClipboard } from '#lib/utils/clipboard';
	import FootnotePopover from './FootnotePopover.svelte';
	import CitationPopover from './CitationPopover.svelte';

	interface Props {
		/** Server-rendered HTML of the position paper body. */
		html: string;
		/** slug → resolved reference map for footnote popovers. */
		resolvedRefs: Record<string, ResolvedReference>;
		/** Expose the root element for the progress bar + TOC observer. */
		onRootMount?: (_el: HTMLElement) => void;
	}

	let { html, resolvedRefs, onRootMount }: Props = $props();

	let proseEl = $state<HTMLElement | null>(null);

	$effect(() => {
		if (proseEl && onRootMount) onRootMount(proseEl);
	});

	// Inject anchor-copy buttons beside h2/h3 headings after hydration. The
	// button sits next to the heading, in a wrapper, not inside it: inside, it
	// became part of the heading's accessible name ("Title Copy link to
	// section: Title"). The wrapper is the hover/positioning context instead.
	$effect(() => {
		if (!proseEl) return;
		const headings = Array.from(proseEl.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
		const cleanups: Array<() => void> = [];

		for (const heading of headings) {
			// Avoid double-insertion on HMR / re-renders.
			if (heading.parentElement?.classList.contains('reader-heading-anchor')) continue;

			const wrapper = document.createElement('div');
			wrapper.className = 'reader-heading-anchor';

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'anchor-copy-button';
			btn.setAttribute('aria-label', `Copy link to section: ${heading.textContent ?? ''}`);
			btn.innerHTML = '<span aria-hidden="true">#</span>';

			let resetTimer: ReturnType<typeof setTimeout> | undefined;
			const handler = async () => {
				const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
				if (!(await copyToClipboard(url))) return;
				btn.dataset.copied = 'true';
				clearTimeout(resetTimer);
				resetTimer = setTimeout(() => {
					delete btn.dataset.copied;
				}, 1500);
			};

			btn.addEventListener('click', handler);
			heading.before(wrapper);
			wrapper.append(heading, btn);
			cleanups.push(() => {
				clearTimeout(resetTimer);
				btn.removeEventListener('click', handler);
				// Put the heading back where {@html} left it.
				if (wrapper.isConnected) wrapper.replaceWith(heading);
				else btn.remove();
			});
		}

		return () => cleanups.forEach((fn) => fn());
	});
</script>

<div bind:this={proseEl} class="reader-prose">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>

<FootnotePopover container={proseEl} {resolvedRefs} />
<CitationPopover container={proseEl} />
