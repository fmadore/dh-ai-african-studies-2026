<script lang="ts">
	import PositionPaperReader from '$lib/components/reader/PositionPaperReader.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<PositionPaperReader {data} />
