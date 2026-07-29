<script lang="ts">
	import ConceptGraph from '$lib/components/ConceptGraph.svelte';
	import graphData from '$lib/data/concept-graph.json';
	import type { ConceptGraphData } from '$lib/types/concept-graph';

	const data = graphData as ConceptGraphData;
</script>

<svelte:head>
	<title>Concept Map – DH & AI in African Studies</title>
	<!-- Embed-only view: keep out of search results so it can't compete with /concepts -->
	<meta name="robots" content="noindex,follow" />
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
	/* The graph is a dark stage in both themes (see ConceptGraph.svelte), and on
	 * /concepts it gets that from the surrounding .band-ink. Standalone it has
	 * to supply its own, or the padding around it stays page-coloured.
	 * Literal rather than var(--graph-ink): that token is declared on
	 * .concept-graph-wrapper, which is this element's child. */
	.embed-wrapper {
		width: 100vw;
		height: 100vh;
		padding: 1rem;
		box-sizing: border-box;
		overflow: hidden;
		background-color: #171514;
	}
</style>
