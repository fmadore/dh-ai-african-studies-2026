import { json } from '@sveltejs/kit';
import graph from '$lib/data/concept-graph.json';

export const prerender = true;

/** Preserve provenance in the downloadable snapshot; UI data is deliberately smaller. */
export const GET = () => json(graph);
