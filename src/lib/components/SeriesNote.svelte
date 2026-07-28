<script lang="ts">
	import { Alert } from 'flowbite-svelte';
	import { BookOpenOutline } from 'flowbite-svelte-icons';
	import { positionPaperAbout } from '$lib/data/position-paper-about';

	const { series } = positionPaperAbout;
</script>

<Alert color="teal" class="max-w-3xl">
	{#snippet icon()}
		<BookOpenOutline class="h-5 w-5" />
	{/snippet}
	<span class="font-semibold">About {series.name}</span>
	<p class="mt-1 text-sm">
		This <a
			href={series.url}
			target="_blank"
			rel="noopener noreferrer"
			class="font-medium underline hover:no-underline">series</a
		>
		publishes conceptual articles engaging with interdisciplinary and inter-regional research conducted
		at the
		<a
			href={series.publisherUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="font-medium underline hover:no-underline">{series.publisher}</a
		>.
	</p>
</Alert>
