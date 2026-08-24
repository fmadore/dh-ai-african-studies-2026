<script lang="ts">
	import type { ConceptGroup } from '$lib/types/concept-graph';

	interface Props {
		groups: ConceptGroup[];
		activeGroups: Set<ConceptGroup>;
		filteredNodeCount: number;
		totalNodeCount: number;
		filteredEdgeCount: number;
		activeGroupCount: number;
		totalGroupCount: number;
		getNodeColor: (_group: ConceptGroup) => string;
		ontoggle: (_group: ConceptGroup) => void;
		onactivateall: () => void;
	}

	let {
		groups,
		activeGroups,
		filteredNodeCount,
		totalNodeCount,
		filteredEdgeCount,
		activeGroupCount,
		totalGroupCount,
		getNodeColor,
		ontoggle,
		onactivateall
	}: Props = $props();
</script>

<!-- Stats bar -->
<div class="stats-bar body-text-muted">
	<span>Showing <strong>{filteredNodeCount}</strong> of {totalNodeCount} concepts</span>
	<span class="stats-sep">·</span>
	<span><strong>{filteredEdgeCount}</strong> relationships</span>
	<span class="stats-sep">·</span>
	<span><strong>{activeGroupCount}</strong> of {totalGroupCount} groups active</span>
</div>

<!-- Group filters -->
<div class="group-filters">
	<button
		class="filter-btn filter-btn-all"
		class:active={activeGroupCount === totalGroupCount}
		onclick={onactivateall}
	>
		All
	</button>
	{#each groups as group (group)}
		<button
			class="filter-btn"
			class:active={activeGroups.has(group)}
			onclick={() => ontoggle(group)}
			style="--group-color: {getNodeColor(group)}"
		>
			<span class="filter-dot" style="background-color: {getNodeColor(group)}"></span>
			{group}
		</button>
	{/each}
</div>

<style>
	.group-filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		justify-content: center;
	}

	.filter-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		background: var(--bg-sunken);
		color: var(--text-muted);
		border: 1px solid var(--border-default);
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
		cursor: pointer;
	}

	.filter-btn:hover {
		background: var(--bg-overlay);
	}

	/* Measured 40x38 on a phone — just under the 2.75rem floor DESIGN.md sets
	   for graph chrome on coarse pointers. */
	@media (pointer: coarse) {
		.filter-btn {
			min-height: 2.75rem;
		}
	}

	.filter-btn.active {
		background: color-mix(in srgb, var(--group-color, var(--accent)) 12%, var(--bg-raised));
		color: var(--text-primary);
		border-color: color-mix(in srgb, var(--group-color, var(--accent)) 40%, transparent);
	}

	:global(.dark) .filter-btn.active {
		background: color-mix(in srgb, var(--group-color, var(--accent)) 15%, var(--bg-page));
	}

	.filter-btn-all {
		--group-color: var(--color-secondary-500);
	}

	.filter-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.stats-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
		font-size: var(--text-xs);
	}

	.stats-bar strong {
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
	}

	/* A border tone on text is invisible: `--border-strong` put these dots at
	   2.7:1. Mixed from the surrounding text instead, they stay quieter than the
	   counts while clearing the 3:1 floor for non-text marks in both themes. */
	.stats-sep {
		color: color-mix(in oklab, var(--text-muted) 55%, transparent);
	}
</style>
