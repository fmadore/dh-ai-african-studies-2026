import type { Participant } from '$lib/types/participant';

export const johannesSibeko: Participant = {
	name: 'Johannes Sibeko',
	affiliation: 'Nelson Mandela University',
	affiliationCoordinates: {
		latitude: -33.9608,
		longitude: 25.6022
	},
	country: 'South Africa',
	role: 'Participant',
	website: 'https://applang.mandela.ac.za/Staff/Johannes-Sibeko',
	bio: "Johannes Sibeko is the coordinator of Nelson Mandela University's Digital Humanities Hub and editor-in-chief of the Journal of the Digital Humanities Association of Southern Africa. His research focuses on corpus linguistics, particularly in readability studies, and on developing foundational language resources to support research in this area. He is also involved in a project scoping the landscape of Digital Humanities in Southern Africa, mapping opportunities, practices, and resources across the region.",
	researchRegions: ['South Africa'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/johannes-sibeko.webp',
	questionsOfInterest: [
		'In what ways can AI and DH improve the curation and preservation of African heritage materials?',
		'Corpus linguistics and readability research for African languages.',
		'Collaborative and community-driven Digital Humanities projects in Africa.'
	]
};
