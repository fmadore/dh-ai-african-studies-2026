<script lang="ts">
	import { untrack } from 'svelte';
	import type {
		ConceptNode,
		ConceptEdge,
		ConceptGraphData,
		ConceptGroup
	} from '#lib/types/concept-graph';
	import {
		GROUP_COLORS,
		ALL_GROUPS,
		getNodeRadius,
		LABEL_COLOR
	} from './concept-graph/graph-config';
	import { Spinner } from 'flowbite-svelte';
	import GraphSearch from './concept-graph/GraphSearch.svelte';
	import GraphDetailPanel from './concept-graph/GraphDetailPanel.svelte';
	import GraphFilters from './concept-graph/GraphFilters.svelte';
	import GraphTextView from './concept-graph/GraphTextView.svelte';
	import GraphControls from './concept-graph/GraphControls.svelte';
	import GraphTooltip from './concept-graph/GraphTooltip.svelte';
	import GraphSelectionPill from './concept-graph/GraphSelectionPill.svelte';
	import { GraphFullscreen } from './concept-graph/graph-fullscreen.svelte';
	import { fitGraphView, viewAfterResize } from './concept-graph/graph-viewport';
	import { nextGraphNode, type GraphNavigationKey } from './concept-graph/graph-navigation';
	import {
		buildAdjacency,
		sortedNeighbors,
		withGroupActive
	} from './concept-graph/graph-selection';
	import { GraphRenderer, type ResolvedGraphEdge } from './concept-graph/graph-renderer';
	import { createGraphSimulation, type GraphSimulation } from './concept-graph/graph-simulation';

	interface Props {
		data: ConceptGraphData;
		embedded?: boolean;
	}

	let { data, embedded = false }: Props = $props();
	const graphInstructionsId = $props.id();

	// --- Elements ---
	let svgEl: SVGSVGElement;
	let canvasEl: HTMLCanvasElement;
	let viewportEl: SVGGElement;
	let containerEl: HTMLDivElement;
	/** The `.graph-canvas` stage: sized by the ResizeObserver, tooltip origin. */
	let stageEl: HTMLDivElement;

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
	let activeGroups = $state.raw<ReadonlySet<ConceptGroup>>(new Set(ALL_GROUPS));
	let simulationReady = $state(false);
	let graphFailed = $state(false);
	let fittingView = true;
	const fullscreen = new GraphFullscreen(() => containerEl);
	let prefersReducedMotion = $state(false);
	let focusedNodeId = $state<string | null>(null);

	// --- Tooltip state ---
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	// Read once per hovered node rather than on every pointermove; dropped
	// when the stage resizes or anything scrolls.
	let stageRect: DOMRect | null = null;

	// The renderer owns DOM writes and the non-reactive view transform, keeping
	// high-frequency D3 ticks out of Svelte's reactive graph.
	const graphRenderer = new GraphRenderer({ getNodeRadius });
	const view = graphRenderer.view;

	// Force layout, zoom and drag (graph-simulation.ts); null until D3 loads
	let simulation: GraphSimulation | null = null;

	// --- Adjacency, built once from the source data ---
	// The spotlight used to rediscover a node's neighbours by walking every
	// edge on each pointerenter. Precomputed, that lookup is O(1).
	let adjacency = $derived(buildAdjacency(data.edges));

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
	// Every distinct neighbour, hidden groups included: following one into a
	// hidden group shows that group again (see navigateToNeighbor).
	let selectedNeighbors = $derived(selectedNode ? sortedNeighbors(adjacency, selectedNode.id) : []);

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
		simulation?.bindDrag();
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
		const syncPreference = () => {
			prefersReducedMotion = query.matches;
			simulation?.setReducedMotion(query.matches);
		};
		syncPreference();
		query.addEventListener('change', syncPreference);
		return () => query.removeEventListener('change', syncPreference);
	});

	function motionDuration(duration: number) {
		return prefersReducedMotion ? 0 : duration;
	}

	// --- Zoom to node (called by search) ---
	function zoomToNode(node: ConceptNode) {
		if (!simulation) return;
		fittingView = false;
		const k = 1.4;
		// The mobile sheet covers the lower half of the screen, so the node is
		// placed in the upper part of the stage rather than at its centre.
		const cy = asSheet ? containerHeight * 0.35 : containerHeight / 2;
		simulation.zoomTo(
			{
				x: containerWidth / 2 - (node.x ?? containerWidth / 2) * k,
				y: cy - (node.y ?? containerHeight / 2) * k,
				k
			},
			motionDuration(500)
		);
		selectedNode = node;
		if (asSheet) {
			// Search sits above the graph, and focusing the node would scroll it to
			// mid-screen, under the sheet. Focus stays in the sheet; the stage is
			// brought up beneath the header instead (fullscreen has no page to scroll).
			focusedNodeId = node.id;
			if (!fullscreen.active)
				stageEl?.scrollIntoView({
					block: 'start',
					behavior: prefersReducedMotion ? 'auto' : 'smooth'
				});
		} else {
			focusGraphNode(node);
		}
	}

	// --- Tooltip positioning ---
	function onNodePointerEnter(node: ConceptNode) {
		hoveredNode = node;
		stageRect = stageEl?.getBoundingClientRect() ?? null;
	}

	function onNodePointerMove(event: PointerEvent) {
		stageRect ??= stageEl?.getBoundingClientRect() ?? null;
		if (!stageRect) return;
		tooltipX = event.clientX - stageRect.left;
		tooltipY = event.clientY - stageRect.top;
	}

	$effect(() => {
		const invalidate = () => (stageRect = null);
		// Capture: a scroll inside any ancestor (the expanded stage scrolls) moves it too
		window.addEventListener('scroll', invalidate, { capture: true, passive: true });
		return () => window.removeEventListener('scroll', invalidate, { capture: true });
	});

	// --- Responsive sizing ---
	$effect(() => {
		if (typeof window === 'undefined' || !containerEl) return;
		const target = stageEl ?? containerEl;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				containerWidth = w;
				if (fullscreen.active) {
					containerHeight = entry.contentRect.height;
				} else {
					containerHeight = embedded
						? Math.max(240, Math.min(w * 0.65, window.innerHeight * 0.55))
						: Math.max(400, Math.min(w * 0.65, 700));
				}
				stageRect = null;
				// Only an untouched fit-all view follows the stage. In fullscreen the
				// stage is `flex: 1`, so opening the detail panel shrinks it; refitting
				// unconditionally threw away the user's zoom and cut zoomToNode's
				// transition short.
				untrack(() => {
					const next = viewAfterResize(
						fittingView,
						filteredNodes,
						containerWidth,
						containerHeight,
						getNodeRadius
					);
					if (next) simulation?.zoomTo(next, 0);
				});
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
		graphFailed = false;
		simulationReady = false;
		fittingView = true;
		selectedNode = null;
		hoveredNode = null;

		createGraphSimulation({
			data: graphData,
			svg: svgEl,
			getSize: () => ({ width: containerWidth, height: containerHeight }),
			getNodeRadius,
			reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
			// A tick schedules a repaint rather than touching reactive state
			onTick: () => {
				if (!destroyed) graphRenderer.scheduleRender(true);
			},
			onSettled: () => {
				if (destroyed) return;
				simulationReady = true;
				if (fittingView) fitGraph(0);
				graphRenderer.scheduleRender(true);
			},
			onZoom: (next, fromGesture) => {
				if (fromGesture) fittingView = false;
				Object.assign(view, next);
				graphRenderer.scheduleRender();
			},
			onDrag: (node) => {
				draggedNode = node;
				if (node) fittingView = false;
			}
		})
			.then((created) => {
				if (destroyed) return created.destroy();
				simulation = created;
				// Assigned once. `$state.raw` means d3's in-place writes to x/y on these
				// very objects stay invisible to Svelte.
				simEdges = created.edges;
				simNodes = created.nodes;
				fitGraph(0);
				simulationReady = true;
			})
			.catch(() => {
				if (!destroyed) graphFailed = true;
			});

		return () => {
			destroyed = true;
			simulation?.destroy();
			simulation = null;
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

	/**
	 * Clear the selection. Closing the detail panel or the selection pill
	 * unmounts the control that had focus, so `restoreFocus` returns it to the
	 * node that was selected — the mobile sheet is a dialog, and a dialog hands
	 * focus back to where it came from.
	 */
	function clearSelection(restoreFocus: boolean) {
		const node = selectedNode;
		selectedNode = null;
		if (restoreFocus && node && filteredNodeIds.has(node.id)) focusGraphNode(node);
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
		// Invariant: the selection (and hover) always belongs to an active group
		if (selectedNode && !next.has(selectedNode.group)) selectedNode = null;
		if (hoveredNode && !next.has(hoveredNode.group)) hoveredNode = null;
	}

	function activateAllGroups() {
		activeGroups = new Set(ALL_GROUPS);
	}

	// --- Zoom controls ---
	function zoomIn() {
		fittingView = false;
		simulation?.zoomBy(1.5, motionDuration(300));
	}

	function zoomOut() {
		fittingView = false;
		simulation?.zoomBy(1 / 1.5, motionDuration(300));
	}

	function fitGraph(duration: number) {
		// Keep dimensions and filters out of the simulation initialization effect.
		untrack(() => {
			if (!simulation) return;
			simulation.zoomTo(
				fitGraphView(filteredNodes, containerWidth, containerHeight, getNodeRadius),
				duration
			);
		});
	}

	function recenter() {
		fittingView = true;
		fitGraph(motionDuration(400));
	}

	// --- Detail panel navigation ---
	// The panel lists every neighbour, so one may sit in a group the user has
	// switched off. Selecting it there left an un-rendered node selected and the
	// whole graph dimmed; its group is shown again instead, keeping the
	// invariant toggleGroup enforces.
	function navigateToNeighbor(nodeId: string) {
		const n = simNodes.find((nd) => nd.id === nodeId);
		if (!n) return;
		activeGroups = withGroupActive(activeGroups, n.group);
		selectedNode = n;
	}

	// --- Mobile detection ---
	let isMobile = $derived(containerWidth < 640);
	// The embed keeps the panel inline: in a short iframe a sheet would bury the graph.
	let asSheet = $derived(isMobile && !embedded);

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

	/**
	 * The one owner of Escape for the graph: one press does one thing. Inner
	 * handlers that consume Escape (search dropdown, header menu) call
	 * preventDefault, and this skips the event; otherwise it clears the
	 * selection first, and only a later press leaves the expanded stage. The
	 * browser exits native fullscreen itself.
	 */
	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || event.defaultPrevented) return;
		if (selectedNode) {
			event.preventDefault();
			// Focus inside the panel or on the pill would be lost when they unmount
			const active = document.activeElement;
			const inSelectionUi =
				active instanceof Element &&
				containerEl?.contains(active) &&
				active.closest('.detail-panel, .selection-pill') !== null;
			clearSelection(inSelectionUi);
		} else if (fullscreen.exitExpanded()) {
			event.preventDefault();
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div
	class="concept-graph-wrapper"
	class:embedded
	class:is-fullscreen={fullscreen.active}
	class:is-expanded={fullscreen.expanded}
	data-viewport-overlay={fullscreen.expanded ? '' : undefined}
	bind:this={containerEl}
>
	<!-- Toolbar: stats + search + group filters -->
	<div class="graph-toolbar">
		<GraphFilters
			groups={ALL_GROUPS}
			{activeGroups}
			filteredNodeCount={filteredNodes.length}
			totalNodeCount={simNodes.length}
			filteredEdgeCount={filteredEdges.length}
			ontoggle={toggleGroup}
			onactivateall={activateAllGroups}
		/>
		<GraphSearch nodes={filteredNodes} onselect={zoomToNode} />
	</div>

	<!-- Graph canvas -->
	<div
		class="graph-canvas card-surface"
		class:has-selection={selectedNode !== null}
		bind:this={stageEl}
	>
		<p id={graphInstructionsId} class="sr-only">
			Use the arrow keys to move between concepts. Press Enter or Space to show a concept's details.
		</p>
		{#if graphFailed}
			<div class="loading-overlay graph-error" role="status">
				<p>The interactive graph could not be loaded.</p>
				<p>All concepts and connections are available in the text directory below.</p>
				<!-- A new document clears failed module imports retained by some browsers. -->
				<button class="graph-retry" onclick={() => window.location.reload()}
					>Reload page and retry</button
				>
			</div>
		{:else if !simulationReady}
			<div class="loading-overlay">
				<Spinner size="8" color="teal" />
				<p class="body-text-muted">Building concept network...</p>
			</div>
		{/if}

		<!-- Edges: purely decorative, so they are rasterised rather than kept as
		     a thousand-odd live SVG elements. Hidden from assistive tech; every
		     relationship is also reachable as text in the detail panel. -->
		<canvas bind:this={canvasEl} class="graph-edges" aria-hidden="true"></canvas>

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
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
						onpointerenter={() => onNodePointerEnter(node)}
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
						<!-- Invisible touch surface, coarse pointers only (via CSS): the
						     radius encodes degree, so low-degree nodes stay visually small
						     while fingers get a tappable disc. -->
						<circle class="node-hit-area" r={Math.max(r + 4, 22)} fill="transparent" />

						<!-- Seed glow ring -->
						{#if node.seed}
							<circle
								r={r + 4}
								fill="none"
								stroke={GROUP_COLORS[node.group]}
								stroke-width="1.5"
								opacity="0.3"
							/>
						{/if}

						<!-- Main circle -->
						<circle
							{r}
							fill={GROUP_COLORS[node.group]}
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

		{#if selectedNode}
			<GraphSelectionPill node={selectedNode} onclear={() => clearSelection(true)} />
		{/if}

		<GraphControls
			isFullscreen={fullscreen.active}
			onzoomin={zoomIn}
			onzoomout={zoomOut}
			onrecenter={recenter}
			ontogglefullscreen={() => fullscreen.toggle()}
		/>

		<!-- Interaction hint -->
		<div class="interaction-hint body-text-muted">
			{#if isMobile}
				Pinch to zoom · Drag nodes · Tap for details
			{:else}
				Arrow keys move between concepts · Enter opens details · Ctrl+scroll zooms
			{/if}
		</div>

		<!-- Hover tooltip -->
		<!-- Not while the mobile sheet is open: it only repeats the sheet's header. -->
		{#if hoveredNode && !draggedNode && !(asSheet && selectedNode)}
			<GraphTooltip node={hoveredNode} x={tooltipX} y={tooltipY} />
		{/if}
	</div>

	<!-- Detail panel -->
	{#if selectedNode}
		<GraphDetailPanel
			node={selectedNode}
			neighbors={selectedNeighbors}
			isMobile={asSheet}
			onclose={() => clearSelection(true)}
			onnavigate={navigateToNeighbor}
		/>
	{/if}
	<GraphTextView {data} open={graphFailed} />
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
		/* `.card-surface` paints with --surface-2, which `.band-ink` also sets to
		 * 5% white. The mobile detail sheet overlays the graph, so it showed the
		 * nodes and labels straight through its text. */
		--surface-2: var(--graph-surface);

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
		scroll-margin-top: var(--scroll-offset);
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

	/* The invisible touch disc exists only where fingers do — a mouse keeps
	   the precise degree-sized target, so dense clusters stay disambiguable. */
	.node-hit-area {
		display: none;
	}

	@media (pointer: coarse) {
		.node-hit-area {
			display: block;
		}
	}

	/* The keyboard indicator is drawn in the graph rather than as a box: a
	 * rectangular outline around a <g> lands on its bounding box (the hit disc
	 * on touch) and does not follow the zoom. The main circle's thick pale
	 * stroke below replaces it. */
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
	 * one in light mode. A class rather than :fullscreen, so the expanded
	 * fallback below shares every rule. */
	.concept-graph-wrapper.is-fullscreen {
		background: var(--graph-ink);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.concept-graph-wrapper:fullscreen::backdrop {
		background: var(--graph-ink);
	}

	.is-fullscreen .graph-canvas {
		flex: 1;
		min-height: 240px;
	}

	/* Nothing behind the stage to scroll, so every gesture belongs to the graph */
	.is-fullscreen .graph-svg {
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	/* Expanded: the Fullscreen API stand-in, fixed over the viewport. */
	.concept-graph-wrapper.is-expanded {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		overscroll-behavior: contain;
	}

	/* <main> is `relative z-10`, a stacking context under the sticky header
	 * (--z-overlay), so no z-index inside it can clear the header. While the
	 * stage is expanded, <main> stops being one. */
	:global(html.concept-graph-expanded) {
		overflow: hidden;
	}

	:global(html.concept-graph-expanded #main-content) {
		z-index: auto;
	}

	/* On a phone the toolbar wraps to nearly half the screen, which left the
	 * fullscreen graph 240px tall. Fullscreen keeps search and the filters, as
	 * one swipeable row, and leaves the counts and directory to the page. */
	@media (max-width: 640px) {
		.is-fullscreen :global(.stats-bar),
		.is-fullscreen :global(.graph-text-view) {
			display: none;
		}

		.is-fullscreen :global(.group-filters) {
			flex-wrap: nowrap;
			justify-content: flex-start;
			overflow-x: auto;
			scrollbar-width: none;
			margin-inline: calc(var(--space-md) * -1);
			padding-inline: var(--space-md);
		}

		.is-fullscreen :global(.filter-btn) {
			flex-shrink: 0;
			white-space: nowrap;
		}
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

	.graph-error {
		padding: var(--space-lg);
		text-align: center;
		background: var(--graph-surface);
	}

	.graph-retry {
		min-height: 2.75rem;
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-control);
		background: var(--graph-raised);
		color: var(--text-primary);
		cursor: pointer;
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
</style>
