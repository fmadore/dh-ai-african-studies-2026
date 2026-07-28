<script lang="ts">
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { QuoteSolid, ChevronDownOutline, CheckOutline } from 'flowbite-svelte-icons';
	import type { PositionPaperMeta } from '$lib/reader/types';
	import { toBibtex, toRis, toChicago, toApa } from '$lib/reader/citation-formatters';
	import { copyToClipboard } from '$lib/utils/clipboard';

	interface Props {
		meta: PositionPaperMeta;
		canonicalUrl: string;
	}

	let { meta, canonicalUrl }: Props = $props();

	interface CitationFormat {
		id: string;
		label: string;
		hint: string;
		build: (_meta: PositionPaperMeta, _url: string) => string;
	}

	const formats: CitationFormat[] = [
		{
			id: 'chicago',
			label: 'Chicago (author-date)',
			hint: 'Running-text citation',
			build: toChicago
		},
		{ id: 'apa', label: 'APA', hint: 'Social sciences style', build: toApa },
		{ id: 'bibtex', label: 'BibTeX', hint: 'Best for LaTeX users', build: toBibtex },
		{ id: 'ris', label: 'RIS', hint: 'Universal reference manager', build: toRis }
	];

	let copied = $state<string | null>(null);
	let announcement = $state('');
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	async function copy(format: CitationFormat) {
		const ok = await copyToClipboard(format.build(meta, canonicalUrl));
		announcement = ok
			? `${format.label} citation copied to clipboard`
			: `Could not copy the ${format.label} citation`;
		if (!ok) return;

		copied = format.id;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copied = null;
		}, 2000);
	}

	$effect(() => () => clearTimeout(copyTimer));
</script>

<Button color="light" size="sm" class="font-medium">
	<QuoteSolid class="mr-2 h-4 w-4" />
	How to cite
	<ChevronDownOutline class="ml-1 h-3 w-3" />
</Button>
<Dropdown simple class="z-(--z-popover) w-60">
	{#each formats as format (format.id)}
		<DropdownItem onclick={() => copy(format)}>
			<span class="text-primary-ink block font-medium">
				{#if copied === format.id}
					<CheckOutline class="mr-1 inline h-4 w-4" />Copied
				{:else}
					{format.label}
				{/if}
			</span>
			<span class="text-subtle-ink block text-xs">{format.hint}</span>
		</DropdownItem>
	{/each}
</Dropdown>

<!-- Copy feedback is otherwise visual only; announce it for screen readers. -->
<span class="sr-only" role="status" aria-live="polite">{announcement}</span>
