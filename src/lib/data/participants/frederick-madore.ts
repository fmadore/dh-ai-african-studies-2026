import type { Participant } from '$lib/types/participant';

export const frederickMadore: Participant = {
	name: 'Frédérick Madore',
	affiliation: 'Leibniz-Zentrum Moderner Orient',
	affiliationCoordinates: {
		latitude: 52.5200,
		longitude: 13.4050
	},
	country: 'Germany',
	role: 'Co-organizer',
	bio: 'Frédérick Madore is a Research Fellow at the Leibniz-Zentrum Moderner Orient (ZMO) in Berlin, where his work combines African history with digital humanities and AI. He leads the "Islam West Africa Collection" (IWAC), an open-access database that uses AI-assisted workflows to process and visualise over 14,500 archival items related to Muslim societies in Francophone West Africa. By combining extensive fieldwork with computational analysis, his research focuses on integrating digital tools with traditional archival methods to improve accessibility and analysis in West African contexts.',
	researchRegions: ['West Africa', 'Benin', "Côte d'Ivoire", 'Burkina Faso', 'Togo'],
	thematicGroup: 'The Archive: Preservation, Community Custody & Visual Heritage',
	photoUrl: '/images/participants/frederick-madore.jpg',
	questionsOfInterest: [
		'Strategies for using AI pipelines to rapidly process the "backlog" of private, unprocessed digital collections held by individual researchers and returning them to the community.',
		'"Digital Sobriety" and "Minimal Computing" in Practice: Can lightweight, locally hosted open-source models realistically compete with commercial giants (ChatGPT/Gemini) for African institutions with limited hardware?'
	]
};
