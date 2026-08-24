import type { PageServerLoad } from './$types';
import graphJson from '$lib/data/concept-graph.json';
import { toConceptGraphData } from '$lib/utils/concept-graph-data';

// Only the workshop's own groups: the graph also buckets nodes as
// "Cross-cutting" and "Extended", which are not thematic groups.
const NON_THEMATIC_GROUPS = new Set(['Cross-cutting', 'Extended']);

/**
 * Runs at prerender time, so the 128 KB graph JSON ships as page data instead
 * of being compiled into the route's JS chunk. The stats are derived here for
 * the same reason — they are build-time facts about a static dataset.
 */
export const load: PageServerLoad = () => {
	const graph = toConceptGraphData(graphJson);
	const nodeCount = graph.nodes.length;
	const seedCount = graph.nodes.filter((n) => n.seed).length;

	return {
		graph,
		nodeCount,
		seedCount,
		extendedCount: nodeCount - seedCount,
		edgeCount: graph.edges.length,
		groupCount: new Set(
			graph.nodes.map((n) => n.group).filter((group) => !NON_THEMATIC_GROUPS.has(group))
		).size
	};
};
