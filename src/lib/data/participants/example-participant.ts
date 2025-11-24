import type { Participant } from '$lib/types/participant';

export const exampleParticipant: Participant = {
	name: 'Dr. Example Participant',
	affiliation: 'University of Example',
	affiliationCoordinates: {
		latitude: 51.5074,
		longitude: -0.1278
	},
	country: 'United Kingdom',
	role: 'Participant',
	bio: 'Dr. Example is a researcher specializing in digital humanities and African studies with over 10 years of experience in computational linguistics and cultural heritage preservation.',
	researchRegions: ['West Africa', 'East Africa'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/example.jpg'
};
