import type { D3DragEvent } from 'd3-drag';
import type { Selection } from 'd3-selection';
import type { D3ZoomEvent } from 'd3-zoom';
import type { ConceptEdge, ConceptGraphData, ConceptNode } from '$lib/types/concept-graph';
import type { GraphView } from './graph-renderer';

/**
 * The D3 side of the concept graph: force layout, zoom and node dragging.
 *
 * ConceptGraph.svelte keeps the UI state and accessibility; GraphRenderer
 * paints. This module owns the D3 objects, loads them on demand (so none of
 * D3 is in the page's initial JavaScript), and hands back a small handle, so
 * the component no longer keeps D3 references and transition types of its own.
 */

export interface GraphSimulationOptions {
	data: ConceptGraphData;
	svg: SVGSVGElement;
	/**
	 * Read once D3 has loaded, not when this is called: by then the container
	 * has its measured size, and a reactive caller doesn't subscribe to it (a
	 * resize must not rebuild the layout).
	 */
	getSize: () => { width: number; height: number };
	getNodeRadius: (degree: number) => number;
	/** Node positions moved (every tick). */
	onTick: () => void;
	/** The layout has come to rest. */
	onSettled: () => void;
	onZoom: (view: GraphView) => void;
	/** The node being dragged, or null when a drag ends. */
	onDrag: (node: ConceptNode | null) => void;
}

export interface GraphSimulation {
	/** Copies of the source data; d3-force writes positions into them in place. */
	readonly nodes: ConceptNode[];
	readonly edges: ConceptEdge[];
	/** (Re)attach dragging to the current `.node-group` elements. */
	bindDrag: () => void;
	zoomBy: (factor: number, durationMs: number) => void;
	zoomTo: (view: GraphView, durationMs: number) => void;
	destroy: () => void;
}

type DragSubject = { x?: number; y?: number };
type DragEvent = D3DragEvent<SVGGElement, unknown, DragSubject>;

// d3-zoom loads d3-transition, which adds `.transition()` to selections; its
// types aren't installed, so this is the slice of the API used here.
type Transition = {
	duration: (_milliseconds: number) => Transition;
	call: (_callback: unknown, ..._args: unknown[]) => Transition;
};
type SvgSelection = Selection<SVGSVGElement, unknown, null, undefined> & {
	transition: () => Transition;
};

export async function createGraphSimulation(
	options: GraphSimulationOptions
): Promise<GraphSimulation> {
	const [d3Force, d3Zoom, d3Selection, d3Drag] = await Promise.all([
		import('d3-force'),
		import('d3-zoom'),
		import('d3-selection'),
		import('d3-drag')
	]);
	const { data, getNodeRadius } = options;
	const { width, height } = options.getSize();

	const nodes: ConceptNode[] = data.nodes.map((n) => ({ ...n }));
	const edges: ConceptEdge[] = data.edges.map((e) => ({ ...e }));

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

	// A tick only moves nodes; it never changes which nodes or edges exist.
	simulation.on('tick', options.onTick);
	simulation.on('end', options.onSettled);

	// --- Zoom: pinch and drag always; the wheel only with Ctrl/⌘, so the page
	// still scrolls past the graph ---
	const svg = d3Selection.select(options.svg) as SvgSelection;
	const zoomBehavior = d3Zoom
		.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.3, 5])
		.filter((event: Event) =>
			event.type === 'wheel' ? (event as WheelEvent).ctrlKey || (event as WheelEvent).metaKey : true
		)
		.on('zoom', ({ transform }: D3ZoomEvent<SVGSVGElement, unknown>) =>
			options.onZoom({ x: transform.x, y: transform.y, k: transform.k })
		);
	svg.call(zoomBehavior);

	// --- Drag: events fire per pointer move, so resolve ids through a map ---
	const nodesById = new Map(nodes.map((n) => [n.id, n]));
	const nodeOf = (el: SVGGElement) => nodesById.get(el.getAttribute('data-node-id') ?? '');

	const dragBehavior = d3Drag
		.drag<SVGGElement, unknown, DragSubject>()
		.subject(function () {
			const node = nodeOf(this);
			return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
		})
		.on('start', function (event: DragEvent) {
			const node = nodeOf(this);
			if (!node) return;
			if (!event.active) simulation.alphaTarget(0.3).restart();
			node.fx = node.x;
			node.fy = node.y;
			options.onDrag(node);
		})
		.on('drag', function (event: DragEvent) {
			const node = nodeOf(this);
			if (!node) return;
			node.fx = event.x;
			node.fy = event.y;
		})
		.on('end', function (event: DragEvent) {
			const node = nodeOf(this);
			if (!node) return;
			if (!event.active) simulation.alphaTarget(0);
			node.fx = null;
			node.fy = null;
			options.onDrag(null);
		});

	return {
		nodes,
		edges,
		bindDrag: () => svg.selectAll<SVGGElement, unknown>('.node-group').call(dragBehavior),
		zoomBy: (factor, durationMs) =>
			svg.transition().duration(durationMs).call(zoomBehavior.scaleBy, factor),
		zoomTo: ({ x, y, k }, durationMs) =>
			svg
				.transition()
				.duration(durationMs)
				.call(zoomBehavior.transform, d3Zoom.zoomIdentity.translate(x, y).scale(k)),
		destroy: () => {
			simulation.stop();
			svg.on('.zoom', null);
		}
	};
}
