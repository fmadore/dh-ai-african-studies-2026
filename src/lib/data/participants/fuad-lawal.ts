import type { Participant } from '$lib/types/participant';

export const fuadLawal: Participant = {
	name: "Fu'ad Lawal",
	affiliation: 'Archivi.ng',
	affiliationCoordinates: {
		latitude: 6.5244,
		longitude: 3.3792
	},
	country: 'Nigeria',
	role: 'Participant',
	website: 'https://archivi.ng/',
	bio: "Fu'ad Lawal is the Executive Director of Archivi.ng, an organisation digitising Nigeria's newspapers, magazines and oral histories to make the nation's history accessible to everyone. His work explores the intersection of digital preservation, access, and sensemaking, with a focus on building African-centred infrastructures for knowledge. At Archivi.ng, he leads a multidisciplinary team combining archival science, storytelling, and machine learning to preserve millions of pages of history. His broader interest lies in how technology can help societies remember, understand, and imagine better futures.",
	researchRegions: ['Nigeria'],
	thematicGroup: 'Infrastructure, Governance & Access',
	photoUrl: '/images/participants/fuad-lawal.png',
	questionsOfInterest: [
		'What frameworks and collaborations are needed to ensure that digital humanities projects in Africa move beyond digitisation toward active knowledge production, sense-making, and accessibility for everyone?',
		'How can African archival infrastructures serve as datasets for training culturally aligned AI systems that preserve linguistic nuance, local memory, and indigenous knowledge systems?',
		"How can AI help us make sense of Africa's historical record at scale, without losing the context, nuance, and intent of the original materials?"
	]
};
