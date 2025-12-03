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
			'This group focuses on building AI tools that truly serve African languages. Instead of simply translating Western models, participants explore how to design systems rooted in African linguistic structures. Key topics include prioritizing speech technology for oral traditions and ensuring that communities retain ownership of their language data.',
		guidingQuestions: [
			{
				category: 'On Sovereignty',
				question:
					'How can we ensure African communities own their language data and avoid exploitation by global AI models?'
			},
			{
				category: 'On Modality',
				question:
					'Given the rich oral traditions of many African languages, how can we prioritize speech and audio technologies over text-heavy approaches?'
			},
			{
				category: 'On Design',
				question:
					'How do we create technical standards that respect African linguistic structures instead of forcing them into Western categories?'
			}
		]
	},
	{
		id: 'archive-preservation-community-custody-visual-heritage',
		name: 'The Archive: Preservation, Community Custody & Visual Heritage',
		description:
			'This group looks beyond digitization to ask: who owns African history in the digital age? Participants examine how to preserve manuscripts and visual culture in ways that respect local context and community rights. The goal is to support sustainable, community-led archives rather than "extracting" heritage for external AI training.',
		guidingQuestions: [
			{
				category: 'On Custody',
				question:
					'How can partnerships ensure African communities keep control over their digital archives instead of just supplying raw data?'
			},
			{
				category: 'On Context',
				question:
					'How do we apply AI analysis to heritage materials without stripping away their cultural meaning or hiding the human labor involved?'
			},
			{
				category: 'On Sustainability',
				question:
					'How can we prioritize affordable, easy-to-maintain tools so archives survive without reliance on Western funding agencies?'
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
