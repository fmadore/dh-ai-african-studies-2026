import type { ConceptEdge, ConceptGroup } from '#lib/types/concept-graph';

const endpointId = (end: ConceptEdge['source']) => (typeof end === 'string' ? end : end.id);

/**
 * Undirected neighbour sets, built once from the source data. A pair linked in
 * both directions is still one neighbour: selection counts distinct
 * neighbours, never both directions twice.
 */
export function buildAdjacency(edges: readonly ConceptEdge[]): Map<string, Set<string>> {
	const map = new Map<string, Set<string>>();
	const link = (from: string, to: string) => {
		const set = map.get(from);
		if (set) set.add(to);
		else map.set(from, new Set([to]));
	};
	for (const edge of edges) {
		const s = endpointId(edge.source);
		const t = endpointId(edge.target);
		link(s, t);
		link(t, s);
	}
	return map;
}

/** A node's distinct neighbours, in the order the detail panel lists them. */
export function sortedNeighbors(
	adjacency: ReadonlyMap<string, ReadonlySet<string>>,
	nodeId: string
): string[] {
	return [...(adjacency.get(nodeId) ?? [])].sort();
}

/**
 * The group filter with `group` switched on. Following a connection from the
 * detail panel may lead into a group the user has hidden; that group is shown
 * again so the newly selected node is actually rendered, preserving the
 * invariant that the selection always belongs to an active group. Returns the
 * same set when nothing changes, so callers can skip a reactive write.
 */
export function withGroupActive(
	active: ReadonlySet<ConceptGroup>,
	group: ConceptGroup
): ReadonlySet<ConceptGroup> {
	return active.has(group) ? active : new Set([...active, group]);
}
