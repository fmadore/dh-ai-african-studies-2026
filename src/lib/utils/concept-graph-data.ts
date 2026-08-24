import type { ConceptEdge, ConceptGraphData, ConceptNode } from '$lib/types/concept-graph';

interface RawConceptNode extends ConceptNode {
	/** Written by the export script but never read — the renderer maps
	 * group → color itself (graph-config.ts). */
	color?: string;
}

interface RawConceptGraph {
	nodes: RawConceptNode[];
	edges: ConceptEdge[];
}

/**
 * Narrows the exported JSON to what the graph actually consumes, so the
 * prerendered page data carries no dead fields.
 */
export function toConceptGraphData(raw: unknown): ConceptGraphData {
	const { nodes, edges } = raw as RawConceptGraph;
	return {
		nodes: nodes.map(({ id, label, group, seed, degree }) => ({ id, label, group, seed, degree })),
		edges
	};
}
