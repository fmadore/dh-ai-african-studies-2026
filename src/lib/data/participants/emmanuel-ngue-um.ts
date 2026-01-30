import type { Participant } from '$lib/types/participant';

export const emmanuelNgueUm: Participant = {
	name: 'Emmanuel Ngue Um',
	affiliation: 'University of Yaounde 1',
	affiliationCoordinates: {
		latitude: 3.8480,
		longitude: 11.5021
	},
	country: 'Cameroon',
	role: 'Participant',
	website: 'https://github.com/Ngue-Um',
	bio: "Emmanuel Ngue Um is an Associate Professor of African Languages and Linguistics at the University of Yaoundé 1. His current research focuses on developing speech technologies and machine translation services to support the teaching and revitalisation of Africa's indigenous languages. He is also involved in developing an ecomuseum to preserve and promote a section of the colonial railway in Cameroon.",
	researchRegions: ['Cameroon', 'Congo', 'Senegal', 'Benin', 'Nigeria', 'Ghana'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/emmanuel-ngue-um.jpg',
	questionsOfInterest: [
		'Language technologies for under-served African languages',
		'Approaches to dataset design, inclusivity and linguistic diversity',
		'Data sovereignty in the digital economy'
	]
};
