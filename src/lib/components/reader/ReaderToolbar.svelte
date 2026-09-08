<script lang="ts">
	import { readerPrefs } from '$lib/utils/reader-preferences.svelte';
	import type { PositionPaperMeta, ReaderFontFamily, ReaderFontSize } from '$lib/reader/types';
	import CiteThisWidget from './CiteThisWidget.svelte';
	import PdfDownloadButton from './PdfDownloadButton.svelte';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { Button } from 'flowbite-svelte';
	import { DownloadOutline } from 'flowbite-svelte-icons';

	interface Props {
		meta: PositionPaperMeta;
		canonicalUrl: string;
	}

	let { meta, canonicalUrl }: Props = $props();

	const families: Array<{ value: ReaderFontFamily; label: string; className: string }> = [
		{ value: 'sans', label: 'Aa', className: '' },
		{ value: 'serif', label: 'Aa', className: 'reader-toolbar__segment--serif' },
		{
			value: 'accessible',
			label: 'Aa',
			className: 'reader-toolbar__segment--accessible'
		}
	];

	const sizes: Array<{ value: ReaderFontSize; label: string; aria: string }> = [
		{ value: 90, label: 'A⁻', aria: 'Smaller text' },
		{ value: 100, label: 'A', aria: 'Default text size' },
		{ value: 115, label: 'A⁺', aria: 'Larger text' },
		{ value: 130, label: 'A⁺⁺', aria: 'Largest text' }
	];
</script>

<div class="reader-toolbar no-print" role="toolbar" aria-label="Reader controls">
	<div class="reader-toolbar__settings">
		<div class="reader-toolbar__group" role="group" aria-label="Font family">
			{#each families as font (font.value)}
				<button
					type="button"
					class="reader-toolbar__segment {font.className}"
					aria-pressed={readerPrefs.fontFamily === font.value}
					aria-label="Set font to {font.value}"
					title="{font.value.charAt(0).toUpperCase() + font.value.slice(1)} font"
					onclick={() => (readerPrefs.fontFamily = font.value)}
				>
					{font.label}
				</button>
			{/each}
		</div>

		<div class="reader-toolbar__group" role="group" aria-label="Font size">
			{#each sizes as size (size.value)}
				<button
					type="button"
					class="reader-toolbar__segment"
					aria-pressed={readerPrefs.fontSize === size.value}
					aria-label={size.aria}
					title={size.aria}
					onclick={() => (readerPrefs.fontSize = size.value)}
				>
					{size.label}
				</button>
			{/each}
		</div>
	</div>
	<div class="reader-toolbar__actions">
		<div class="reader-toolbar__action"><CiteThisWidget {meta} {canonicalUrl} /></div>
		{#if import.meta.env.PAPER_EPUB_AVAILABLE}
			<div class="reader-toolbar__action">
				<Button
					color="light"
					size="sm"
					href={resolveAssetPath('/documents/position-paper.epub')}
					download="position-paper.epub"
					class="font-medium"
				>
					<DownloadOutline class="mr-2 h-4 w-4" />Download EPUB
				</Button>
			</div>
		{/if}
		<div class="reader-toolbar__action">
			<PdfDownloadButton pdfPath={meta.pdfPath} pdfAvailable={meta.pdfAvailable} doi={meta.doi} />
		</div>
	</div>
</div>

<style>
	.reader-toolbar__settings {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}
	.reader-toolbar__actions {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		flex: 1 1 30rem;
		gap: var(--space-sm);
	}
	.reader-toolbar__action {
		min-width: 0;
	}
	.reader-toolbar__action > :global(button),
	.reader-toolbar__action > :global(a) {
		width: 100%;
		min-height: 2.75rem;
		white-space: nowrap;
	}
	@container reader-toolbar (max-width: 30rem) {
		.reader-toolbar__actions {
			grid-template-columns: 1fr;
		}
	}
</style>
