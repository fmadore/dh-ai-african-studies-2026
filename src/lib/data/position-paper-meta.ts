import type { PositionPaperMeta } from '$lib/reader/types';

/**
 * Single source of truth for the position paper's bibliographic metadata.
 * Drives SEO/Google Scholar/Dublin Core meta tags, JSON-LD, and the
 * "How to cite" widget.
 */
export const positionPaperMeta: PositionPaperMeta = {
	title: 'Charting New Territory: Digital Humanities and AI in African Studies',
	subtitle: 'A Position Paper',
	authors: [
		{ name: 'Frédérick Madore', url: 'https://www.frederickmadore.com/' },
		{ name: 'Vincent Hiribarren', url: 'https://www.kcl.ac.uk/people/vincent-hiribarren' }
	],
	publicationDate: '2026-05-01',
	revisedDate: undefined,
	abstract:
		'This position paper synthesises the outcomes of the workshop "Charting New Territory: Digital Humanities and AI in African Studies" (Hanover, 18–20 February 2026) into a set of recommendations for researchers, funders, and institutions working at the intersection of digital humanities, artificial intelligence, and African studies. It centres African perspectives and addresses infrastructure gaps, linguistic diversity, equity, methodology, and ethics.',
	keywords: [
		'Digital Humanities',
		'Artificial Intelligence',
		'African Studies',
		'Open Science',
		'Research Infrastructure',
		'Multilingualism',
		'Data Governance',
		'Ethics',
		'Policy'
	],
	language: 'en',
	publisher: 'Leibniz-Zentrum Moderner Orient (ZMO)',
	journalTitle: 'ZMO Programmatic Texts',
	doi: undefined,
	issn: undefined,
	pdfPath: '/documents/position-paper.pdf',
	pdfAvailable: false
};
