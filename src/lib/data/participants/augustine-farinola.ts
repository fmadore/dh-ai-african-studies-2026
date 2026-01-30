import type { Participant } from '$lib/types/participant';

export const augustineFarinola: Participant = {
	name: 'Augustine Farinola',
	affiliation: 'University of Alberta',
	affiliationCoordinates: {
		latitude: 53.5232,
		longitude: -113.5263
	},
	country: 'Canada',
	role: 'Participant',
	website: 'https://apps.ualberta.ca/directory/person/farinola',
	bio: 'Augustine Farinola currently holds a Graduate Research Assistant Fellowship in the Faculty of Medicine & Dentistry (Medicine Department) and a Graduate Research Assistantship in Media Technology Studies (Faculty of Arts), under the supervision of Prof. Geoffrey Rockwell at the University of Alberta, Edmonton, Canada. His research in African Digital Humanities include publications [Digital Humanities Scholarship in Africa : Prospects and Challenges, 2019; Towards a Yoruba Indigenous Model of Communication for Software Development in Digital Humanities, 2022; Moral Chains and Animal Agents: A Database-Driven Study of African Folktales, 2025] and Digital Projects [such as Paint-Me-Black (2018, https://paintmeblack.com), Africanpedia (2023, https://www.africanpedia.com), StoryChain App (2024, https://www.digitalafricanstorytelling.com), and ADH-Lab (2025, https://www.africandigitalhumanities.ca).',
	researchRegions: ['Africa', 'North America'],
	thematicGroup: 'Language Technologies, NLP & Corpora',
	photoUrl: '/images/participants/augustine-farinola.jpeg',
	questionsOfInterest: [
		'Designing DH tools with African epistemic & ontological frameworks: How do we translate indigenous theories into concrete schemas, metadata fields, and UI patterns so DH tools achieve true epistemic fit and avoid category loss?',
		'Conceptual engineering for linguistic/interface translation in DH: Which core interface concepts (labels, commands, error states, speech-act cues) fail to carry over in African languages, and how can conceptual engineering reshape them—plus what tests confirm semantic fidelity across languages and contexts?',
		'African-language NLP & corpora: standards, benchmarks, and ethics: What minimum standards (dialect coverage, tone/orthography, annotation rubrics) and consent/governance protocols enable shareable corpora, and how should we benchmark NLP so cultural validity is measured alongside accuracy?'
	]
};
