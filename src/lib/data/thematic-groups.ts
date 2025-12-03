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
			'This group addresses the critical intersection of computational linguistics and data sovereignty, aiming to build sovereign computational infrastructures for African languages. Spanning the technical lifecycle from speech technologies and audio corpora to the high-level architecture of Large Language Models (LLMs), this group seeks to resolve the structural biases inherent in current AI development. By prioritizing epistemic fit, the participants aim to establish robust benchmarking standards and dataset designs that defy Anglophone dominance. The objective is to prevent "category loss" through conceptual engineering, ensuring that NLP tools, user interfaces, and training data are not merely translated, but are architecturally grounded in African linguistic structures and indigenous ontologies.',
		guidingQuestions: [
			{
				category: 'On Sovereignty',
				question:
					'How can we ensure African communities retain ownership of their language data and prevent exploitation when contributing to global AI models?'
			},
			{
				category: 'On Modality',
				question:
					'Since many African languages have strong oral traditions, how can we prioritize speech and audio technologies over text-centric approaches?'
			},
			{
				category: 'On Design',
				question:
					'How do we create technical standards and user interfaces that respect African linguistic structures, rather than simply translating Western concepts?'
			}
		]
	},
	{
		id: 'archive-preservation-community-custody-visual-heritage',
		name: 'The Archive: Preservation, Community Custody & Visual Heritage',
		description:
			'This group centers the "politics of the archive," moving the conversation beyond digitization as a technical task to a question of sovereignty: "who owns the digital twin?" Uniting expertise in Ethiopian and Arabic manuscript cultures, West African art history, women\'s archives, and labor records, the participants are critically focused on the gap between global digital infrastructures and local community needs. Their intervention challenges the "extraction" model—where African history is mined for raw data—by advocating for post-custodial frameworks that respect indigenous knowledge systems and linguistic diversity. Whether preserving fragile manuscripts or mapping visual culture, the group aims to define how digital tools can support sustainable, community-led stewardship rather than displacing local ownership.',
		guidingQuestions: [
			{
				category: 'On Custody',
				question:
					'How can partnerships be designed so that African communities retain control over their digital archives, rather than serving as raw data suppliers for external researchers?'
			},
			{
				category: 'On Context',
				question:
					'How do we digitize visual heritage and manuscripts without stripping away their cultural meaning or hiding the human labor involved in preserving them?'
			},
			{
				category: 'On Sustainability',
				question:
					'How can we prioritize tools that are simple and affordable enough to be maintained locally, ensuring the archive survives without constant foreign aid?'
			}
		]
	},
	{
		id: 'infrastructure-governance-access',
		name: 'Infrastructure, Governance & Access',
		description:
			'This workstream serves to ground the workshop in practical reality. While other sessions may explore the theoretical potential of AI, this group confronts what is actually achievable given the daily constraints of electricity, bandwidth, and funding. By uniting participants building these systems, the group creates a powerhouse for discussing "Digital Sobriety"—the urgent need for technology that works within local limitations rather than ignoring them. This team is uniquely positioned to draft concrete policy recommendations, guiding funders toward supporting infrastructure that is not just innovative, but sustainable, equitable, and built to last.',
		guidingQuestions: [
			{
				category: 'On Access',
				question:
					'How can we build digital tools that actually work in environments with unstable electricity and expensive data, rather than assuming everyone has high-speed internet?'
			},
			{
				category: 'On Regulation',
				question:
					'What rules must be put in place to ensure AI development respects African labor rights and benefits local citizens, rather than just extracting data for foreign profit?'
			},
			{
				category: 'On Sovereignty',
				question:
					'How can African institutions build and own the basic infrastructure—like servers and databases—needed to stop relying on expensive technology rented from the Global North?'
			}
		]
	},
	{
		id: 'epistemologies-decoloniality-ethical-frameworks',
		name: 'Epistemologies, Decoloniality & Ethical Frameworks',
		description:
			'This group addresses the risk that new digital tools might simply repeat historical inequalities. By combining expertise in African languages, digital restitution, and data ethics, these scholars will examine the hidden biases often built into AI and archival systems. Their work will define the core ethical principles for the Position Paper, ensuring the workshop avoids empty "techno-solutionism"—the belief that technology alone can solve complex cultural problems—and instead prioritizes African ownership and ways of knowing.',
		guidingQuestions: [
			{
				category: 'On Knowledge Systems',
				question:
					'How can we design digital tools that recognize African languages, scripts, and oral traditions, rather than forcing them into rigid Western categories that fail to capture their true meaning?'
			},
			{
				category: 'On Data Justice',
				question:
					'What specific safeguards must be established to prevent African cultural heritage from being treated as "raw material" for AI models, ensuring that communities retain ownership of their own stories?'
			},
			{
				category: 'On Relevance',
				question:
					'How do we ensure that digital projects address actual social needs and literacy gaps, rather than prioritizing "flashy" technology that ignores the daily realities of the people it claims to serve?'
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
