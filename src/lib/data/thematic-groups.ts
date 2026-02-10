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
			'This group grounds the workshop in the material realities of digital infrastructure in Africa. Rather than assuming ubiquitous high-speed access, it focuses on "Digital Sobriety"—building sustainable systems that are resilient to infrastructural challenges. They also aim to draft policies that protect labor rights and ensure AI development benefits local economies.',
		guidingQuestions: [
			{
				category: 'On Access',
				question:
					'How can we design resilient tools that function effectively regardless of connectivity levels or infrastructural constraints?'
			},
			{
				category: 'On Regulation',
				question:
					'What rules are needed to ensure AI respects African labor rights and benefits local citizens?'
			},
			{
				category: 'On Infrastructure',
				question:
					'How can African institutions develop sovereign digital infrastructures to ensure data remains under local control and reduce dependency on external providers?'
			}
		]
	},
	{
		id: 'epistemologies-decoloniality-ethical-frameworks',
		name: 'Epistemologies, Decoloniality & Ethical Frameworks',
		description:
			'This group examines the hidden biases in digital tools to prevent repeating historical inequalities. It challenges "techno-solutionism"—the idea that technology alone can solve complex social problems. Instead, participants define ethical principles to ensure digital projects are relevant, respectful, and grounded in African ways of knowing.',
		guidingQuestions: [
			{
				category: 'On Knowledge',
				question:
					'How can we design tools that recognize African knowledge systems rather than fitting them into rigid foreign categories?'
			},
			{
				category: 'On Ethics',
				question:
					'What safeguards are needed to prevent African culture from being treated merely as "raw material" for AI?'
			},
			{
				category: 'On Relevance',
				question:
					'How do we ensure digital projects address actual social needs rather than prioritizing flashy technology or speculative AI hype?'
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
