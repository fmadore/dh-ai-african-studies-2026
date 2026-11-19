import type { PageServerLoad } from './$types';
import { attendees, coOrganizers } from '#lib/data/participants';
import { interviews } from '#lib/data/interviews';
import { paperPublicationDate } from '#lib/data/position-paper-meta';
import { interviewPosterPath } from '#lib/server/interview-posters';
import { loadPhotoSample } from '#lib/server/photos';
import { formatLongDate } from '#lib/utils/formatters';

/**
 * A small sample of the gallery for the homepage strip. The site is an archive
 * of an event that happened; its front page previously showed none of it.
 *
 * The figures are reduced here, at prerender time, so the homepage bundle
 * ships a few numbers and names instead of every participant's biography,
 * the interview list and the paper metadata.
 */
export const load: PageServerLoad = async () => {
	const featured = interviews[0];
	return {
		stripPhotos: await loadPhotoSample(4),
		// Self-hosted, so the homepage makes no request to YouTube
		featuredInterviewPoster: featured ? interviewPosterPath(featured.youtubeId) : undefined,
		participantCount: attendees.length,
		countryCount: new Set(attendees.map((participant) => participant.country)).size,
		interviewCount: interviews.length,
		organiserNames: coOrganizers.map(
			(participant) => `${participant.name} (${participant.affiliation})`
		),
		paperPublishedOn: formatLongDate(paperPublicationDate)
	};
};
