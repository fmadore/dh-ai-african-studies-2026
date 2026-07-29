<script lang="ts">
	import type {
		PositionPaperMeta,
		ProcessedPaper,
		TocItem,
		ResolvedReference
	} from '$lib/reader/types';
	import { readerPrefs } from '$lib/utils/reader-preferences.svelte';
	import ReaderMasthead from './ReaderMasthead.svelte';
	import ReaderToolbar from './ReaderToolbar.svelte';
	import ReaderProse from './ReaderProse.svelte';
	import ReaderToc from './ReaderToc.svelte';
	import ReaderProgressBar from './ReaderProgressBar.svelte';

	interface Props {
		meta: PositionPaperMeta;
		paper: ProcessedPaper;
		canonicalUrl: string;
	}

	let { meta, paper, canonicalUrl }: Props = $props();

	let proseRoot = $state<HTMLElement | null>(null);

	// Hydrate preferences once on mount. Persistence is handled by the store's
	// setters, so there is nothing to write back here.
	$effect(() => {
		readerPrefs.hydrate();
	});

	// The preference attributes live on <html> rather than on the shell so the
	// inline boot script can set them before the first paint (see
	// readerPrefsBootScript). Keep them in step once Svelte takes over, and
	// remove them when leaving the reader.
	$effect(() => {
		const root = document.documentElement;
		root.setAttribute('data-reader-font', readerPrefs.fontFamily);
		root.setAttribute('data-reader-size', String(readerPrefs.fontSize));
		return () => {
			root.removeAttribute('data-reader-font');
			root.removeAttribute('data-reader-size');
		};
	});

	let toc: TocItem[] = $derived(paper.toc);
	let resolvedRefs: Record<string, ResolvedReference> = $derived(paper.resolvedRefs);
</script>

<ReaderProgressBar target={proseRoot} />

<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<!-- The ambient dot mesh is a single fixed layer on the layout shell now -->
	<div class="content-width-wide reader-shell relative">
		<div class="reader-shell__masthead surface-panel surface-padding">
			<ReaderMasthead {meta} />
		</div>

		<div class="reader-shell__grid">
			<aside class="reader-shell__toc-col">
				<ReaderToc {toc} {proseRoot} />
			</aside>

			<div class="reader-shell__main">
				<div class="reader-shell__toolbar-wrap">
					<ReaderToolbar {meta} {canonicalUrl} />
				</div>

				<div class="reader-shell__prose-wrap">
					<ReaderProse html={paper.html} {resolvedRefs} onRootMount={(el) => (proseRoot = el)} />
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.reader-shell {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}
	.reader-shell__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}
	@media (min-width: 1024px) {
		.reader-shell__grid {
			grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
		}
	}
	.reader-shell__main {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		min-width: 0;
	}
	.reader-shell__toolbar-wrap {
		position: sticky;
		top: 4.5rem;
		z-index: var(--z-sticky);
	}
	.reader-shell__prose-wrap {
		padding-block: var(--space-lg);
	}
</style>
