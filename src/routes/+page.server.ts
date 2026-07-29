import type { PageServerLoad } from './$types';
import { loadPhotoSample } from '$lib/server/photos';

/**
 * A small sample of the gallery for the homepage strip. The site is an archive
 * of an event that happened; its front page previously showed none of it.
 */
export const load: PageServerLoad = async () => {
	return { stripPhotos: await loadPhotoSample(4) };
};
