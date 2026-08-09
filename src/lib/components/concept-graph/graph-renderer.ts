import type { ConceptNode } from '$lib/types/concept-graph';
import { EDGE_COLOR } from './graph-config';

/** An edge after d3-force has resolved its string ids to node objects. */
export type ResolvedGraphEdge = { s: ConceptNode; t: ConceptNode };

export interface GraphPaintState {
	nodes: readonly ConceptNode[];
	edges: readonly ResolvedGraphEdge[];
	spot: ConceptNode | null;
	spotIds: ReadonlySet<string> | null;
}

export interface GraphView {
	x: number;
	y: number;
	k: number;
}

interface GraphRendererOptions {
	getNodeRadius: (degree: number) => number;
}

/**
 * The imperative render layer for the graph.
 *
 * D3 owns node coordinates and Svelte owns structural markup. This renderer
 * bridges the two without putting simulation ticks into Svelte reactivity:
 * edges are batched onto canvas while SVG nodes and labels are updated in one
 * animation frame. Its public state is intentionally small so the component
 * can remain responsible for UI state and accessibility interactions.
 */
export class GraphRenderer {
	readonly view: GraphView = { x: 0, y: 0, k: 1 };

	#canvas: HTMLCanvasElement | null = null;
	#canvasContext: CanvasRenderingContext2D | null = null;
	#viewport: SVGGElement | null = null;
	#nodeElements: SVGGElement[] = [];
	#labelElements: SVGTextElement[] = [];
	#paint: GraphPaintState = { nodes: [], edges: [], spot: null, spotIds: null };
	#dpr = 1;
	#width = 0;
	#height = 0;
	#frame = 0;
	#positionsDirty = true;
	#getNodeRadius: GraphRendererOptions['getNodeRadius'];

	constructor({ getNodeRadius }: GraphRendererOptions) {
		this.#getNodeRadius = getNodeRadius;
	}

	setViewport(viewport: SVGGElement | null) {
		this.#viewport = viewport;
		this.scheduleRender();
	}

	setCanvas(canvas: HTMLCanvasElement | null) {
		this.#canvas = canvas;
		this.#canvasContext = canvas?.getContext('2d') ?? null;
	}

	setNodeElements(nodes: SVGGElement[], labels: SVGTextElement[]) {
		this.#nodeElements = nodes;
		this.#labelElements = labels;
		this.scheduleRender(true);
	}

	focusNode(nodeId: string) {
		this.#nodeElements.find((element) => element.dataset.nodeId === nodeId)?.focus();
	}

	setPaint(paint: GraphPaintState) {
		this.#paint = paint;
		this.scheduleRender();
	}

	resize(width: number, height: number) {
		const canvas = this.#canvas;
		if (!canvas) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		this.#canvasContext = canvas.getContext('2d');
		this.#dpr = dpr;
		this.#width = width;
		this.#height = height;
		this.scheduleRender();
	}

	scheduleRender(movedNodes = false) {
		if (movedNodes) this.#positionsDirty = true;
		// A hidden tab never fires rAF, which would leave the graph blank until it
		// is focused. There is no frame to coalesce into there, so paint now.
		if (typeof document !== 'undefined' && document.hidden) {
			this.#render();
			return;
		}
		if (this.#frame) return;
		this.#frame = requestAnimationFrame(() => {
			this.#frame = 0;
			this.#render();
		});
	}

	destroy() {
		if (this.#frame) cancelAnimationFrame(this.#frame);
		this.#frame = 0;
		this.#canvas = null;
		this.#canvasContext = null;
		this.#viewport = null;
		this.#nodeElements = [];
		this.#labelElements = [];
	}

	#render() {
		this.#viewport?.setAttribute(
			'transform',
			`translate(${this.view.x},${this.view.y}) scale(${this.view.k})`
		);
		this.#drawEdges();
		this.#layoutNodes();
		this.#positionsDirty = false;
	}

	/** Every edge in three batched strokes — one per spotlight state. */
	#drawEdges() {
		const ctx = this.#canvasContext;
		if (!ctx) return;

		ctx.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
		ctx.clearRect(0, 0, this.#width, this.#height);
		ctx.translate(this.view.x, this.view.y);
		ctx.scale(this.view.k, this.view.k);
		// Line widths are set inside the scaled space so they thicken with zoom,
		// matching what the SVG <g> used to do.
		ctx.strokeStyle = EDGE_COLOR;
		ctx.lineCap = 'round';

		const { edges, spot } = this.#paint;
		const spotId = spot?.id;

		// One path per spotlight state, so the whole edge set costs at most two strokes.
		ctx.globalAlpha = spotId ? 0.07 : 0.38;
		ctx.lineWidth = 0.7;
		ctx.beginPath();
		for (const { s, t } of edges) {
			if (spotId && (s.id === spotId || t.id === spotId)) continue;
			ctx.moveTo(s.x ?? 0, s.y ?? 0);
			ctx.lineTo(t.x ?? 0, t.y ?? 0);
		}
		ctx.stroke();

		if (spotId) {
			ctx.globalAlpha = 0.7;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			for (const { s, t } of edges) {
				if (s.id !== spotId && t.id !== spotId) continue;
				ctx.moveTo(s.x ?? 0, s.y ?? 0);
				ctx.lineTo(t.x ?? 0, t.y ?? 0);
			}
			ctx.stroke();
		}

		ctx.globalAlpha = 1;
	}

	#labelVisible(node: ConceptNode): boolean {
		if (this.#paint.spot && this.#paint.spotIds?.has(node.id)) return true;
		if (this.view.k >= 2.5) return true;
		if (this.view.k >= 1.5 && node.degree >= 10) return true;
		return node.degree >= 15;
	}

	#layoutNodes() {
		const { nodes, spot, spotIds } = this.#paint;
		for (let index = 0; index < nodes.length; index++) {
			const node = nodes[index];
			const group = this.#nodeElements[index];
			if (!group) continue;

			const x = node.x ?? 0;
			const y = node.y ?? 0;
			if (this.#positionsDirty) group.setAttribute('transform', `translate(${x},${y})`);

			const alpha = !spot || spotIds?.has(node.id) ? '' : '0.12';
			if (group.style.opacity !== alpha) group.style.opacity = alpha;

			const label = this.#labelElements[index];
			if (!label) continue;

			if (this.#labelVisible(node)) {
				const wasHidden = label.style.display === 'none';
				if (wasHidden) label.style.display = '';
				// Hidden labels are not kept up to date, so one revealed by a zoom
				// or a spotlight must be placed even when nothing has moved.
				if (this.#positionsDirty || wasHidden) {
					label.setAttribute('x', String(x));
					label.setAttribute('y', String(y - this.#getNodeRadius(node.degree) - 5));
				}
				const focused = spot?.id === node.id;
				const size = focused ? '12' : '10';
				const weight = focused ? '600' : '400';
				if (label.getAttribute('font-size') !== size) label.setAttribute('font-size', size);
				if (label.getAttribute('font-weight') !== weight) label.setAttribute('font-weight', weight);
				if (label.style.opacity !== alpha) label.style.opacity = alpha;
			} else if (label.style.display !== 'none') {
				label.style.display = 'none';
			}
		}
	}
}
