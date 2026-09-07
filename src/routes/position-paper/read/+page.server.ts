import { loadPositionPaper } from '$lib/reader/load-paper';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = () => loadPositionPaper();
