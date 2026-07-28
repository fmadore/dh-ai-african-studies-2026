/**
 * Editorial copy describing the position paper.
 *
 * Single source of truth shared by the public landing page
 * (`/position-paper`) and the reader's "About this paper" panel
 * (`/position-paper/read`), which previously held verbatim copies of the
 * same prose. The two render it with different layouts, so only the text
 * lives here — not the markup.
 */

export interface PaperAudience {
	title: string;
	description: string;
}

export const positionPaperAbout = {
	purpose:
		'The paper synthesises the discussions from the workshop into a set of recommendations for researchers, funders and institutions working at the intersection of digital humanities, AI and African studies. It aims to provide a strategic reference point for this emerging field, which currently lacks shared standards and clear direction. The paper centres African perspectives while addressing infrastructure gaps and linguistic diversity.',

	contentsIntro: 'The paper addresses three areas:',

	audienceIntro: 'The paper is addressed to:',

	audiences: [
		{
			title: 'Research funders',
			description: 'seeking models for sustainable, equitable project support'
		},
		{
			title: 'Universities',
			description: 'developing curricula and training in digital methods'
		},
		{
			title: 'Technology developers',
			description: 'building tools for multilingual and cross-cultural research'
		},
		{
			title: 'Policy makers',
			description: 'working on data governance and digital infrastructure'
		}
	] satisfies PaperAudience[],

	/**
	 * The drafting process, told from two vantage points. The landing page is
	 * written while the paper is still forthcoming; the reader only ships once
	 * it is published, so it speaks in the past tense.
	 */
	process: {
		forthcoming:
			'A drafting committee has been preparing the paper since the workshop, incorporating participant feedback and professional editing. The goal is a document that is both rigorous and accessible to non-specialist readers in policy and funding contexts. Publication details will be announced on this page once the paper is released.',
		published:
			'A drafting committee prepared the paper in the months following the workshop, incorporating participant feedback and professional editing. The goal was a document that is both rigorous and accessible to non-specialist readers in policy and funding contexts.'
	},

	/** The publication series, linked from both contexts. */
	series: {
		name: 'ZMO Programmatic Texts',
		url: 'https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts',
		publisher: 'Leibniz-Zentrum Moderner Orient',
		publisherUrl: 'https://www.zmo.de/en'
	}
} as const;
