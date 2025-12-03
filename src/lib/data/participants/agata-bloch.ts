import type { Participant } from '$lib/types/participant';

export const agataBloch: Participant = {
	name: 'Agata Błoch',
	affiliation: 'Institute of History, Polish Academy of Sciences',
	affiliationCoordinates: {
		latitude: 52.2297,
		longitude: 21.0122
	},
	country: 'Poland',
	role: 'Participant',
	bio: 'Agata Błoch is an Assistant Professor at the Institute of History at the Polish Academy of Sciences and a lecturer at Jagiellonian University. She is the Principal Investigator of the project "Imperial Commoners of Brazil and West Africa (1640-1822)," funded by the Polish National Science Centre. In 2022, she received the Award for the Best Thesis on Latin America in Europe, granted by the Consejo Europeo de Investigaciones Sociales de América Latina (CEISAL). In 2025, she was awarded a certificate of merit at the IV Scientific Research Symposium of the Jean Piaget University of Cape Verde, recognizing her outstanding research in the category of Technological and Social Sciences Studies. Her papers have been published in journals such as the Journal of African History, Social Networks, the Journal of History, and Digital Humanities Quarterly, among others.',
	researchRegions: ['Atlantic', 'Brazil', 'West Africa'],
	thematicGroup: 'Epistemologies, Decoloniality & Ethical Frameworks',
	photoUrl: '/images/participants/agata-bloch.jpg',
	questionsOfInterest: [
		'How can Black and African Digital Humanities challenge Western epistemic dominance and establish autonomous frameworks for digital knowledge production?',
		'What practical and ethical strategies can help decolonize digital infrastructures and promote more equitable access to African historical data?',
		'How can digital humanists and AI developers work together to ensure that African cultural and historical contexts are accurately represented in AI and machine learning systems?'
	]
};
