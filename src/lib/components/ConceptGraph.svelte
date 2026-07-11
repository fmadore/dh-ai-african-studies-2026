<script lang="ts">
	import type {
		ConceptNode,
		ConceptEdge,
		ConceptGraphData,
		ConceptGroup
	} from '$lib/types/concept-graph';
	import { useDarkMode } from '$lib/utils/dark-mode.svelte';
	import { GROUP_COLORS, ALL_GROUPS, getNodeRadius } from './concept-graph/graph-config';
	import { Spinner } from 'flowbite-svelte';
	import {
		CloseOutline,
		PlusOutline,
		MinusOutline,
		ExpandOutline,
		CompressOutline
	} from 'flowbite-svelte-icons';
	import GraphSearch from './concept-graph/GraphSearch.svelte';
	import GraphDetailPanel from './concept-graph/GraphDetailPanel.svelte';
	import GraphFilters from './concept-graph/GraphFilters.svelte';

	interface Props {
		data: ConceptGraphData;
	}

	let { data }: Props = $props();

	// --- Dark mode ---
	const darkMode = useDarkMode();
	let isDarkMode = $derived(darkMode.isDark);

	function getNodeColor(group: ConceptGroup): string {
		const colors = GROUP_COLORS[group];
		return isDarkMode ? colors.dark : colors.light;
	}

	// --- State ---
	let svgEl: SVGSVGElement;
	let containerEl: HTMLDivElement;
	let containerWidth = $state(800);
	let containerHeight = $state(500);
	let simNodes = $state<ConceptNode[]>([]);
	let simEdges = $state<ConceptEdge[]>([]);
	let hoveredNode = $state<ConceptNode | null>(null);
	let selectedNode = $state<ConceptNode | null>(null);
	let activeGroups = $state<Set<ConceptGroup>>(new Set(ALL_GROUPS));
	let transform = $state({ x: 0, y: 0, k: 1 });
	let simulationReady = $state(false);
	let draggedNode = $state<ConceptNode | null>(null);

	// --- Tooltip state ---
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Track references for programmatic control
	let zoomBehaviorRef: any = null;
	let svgSelectionRef: any = null;
	let d3ZoomModuleRef: any = null;
	let applyDragRef: (() => void) | null = null;
	let isFullscreen = $state(false);

	// --- Filtered data ---
	let filteredNodes = $derived(simNodes.filter((n) => activeGroups.has(n.group)));
	let filteredNodeIds = $derived(new Set(filteredNodes.map((n) => n.id)));
	let filteredEdges = $derived(
		simEdges.filter((e) => {
			const srcId = typeof e.source === 'string' ? e.source : e.source.id;
			const tgtId = typeof e.target === 'string' ? e.target : e.target.id;
			return filteredNodeIds.has(srcId) && filteredNodeIds.has(tgtId);
		})
	);

	// --- Spotlight: hover takes priority, then selected ---
	let spotlightNode = $derived(hoveredNode ?? selectedNode);
	let spotlightNeighborIds = $derived.by(() => {
		if (!spotlightNode) return new Set<string>();
		const ids = new Set<string>(); // eslint-disable-line svelte/prefer-svelte-reactivity
		ids.add(spotlightNode.id);
		for (const e of simEdges) {
			const srcId = typeof e.source === 'string' ? e.source : e.source.id;
			const tgtId = typeof e.target === 'string' ? e.target : e.target.id;
			if (srcId === spotlightNode.id) ids.add(tgtId);
			if (tgtId === spotlightNode.id) ids.add(srcId);
		}
		return ids;
	});

	// --- Selected node neighbors for detail panel ---
	let selectedNeighbors = $derived.by(() => {
		if (!selectedNode) return [];
		const names: string[] = [];
		for (const e of simEdges) {
			const srcId = typeof e.source === 'string' ? e.source : e.source.id;
			const tgtId = typeof e.target === 'string' ? e.target : e.target.id;
			if (srcId === selectedNode.id) names.push(tgtId);
			else if (tgtId === selectedNode.id) names.push(srcId);
		}
		return [...new Set(names)].sort();
	});

	// --- Label visibility based on zoom ---
	function shouldShowLabel(node: ConceptNode): boolean {
		if (spotlightNode && spotlightNeighborIds.has(node.id)) return true;
		if (transform.k >= 2.5) return true;
		if (transform.k >= 1.5 && node.degree >= 10) return true;
		if (node.degree >= 15) return true;
		return false;
	}

	// --- Edge key helper ---
	function edgeKey(e: ConceptEdge): string {
		const s = typeof e.source === 'string' ? e.source : e.source.id;
		const t = typeof e.target === 'string' ? e.target : e.target.id;
		return `${s}-${t}`;
	}

	// --- Edge coordinates helper ---
	function edgeCoords(e: ConceptEdge) {
		const src = typeof e.source === 'string' ? simNodes.find((n) => n.id === e.source) : e.source;
		const tgt = typeof e.target === 'string' ? simNodes.find((n) => n.id === e.target) : e.target;
		return {
			x1: src?.x ?? 0,
			y1: src?.y ?? 0,
			x2: tgt?.x ?? 0,
			y2: tgt?.y ?? 0,
			srcId: src?.id ?? '',
			tgtId: tgt?.id ?? ''
		};
	}

	// --- Opacity helpers for spotlight effect ---
	function nodeOpacity(node: ConceptNode): number {
		if (!spotlightNode) return 1;
		return spotlightNeighborIds.has(node.id) ? 1 : 0.12;
	}

	function edgeOpacity(srcId: string, tgtId: string): number {
		if (!spotlightNode) return 0.3;
		if (srcId === spotlightNode.id || tgtId === spotlightNode.id) return 0.7;
		return 0.04;
	}

	// --- Zoom to node (called by search) ---
	function zoomToNode(node: ConceptNode) {
		if (!zoomBehaviorRef || !svgSelectionRef || !d3ZoomModuleRef) return;
		const nx = node.x ?? containerWidth / 2;
		const ny = node.y ?? containerHeight / 2;
		const scale = 1.4;
		const tx = containerWidth / 2 - nx * scale;
		const ty = containerHeight / 2 - ny * scale;
		svgSelectionRef
			.transition()
			.duration(500)
			.call(zoomBehaviorRef.transform, d3ZoomModuleRef.zoomIdentity.translate(tx, ty).scale(scale));
		selectedNode = node;
	}

	// --- Tooltip positioning ---
	function onNodePointerMove(event: PointerEvent) {
		const canvas = containerEl?.querySelector('.graph-canvas');
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		tooltipX = event.clientX - rect.left;
		tooltipY = event.clientY - rect.top;
	}

	// --- Responsive sizing ---
	$effect(() => {
		if (typeof window === 'undefined' || !containerEl) return;
		const graphCanvas = containerEl.querySelector('.graph-canvas') as HTMLElement | null;
		const target = graphCanvas ?? containerEl;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				containerWidth = w;
				if (isFullscreen) {
					containerHeight = entry.contentRect.height;
				} else {
					containerHeight = Math.max(400, Math.min(w * 0.65, 700));
				}
			}
		});
		ro.observe(target);
		return () => ro.disconnect();
	});

	// --- D3 simulation (dynamic import, SSR-safe) ---
	$effect(() => {
		if (typeof window === 'undefined') return;

		// Read `data` synchronously so the effect tracks it and rebuilds on change
		const graphData = data;
		let destroyed = false;
		let cleanup: (() => void) | null = null;

		Promise.all([
			import('d3-force'),
			import('d3-zoom'),
			import('d3-selection'),
			import('d3-drag')
		]).then(([d3Force, d3Zoom, d3Selection, d3Drag]) => {
			if (destroyed) return;

			const nodes: ConceptNode[] = graphData.nodes.map((n) => ({ ...n }));
			const edges: ConceptEdge[] = graphData.edges.map((e) => ({ ...e }));

			const width = containerWidth;
			const height = containerHeight;

			const simulation = d3Force
				.forceSimulation(nodes)
				.alphaDecay(0.05)
				.velocityDecay(0.4)
				.force(
					'link',
					d3Force
						.forceLink<ConceptNode, ConceptEdge>(edges)
						.id((d) => d.id)
						.distance(140)
						.strength(0.15)
				)
				.force('charge', d3Force.forceManyBody().strength(-350).distanceMax(500))
				.force('center', d3Force.forceCenter(width / 2, height / 2))
				.force(
					'collide',
					d3Force
						.forceCollide<ConceptNode>()
						.radius((d) => getNodeRadius(d.degree) + 12)
						.strength(0.8)
				)
				.force('x', d3Force.forceX(width / 2).strength(0.02))
				.force('y', d3Force.forceY(height / 2).strength(0.02));

			simulation.on('end', () => {
				simulationReady = true;
			});

			setTimeout(() => {
				if (!destroyed) simulationReady = true;
			}, 300);

			// --- d3-zoom on SVG ---
			const svg = d3Selection.select(svgEl);
			const zoomBehavior = d3Zoom
				.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.3, 5])
				.filter((event: any) => {
					if (event.type === 'wheel') return event.ctrlKey || event.metaKey;
					return true;
				})
				.on('zoom', (event: any) => {
					transform = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
				});

			svg.call(zoomBehavior as any);
			zoomBehaviorRef = zoomBehavior;
			svgSelectionRef = svg;
			d3ZoomModuleRef = d3Zoom;

			// --- d3-drag on nodes ---
			function findNode(el: SVGGElement): ConceptNode | undefined {
				const id = el.getAttribute('data-node-id');
				return id ? nodes.find((n) => n.id === id) : undefined;
			}

			const dragBehavior = d3Drag
				.drag<SVGGElement, unknown>()
				.subject(function () {
					const node = findNode(this);
					return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
				})
				.on('start', function (event: any) {
					const node = findNode(this);
					if (!node) return;
					if (!event.active) simulation.alphaTarget(0.3).restart();
					node.fx = node.x;
					node.fy = node.y;
					draggedNode = node;
				})
				.on('drag', function (event: any) {
					const node = findNode(this);
					if (!node) return;
					node.fx = event.x;
					node.fy = event.y;
				})
				.on('end', function (event: any) {
					const node = findNode(this);
					if (!node) return;
					if (!event.active) simulation.alphaTarget(0);
					node.fx = null;
					node.fy = null;
					draggedNode = null;
				});

			const applyDrag = () => {
				if (destroyed || !svgEl) return;
				d3Selection.select(svgEl).selectAll<SVGGElement, unknown>('.node-group').call(dragBehavior);
			};
			applyDragRef = applyDrag;

			// Edge array membership never changes after init; only node positions do
			simEdges = [...edges];

			let firstDragApplied = false;
			simulation.on('tick', () => {
				simNodes = [...nodes];
				if (!firstDragApplied) {
					firstDragApplied = true;
					requestAnimationFrame(applyDrag);
				}
			});

			cleanup = () => {
				simulation.stop();
				svg.on('.zoom', null);
				zoomBehaviorRef = null;
				svgSelectionRef = null;
				d3ZoomModuleRef = null;
				applyDragRef = null;
			};
		});

		return () => {
			destroyed = true;
			cleanup?.();
			cleanup = null;
		};
	});

	// --- Click handling ---
	function onNodeClick(event: MouseEvent, node: ConceptNode) {
		event.stopPropagation();
		if (selectedNode?.id === node.id) {
			selectedNode = null;
		} else {
			selectedNode = node;
		}
	}

	function onBackgroundClick() {
		selectedNode = null;
	}

	// --- Group toggle ---
	function toggleGroup(group: ConceptGroup) {
		const next = new Set(activeGroups); // eslint-disable-line svelte/prefer-svelte-reactivity
		if (next.has(group)) {
			if (next.size > 1) next.delete(group);
		} else {
			next.add(group);
		}
		activeGroups = next;
		requestAnimationFrame(() => applyDragRef?.());
	}

	function activateAllGroups() {
		activeGroups = new Set(ALL_GROUPS);
		requestAnimationFrame(() => applyDragRef?.());
	}

	// --- Zoom controls ---
	function zoomIn() {
		if (!zoomBehaviorRef || !svgSelectionRef) return;
		svgSelectionRef.transition().duration(300).call(zoomBehaviorRef.scaleBy, 1.5);
	}

	function zoomOut() {
		if (!zoomBehaviorRef || !svgSelectionRef) return;
		svgSelectionRef
			.transition()
			.duration(300)
			.call(zoomBehaviorRef.scaleBy, 1 / 1.5);
	}

	function recenter() {
		if (!zoomBehaviorRef || !svgSelectionRef || !d3ZoomModuleRef) return;
		svgSelectionRef
			.transition()
			.duration(400)
			.call(zoomBehaviorRef.transform, d3ZoomModuleRef.zoomIdentity);
	}

	// --- Fullscreen ---
	function toggleFullscreen() {
		if (!containerEl) return;
		if (!document.fullscreenElement) {
			// isFullscreen itself is kept in sync by the fullscreenchange listener
			containerEl
				.requestFullscreen()
				.then(() => {
					setTimeout(recenter, 200);
				})
				.catch(() => {
					// Fullscreen unsupported (e.g. iOS Safari) — ignore
				});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		function onFullscreenChange() {
			isFullscreen = !!document.fullscreenElement;
		}
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	});

	// --- Detail panel navigation ---
	function navigateToNeighbor(nodeId: string) {
		const n = simNodes.find((nd) => nd.id === nodeId);
		if (n) selectedNode = n;
	}

	// --- Mobile detection ---
	let isMobile = $derived(containerWidth < 640);
</script>

<div class="concept-graph-wrapper" bind:this={containerEl}>
	<!-- Toolbar: stats + search + group filters -->
	<div class="graph-toolbar">
		<GraphFilters
			groups={ALL_GROUPS}
			{activeGroups}
			filteredNodeCount={filteredNodes.length}
			totalNodeCount={simNodes.length}
			filteredEdgeCount={filteredEdges.length}
			activeGroupCount={activeGroups.size}
			totalGroupCount={ALL_GROUPS.length}
			{getNodeColor}
			ontoggle={toggleGroup}
			onactivateall={activateAllGroups}
		/>
		<GraphSearch nodes={filteredNodes} {getNodeColor} onselect={zoomToNode} />
	</div>

	<!-- Graph canvas -->
	<div class="graph-canvas card-surface" class:has-selection={selectedNode !== null}>
		{#if !simulationReady}
			<div class="loading-overlay">
				<Spinner size="8" color="teal" />
				<p class="body-text-muted">Building concept network...</p>
			</div>
		{/if}

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<svg
			bind:this={svgEl}
			width={containerWidth}
			height={containerHeight}
			viewBox="0 0 {containerWidth} {containerHeight}"
			class="graph-svg"
			role="application"
			aria-label="Interactive concept network graph showing relationships between workshop themes"
			tabindex="-1"
			onclick={onBackgroundClick}
			onkeydown={(e) => {
				if (e.key === 'Escape') selectedNode = null;
			}}
		>
			<g transform="translate({transform.x},{transform.y}) scale({transform.k})">
				<!-- Edges -->
				{#each filteredEdges as edge (edgeKey(edge))}
					{@const coords = edgeCoords(edge)}
					<line
						x1={coords.x1}
						y1={coords.y1}
						x2={coords.x2}
						y2={coords.y2}
						stroke={isDarkMode ? '#94a3b8' : '#64748b'}
						stroke-width={spotlightNode &&
						(coords.srcId === spotlightNode.id || coords.tgtId === spotlightNode.id)
							? 1.5
							: 0.7}
						opacity={edgeOpacity(coords.srcId, coords.tgtId)}
					/>
				{/each}

				<!-- Nodes (circles only) -->
				{#each filteredNodes as node (node.id)}
					{@const r = getNodeRadius(node.degree)}
					{@const nx = node.x ?? 0}
					{@const ny = node.y ?? 0}
					<g
						class="node-group"
						role="button"
						tabindex="0"
						aria-label="{node.label} — {node.degree} connections"
						style="cursor: grab; opacity: {nodeOpacity(node)}; outline: none;"
						data-node-id={node.id}
						onpointerenter={() => (hoveredNode = node)}
						onpointermove={onNodePointerMove}
						onpointerleave={() => {
							if (hoveredNode?.id === node.id) hoveredNode = null;
						}}
						onclick={(e) => onNodeClick(e, node)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onNodeClick(e as any, node);
							}
						}}
					>
						<!-- Seed glow ring -->
						{#if node.seed}
							<circle
								cx={nx}
								cy={ny}
								r={r + 4}
								fill="none"
								stroke={getNodeColor(node.group)}
								stroke-width="1.5"
								opacity="0.3"
							/>
						{/if}

						<!-- Main circle -->
						<circle
							cx={nx}
							cy={ny}
							{r}
							fill={getNodeColor(node.group)}
							stroke={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)'}
							stroke-width="1.5"
						/>
					</g>
				{/each}

				<!-- Labels (separate top layer, always rendered above all nodes) -->
				{#each filteredNodes as node (node.id)}
					{#if shouldShowLabel(node)}
						{@const r = getNodeRadius(node.degree)}
						<text
							x={node.x ?? 0}
							y={(node.y ?? 0) - r - 5}
							text-anchor="middle"
							class="node-label"
							fill={isDarkMode ? '#e2e8f0' : '#1e293b'}
							font-size={spotlightNode?.id === node.id ? '12' : '10'}
							font-weight={spotlightNode?.id === node.id ? '600' : '400'}
							opacity={nodeOpacity(node)}
							style="pointer-events: none;"
						>
							{node.label}
						</text>
					{/if}
				{/each}
			</g>
		</svg>

		<!-- Selection pill -->
		{#if selectedNode}
			<button
				class="selection-pill"
				onclick={() => {
					selectedNode = null;
				}}
				aria-label="Clear selection: {selectedNode.label}"
			>
				<span
					class="selection-pill-dot"
					style="background-color: {getNodeColor(selectedNode.group)}"
				></span>
				<span class="selection-pill-label">{selectedNode.label}</span>
				<CloseOutline class="h-3.5 w-3.5" aria-hidden="true" />
			</button>
		{/if}

		<!-- Graph controls -->
		<div class="graph-controls">
			<button class="control-btn" onclick={zoomIn} aria-label="Zoom in" title="Zoom in">
				<PlusOutline class="h-4 w-4" />
			</button>
			<button class="control-btn" onclick={zoomOut} aria-label="Zoom out" title="Zoom out">
				<MinusOutline class="h-4 w-4" />
			</button>
			<button class="control-btn" onclick={recenter} aria-label="Recenter graph" title="Recenter">
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
				onclick={toggleFullscreen}
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

		<!-- Interaction hint -->
		<div class="interaction-hint body-text-muted">
			{#if isMobile}
				Pinch to zoom · Drag nodes · Tap for details
			{:else}
				Ctrl+scroll to zoom · Drag background to pan · Drag nodes to reposition · Click for details
			{/if}
		</div>

		<!-- Hover tooltip -->
		{#if hoveredNode && !draggedNode}
			<div class="graph-tooltip" style="left: {tooltipX + 14}px; top: {tooltipY - 10}px;">
				<div class="tooltip-label">{hoveredNode.label}</div>
				<div class="tooltip-meta">
					<span class="tooltip-dot" style="background-color: {getNodeColor(hoveredNode.group)}"
					></span>
					<span class="tooltip-group">{hoveredNode.group}</span>
				</div>
				<div class="tooltip-stats">
					{hoveredNode.degree} connection{hoveredNode.degree !== 1 ? 's' : ''}
					{#if hoveredNode.seed}
						<span class="tooltip-seed">· Seed</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Detail panel -->
	{#if selectedNode}
		<GraphDetailPanel
			node={selectedNode}
			neighbors={selectedNeighbors}
			{isMobile}
			{getNodeColor}
			onclose={() => (selectedNode = null)}
			onnavigate={navigateToNeighbor}
		/>
	{/if}
</div>

<style>
	.concept-graph-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
	}

	/* Toolbar: stats + search on one row, filters below */
	.graph-toolbar {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs);
		align-items: center;
	}

	.graph-toolbar :global(.stats-bar) {
		grid-column: 1;
		grid-row: 1;
		justify-content: flex-start;
	}

	.graph-toolbar :global(.search-bar) {
		grid-column: 2;
		grid-row: 1;
	}

	.graph-toolbar :global(.group-filters) {
		grid-column: 1 / -1;
		grid-row: 2;
	}

	@media (max-width: 640px) {
		.graph-toolbar {
			grid-template-columns: 1fr;
		}

		.graph-toolbar :global(.search-bar) {
			grid-column: 1;
			grid-row: 1;
			max-width: 100%;
		}

		.graph-toolbar :global(.stats-bar) {
			grid-row: 2;
		}

		.graph-toolbar :global(.group-filters) {
			grid-column: 1;
			grid-row: 3;
		}
	}

	.graph-canvas {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius-xl);
	}

	.graph-svg {
		display: block;
		touch-action: pan-y;
	}

	/* Fullscreen mode */
	.concept-graph-wrapper:fullscreen {
		background: var(--bg-page);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
	}

	.concept-graph-wrapper:fullscreen .graph-canvas {
		flex: 1;
	}

	.concept-graph-wrapper:fullscreen .graph-svg {
		width: 100%;
		height: 100%;
	}

	/* Graph controls */
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
		width: 2rem;
		height: 2rem;
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

	.control-btn:hover {
		background: var(--bg-sunken);
		color: var(--text-primary);
		box-shadow: var(--shadow-md);
	}

	.control-btn:active {
		transform: scale(0.93);
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		z-index: 2;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.interaction-hint {
		position: absolute;
		bottom: var(--space-sm);
		left: 50%;
		transform: translateX(-50%);
		font-size: var(--text-xs);
		background: var(--bg-raised);
		color: var(--text-muted);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		opacity: 0.7;
		pointer-events: none;
		white-space: nowrap;
		border: 1px solid var(--border-subtle);
	}

	/* Node labels — halo sized to the current page background */
	.node-label {
		pointer-events: none;
		user-select: none;
		text-shadow:
			0 0 4px var(--bg-page),
			0 0 4px var(--bg-page),
			0 0 8px var(--bg-page);
	}

	/* Selection pill */
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
	}

	.selection-pill:hover {
		background: var(--bg-sunken);
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

	/* Tooltip */
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
