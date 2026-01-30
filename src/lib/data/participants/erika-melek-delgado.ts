import type { Participant } from '$lib/types/participant';

export const erikaMelekDelgado: Participant = {
	name: 'Erika Melek Delgado',
	affiliation: "King's College London",
	affiliationCoordinates: {
		latitude: 51.5114,
		longitude: -0.1160
	},
	country: 'United Kingdom',
	role: 'Participant',
	website: 'https://www.kcl.ac.uk/people/erika-melek-delgado',
	bio: 'She is a Lecturer in the History of Empire in the Department of History at King\'s College London. Her research and publications focus on African history, diasporas, empires, and digital humanities (DH). She co-directs Freedom Narratives, serves as Associate Director of The King\'s Past, is the Principal Investigator of Historical African Childhoods (HAC), and leads Project EAP1757 in Cuba, which explores the contributions of enslaved people and their descendants to 19th-century Cuban academic and intellectual life. In addition, she is the Director of Walk With Web Co. Her work bridges historical scholarship with digital innovation and global perspectives.',
	researchRegions: ['West Africa', 'Cuba', 'Brazil'],
	thematicGroup: 'Infrastructure, Governance & Access',
	photoUrl: '/images/participants/erika-melek-delgado.jpg',
	questionsOfInterest: [
		'AI in Africa and the climate crisis',
		'How can we continue to develop DH projects that are accessible to countries with a lack of electricity and low internet data?',
		'How can institutions in the Global North truly partner with projects and people in Africa on an equal power basis? When DH depends so heavily on costly materials and specific infrastructure?'
	]
};
