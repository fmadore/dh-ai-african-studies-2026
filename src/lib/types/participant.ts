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
}
