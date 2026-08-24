import type { PageServerLoad } from './$types';
import graphJson from '$lib/data/concept-graph.json';
import { toConceptGraphData } from '$lib/utils/concept-graph-data';

/** Same treatment as /concepts: the graph JSON rides the prerendered page
 * data rather than the JS chunk. */
export const load: PageServerLoad = () => ({
	graph: toConceptGraphData(graphJson)
});
