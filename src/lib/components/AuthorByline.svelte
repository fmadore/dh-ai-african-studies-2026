<script lang="ts">
	import type { Author } from '$lib/utils/seo';

	interface Props {
		authors: readonly Author[];
		/** Footnote revealed by a marker set after the last author. */
		note?: string;
		/** Marker glyph — the usual footnote asterisk. */
		marker?: string;
	}

	let { authors, note, marker = '*' }: Props = $props();

	const noteId = $props.id();
	const nameList = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

	let names = $derived(nameList.format(authors.map((author) => author.name)));

	let root = $state<HTMLElement | null>(null);
	/** Pinned open by a click or a keypress; survives the pointer leaving. */
	let pinned = $state(false);
	/** Held open by the pointer. */
	let peeking = $state(false);
	let peekTimer: ReturnType<typeof setTimeout> | undefined;

	let open = $derived(pinned || peeking);

	function peek(on: boolean) {
		clearTimeout(peekTimer);
		if (on) {
			peeking = true;
			return;
		}
		// A grace period, so the pointer can cross the gap from the marker to
		// the panel without the note closing under it.
		peekTimer = setTimeout(() => (peeking = false), 150);
	}

	function dismiss() {
		clearTimeout(peekTimer);
		pinned = false;
		peeking = false;
	}

	// Only listen while pinned: a note left open closes on Escape, or on a
	// click that lands outside it, like any other disclosure.
	$effect(() => {
		if (!pinned) return;

		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') dismiss();
		}
		function onPointerDown(event: Event) {
			if (root && !root.contains(event.target as Node)) dismiss();
		}

		document.addEventListener('keydown', onKeydown);
		document.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('pointerdown', onPointerDown);
		};
	});

	$effect(() => () => clearTimeout(peekTimer));
</script>

<!-- prettier-ignore -->
<p class="author-byline" bind:this={root}>{names}{#if note}<button
		type="button"
		class="author-byline__marker"
		aria-expanded={open}
		aria-controls={noteId}
		onclick={() => (pinned = !pinned)}
		onmouseenter={() => peek(true)}
		onmouseleave={() => peek(false)}
	><span class="sr-only">Note on authorship</span><span aria-hidden="true">{marker}</span></button><span
		id={noteId}
		class="author-byline__note"
		role="note"
		hidden={!open}
		onmouseenter={() => peek(true)}
		onmouseleave={() => peek(false)}
	>{note}</span>{/if}</p>

<style>
	.author-byline {
		position: relative;
		margin: 0;
	}

	.author-byline__marker {
		display: inline-block;
		position: relative;
		padding-inline: 0.4rem;
		margin-inline-start: -0.15rem;
		vertical-align: super;
		font-size: 0.75em;
		line-height: 1;
		color: var(--text-link);
		background: none;
		border: 0;
		cursor: pointer;
		transition: color var(--transition-micro);
	}

	/* An asterisk cannot be a 44px target without wrecking the line, so the hit
	   area grows through a pseudo-element that takes up no space. */
	.author-byline__marker::after {
		content: '';
		position: absolute;
		width: 2.75rem;
		height: 2.75rem;
		inset-inline-start: 50%;
		inset-block-start: 50%;
		transform: translate(-50%, -50%);
	}

	.author-byline__marker:hover {
		color: var(--text-link-hover);
	}

	.author-byline__note {
		display: block;
		position: absolute;
		inset-inline-start: 0;
		inset-block-start: calc(100% + var(--space-2xs));
		z-index: var(--z-popover);
		/* Anchored to the byline rather than to the marker, which may sit
		   anywhere along a list this long — and can never overflow the page. */
		width: min(32rem, calc(100vw - 2rem));
		padding: var(--space-md);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-regular);
		line-height: var(--leading-relaxed);
		text-align: start;
		color: var(--text-secondary);
		background: var(--bg-raised);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
	}

	.author-byline__note[hidden] {
		display: none;
	}

	/* On paper there is nothing to hover, so the note simply follows the byline. */
	@media print {
		.author-byline__marker {
			color: inherit;
		}

		.author-byline__note,
		.author-byline__note[hidden] {
			display: block;
			position: static;
			width: auto;
			margin-block-start: var(--space-2xs);
			padding: 0;
			border: 0;
			box-shadow: none;
		}
	}
</style>
