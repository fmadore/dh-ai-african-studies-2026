import type { PageServerLoad } from './$types';
import { loadWorkshopPhotos } from '$lib/server/photos';

export const load: PageServerLoad = async () => {
	return { photos: await loadWorkshopPhotos() };
};
