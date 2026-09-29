import type { PageServerLoad } from './$types';
import { interviews } from '$lib/data/interviews';
import { interviewPosterPath } from '$lib/server/interview-posters';
import { loadPhotoSample } from '$lib/server/photos';

/**
 * A small sample of the gallery for the homepage strip. The site is an archive
 * of an event that happened; its front page previously showed none of it.
 */
export const load: PageServerLoad = async () => {
	const featured = interviews[0];
	return {
		stripPhotos: await loadPhotoSample(4),
		// Self-hosted, so the homepage makes no request to YouTube
		featuredInterviewPoster: featured ? interviewPosterPath(featured.youtubeId) : undefined
	};
};
