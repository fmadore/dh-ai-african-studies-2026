<script lang="ts">
	import type { ConceptNode, ConceptEdge, ConceptGraphData, ConceptGroup } from '$lib/types/concept-graph';
	import { createSubscriber } from 'svelte/reactivity';

	interface Props {
		data: ConceptGraphData;
	}

	let { data }: Props = $props();

	// --- Dark mode detection (same pattern as ParticipantsMap) ---
	const darkModeSubscriber = createSubscriber((update) => {
		if (typeof window === 'undefined') return;
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') update();
			}
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	let isDarkMode = $derived.by(() => {
		if (typeof window === 'undefined') return false;
		darkModeSubscriber();
		return document.documentElement.classList.contains('dark');
	});

	// --- Group colors (teal-dominant palette) ---
	const GROUP_COLORS: Record<ConceptGroup, { light: string; dark: string }> = {
		'Infrastructure & Governance': { light: '#0d9488', dark: '#2dd4bf' },
		'Cross-cutting': { light: '#059669', dark: '#34d399' },
		'Extended': { light: '#64748b', dark: '#94a3b8' },
		'Language Technologies': { light: '#dc2626', dark: '#f87171' },
		'The Archive': { light: '#d97706', dark: '#fbbf24' },
		'Epistemologies & Ethics': { light: '#7c3aed', dark: '#a78bfa' }
	};

	const ALL_GROUPS: ConceptGroup[] = [
		'Cross-cutting',
		'The Archive',
		'Epistemologies & Ethics',
		'Infrastructure & Governance',
		'Language Technologies',
		'Extended'
	];

	function getNodeColor(group: ConceptGroup): string {
		const colors = GROUP_COLORS[group];
		return isDarkMode ? colors.dark : colors.light;
	}

	function getNodeRadius(degree: number): number {
		return Math.max(6, Math.min(22, 6 + degree * 0.55));
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

	// Track references for programmatic control
	let simulationRef: any = null;
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

	// --- Neighbor sets for hover spotlight ---
	let neighborIds = $derived.by(() => {
		if (!hoveredNode) return new Set<string>();
		const ids = new Set<string>();
		ids.add(hoveredNode.id);
		for (const e of simEdges) {
			const srcId = typeof e.source === 'string' ? e.source : e.source.id;
			const tgtId = typeof e.target === 'string' ? e.target : e.target.id;
			if (srcId === hoveredNode.id) ids.add(tgtId);
			if (tgtId === hoveredNode.id) ids.add(srcId);
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
		if (hoveredNode && neighborIds.has(node.id)) return true;
		if (selectedNode?.id === node.id) return true;
		if (transform.k >= 2.5) return true;
		if (transform.k >= 1.5 && node.degree >= 10) return true;
		if (node.degree >= 15) return true;
		return false;
	}

	// --- Edge key helper (Svelte can't parse ternaries in #each key) ---
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
		if (!hoveredNode) return 1;
		return neighborIds.has(node.id) ? 1 : 0.12;
	}

	function edgeOpacity(srcId: string, tgtId: string): number {
		if (!hoveredNode) return 0.3;
		if (srcId === hoveredNode.id || tgtId === hoveredNode.id) return 0.7;
		return 0.04;
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

		let destroyed = false;

		Promise.all([
			import('d3-force'),
			import('d3-zoom'),
			import('d3-selection'),
			import('d3-drag')
		]).then(([d3Force, d3Zoom, d3Selection, d3Drag]) => {
			if (destroyed) return;

			// Deep-clone nodes/edges so d3 can mutate them
			const nodes: ConceptNode[] = data.nodes.map((n) => ({ ...n }));
			const edges: ConceptEdge[] = data.edges.map((e) => ({ ...e }));

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
				.force('collide', d3Force.forceCollide<ConceptNode>().radius((d) => getNodeRadius(d.degree) + 12).strength(0.8))
				.force('x', d3Force.forceX(width / 2).strength(0.02))
				.force('y', d3Force.forceY(height / 2).strength(0.02));

			simulationRef = simulation;

			// Mark ready after simulation settles
			simulation.on('end', () => {
				simulationReady = true;
			});

			// Also mark ready quickly so user sees something
			setTimeout(() => {
				if (!destroyed) simulationReady = true;
			}, 300);

			// --- d3-zoom on SVG ---
			const svg = d3Selection.select(svgEl);
			const zoomBehavior = d3Zoom
				.zoom<SVGSVGElement, unknown>()
				.scaleExtent([0.3, 5])
				.filter((event: any) => {
					// Ctrl/meta+scroll for zoom
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
			// d3-drag natively coordinates with d3-zoom so node drags
			// don't trigger pan, and event.x/y are in simulation space.
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

			// Apply drag to node elements — re-apply after Svelte re-renders
			const applyDrag = () => {
				if (destroyed || !svgEl) return;
				d3Selection.select(svgEl).selectAll<SVGGElement, unknown>('.node-group').call(dragBehavior);
			};
			applyDragRef = applyDrag;

			let firstDragApplied = false;
			simulation.on('tick', () => {
				simNodes = [...nodes];
				simEdges = [...edges];
				// Apply d3-drag after first render
				if (!firstDragApplied) {
					firstDragApplied = true;
					requestAnimationFrame(applyDrag);
				}
			});

			return () => {
				destroyed = true;
				simulation.stop();
				simulationRef = null;
				zoomBehaviorRef = null;
				svgSelectionRef = null;
				d3ZoomModuleRef = null;
				applyDragRef = null;
			};
		});
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
		const next = new Set(activeGroups);
		if (next.has(group)) {
			// Don't allow deactivating all groups
			if (next.size > 1) next.delete(group);
		} else {
			next.add(group);
		}
		activeGroups = next;
		// Re-apply d3-drag to new node elements after Svelte re-renders
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
		svgSelectionRef.transition().duration(300).call(zoomBehaviorRef.scaleBy, 1 / 1.5);
	}

	function recenter() {
		if (!zoomBehaviorRef || !svgSelectionRef || !d3ZoomModuleRef) return;
		svgSelectionRef.transition().duration(400).call(
			zoomBehaviorRef.transform,
			d3ZoomModuleRef.zoomIdentity
		);
	}

	// --- Fullscreen ---
	function toggleFullscreen() {
		if (!containerEl) return;
		if (!document.fullscreenElement) {
			containerEl.requestFullscreen().then(() => {
				isFullscreen = true;
				// Delay recenter so ResizeObserver can update dimensions first
				setTimeout(recenter, 200);
			});
		} else {
			document.exitFullscreen().then(() => { isFullscreen = false; });
		}
	}

	// Listen for fullscreen exit via Esc key
	$effect(() => {
		if (typeof window === 'undefined') return;
		function onFullscreenChange() {
			isFullscreen = !!document.fullscreenElement;
		}
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	});

	// --- Mobile detection ---
	let isMobile = $derived(containerWidth < 640);
</script>

<div class="concept-graph-wrapper" bind:this={containerEl}>
	<!-- Graph canvas -->
	<div class="graph-canvas card-surface" class:has-selection={selectedNode !== null}>
		{#if !simulationReady}
			<div class="loading-overlay">
				<div class="loading-spinner"></div>
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
			onkeydown={(e) => { if (e.key === 'Escape') selectedNode = null; }}
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
						stroke-width={hoveredNode && (coords.srcId === hoveredNode.id || coords.tgtId === hoveredNode.id) ? 1.5 : 0.7}
						opacity={edgeOpacity(coords.srcId, coords.tgtId)}
					/>
				{/each}

				<!-- Nodes -->
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
						onpointerleave={() => { if (hoveredNode?.id === node.id) hoveredNode = null; }}
						onclick={(e) => onNodeClick(e, node)}
						onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(e as any, node); } }}
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
							r={r}
							fill={getNodeColor(node.group)}
							stroke={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)'}
							stroke-width="1.5"
						/>

						<!-- Label -->
						{#if shouldShowLabel(node)}
							<text
								x={nx}
								y={ny - r - 5}
								text-anchor="middle"
								class="node-label"
								fill={isDarkMode ? '#e2e8f0' : '#1e293b'}
								font-size={hoveredNode?.id === node.id ? '12' : '10'}
								font-weight={hoveredNode?.id === node.id || selectedNode?.id === node.id ? '600' : '400'}
							>
								{node.label}
							</text>
						{/if}
					</g>
				{/each}
			</g>
		</svg>

		<!-- Graph controls -->
		<div class="graph-controls">
			<button class="control-btn" onclick={zoomIn} aria-label="Zoom in" title="Zoom in">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" y1="3" x2="8" y2="13" />
					<line x1="3" y1="8" x2="13" y2="8" />
				</svg>
			</button>
			<button class="control-btn" onclick={zoomOut} aria-label="Zoom out" title="Zoom out">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="3" y1="8" x2="13" y2="8" />
				</svg>
			</button>
			<button class="control-btn" onclick={recenter} aria-label="Recenter graph" title="Recenter">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="8" cy="8" r="3" />
					<line x1="8" y1="1" x2="8" y2="4" />
					<line x1="8" y1="12" x2="8" y2="15" />
					<line x1="1" y1="8" x2="4" y2="8" />
					<line x1="12" y1="8" x2="15" y2="8" />
				</svg>
			</button>
			<button class="control-btn" onclick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
				{#if isFullscreen}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="6,1 6,6 1,6" />
						<polyline points="10,15 10,10 15,10" />
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="1,6 1,1 6,1" />
						<polyline points="15,10 15,15 10,15" />
					</svg>
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
	</div>

	<!-- Group filters -->
	<div class="group-filters">
		<button
			class="filter-btn filter-btn-all"
			class:active={activeGroups.size === ALL_GROUPS.length}
			onclick={activateAllGroups}
		>
			All
		</button>
		{#each ALL_GROUPS as group (group)}
			<button
				class="filter-btn"
				class:active={activeGroups.has(group)}
				onclick={() => toggleGroup(group)}
				style="--group-color: {getNodeColor(group)}"
			>
				<span class="filter-dot" style="background-color: {getNodeColor(group)}"></span>
				{group}
			</button>
		{/each}
	</div>

	<!-- Detail panel -->
	{#if selectedNode}
		<div class="detail-panel card-surface surface-padding-sm" class:bottom-sheet={isMobile}>
			<div class="detail-header">
				<h3 class="heading-sub" style="font-size: var(--text-lg);">{selectedNode.label}</h3>
				<button class="detail-close" onclick={() => (selectedNode = null)} aria-label="Close detail panel">
					&times;
				</button>
			</div>
			<div class="detail-meta">
				<span
					class="detail-badge"
					style="background-color: {getNodeColor(selectedNode.group)}20; color: {getNodeColor(selectedNode.group)}; border: 1px solid {getNodeColor(selectedNode.group)}40;"
				>
					{selectedNode.group}
				</span>
				{#if selectedNode.seed}
					<span class="detail-badge detail-badge-seed">Seed concept</span>
				{/if}
				<span class="body-text-muted">{selectedNode.degree} connections</span>
			</div>
			{#if selectedNeighbors.length > 0}
				<div class="detail-connections">
					<p class="text-body-sm" style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-xs);">
						Connected to:
					</p>
					<div class="connection-tags">
						{#each selectedNeighbors as neighbor (neighbor)}
							<button
								class="connection-tag"
								onclick={() => {
									const n = simNodes.find((nd) => nd.id === neighbor);
									if (n) selectedNode = n;
								}}
							>
								{neighbor}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.concept-graph-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
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
		background: var(--color-surface-50);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
	}

	:global(.dark) .concept-graph-wrapper:fullscreen {
		background: var(--color-surface-900);
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
		background: var(--color-surface-0);
		color: var(--color-gray-600);
		border: 1px solid var(--color-surface-300);
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.control-btn:hover {
		background: var(--color-surface-100);
		color: var(--color-gray-900);
		box-shadow: var(--shadow-md);
	}

	.control-btn:active {
		transform: scale(0.93);
	}

	:global(.dark) .control-btn {
		background: var(--color-surface-dark-elevated);
		color: var(--color-gray-400);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow: var(--shadow-dark-sm);
	}

	:global(.dark) .control-btn:hover {
		background: var(--color-surface-dark-overlay);
		color: var(--color-gray-100);
		box-shadow: var(--shadow-dark-md);
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

	.loading-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid var(--color-surface-300);
		border-top-color: var(--color-secondary-500);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	:global(.dark) .loading-spinner {
		border-color: var(--color-surface-dark-overlay);
		border-top-color: var(--color-secondary-400);
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
		background: var(--color-surface-0);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-full);
		opacity: 0.7;
		pointer-events: none;
		white-space: nowrap;
		border: 1px solid var(--color-surface-300);
	}

	:global(.dark) .interaction-hint {
		background: var(--color-surface-dark-elevated);
		border-color: rgba(255, 255, 255, 0.08);
	}

	/* Node labels */
	.node-label {
		pointer-events: none;
		user-select: none;
		text-shadow:
			0 0 4px var(--color-surface-0),
			0 0 4px var(--color-surface-0),
			0 0 8px var(--color-surface-0);
	}

	:global(.dark) .node-label {
		text-shadow:
			0 0 4px var(--color-surface-dark-base),
			0 0 4px var(--color-surface-dark-base),
			0 0 8px var(--color-surface-dark-base);
	}

	/* Group filter buttons */
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
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Detail panel */
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
		font-size: 1.5rem;
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
