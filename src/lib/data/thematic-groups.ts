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
			'This group moves the conversation beyond "how to digitize" to "who owns the digital twin?", bridging the gap between high-tech AI pipelines and community-centred memory work. The critical intervention for this group is to challenge the "extraction" model, in which African communities supply raw data for Global North DH projects. They must explore post-custodial models where AI tools assist communities in organising their own archives according to their own epistemologies, rather than feeding a centralised external database.',
		guidingQuestions: [
			{
				category: 'The Ownership Question',
				question:
					'How do we design legal and technical frameworks so that African organizations retain ownership over digitized material contributed to AI projects, rather than acting as passive "suppliers"?'
			},
			{
				category: 'The "Digital Twin" Ethics',
				question:
					'When creating a "digital twin" of a physical object or manuscript, how do we ensure the metadata reflects the local context and community values, rather than stripping it bare for global interoperability?'
			},
			{
				category: 'The "Right to Refusal"',
				question:
					'In the rush to preserve "at-risk" heritage, how do we encode a community\'s right to refuse digitization or restrict access to sacred materials within the architecture of the database itself?'
			},
			{
				category: 'The Feedback Loop',
				question:
					'How can AI pipelines be used specifically to process "backlogs" of private collections for the purpose of returning them to the community, rather than for external academic extraction?'
			}
		]
	},
	{
		id: 'infrastructure-governance-access',
		name: 'Infrastructure, Governance & Access',
		description:
			'This group grounds the workshop in reality. While other groups discuss what AI could do, this group discusses what is possible given the constraints of power, bandwidth, and funding. Merging legal/policy experts with infrastructure builders creates a powerhouse for discussing "Digital Sobriety." They are best suited to draft the policy recommendations for funders regarding sustainable infrastructure.',
		guidingQuestions: [
			{
				category: 'Infrastructural',
				question:
					'How can we implement "Minimal Computing" strategies that allow sophisticated DH work to proceed in environments with unstable electricity and data poverty?'
			},
			{
				category: 'Political',
				question:
					'How do we move from a model of "extracting raw data" (from the South) and "exporting analysis" (from the North) to a true circular value chain?'
			},
			{
				category: 'Governance',
				question:
					'What legal frameworks are needed to ensure African nations retain sovereignty over the datasets created by mass digitization projects?'
			}
		]
	},
	{
		id: 'epistemologies-decoloniality-ethical-frameworks',
		name: 'Epistemologies, Decoloniality & Ethical Frameworks',
		description:
			'This will challenge the ontological assumptions embedded in digital tools. By bringing together scholars of "epistemic dominance" with those working on indigenous knowledge systems, this group will define the philosophical framework that the Position Paper must adopt. They ensure the workshop does not fall into "techno-solutionism."',
		guidingQuestions: [
			{
				category: 'Epistemic',
				question:
					'How do we translate indigenous theories into metadata fields and UI patterns so that the digital tool achieves "epistemic fit" rather than forcing African concepts into Western boxes?'
			},
			{
				category: 'Critical',
				question:
					'In what ways do current AI models function as "WEIRD" (Western, Educated, Industrialized, Rich, Democratic) tools, and how can we actively de-bias them in an African context?'
			},
			{
				category: 'Future-Looking',
				question:
					'How can Black and African DH establish autonomous frameworks for knowledge production that do not rely on validation from the Global North?'
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
