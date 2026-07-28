<script lang="ts">
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { QuoteSolid, ChevronDownOutline, CheckOutline } from 'flowbite-svelte-icons';
	import type { PositionPaperMeta } from '$lib/reader/types';
	import { toBibtex, toRis, toChicago, toApa } from '$lib/reader/citation-formatters';

	interface Props {
		meta: PositionPaperMeta;
		canonicalUrl: string;
	}

	let { meta, canonicalUrl }: Props = $props();

	let copied = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	async function copy(format: 'bibtex' | 'ris' | 'chicago' | 'apa') {
		let text = '';
		switch (format) {
			case 'bibtex':
				text = toBibtex(meta);
				break;
			case 'ris':
				text = toRis(meta);
				break;
			case 'chicago':
				text = toChicago(meta, canonicalUrl);
				break;
			case 'apa':
				text = toApa(meta, canonicalUrl);
				break;
		}

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			} else {
				const ta = document.createElement('textarea');
				ta.value = text;
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}
			copied = format;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copied = null;
			}, 2000);
		} catch (err) {
			console.error('Copy failed', err);
		}
	}
</script>

<Button color="light" size="sm" class="font-medium">
	<QuoteSolid class="mr-2 h-4 w-4" />
	How to cite
	<ChevronDownOutline class="ml-1 h-3 w-3" />
</Button>
<Dropdown simple class="z-(--z-popover) w-60">
	<DropdownItem onclick={() => copy('chicago')}>
		<span class="text-primary-ink block font-medium">
			{#if copied === 'chicago'}<CheckOutline class="mr-1 inline h-4 w-4" />Copied{:else}Chicago
				(author-date){/if}
		</span>
		<span class="text-subtle-ink block text-xs">Running-text citation</span>
	</DropdownItem>
	<DropdownItem onclick={() => copy('apa')}>
		<span class="text-primary-ink block font-medium">
			{#if copied === 'apa'}<CheckOutline class="mr-1 inline h-4 w-4" />Copied{:else}APA{/if}
		</span>
		<span class="text-subtle-ink block text-xs">Social sciences style</span>
	</DropdownItem>
	<DropdownItem onclick={() => copy('bibtex')}>
		<span class="text-primary-ink block font-medium">
			{#if copied === 'bibtex'}<CheckOutline class="mr-1 inline h-4 w-4" />Copied{:else}BibTeX{/if}
		</span>
		<span class="text-subtle-ink block text-xs">Best for LaTeX users</span>
	</DropdownItem>
	<DropdownItem onclick={() => copy('ris')}>
		<span class="text-primary-ink block font-medium">
			{#if copied === 'ris'}<CheckOutline class="mr-1 inline h-4 w-4" />Copied{:else}RIS{/if}
		</span>
		<span class="text-subtle-ink block text-xs">Universal reference manager</span>
	</DropdownItem>
</Dropdown>
