import type { ConceptNode } from '$lib/types/concept-graph';

export type GraphNavigationKey =
	'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End';

/**
 * Resolve the next node for the graph's roving-tabindex keyboard model.
 * Arrow keys follow the visual layout when D3 coordinates are available and
 * fall back to source order while the simulation is still settling.
 */
export function nextGraphNode(
	nodes: readonly ConceptNode[],
	currentId: string | null,
	key: GraphNavigationKey
): ConceptNode | undefined {
	if (nodes.length === 0) return undefined;
	if (key === 'Home') return nodes[0];
	if (key === 'End') return nodes[nodes.length - 1];

	const currentIndex = Math.max(
		0,
		nodes.findIndex((node) => node.id === currentId)
	);
	const current = nodes[currentIndex];
	const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
	const direction = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
	const currentPrimary = horizontal ? current.x : current.y;
	const currentCross = horizontal ? current.y : current.x;

	if (Number.isFinite(currentPrimary) && Number.isFinite(currentCross)) {
		let best: ConceptNode | undefined;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const candidate of nodes) {
			if (candidate.id === current.id) continue;
			const candidatePrimary = horizontal ? candidate.x : candidate.y;
			const candidateCross = horizontal ? candidate.y : candidate.x;
			if (!Number.isFinite(candidatePrimary) || !Number.isFinite(candidateCross)) continue;

			const forward = ((candidatePrimary as number) - (currentPrimary as number)) * direction;
			if (forward <= 0) continue;
			const cross = Math.abs((candidateCross as number) - (currentCross as number));
			// Prefer a nearby node in the requested direction without making a tiny
			// cross-axis difference outweigh a much shorter forward movement.
			const score = forward + cross * 1.75;
			if (score < bestScore) {
				best = candidate;
				bestScore = score;
			}
		}

		if (best) return best;
	}

	const offset = direction > 0 ? 1 : -1;
	return nodes[(currentIndex + offset + nodes.length) % nodes.length];
}
