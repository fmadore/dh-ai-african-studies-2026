<script lang="ts">
	import type { ConceptGraphData } from '$lib/types/concept-graph';
	import { resolveAppPath } from '$lib/utils/paths';

	let { data, open = false }: { data: ConceptGraphData; open?: boolean } = $props();
	let nodes = $derived(data.nodes.toSorted((a, b) => a.label.localeCompare(b.label)));
	let entries = $derived.by(() => {
		// Local index rebuilt by this derivation; no reactive mutations escape it.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const connections = new Map<string, Set<string>>();
		for (const edge of data.edges) {
			const source = typeof edge.source === 'string' ? edge.source : edge.source.id;
			const target = typeof edge.target === 'string' ? edge.target : edge.target.id;
			if (!connections.has(source)) connections.set(source, new Set());
			if (!connections.has(target)) connections.set(target, new Set());
			connections.get(source)!.add(target);
			connections.get(target)!.add(source);
		}
		return nodes.map((node) => ({
			node,
			neighbors: nodes.filter((candidate) => connections.get(node.id)?.has(candidate.id))
		}));
	});
</script>

<details class="graph-text-view" {open}>
	<summary>Browse all {nodes.length} concepts and connections as text</summary>
	<p class="graph-text-intro">
		This directory also works without the interactive graph. Expand a concept to read its
		connections.
	</p>
	<ul class="graph-text-list">
		{#each entries as { node, neighbors } (node.id)}
			<li>
				<details>
					<summary>{node.label} <span>({neighbors.length} connections)</span></summary>
					<p>{node.group}{node.seed ? ' · Seed concept' : ''}</p>
					{#if neighbors.length}
						<p>
							<strong>Connected to:</strong>
							{neighbors.map((neighbor) => neighbor.label).join('; ')}.
						</p>
					{:else}
						<p>No connections in this export.</p>
					{/if}
					<a href={`${resolveAppPath('/references')}?q=${encodeURIComponent(node.label)}`}
						>Find “{node.label}” in the bibliography</a
					>
				</details>
			</li>
		{/each}
	</ul>
</details>

<style>
	.graph-text-view {
		padding: var(--space-sm);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		background: var(--graph-surface);
		color: var(--text-secondary);
	}
	summary {
		cursor: pointer;
		padding-block: var(--space-xs);
		font-weight: var(--font-weight-semibold);
	}
	.graph-text-intro {
		margin-block: var(--space-sm);
	}
	.graph-text-list {
		list-style: none;
		padding: 0;
		max-height: 28rem;
		overflow-y: auto;
	}
	li + li {
		border-top: 1px solid var(--border-subtle);
	}
	p,
	a {
		font-size: var(--text-sm);
	}
	li p {
		margin-bottom: var(--space-xs);
	}
	li a {
		display: inline-block;
		padding-block: var(--space-xs);
		color: var(--text-link);
		text-decoration: underline;
	}
	summary span {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-regular);
	}
</style>
