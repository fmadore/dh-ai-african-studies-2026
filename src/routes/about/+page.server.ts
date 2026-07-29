import type { PageServerLoad } from './$types';
import { loadPhotoSample } from '$lib/server/photos';

/**
 * One documentary image for the Background section — the intellectual heart of
 * the site, and otherwise an unbroken wall of grey text.
 */
export const load: PageServerLoad = async () => {
	const sample = await loadPhotoSample(3);
	return { backgroundPhoto: sample[1] ?? sample[0] ?? null };
};
