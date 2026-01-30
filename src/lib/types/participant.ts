export type ParticipantRole = 'Participant' | 'Co-organizer' | 'Student assistant';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface Participant {
	name: string;
	affiliation: string;
	affiliationCoordinates?: Coordinates;
	country: string;
	role: ParticipantRole;
	bio: string;
	researchRegions: string[];
	thematicGroup?: string;
	photoUrl?: string;
	/** Up to 3 questions or topics of interest submitted by the participant */
	questionsOfInterest?: string[];
	/** Personal website URL */
	website?: string;
}
