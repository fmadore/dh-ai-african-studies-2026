export type ParticipantRole = 'Participant' | 'Co-organizer' | 'Student assistant';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface Participant {
	name: string;
	affiliation: string;
	affiliationCoordinates?: Coordinates;
	role: ParticipantRole;
	bio: string;
	researchRegions: string[];
	photoUrl: string;
}
