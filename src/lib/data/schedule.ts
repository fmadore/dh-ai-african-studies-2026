/**
 * Workshop Schedule Data
 *
 * Centralized schedule for the three-day workshop.
 * Session types: plenary, subgroups, world-cafe, break, social
 */

export type SessionType = 'plenary' | 'subgroups' | 'world-cafe' | 'break' | 'social';

export interface ScheduleItem {
	time: string;
	title: string;
	description?: string;
	details?: string[];
	deliverables?: string[];
	type: SessionType;
	facilitators?: string[];
	rooms?: string[];
}

export interface DaySchedule {
	date: string;
	dayNumber: number;
	theme: string;
	themeDescription: string;
	items: ScheduleItem[];
}

export const schedule: DaySchedule[] = [
	{
		date: 'Wednesday, 18 February 2026',
		dayNumber: 1,
		theme: 'Methodological Integration & Digital Preservation',
		themeDescription:
			'We will document existing computational methods, preservation infrastructure and implementation barriers before developing technical standards, preservation protocols and implementation strategies. Areas of focus will include adapting AI for African languages and establishing sustainable digital preservation models.',
		items: [
			{
				time: '08:00–09:00',
				title: 'Registration & Welcome Coffee',
				type: 'break'
			},
			{
				time: '09:00–09:45',
				title: 'Opening and Introduction',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6'],
				details: [
					'Welcome remarks and overview of workshop format and goals (position paper)',
					'Brief participant introductions',
					'Introduction to collaborative workspace and explanation of the programme'
				]
			},
			{
				time: '09:45–11:00',
				title: 'Digital Humanities, AI and African Linguistic Diversity',
				type: 'plenary',
				facilitators: ['To be determined'],
				rooms: ['SR 6']
			},
			{
				time: '11:00–11:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '11:30–13:00',
				title: 'Working Groups Session',
				description: 'Working groups convene to discuss',
				type: 'subgroups',
				rooms: ['SR 5', 'SR 6', 'BRDT', '4 AG'],
				deliverables: ['Keywords and key pointers in preparation for the World Café session']
			},
			{
				time: '13:00–14:30',
				title: 'Lunch Break',
				type: 'break'
			},
			{
				time: '14:30–16:00',
				title: 'World Café',
				type: 'world-cafe',
				rooms: ['SR 5'],
				details: [
					'Setup: 4 tables, each hosted by one work group',
					'Hosts: 2 members of each work group stay at their table as "Hosts"',
					'Travelers: The rest of the group rotates to the other 3 tables at timed intervals'
				]
			},
			{
				time: '16:00–16:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '16:30–17:15',
				title: 'Day One Synthesis: Group Work',
				description: 'Small groups gather and prepare a short summary of key findings from World Café conversations',
				type: 'subgroups'
			},
			{
				time: '17:15–18:00',
				title: 'Day One Synthesis: Presentations',
				description: 'Rapporteurs present key insights from each working groups',
				type: 'plenary',
				rooms: ['SR 6']
			},
			{
				time: '18:30',
				title: 'Dinner',
				type: 'social',
				rooms: ['Festsaal']
			}
		]
	},
	{
		date: 'Thursday, 19 February 2026',
		dayNumber: 2,
		theme: 'Fostering Equitable Collaboration',
		themeDescription:
			'Centers African epistemologies to redesign research partnerships and resource distribution. This stream aims to create concrete mechanisms for North-South and South-South collaboration that dismantle power imbalances and promote genuine reciprocity.',
		items: [
			{
				time: '09:30–10:00',
				title: 'Reflection on Day One',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6'],
				details: [
					'Housekeeping',
					'Recap of key insights and deliverables from Day One, emphasising the link between methodological development and issues of equity and access',
					"Briefly revisit outstanding questions from Day One that are relevant to Day Two's themes"
				]
			},
			{
				time: '10:00–11:00',
				title: 'Mapping Digital Inequalities: Assessing Resource Distribution and Access in DH and AI for African Studies',
				type: 'plenary',
				facilitators: ['To be determined'],
				rooms: ['SR 6']
			},
			{
				time: '11:00–11:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '11:30–13:00',
				title: 'Exploring Models for Equitable Research Collaboration',
				type: 'subgroups',
				rooms: ['SR 5', 'SR 6', 'BRDT'],
				description:
					'The 4 groups reconvene in preparation for the World Café, focusing on concrete mechanisms for equitable partnerships, resource sharing, and knowledge exchange in DH and AI projects involving African contexts.',
				details: ['Each group works on exploring models for equitable research collaboration'],
				deliverables: [
					'Collection of key principles and practical mechanisms for equitable collaboration models',
					'Key pointers for the World Café session'
				]
			},
			{
				time: '13:00–14:30',
				title: 'Lunch Break',
				type: 'break',
				rooms: ['Festsaal']
			},
			{
				time: '14:30–16:00',
				title: 'World Café',
				type: 'world-cafe',
				details: [
					'Setup: 4 tables, each hosted by one Work Stream',
					'Hosts: 2 members of each Work Stream stay at their table as "Hosts"',
					'Travelers: The rest of the group rotates to the other 3 tables at timed intervals'
				]
			},
			{
				time: '16:00–16:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '16:30–17:15',
				title: 'Day Two Synthesis: Group Work',
				description:
					'Small groups gather and prepare a short summary of key findings from World Café conversations',
				type: 'subgroups',
				rooms: ['SR 6']
			},
			{
				time: '17:15–18:00',
				title: 'Day Two Synthesis: Presentations',
				description:
					'Rapporteurs present key insights from each session, highlighting key deliverables related to equitable collaboration',
				type: 'plenary',
				rooms: ['SR 6']
			},
			{
				time: '18:30',
				title: 'Dinner',
				type: 'social',
				rooms: ['Festsaal']
			}
		]
	},
	{
		date: 'Friday, 20 February 2026',
		dayNumber: 3,
		theme: 'Ethical Frameworks & Digital Sovereignty',
		themeDescription:
			'Develops guidelines for data governance and responsible AI implementation. The focus shifts from passive consultation to active co-creation, establishing standards that protect digital sovereignty and ensure equitable knowledge dissemination.',
		items: [
			{
				time: '09:00–09:10',
				title: 'Aims of Day 3',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6']
			},
			{
				time: '09:10–11:00',
				title: 'Ethical Dilemmas and Best Practices in DH and AI Implementation in African Institutions and Archives 1/2',
				type: 'world-cafe',
				facilitators: ['To be determined'],
				rooms: ['SR 6']
			},
			{
				time: '11:00–11:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '11:30–13:00',
				title: 'Ethical Dilemmas and Best Practices in DH and AI Implementation in African Studies 2/2',
				type: 'world-cafe',
				facilitators: ['To be determined'],
				rooms: ['SR 6']
			},
			{
				time: '13:00–14:15',
				title: 'Lunch Break',
				type: 'break'
			},
			{
				time: '14:15–14:45',
				title: 'Slides and Instructions for the Position Paper',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6'],
				details: [
					'Establishment of a clear timeline for post-workshop drafting, review, editing, and dissemination of the position paper'
				]
			},
			{
				time: '14:45–15:00',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '15:00–16:30',
				title: 'Writing Session',
				type: 'subgroups',
				rooms: ['SR 5', 'SR 6', 'BRDT', 'Bar OG'],
				details: [
					'Structured session focused on finalising the framework and key recommendations for the position paper, incorporating the ethical principles and policy recommendations developed during Day Three',
					'Review and refinement of the position paper outline and key messages'
				],
				deliverables: [
					'Draft sections of the position paper with key recommendations',
					'Refined position paper outline and key messages'
				]
			},
			{
				time: '16:30–17:00',
				title: "What's Next / Conclusion",
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6'],
				details: [
					'Discussion and commitment to concrete follow-up activities and collaborative actions beyond the workshop to implement workshop recommendations',
					'Deliverable: Finalised outline of the position paper, agreed-upon writing responsibilities and timeline, and a preliminary list of concrete follow-up actions and commitments from workshop participants',
					'Final reflections from all participants on the workshop experience and key takeaways',
					'Formal commitments from participants to specific actions and collaborations following the workshop',
					'Formal closing remarks'
				]
			},
			{
				time: '18:00',
				title: 'Dinner',
				type: 'social',
				rooms: ['Festsaal']
			}
		]
	}
];

/** Session type metadata for styling and display */
export const sessionTypes: Record<
	SessionType,
	{
		label: string;
		colorClass: string;
	}
> = {
	plenary: {
		label: 'Plenary',
		colorClass: 'bg-primary-300 dark:bg-primary-600'
	},
	subgroups: {
		label: 'Subgroups Work',
		colorClass: 'bg-secondary-500'
	},
	'world-cafe': {
		label: 'World Café',
		colorClass: 'bg-amber-500'
	},
	break: {
		label: 'Break',
		colorClass: 'bg-gray-300 dark:bg-gray-600'
	},
	social: {
		label: 'Social Event',
		colorClass: 'bg-primary-500'
	}
};
