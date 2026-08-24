import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CslReference } from '$lib/types/csl';
import referencesData from '$lib/data/references.json';
import { stripReadingStatusTags } from '$lib/utils/references';

export const prerender = true;

/**
 * The complete CSL records, in the same stripped shape the page always used.
 * The references page fetches this lazily — for expanding an abstract past its
 * bundled preview and for Zotero export, never for the collapsed list.
 */
export const GET: RequestHandler = () =>
	json(stripReadingStatusTags(referencesData as unknown as CslReference[]));
