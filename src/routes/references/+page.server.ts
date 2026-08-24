import type { PageServerLoad } from './$types';
import type { CslReference } from '$lib/types/csl';
import referencesData from '$lib/data/references.json';
import { stripReadingStatusTags } from '$lib/utils/references';
import { toReferenceListItem } from '$lib/utils/reference-index';

/**
 * The full bibliography is 437 KB of JSON, half of it abstracts the collapsed
 * list only ever clamps to three lines. This load runs at prerender time, so
 * the page ships a lean index instead of bundling the whole file; the complete
 * records stay in the prerendered /references/data.json and are fetched once,
 * on the first abstract expansion or export.
 */
export const load: PageServerLoad = () => ({
	referenceIndex: stripReadingStatusTags(referencesData as unknown as CslReference[]).map(
		toReferenceListItem
	)
});
