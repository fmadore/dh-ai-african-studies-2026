<script lang="ts">
	import type {
		ConceptNode,
		ConceptEdge,
		ConceptGraphData,
		ConceptGroup
	} from '$lib/types/concept-graph';
	import {
		GROUP_COLORS,
		ALL_GROUPS,
		getNodeRadius,
		LABEL_COLOR
	} from './concept-graph/graph-config';
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
	import { nextGraphNode, type GraphNavigationKey } from './concept-graph/graph-navigation';
	import { GraphRenderer, type ResolvedGraphEdge } from './concept-graph/graph-renderer';
	import type { D3DragEvent } from 'd3-drag';
	import type { Selection } from 'd3-selection';
	import type { D3ZoomEvent, ZoomBehavior } from 'd3-zoom';

	interface Props {
		data: ConceptGraphData;
	}

	let { data }: Props = $props();
	const graphInstructionsId = $props.id();

	type GraphDragSubject = { x?: number; y?: number };
	type GraphTransition = {
		duration: (_milliseconds: number) => GraphTransition;
		call: (_callback: unknown, ..._args: unknown[]) => GraphTransition;
	};
	type GraphSelection = Selection<SVGSVGElement, unknown, null, undefined> & {
		transition: () => GraphTransition;
	};

	// The stage is dark in both themes, so the palette is fixed rather than
	// following the page theme — see graph-config.ts.
	function getNodeColor(group: ConceptGroup): string {
		return GROUP_COLORS[group];
	}

	// --- Elements ---
	let svgEl: SVGSVGElement;
	let canvasEl: HTMLCanvasElement;
	let viewportEl: SVGGElement;
	let containerEl: HTMLDivElement;

	let containerWidth = $state(800);
	let containerHeight = $state(500);

	// d3-force mutates every node object in place, sixty times a second.
	// `$state.raw` keeps those objects out of Svelte's proxy, so a tick costs
	// nothing reactively; the arrays themselves are assigned exactly once, when
	// the simulation is built.
	let simNodes = $state.raw<ConceptNode[]>([]);
	let simEdges = $state.raw<ConceptEdge[]>([]);
	let hoveredNode = $state.raw<ConceptNode | null>(null);
	let selectedNode = $state.raw<ConceptNode | null>(null);
	let draggedNode = $state.raw<ConceptNode | null>(null);
	let activeGroups = $state.raw<Set<ConceptGroup>>(new Set(ALL_GROUPS));
	let simulationReady = $state(false);
	let isFullscreen = $state(false);
	let prefersReducedMotion = $state(false);
	let focusedNodeId = $state<string | null>(null);

	// --- Tooltip state ---
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// The renderer owns DOM writes and the non-reactive view transform, keeping
	// high-frequency D3 ticks out of Svelte's reactive graph.
	const graphRenderer = new GraphRenderer({ getNodeRadius });
	const view = graphRenderer.view;

	// Track references for programmatic control
	let zoomBehaviorRef: ZoomBehavior<SVGSVGElement, unknown> | null = null;
	let svgSelectionRef: GraphSelection | null = null;
	let d3ZoomModuleRef: typeof import('d3-zoom') | null = null;
	let applyDragRef: (() => void) | null = null;

	// --- Adjacency, built once from the source data ---
	// The spotlight used to rediscover a node's neighbours by walking every
	// edge on each pointerenter. Precomputed, that lookup is O(1).
	let adjacency = $derived.by(() => {
		const map = new Map<string, string[]>(); // eslint-disable-line svelte/prefer-svelte-reactivity
		const link = (from: string, to: string) => {
			const list = map.get(from);
			if (list) list.push(to);
			else map.set(from, [to]);
		};
		for (const e of data.edges) {
			const s = typeof e.source === 'string' ? e.source : e.source.id;
			const t = typeof e.target === 'string' ? e.target : e.target.id;
			link(s, t);
			link(t, s);
		}
		return map;
	});

	// --- Filtered data ---
	// `simNodes` is now stable across ticks, so these recompute only when the
	// user toggles a group filter.
	let filteredNodes = $derived(simNodes.filter((n) => activeGroups.has(n.group)));
	let filteredNodeIds = $derived(new Set(filteredNodes.map((n) => n.id)));

	$effect(() => {
		const nodes = filteredNodes;
		if (nodes.length === 0) {
			focusedNodeId = null;
		} else if (!focusedNodeId || !nodes.some((node) => node.id === focusedNodeId)) {
			focusedNodeId = nodes[0].id;
		}
	});
	let filteredEdges = $derived.by(() => {
		const ids = filteredNodeIds;
		const out: ResolvedGraphEdge[] = [];
		for (const e of simEdges) {
			const s = e.source;
			const t = e.target;
			if (typeof s === 'string' || typeof t === 'string') continue;
			if (ids.has(s.id) && ids.has(t.id)) out.push({ s, t });
		}
		return out;
	});

	// --- Spotlight: hover takes priority, then selected ---
	let spotlightNode = $derived(hoveredNode ?? selectedNode);
	let spotlightNeighborIds = $derived.by(() => {
		if (!spotlightNode) return null;
		const ids = new Set<string>([spotlightNode.id]); // eslint-disable-line svelte/prefer-svelte-reactivity
		for (const id of adjacency.get(spotlightNode.id) ?? []) ids.add(id);
		return ids;
	});

	// --- Selected node neighbors for detail panel ---
	let selectedNeighbors = $derived.by(() => {
		if (!selectedNode) return [];
		return [...new Set(adjacency.get(selectedNode.id) ?? [])].sort();
	});

	// Mirror reactive state into the renderer. It is the only bridge between
	// Svelte state and the imperative canvas/SVG paint loop.
	$effect(() => {
		graphRenderer.setPaint({
			nodes: filteredNodes,
			edges: filteredEdges,
			spot: spotlightNode,
			spotIds: spotlightNeighborIds
		});
	});

	$effect(() => {
		graphRenderer.setViewport(viewportEl);
	});

	// Re-cache element references whenever nodes are recreated by a filter toggle.
	$effect(() => {
		const expected = filteredNodes.length;
		if (!svgEl || expected === 0) return;
		graphRenderer.setNodeElements(
			Array.from(svgEl.querySelectorAll<SVGGElement>('.node-group')),
			Array.from(svgEl.querySelectorAll<SVGTextElement>('.node-label'))
		);
		applyDragRef?.();
	});

	// --- Canvas backing store ---
	$effect(() => {
		if (!canvasEl) return;
		graphRenderer.setCanvas(canvasEl);
		graphRenderer.resize(containerWidth, containerHeight);
	});

	$effect(() => () => graphRenderer.destroy());

	$effect(() => {
		if (typeof window === 'undefined') return;
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncPreference = () => (prefersReducedMotion = query.matches);
		syncPreference();
		query.addEventListener('change', syncPreference);
		return () => query.removeEventListener('change', syncPreference);
	});

	function motionDuration(duration: number) {
		return prefersReducedMotion ? 0 : duration;
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
			.duration(motionDuration(500))
			.call(zoomBehaviorRef.transform, d3ZoomModuleRef.zoomIdentity.translate(tx, ty).scale(scale));
		selectedNode = node;
		focusGraphNode(node);
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
				graphRenderer.scheduleRender(true);
			});

			setTimeout(() => {
				if (!destroyed) simulationReady = true;
			}, 300);

			// --- d3-zoom on SVG ---
			const svg = d3Selection.select(svgEl);
			const zoomBehavior = d3Zoom
				.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.3, 5])
				.filter((event: Event) => {
					if (event.type === 'wheel') {
						const wheelEvent = event as WheelEvent;
						return wheelEvent.ctrlKey || wheelEvent.metaKey;
					}
					return true;
				})
				.on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
					view.x = event.transform.x;
					view.y = event.transform.y;
					view.k = event.transform.k;
					graphRenderer.scheduleRender();
				});

			svg.call(zoomBehavior);
			zoomBehaviorRef = zoomBehavior;
			svgSelectionRef = svg as GraphSelection;
			d3ZoomModuleRef = d3Zoom;

			// --- d3-drag on nodes ---
			function findNode(el: SVGGElement): ConceptNode | undefined {
				const id = el.getAttribute('data-node-id');
				return id ? nodes.find((n) => n.id === id) : undefined;
			}

			const dragBehavior = d3Drag
				.drag<SVGGElement, unknown, GraphDragSubject>()
				.subject(function () {
					const node = findNode(this);
					return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
				})
				.on('start', function (event: D3DragEvent<SVGGElement, unknown, GraphDragSubject>) {
					const node = findNode(this);
					if (!node) return;
					if (!event.active) simulation.alphaTarget(0.3).restart();
					node.fx = node.x;
					node.fy = node.y;
					draggedNode = node;
				})
				.on('drag', function (event: D3DragEvent<SVGGElement, unknown, GraphDragSubject>) {
					const node = findNode(this);
					if (!node) return;
					node.fx = event.x;
					node.fy = event.y;
				})
				.on('end', function (event: D3DragEvent<SVGGElement, unknown, GraphDragSubject>) {
					const node = findNode(this);
					if (!node) return;
					if (!event.active) simulation.alphaTarget(0);
					node.fx = null;
					node.fy = null;
					draggedNode = null;
				});

			applyDragRef = () => {
				if (destroyed || !svgEl) return;
				d3Selection.select(svgEl).selectAll<SVGGElement, unknown>('.node-group').call(dragBehavior);
			};

			// A tick only moves nodes; it never changes which nodes or edges exist.
			// So it schedules a repaint rather than touching reactive state.
			simulation.on('tick', () => graphRenderer.scheduleRender(true));

			// Assigned once. `$state.raw` means d3's in-place writes to x/y on these
			// very objects stay invisible to Svelte.
			simEdges = edges;
			simNodes = nodes;

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
	function onNodeClick(event: MouseEvent | KeyboardEvent, node: ConceptNode) {
		event.stopPropagation();
		selectedNode = selectedNode?.id === node.id ? null : node;
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
	}

	function activateAllGroups() {
		activeGroups = new Set(ALL_GROUPS);
	}

	// --- Zoom controls ---
	function zoomIn() {
		if (!zoomBehaviorRef || !svgSelectionRef) return;
		svgSelectionRef.transition().duration(motionDuration(300)).call(zoomBehaviorRef.scaleBy, 1.5);
	}

	function zoomOut() {
		if (!zoomBehaviorRef || !svgSelectionRef) return;
		svgSelectionRef
			.transition()
			.duration(motionDuration(300))
			.call(zoomBehaviorRef.scaleBy, 1 / 1.5);
	}

	function recenter() {
		if (!zoomBehaviorRef || !svgSelectionRef || !d3ZoomModuleRef) return;
		svgSelectionRef
			.transition()
			.duration(motionDuration(400))
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

	// --- Keyboard focus spotlight (parity with pointer hover) ---
	function onNodeFocus(node: ConceptNode) {
		focusedNodeId = node.id;
		hoveredNode = node;
		// Position the tooltip at the node itself (no pointer coords on focus)
		tooltipX = (node.x ?? 0) * view.k + view.x;
		tooltipY = (node.y ?? 0) * view.k + view.y;
	}

	function focusGraphNode(node: ConceptNode) {
		focusedNodeId = node.id;
		requestAnimationFrame(() => {
			graphRenderer.focusNode(node.id);
		});
	}

	function onNodeKeydown(event: KeyboardEvent, node: ConceptNode) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onNodeClick(event, node);
			return;
		}

		if (
			event.key !== 'ArrowUp' &&
			event.key !== 'ArrowDown' &&
			event.key !== 'ArrowLeft' &&
			event.key !== 'ArrowRight' &&
			event.key !== 'Home' &&
			event.key !== 'End'
		) {
			return;
		}

		event.preventDefault();
		const next = nextGraphNode(filteredNodes, node.id, event.key as GraphNavigationKey);
		if (next) focusGraphNode(next);
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && selectedNode) selectedNode = null;
	}}
/>

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
		<p id={graphInstructionsId} class="sr-only">
			Use the arrow keys to move between concepts. Press Enter or Space to show a concept's details.
		</p>
		{#if !simulationReady}
			<div class="loading-overlay">
				<Spinner size="8" color="teal" />
				<p class="body-text-muted">Building concept network...</p>
			</div>
		{/if}

		<!-- Edges: purely decorative, so they are rasterised rather than kept as
		     a thousand-odd live SVG elements. Hidden from assistive tech; every
		     relationship is also reachable as text in the detail panel. -->
		<canvas bind:this={canvasEl} class="graph-edges" aria-hidden="true"></canvas>

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<svg
			bind:this={svgEl}
			width={containerWidth}
			height={containerHeight}
			viewBox="0 0 {containerWidth} {containerHeight}"
			class="graph-svg"
			role="group"
			aria-label="Interactive concept network graph showing relationships between workshop themes"
			aria-describedby={graphInstructionsId}
			tabindex="-1"
			onclick={onBackgroundClick}
			onkeydown={(e) => {
				if (e.key === 'Escape') selectedNode = null;
			}}
		>
			<g bind:this={viewportEl}>
				<!-- Nodes (circles only). Position, opacity and the zoom transform are
				     written imperatively by render(); the template stays structural. -->
				{#each filteredNodes as node (node.id)}
					{@const r = getNodeRadius(node.degree)}
					<g
						class="node-group"
						role="button"
						tabindex={node.id === focusedNodeId ? 0 : -1}
						aria-label="{node.label} — {node.degree} connections"
						aria-pressed={selectedNode?.id === node.id}
						data-node-id={node.id}
						onpointerenter={() => (hoveredNode = node)}
						onpointermove={onNodePointerMove}
						onpointerleave={() => {
							if (hoveredNode?.id === node.id) hoveredNode = null;
						}}
						onfocus={() => onNodeFocus(node)}
						onblur={() => {
							if (hoveredNode?.id === node.id) hoveredNode = null;
						}}
						onclick={(e) => onNodeClick(e, node)}
						onkeydown={(event) => onNodeKeydown(event, node)}
					>
						<!-- Seed glow ring -->
						{#if node.seed}
							<circle
								r={r + 4}
								fill="none"
								stroke={getNodeColor(node.group)}
								stroke-width="1.5"
								opacity="0.3"
							/>
						{/if}

						<!-- Main circle -->
						<circle
							{r}
							fill={getNodeColor(node.group)}
							stroke="rgba(255,255,255,0.18)"
							stroke-width="1.5"
						/>
					</g>
				{/each}

				<!-- Labels (separate top layer, always rendered above all nodes).
				     All of them stay in the DOM and are shown or hidden by render(),
				     so zooming past a threshold no longer creates ~100 text nodes. -->
				{#each filteredNodes as node (node.id)}
					<text
						text-anchor="middle"
						class="node-label"
						fill={LABEL_COLOR}
						font-size="10"
						font-weight="400"
						style="display: none;"
					>
						{node.label}
					</text>
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
				Arrow keys move between concepts · Enter opens details · Ctrl+scroll zooms
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
	/* The graph carries its own dark stage rather than borrowing the page's
	 * surfaces. Two reasons:
	 *
	 * 1. It is always painted on ink — inside `.band-ink` on /concepts, and
	 *    standalone on /concepts/embed. Reading the *page* theme meant that in
	 *    light mode the light palette landed on a near-black band: labels at
	 *    1.05:1, edges at 1.39:1.
	 * 2. `.band-ink` redefines --bg-raised to rgba(255,255,255,0.05), so every
	 *    piece of chrome built on it — tooltip, controls, selection pill, search
	 *    field and its results, filter chips, detail panel — was 95%
	 *    transparent, with nodes and edges showing straight through.
	 *
	 * Declaring the on-ink token set here makes the graph self-contained, so it
	 * looks the same in both themes, on both routes, and in fullscreen. */
	.concept-graph-wrapper {
		/* Fixed, not mixed from --surface-ink: that token is #1c1917 in light mode
		 * but pure black in dark, and an oklab mix off black barely moves (11%
		 * white gave #040404), leaving the tooltip indistinguishable from the
		 * stage. Explicit steps keep the stage identical in both themes. Warm
		 * darks, to sit with the site's stone ramp rather than against it. */
		--graph-ink: #171514;
		--graph-surface: #201d1b;
		--graph-raised: #2c2926;
		--graph-sunken: #1a1817;

		--bg-page: var(--graph-ink);
		--bg-raised: var(--graph-raised);
		--bg-sunken: var(--graph-sunken);
		--bg-overlay: #3a3633;

		--text-primary: var(--color-gray-50);
		--text-secondary: var(--color-gray-200);
		--text-muted: var(--color-gray-300);
		--text-subtle: var(--color-gray-400);
		--text-accent: var(--color-secondary-300);
		--text-link: var(--color-secondary-300);
		--text-link-hover: var(--color-secondary-200);

		--border-subtle: rgba(255, 255, 255, 0.1);
		--border-default: rgba(255, 255, 255, 0.18);
		--border-strong: rgba(255, 255, 255, 0.3);
		--accent: var(--color-secondary-400);

		color: var(--text-primary);
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
		/* Opaque, so the stage does not depend on whatever is behind it. */
		background-color: var(--graph-surface);
	}

	/* Edge layer sits under the interactive SVG and never takes a pointer event. */
	.graph-edges {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.graph-svg {
		display: block;
		position: relative;
		z-index: 1;
		touch-action: pan-y;
	}

	.node-group {
		cursor: grab;
	}

	.node-group:focus-visible {
		outline: none;
	}

	.node-group:focus-visible circle:last-child {
		stroke: var(--color-secondary-100);
		stroke-width: 3;
	}

	/* Fullscreen mode. The ink, not --bg-page: the ancestor band stops painting
	 * once this element is in the top layer, and --bg-page is the *page*
	 * background, so fullscreen used to swap the dark stage for a near-white
	 * one in light mode. */
	.concept-graph-wrapper:fullscreen {
		background: var(--graph-ink);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
	}

	.concept-graph-wrapper:fullscreen::backdrop {
		background: var(--graph-ink);
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
		z-index: 2;
	}

	/* Node labels — the halo must match the stage the text sits on, not the page
	 * behind it, or it reads as a pale outline around every label. */
	.node-label {
		pointer-events: none;
		user-select: none;
		text-shadow:
			0 0 4px var(--graph-surface),
			0 0 4px var(--graph-surface),
			0 0 8px var(--graph-surface);
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
