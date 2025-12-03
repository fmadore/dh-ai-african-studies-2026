import type { Participant } from '$lib/types/participant';

export const mennoVanZaanen: Participant = {
	name: 'Menno van Zaanen',
	affiliation: 'South African Centre for Digital Language Resources',
	affiliationCoordinates: {
		latitude: -26.7056,
		longitude: 27.0094
	},
	country: 'South Africa',
	role: 'Participant',
	bio: 'Menno van Zaanen is a professor in Digital Humanities at the South African Centre for Digital Language Resources. He is particularly interested in incorporating the use of computational techniques in the field of Humanities. His research background is in computer science and computational linguistics.',
	researchRegions: ['South Africa'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/menno-van-zaanen.png',
	questionsOfInterest: [
		'National and international networks in the context of Digital Humanities',
		'Impact of low resource languages in the age of large language models',
		'Artificial Intelligence in education'
	]
};
