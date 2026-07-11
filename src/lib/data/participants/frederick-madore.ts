import type { Participant } from '$lib/types/participant';

export const frederickMadore: Participant = {
	name: 'Frédérick Madore',
	affiliation: 'University of Bayreuth',
	affiliationCoordinates: {
		latitude: 49.9442,
		longitude: 11.5754
	},
	country: 'Germany',
	role: 'Co-organizer',
	bio: 'Frédérick Madore is a historian of Islam in Francophone West Africa and a Data Curator at the Cluster of Excellence "Africa Multiple," University of Bayreuth. His current work explores how AI and digital methods can transform the study of under-resourced African digital collections. He is developing the Islam West Africa Collection (IWAC), an open-access database of over 14,500 documents built on Omeka S. Using LLM-powered pipelines, he experiments with AI-assisted text extraction, named entity recognition, and sentiment analysis to process large documentary collections—while critically examining the risks of algorithmic opacity and Western-centric bias. He was previously a Research Fellow at Leibniz-Zentrum Moderner Orient (Berlin).',
	researchRegions: ['West Africa', 'Benin', "Côte d'Ivoire", 'Burkina Faso', 'Togo'],
	thematicGroup: 'The Archive: Preservation, Community Custody & Visual Heritage',
	photoUrl: '/images/participants/frederick-madore.webp',
	questionsOfInterest: [
		'Strategies for using AI pipelines to rapidly process the "backlog" of private, unprocessed digital collections held by individual researchers and returning them to the community.',
		'"Digital Sobriety" and "Minimal Computing" in Practice: Can lightweight, locally hosted open-source models realistically compete with commercial giants (ChatGPT/Gemini) for African institutions with limited hardware?'
	],
	website: 'https://www.frederickmadore.com/'
};
