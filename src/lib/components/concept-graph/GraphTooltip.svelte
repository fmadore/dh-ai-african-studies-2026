<script lang="ts">
	import type { ConceptNode } from '#lib/types/concept-graph';
	import { GROUP_COLORS } from './graph-config';

	interface Props {
		node: ConceptNode;
		/** Position within the graph stage, in CSS pixels. */
		x: number;
		y: number;
	}

	let { node, x, y }: Props = $props();
</script>

<div class="graph-tooltip" style="left: {x + 14}px; top: {y - 10}px;">
	<div class="tooltip-label">{node.label}</div>
	<div class="tooltip-meta">
		<span class="tooltip-dot" style="background-color: {GROUP_COLORS[node.group]}"></span>
		<span class="tooltip-group">{node.group}</span>
	</div>
	<div class="tooltip-stats">
		{node.degree} connection{node.degree !== 1 ? 's' : ''}
		{#if node.seed}
			<span class="tooltip-seed">· Seed</span>
		{/if}
	</div>
</div>

<style>
	.graph-tooltip {
		position: absolute;
		pointer-events: none;
		z-index: var(--z-dropdown);
		background: var(--bg-raised);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		padding: var(--space-2xs) var(--space-xs);
		box-shadow: var(--shadow-md);
		max-width: 14rem;
		white-space: nowrap;
	}

	.tooltip-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		line-height: var(--leading-snug);
	}

	.tooltip-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.125rem;
	}

	.tooltip-dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.tooltip-group {
		font-size: var(--text-xs);
		color: var(--text-subtle);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tooltip-stats {
		font-size: var(--text-xs);
		color: var(--text-subtle);
		margin-top: var(--space-3xs);
	}

	.tooltip-seed {
		color: var(--accent);
		font-weight: var(--font-weight-medium);
	}
</style>
