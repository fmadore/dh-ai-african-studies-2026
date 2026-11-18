import type { Participant } from '#lib/types/participant';
import { participants } from './participants/index';

export { participants };

/*
 * The role splits every page draws on. Photo paths stay as written here:
 * resolving them depends on the page's base path, so the component that
 * renders a photo resolves it (see resolveAssetPath).
 */

/** Everyone who took part in the workshop: co-organisers and participants. */
export const attendees: Participant[] = participants.filter(
	(participant) => participant.role !== 'Student assistant'
);

export const coOrganizers: Participant[] = participants.filter(
	(participant) => participant.role === 'Co-organizer'
);

export const studentAssistants: Participant[] = participants.filter(
	(participant) => participant.role === 'Student assistant'
);
