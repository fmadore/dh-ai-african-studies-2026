<script lang="ts">
	import type { ConceptNode, ConceptGroup } from '$lib/types/concept-graph';
	import { resolveAppPath } from '$lib/utils/paths';

	interface Props {
		node: ConceptNode;
		neighbors: string[];
		isMobile: boolean;
		getNodeColor: (_group: ConceptGroup) => string;
		onclose: () => void;
		onnavigate: (_nodeId: string) => void;
	}

	let { node, neighbors, isMobile, getNodeColor, onclose, onnavigate }: Props = $props();

	let closeButtonEl: HTMLButtonElement | undefined;

	/**
	 * The map's value is that it connects concepts to the reading behind them.
	 * The graph data carries no reference IDs, so the link searches the
	 * bibliography for the concept label — enough to turn the map from an
	 * ornament into navigation into /references.
	 */
	let bibliographyHref = $derived(
		`${resolveAppPath('/references')}?q=${encodeURIComponent(node.label)}`
	);

	// The mobile bottom sheet overlays content, so announce it and move focus in
	$effect(() => {
		if (isMobile && node) {
			closeButtonEl?.focus();
		}
	});
</script>

<div
	class="detail-panel card-surface surface-padding-sm"
	class:bottom-sheet={isMobile}
	role={isMobile ? 'dialog' : undefined}
	aria-label={isMobile ? node.label : undefined}
>
	<div class="detail-header">
		<h3 class="detail-title">{node.label}</h3>
		<button
			bind:this={closeButtonEl}
			class="detail-close"
			onclick={onclose}
			aria-label="Close detail panel"
		>
			&times;
		</button>
	</div>
	<div class="detail-meta">
		<span
			class="detail-badge"
			style="background-color: color-mix(in srgb, {getNodeColor(
				node.group
			)} 12%, transparent); color: {getNodeColor(
				node.group
			)}; border: 1px solid color-mix(in srgb, {getNodeColor(node.group)} 25%, transparent);"
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
			<p class="detail-connections-label">Connected to:</p>
			<div class="connection-tags">
				{#each neighbors as neighbor (neighbor)}
					<button class="connection-tag" onclick={() => onnavigate(neighbor)}>
						{neighbor}
					</button>
				{/each}
			</div>
		</div>
	{/if}
	<a href={bibliographyHref} class="detail-reading">
		Find “{node.label}” in the bibliography →
	</a>
</div>

<style>
	.detail-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.detail-reading {
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		text-decoration: none;
	}

	.detail-reading:hover {
		color: var(--text-link-hover);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.detail-panel.bottom-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-overlay);
		border-radius: var(--radius-panel) var(--radius-panel) 0 0;
		max-height: 50vh;
		overflow-y: auto;
		box-shadow: var(--shadow-xl);
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
	}

	.detail-title {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-lg);
		line-height: var(--leading-snug);
		color: var(--text-primary);
	}

	.detail-connections-label {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-secondary);
		margin-bottom: var(--space-xs);
	}

	.detail-close {
		font-size: var(--text-xl);
		line-height: 1;
		color: var(--text-subtle);
		background: none;
		border: none;
		padding: var(--space-3xs);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition:
			color var(--transition-micro),
			background var(--transition-micro);
	}

	.detail-close:hover {
		color: var(--text-secondary);
		background: var(--bg-sunken);
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
		padding: var(--space-3xs) var(--space-xs);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		background: var(--bg-sunken);
		color: var(--text-secondary);
		border: 1px solid var(--border-default);
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.connection-tag:hover {
		background: color-mix(in srgb, var(--accent) 10%, var(--bg-raised));
		border-color: color-mix(in srgb, var(--accent) 40%, transparent);
		color: var(--text-link);
	}
</style>
