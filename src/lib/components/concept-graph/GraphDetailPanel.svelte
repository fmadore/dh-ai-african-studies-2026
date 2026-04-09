<script lang="ts">
	import type { ConceptNode, ConceptGroup } from '$lib/types/concept-graph';

	interface Props {
		node: ConceptNode;
		neighbors: string[];
		isMobile: boolean;
		getNodeColor: (_group: ConceptGroup) => string;
		onclose: () => void;
		onnavigate: (_nodeId: string) => void;
	}

	let { node, neighbors, isMobile, getNodeColor, onclose, onnavigate }: Props = $props();
</script>

<div class="detail-panel card-surface surface-padding-sm" class:bottom-sheet={isMobile}>
	<div class="detail-header">
		<h3 class="heading-sub" style="font-size: var(--text-lg);">{node.label}</h3>
		<button class="detail-close" onclick={onclose} aria-label="Close detail panel">
			&times;
		</button>
	</div>
	<div class="detail-meta">
		<span
			class="detail-badge"
			style="background-color: {getNodeColor(node.group)}20; color: {getNodeColor(
				node.group
			)}; border: 1px solid {getNodeColor(node.group)}40;"
		>
			{node.group}
		</span>
		{#if node.seed}
			<span class="detail-badge detail-badge-seed">Seed concept</span>
		{/if}
		<span class="body-text-muted">{node.degree} connections</span>
	</div>
	{#if neighbors.length > 0}
		<div class="detail-connections">
			<p
				class="text-body-sm"
				style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-xs);"
			>
				Connected to:
			</p>
			<div class="connection-tags">
				{#each neighbors as neighbor (neighbor)}
					<button class="connection-tag" onclick={() => onnavigate(neighbor)}>
						{neighbor}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.detail-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.detail-panel.bottom-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-overlay);
		border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
		max-height: 50vh;
		overflow-y: auto;
		box-shadow: 0 -10px 30px -5px rgba(0, 0, 0, 0.15);
	}

	:global(.dark) .detail-panel.bottom-sheet {
		box-shadow: 0 -10px 30px -5px rgba(0, 0, 0, 0.5);
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
	}

	.detail-close {
		font-size: var(--text-xl);
		line-height: 1;
		color: var(--color-gray-400);
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		border-radius: var(--radius-md);
	}

	.detail-close:hover {
		color: var(--color-gray-600);
		background: var(--color-surface-100);
	}

	:global(.dark) .detail-close:hover {
		color: var(--color-gray-200);
		background: var(--color-surface-dark-overlay);
	}

	.detail-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-xs);
	}

	.detail-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
	}

	.detail-badge-seed {
		background: color-mix(in srgb, var(--color-secondary-500) 12%, transparent);
		color: var(--color-secondary-700);
		border: 1px solid color-mix(in srgb, var(--color-secondary-500) 30%, transparent);
	}

	:global(.dark) .detail-badge-seed {
		background: color-mix(in srgb, var(--color-secondary-400) 15%, transparent);
		color: var(--color-secondary-300);
		border-color: color-mix(in srgb, var(--color-secondary-400) 30%, transparent);
	}

	.detail-connections {
		max-height: 12rem;
		overflow-y: auto;
	}

	.connection-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.connection-tag {
		padding: 0.125rem 0.5rem;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		background: var(--color-surface-100);
		color: var(--color-gray-700);
		border: 1px solid var(--color-surface-300);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.connection-tag:hover {
		background: var(--color-secondary-50);
		border-color: var(--color-secondary-300);
		color: var(--color-secondary-700);
	}

	:global(.dark) .connection-tag {
		background: var(--color-surface-dark-elevated);
		color: var(--color-gray-300);
		border-color: rgba(255, 255, 255, 0.08);
	}

	:global(.dark) .connection-tag:hover {
		background: color-mix(in srgb, var(--color-secondary-400) 15%, var(--color-surface-dark-base));
		border-color: color-mix(in srgb, var(--color-secondary-400) 40%, transparent);
		color: var(--color-secondary-300);
	}
</style>
