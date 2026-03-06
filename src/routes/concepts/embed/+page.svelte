<script lang="ts">
	import ConceptGraph from '$lib/components/ConceptGraph.svelte';
	import graphData from '$lib/data/concept-graph.json';
	import type { ConceptGraphData } from '$lib/types/concept-graph';

	const data = graphData as ConceptGraphData;
</script>

<svelte:head>
	<title>Concept Map – DH & AI in African Studies</title>
	<style>
		/* Remove any margin/padding from the embed page */
		body {
			margin: 0;
			padding: 0;
			overflow: hidden;
		}
	</style>
</svelte:head>

<div class="embed-wrapper">
	<ConceptGraph {data} />
</div>

<style>
	.embed-wrapper {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
</style>
