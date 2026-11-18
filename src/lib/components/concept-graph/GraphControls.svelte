<script lang="ts">
	import { PlusOutline, MinusOutline, ExpandOutline, CompressOutline } from 'flowbite-svelte-icons';

	interface Props {
		isFullscreen: boolean;
		onzoomin: () => void;
		onzoomout: () => void;
		onrecenter: () => void;
		ontogglefullscreen: () => void;
	}

	let { isFullscreen, onzoomin, onzoomout, onrecenter, ontogglefullscreen }: Props = $props();
</script>

<div class="graph-controls">
	<button class="control-btn" onclick={onzoomin} aria-label="Zoom in" title="Zoom in">
		<PlusOutline class="h-4 w-4" />
	</button>
	<button class="control-btn" onclick={onzoomout} aria-label="Zoom out" title="Zoom out">
		<MinusOutline class="h-4 w-4" />
	</button>
	<button
		class="control-btn"
		onclick={onrecenter}
		aria-label="Recenter graph"
		title="Fit all visible concepts"
	>
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="8" cy="8" r="3" />
			<line x1="8" y1="1" x2="8" y2="4" />
			<line x1="8" y1="12" x2="8" y2="15" />
			<line x1="1" y1="8" x2="4" y2="8" />
			<line x1="12" y1="8" x2="15" y2="8" />
		</svg>
	</button>
	<button
		class="control-btn"
		onclick={ontogglefullscreen}
		aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
		title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
	>
		{#if isFullscreen}
			<CompressOutline class="h-4 w-4" />
		{:else}
			<ExpandOutline class="h-4 w-4" />
		{/if}
	</button>
</div>

<style>
	.graph-controls {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		z-index: 3;
	}

	.control-btn {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--radius-md);
		background: var(--bg-raised);
		color: var(--text-muted);
		border: 1px solid var(--border-default);
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			box-shadow var(--transition-micro),
			transform var(--transition-micro);
		box-shadow: var(--shadow-sm);
	}

	/* Lift, not sink: on the ink stage --bg-sunken is darker than --bg-raised,
	 * so the old hover made the control recede. */
	.control-btn:hover {
		background: var(--bg-overlay);
		color: var(--text-primary);
		box-shadow: var(--shadow-md);
	}

	.control-btn:active {
		transform: scale(0.93);
	}
</style>
