<script lang="ts">
	import { readerPrefs } from '$lib/utils/reader-preferences.svelte';
	import type { PositionPaperMeta, ReaderFontFamily, ReaderFontSize } from '$lib/reader/types';
	import CiteThisWidget from './CiteThisWidget.svelte';
	import PdfDownloadButton from './PdfDownloadButton.svelte';

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

	<div class="reader-toolbar__spacer"></div>

	<CiteThisWidget {meta} {canonicalUrl} />
	<PdfDownloadButton pdfPath={meta.pdfPath} pdfAvailable={meta.pdfAvailable} />
</div>

<style>
	.reader-toolbar__spacer {
		flex: 1 1 auto;
	}
</style>
