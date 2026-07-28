<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { FileCheckOutline, ClockOutline } from 'flowbite-svelte-icons';
	import { resolveAssetPath } from '$lib/utils/paths';

	interface Props {
		pdfPath: string;
		pdfAvailable: boolean;
		/** Filename offered to the browser's download prompt. */
		filename?: string;
	}

	let { pdfPath, pdfAvailable, filename = 'position-paper.pdf' }: Props = $props();

	let href = $derived(resolveAssetPath(pdfPath));
</script>

{#if pdfAvailable && href}
	<Button color="primary" size="sm" {href} download={filename} class="font-medium">
		<FileCheckOutline class="mr-2 h-4 w-4" />
		Download PDF
	</Button>
{:else}
	<Button color="light" size="sm" disabled class="font-medium">
		<ClockOutline class="mr-2 h-4 w-4" />
		PDF available soon
	</Button>
{/if}
