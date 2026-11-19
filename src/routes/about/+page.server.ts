import type { PageServerLoad } from './$types';
import type { Participant } from '#lib/types/participant';
import { coOrganizers, studentAssistants } from '#lib/data/participants';
import { paperPublicationDate } from '#lib/data/position-paper-meta';
import { loadPhotoSample } from '#lib/server/photos';
import { formatLongDate } from '#lib/utils/formatters';

/** What a person card on this page shows, and nothing else. */
function toPersonCard(participant: Participant) {
	return {
		name: participant.name,
		affiliation: participant.affiliation,
		bio: participant.bio,
		website: participant.website,
		// As written: the component resolves it against the page's base path.
		photoUrl: participant.photoUrl,
		researchRegions: participant.researchRegions.toSorted()
	};
}

/**
 * One documentary image for the Background section — the intellectual heart of
 * the site, and otherwise an unbroken wall of grey text.
 *
 * The people sections and the paper date are reduced here, at prerender time,
 * so the page bundle does not import every participant record or the paper
 * metadata to show two short lists and a date.
 */
export const load: PageServerLoad = async () => {
	const sample = await loadPhotoSample(3);
	return {
		backgroundPhoto: sample[1] ?? sample[0] ?? null,
		coOrganizers: coOrganizers.map(toPersonCard),
		studentAssistants: studentAssistants.map(toPersonCard),
		paperPublishedOn: formatLongDate(paperPublicationDate)
	};
};
