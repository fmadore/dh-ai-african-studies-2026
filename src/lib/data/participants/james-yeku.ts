import type { Participant } from '$lib/types/participant';

export const jamesYeku: Participant = {
	name: 'James Yékú',
	affiliation: 'University of Kansas',
	affiliationCoordinates: {
		latitude: 38.9543,
		longitude: -95.2558
	},
	country: 'United States',
	role: 'Participant',
	website: 'https://jamesyeku.com/',
	bio: 'James Yékú, a recipient of the Alexander von Humboldt fellowship, teaches postcolonial digital humanities and African literary studies at the University of Kansas as an Associate Professor of African and African American Studies. He is the author of "Cultural Netizenship: Social Media, Popular Culture, and Performance in Nigeria," "The Algorithmic Age of Personality: African Literature and Cancel Culture," as well as two books of poetry, and a nonfiction collection.',
	researchRegions: ['Nigeria', 'West Africa'],
	thematicGroup: 'Epistemologies, Decoloniality & Ethical Frameworks',
	photoUrl: '/images/participants/james-yeku.png',
	questionsOfInterest: [
		'Bidirectionality in AI research: How does AI-driven methods enrich the African cultural and historical record, and in what ways does this African archive simultaneously enhance AI models?',
		"Africa and the politics, assumptions and limitations of AI as WEIRD models (Joseph Henrich's acronym for \"Western, Educated, Industrialized, Rich, and Democratic\")",
		"Extractivist Data Practices and the Ambivalence (in terms of necessity and 'danger') of Digitizing the African Archive"
	]
};
