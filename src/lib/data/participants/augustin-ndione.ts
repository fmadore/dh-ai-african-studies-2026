import type { Participant } from '$lib/types/participant';

export const augustinNdione: Participant = {
	name: 'Augustin Ndione',
	affiliation: 'Cheikh Anta Diop University',
	affiliationCoordinates: {
		latitude: 14.6928,
		longitude: -17.4467
	},
	country: 'Senegal',
	role: 'Participant',
	bio: 'Augustin Ndione is a researcher in Linguistics. Since 2023, he is Director of the Center for Applied Linguistics in Dakar (CLAD) at Cheikh Anta Diop University in Dakar, which he joined in 2017. His research focuses on enunciative semantics, but he also participates in the implementation of digital humanities research projects, particularly on the languages of Senegal.',
	researchRegions: ['Senegal', 'West Africa'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/augustin-ndione.jpg',
	questionsOfInterest: [
		'How to equip African languages with AI tools?',
		'What contribution does digital technology provide to researches in the humanities in countries such as Senegal?',
		'How to make AI and technologies accessible to people that do not have access to international languages?'
	]
};
