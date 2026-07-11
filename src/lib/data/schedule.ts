/**
 * Workshop Schedule Data
 *
 * Centralized schedule for the three-day workshop.
 * Session types: plenary, subgroups, world-cafe, break, social
 */

export type SessionType = 'plenary' | 'subgroups' | 'world-cafe' | 'poster' | 'break' | 'social';

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
			'Participants documented existing computational methods, preservation infrastructure and implementation barriers before developing technical standards, preservation protocols and implementation strategies. Areas of focus included adapting AI for African languages and establishing sustainable digital preservation models.',
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
				facilitators: ['Kọ́lá Túbọ̀sún', 'Ashleigh Harris'],
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
				deliverables: [
					"A flipchart poster summarising the group's key themes, questions, and discussion points to anchor their World Café table"
				]
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
					'Interactive discussion format where participants rotate between four thematic tables in three timed rounds (25 minutes each)',
					'Each table is anchored by a table host who stays for the entire session, briefs newcomers on prior discussions, and captures key points',
					'Participants build on the keywords and key pointers prepared during the small-group working sessions',
					'Between rounds, participants disperse individually across tables to maximise cross-pollination of ideas'
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
				description:
					'Small groups gather and prepare a short summary of key findings from World Café conversations',
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
			'Centred African epistemologies to redesign research partnerships and resource distribution. This stream worked on concrete mechanisms for North-South and South-South collaboration that dismantle power imbalances and promote genuine reciprocity.',
		items: [
			{
				time: '08:30–09:30',
				title: 'Welcome Coffee',
				type: 'break'
			},
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
				title:
					'Mapping Digital Inequalities: Assessing Resource Distribution and Access in DH and AI for African Studies',
				type: 'plenary',
				facilitators: ['Karen Ijumba', 'Menno van Zaanen'],
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
				type: 'subgroups',
				rooms: ['SR 5', 'SR 6', 'BRDT'],
				description:
					'Working groups convene to discuss and prepare posters to present their findings.',
				deliverables: [
					"A poster summarising the group's key themes, questions, and discussion points for the afternoon poster presentations"
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
				title: 'Poster Presentations',
				description:
					'Groups present posters developed during the morning session on equitable research collaboration models.',
				type: 'poster',
				rooms: ['SR 6'],
				details: [
					'Each group presents their poster summarising key themes, questions, and discussion points on equitable collaboration',
					'Followed by open discussion and feedback from all participants'
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
					'Small groups gather and prepare a short summary of key findings from poster presentations and discussions',
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
			'Developed guidelines for data governance and responsible AI implementation. The focus shifted from passive consultation to active co-creation, establishing standards that protect digital sovereignty and ensure equitable knowledge dissemination.',
		items: [
			{
				time: '08:30–09:00',
				title: 'Welcome Coffee',
				type: 'break'
			},
			{
				time: '09:00–09:30',
				title: 'Aims of Day 3',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6']
			},
			{
				time: '09:30–11:00',
				title:
					'Ethical Dilemmas and Best Practices in DH and AI Implementation in African Institutions and Archives 1/2',
				type: 'world-cafe',
				facilitators: ['Fallou Ngom', 'Erika Melek Delgado'],
				rooms: ['SR 6']
			},
			{
				time: '11:00–11:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '11:30–13:00',
				title:
					'Ethical Dilemmas and Best Practices in DH and AI Implementation in African Studies 2/2',
				type: 'world-cafe',
				facilitators: ['Cassandra Mark-Thiesen', 'James Yékú'],
				rooms: ['SR 6']
			},
			{
				time: '13:00–14:15',
				title: 'Lunch Break',
				type: 'break',
				rooms: ['Festsaal']
			},
			{
				time: '14:15–15:15',
				title: 'Slides and Instructions for the Position Paper',
				type: 'plenary',
				facilitators: ['Frédérick Madore', 'Vincent Hiribarren'],
				rooms: ['SR 6'],
				details: [
					'Establishment of a clear timeline for post-workshop drafting, review, editing, and dissemination of the position paper'
				]
			},
			{
				time: '15:15–15:30',
				title: 'Coffee Break',
				type: 'break'
			},
			{
				time: '15:30–16:30',
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
				time: '20:00',
				title: 'Dinner',
				description: 'Restaurant Al Dar (self-pay, not included in workshop costs)',
				type: 'social',
				details: ['https://maps.app.goo.gl/JB6Ps2kKySCs7TJi8']
			}
		]
	}
];

/** Session type metadata for styling and display */
/** When the schedule data was last edited — shown on the schedule page */
export const scheduleLastUpdated = '19 February 2026';

export const sessionTypes: Record<
	SessionType,
	{
		label: string;
		colorClass: string;
		/** Card background/border/icon styling — single source for type→style */
		cardBg: string;
		cardBorder: string;
		iconColor: string;
	}
> = {
	plenary: {
		label: 'Plenary',
		colorClass: 'bg-primary-300 dark:bg-primary-600',
		cardBg: 'bg-primary-50 dark:bg-primary-900/20',
		cardBorder: 'border-l-4 border-primary-300 dark:border-primary-600',
		iconColor: 'text-primary-600 dark:text-primary-400'
	},
	subgroups: {
		label: 'Subgroups Work',
		colorClass: 'bg-secondary-500',
		cardBg: 'bg-secondary-50 dark:bg-secondary-900/20',
		cardBorder: 'border-l-4 border-secondary-500',
		iconColor: 'text-accent'
	},
	'world-cafe': {
		label: 'World Café',
		colorClass: 'bg-amber-500',
		cardBg: 'bg-amber-50 dark:bg-amber-900/20',
		cardBorder: 'border-l-4 border-amber-500',
		iconColor: 'text-amber-600 dark:text-amber-400'
	},
	poster: {
		label: 'Poster Presentations',
		colorClass: 'bg-violet-500',
		cardBg: 'bg-violet-50 dark:bg-violet-900/20',
		cardBorder: 'border-l-4 border-violet-500',
		iconColor: 'text-violet-600 dark:text-violet-400'
	},
	break: {
		label: 'Break',
		colorClass: 'bg-gray-300 dark:bg-gray-600',
		cardBg: 'bg-gray-50 dark:bg-gray-800/50',
		cardBorder: 'border-l-4 border-gray-300 dark:border-gray-600',
		iconColor: 'text-gray-500 dark:text-gray-400'
	},
	social: {
		label: 'Social Event',
		colorClass: 'bg-primary-500',
		cardBg: 'bg-primary-100 dark:bg-primary-900/30',
		cardBorder: 'border-l-4 border-primary-500',
		iconColor: 'text-primary-600 dark:text-primary-400'
	}
};
