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
		getNodeColor: (group: ConceptGroup) => string;
		ontoggle: (group: ConceptGroup) => void;
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
		gap: 0.375rem;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		background: var(--color-surface-100);
		color: var(--color-gray-600);
		border: 1px solid var(--color-surface-300);
		transition: all var(--transition-fast);
		cursor: pointer;
	}

	.filter-btn:hover {
		background: var(--color-surface-200);
	}

	.filter-btn.active {
		background: color-mix(in srgb, var(--group-color, var(--color-secondary-500)) 12%, var(--color-surface-0));
		color: var(--color-gray-900);
		border-color: color-mix(in srgb, var(--group-color, var(--color-secondary-500)) 40%, transparent);
	}

	:global(.dark) .filter-btn {
		background: var(--color-surface-dark-elevated);
		color: var(--color-gray-400);
		border-color: rgba(255, 255, 255, 0.08);
	}

	:global(.dark) .filter-btn:hover {
		background: var(--color-surface-dark-overlay);
	}

	:global(.dark) .filter-btn.active {
		background: color-mix(in srgb, var(--group-color, var(--color-secondary-400)) 15%, var(--color-surface-dark-base));
		color: var(--color-gray-100);
		border-color: color-mix(in srgb, var(--group-color, var(--color-secondary-400)) 40%, transparent);
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
		color: var(--color-gray-700);
	}

	:global(.dark) .stats-bar strong {
		color: var(--color-gray-300);
	}

	.stats-sep {
		color: var(--color-gray-300);
	}

	:global(.dark) .stats-sep {
		color: var(--color-gray-600);
	}
</style>
