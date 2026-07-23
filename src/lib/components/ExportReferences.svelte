<script lang="ts">
	import { Button, Dropdown, DropdownItem, Spinner } from 'flowbite-svelte';
	import { DownloadOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { CslReference } from '$lib/types/csl';
	import { generateBibtex, generateRis } from '$lib/utils/citation-export';

	interface Props {
		references: CslReference[];
		filename?: string;
	}

	let { references, filename = 'references' }: Props = $props();

	let isExporting = $state(false);

	async function exportToFormat(format: 'bibtex' | 'ris') {
		if (references.length === 0) return;

		isExporting = true;

		try {
			let content: string;
			let extension: string;
			let mimeType: string;

			if (format === 'bibtex') {
				content = generateBibtex(references);
				extension = 'bib';
				mimeType = 'application/x-bibtex';
			} else {
				content = generateRis(references);
				extension = 'ris';
				mimeType = 'application/x-research-info-systems';
			}

			// Create and download the file
			const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${filename}.${extension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			isExporting = false;
		}
	}
</script>

<Button
	color="light"
	size="sm"
	class="font-medium"
	disabled={isExporting || references.length === 0}
>
	{#if isExporting}
		<Spinner size="4" class="mr-2" />
		Exporting...
	{:else}
		<DownloadOutline class="mr-2 h-4 w-4" />
		Export to Zotero
		<ChevronDownOutline class="ml-1 h-3 w-3" />
	{/if}
</Button>
<Dropdown simple class="z-(--z-popover) w-48">
	<DropdownItem onclick={() => exportToFormat('bibtex')}>
		<span class="text-primary-ink block font-medium">BibTeX (.bib)</span>
		<span class="text-subtle-ink block text-xs">Best for LaTeX users</span>
	</DropdownItem>
	<DropdownItem onclick={() => exportToFormat('ris')}>
		<span class="text-primary-ink block font-medium">RIS (.ris)</span>
		<span class="text-subtle-ink block text-xs">Universal format</span>
	</DropdownItem>
</Dropdown>
