import type { ConceptNode } from '#lib/types/concept-graph';
import type { GraphView } from './graph-renderer';

/** Keep every circle inside the viewport, including at narrow embed sizes. */
export function fitGraphView(
	nodes: readonly ConceptNode[],
	width: number,
	height: number,
	getRadius: (degree: number) => number,
	padding = 32
): GraphView {
	const positioned = nodes.filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
	if (!positioned.length || width <= 0 || height <= 0) return { x: 0, y: 0, k: 1 };
	let left = Infinity;
	let right = -Infinity;
	let top = Infinity;
	let bottom = -Infinity;
	for (const node of positioned) {
		const radius = getRadius(node.degree) + 4;
		left = Math.min(left, node.x! - radius);
		right = Math.max(right, node.x! + radius);
		top = Math.min(top, node.y! - radius);
		bottom = Math.max(bottom, node.y! + radius);
	}
	const inset = Math.min(padding, width / 4, height / 4);
	const k = Math.min(
		1.4,
		(width - 2 * inset) / (right - left),
		(height - 2 * inset) / (bottom - top)
	);
	return {
		x: width / 2 - ((left + right) / 2) * k,
		y: height / 2 - ((top + bottom) / 2) * k,
		k
	};
}

/**
 * The view to apply after the stage changes size, or `null` to keep the
 * current transform. Only an untouched, fit-all view follows the stage: once
 * the user has zoomed, panned, dragged or searched, a resize — the detail
 * panel shrinking the fullscreen stage, say — must neither snap their view
 * back nor interrupt a running zoom transition. The transform is anchored at
 * the stage's top-left corner, so keeping it leaves every node where it was.
 */
export function viewAfterResize(
	fitting: boolean,
	nodes: readonly ConceptNode[],
	width: number,
	height: number,
	getRadius: (degree: number) => number
): GraphView | null {
	return fitting ? fitGraphView(nodes, width, height, getRadius) : null;
}
