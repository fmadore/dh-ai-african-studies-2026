export interface ThematicGroup {
	id: string;
	name: string;
	description: string;
	guidingQuestions: {
		category: string;
		question: string;
	}[];
}

export const thematicGroups: ThematicGroup[] = [
	{
		id: 'language-technologies-nlp-corpora',
		name: 'Language Technologies, NLP & Corpora',
		description:
			'This group examines the challenges of developing AI tools that authentically serve African languages rather than adapting Western models. Participants bring expertise in corpus linguistics, speech technologies, machine translation, and literary metadata systems. Key challenges include building resources for under-documented languages, designing systems that respect tonal and orthographic diversity, and ensuring that language data remains under community control.',
		guidingQuestions: [
			{
				category: 'On Data Governance',
				question:
					'How can African language communities govern their linguistic data and set terms for its use in AI training, rather than having it extracted for global models?'
			},
			{
				category: 'On Modality',
				question:
					'What technical approaches can prioritize speech, audio, and oral genres alongside written text, particularly for languages with limited textual corpora?'
			},
			{
				category: 'On Standards',
				question:
					'How do we develop metadata standards and corpus protocols that capture African linguistic features (tone, reduplication, noun class systems) without forcing them into European grammatical categories?'
			}
		]
	},
	{
		id: 'archive-preservation-community-custody-visual-heritage',
		name: 'The Archive: Preservation, Community Custody & Visual Heritage',
		description:
			'This group addresses how digital archives can serve African communities rather than extracting heritage for external use. Participants lead projects preserving Arabic and Ethiopian manuscripts, West African newspapers, women\'s oral histories, trade union records, and art historical documentation. The central challenge is ensuring that digitization enhances local access and analytical capacity\u2014not just feeds data into global AI systems.',
		guidingQuestions: [
			{
				category: 'On Custody',
				question:
					'How can digitization agreements ensure that African communities retain meaningful control over access, interpretation, and future uses of their heritage, including training AI models?'
			},
			{
				category: 'On Context',
				question:
					'What metadata standards and annotation practices preserve the cultural, linguistic, and material contexts that make archival items meaningful, rather than reducing them to extractable data points?'
			},
			{
				category: 'On Sustainability',
				question:
					'How can archive projects reduce dependency on external funding cycles and technical platforms, building local capacity for long-term maintenance?'
			}
		]
	},
	{
		id: 'infrastructure-governance-access',
		name: 'Infrastructure, Governance & Access',
		description:
			'This group confronts the material and regulatory conditions that shape who can participate in digital scholarship. Participants include specialists in AI governance, tech policy, library science, open science infrastructure, and digital preservation. They examine how connectivity gaps, cloud dependencies, and the absence of African voices in global AI standards constrain research possibilities, and how policy interventions can address these imbalances.',
		guidingQuestions: [
			{
				category: 'On Access',
				question:
					'How can we design offline-capable and low-bandwidth tools that function effectively across Africa\'s varied connectivity landscapes?'
			},
			{
				category: 'On Governance',
				question:
					'What regulatory frameworks can ensure that AI development in Africa serves local research needs and protects the rights of workers in data annotation and content moderation industries?'
			},
			{
				category: 'On Sovereignty',
				question:
					'How can African institutions develop computational infrastructure that reduces dependency on external cloud providers and keeps research data under local jurisdiction?'
			}
		]
	},
	{
		id: 'epistemologies-decoloniality-ethical-frameworks',
		name: 'Epistemologies, Decoloniality & Ethical Frameworks',
		description:
			'This group interrogates the assumptions embedded in digital tools and develops ethical frameworks rooted in African intellectual traditions. Participants bring expertise in postcolonial digital humanities, cultural restitution, AI ethics, and historical knowledge systems including Ajami scholarship. They work to ensure that computational methods do not simply digitize colonial categories but instead create space for African ways of organizing and transmitting knowledge.',
		guidingQuestions: [
			{
				category: 'On Knowledge',
				question:
					'How can classification systems, ontologies, and AI training datasets incorporate African epistemologies\u2014including oral, visual, and non-Western textual traditions\u2014rather than subordinating them to European frameworks?'
			},
			{
				category: 'On Ethics',
				question:
					'What protocols can prevent African cultural materials from being treated as raw inputs for AI systems while ensuring that communities benefit from any computational analysis of their heritage?'
			},
			{
				category: 'On Relevance',
				question:
					'How do we evaluate whether digital projects address actual research and community needs in Africa, rather than serving external academic or commercial agendas?'
			}
		]
	}
];

/**
 * Get a thematic group by its ID
 */
export function getThematicGroupById(id: string): ThematicGroup | undefined {
	return thematicGroups.find((group) => group.id === id);
}

/**
 * Get a thematic group by its name (as stored in participant data)
 */
export function getThematicGroupByName(name: string): ThematicGroup | undefined {
	return thematicGroups.find((group) => group.name === name);
}
