<script lang="ts">
	import type { ConceptNode } from '#lib/types/concept-graph';
	import { CloseOutline } from 'flowbite-svelte-icons';
	import { GROUP_COLORS } from './graph-config';

	interface Props {
		node: ConceptNode;
		onclear: () => void;
	}

	let { node, onclear }: Props = $props();
</script>

<button class="selection-pill" onclick={onclear} aria-label="Clear selection: {node.label}">
	<span class="selection-pill-dot" style="background-color: {GROUP_COLORS[node.group]}"></span>
	<span class="selection-pill-label">{node.label}</span>
	<CloseOutline class="h-3.5 w-3.5" aria-hidden="true" />
</button>

<style>
	.selection-pill {
		position: absolute;
		top: var(--space-sm);
		left: var(--space-sm);
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-3xs) var(--space-xs) var(--space-3xs) var(--space-sm);
		border-radius: var(--radius-full);
		background: var(--bg-raised);
		border: 1px solid var(--border-default);
		box-shadow: var(--shadow-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--text-secondary);
		cursor: pointer;
		z-index: 3;
		transition:
			background var(--transition-micro),
			box-shadow var(--transition-micro);
		max-width: 14rem;
		min-height: 2.75rem;
	}

	.selection-pill:hover {
		background: var(--bg-overlay);
		box-shadow: var(--shadow-md);
	}

	.selection-pill-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.selection-pill-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.selection-pill :global(svg) {
		flex-shrink: 0;
		opacity: 0.5;
	}

	.selection-pill:hover :global(svg) {
		opacity: 1;
	}
</style>
