import type { PositionPaperMeta } from '$lib/reader/types';

/**
 * Single source of truth for the position paper's bibliographic metadata.
 * Drives SEO/Google Scholar/Dublin Core meta tags, JSON-LD, and the
 * "How to cite" widget.
 */
export const positionPaperMeta: PositionPaperMeta = {
	title:
		'For Whom and For What Purpose? A Position Paper on Digital Humanities and AI in African Studies',
	// The order is load-bearing and explained by `authorshipNote` below: the two
	// conveners, then everyone else alphabetically. `url` mirrors the `website`
	// field on the matching participant record. `family`/`given` are set only
	// where the last-word-is-the-surname rule would mis-invert the name in a
	// citation.
	authors: [
		{ name: 'Frédérick Madore', url: 'https://www.frederickmadore.com/' },
		{ name: 'Vincent Hiribarren', url: 'https://www.kcl.ac.uk/people/vincent-hiribarren' },
		{ name: 'Agata Błoch', url: 'https://www.agatabloch.com/' },
		{
			name: 'Albrecht Hofheinz',
			url: 'https://www.hf.uio.no/ikos/english/people/aca/middle-east-studies/tenured/albrech/'
		},
		{
			name: 'Ashleigh Harris',
			url: 'https://www.uu.se/en/contact-and-organisation/staff?query=N7-1606'
		},
		{ name: 'Augustin Ndione', url: 'https://annuairechercheurs.ucad.sn/augustin.ndione' },
		{
			name: 'Britta Frede',
			url: 'https://www.islamwissenschaft.uni-bayreuth.de/en/team/britta-frede/index.php'
		},
		{
			name: 'Cassandra Mark-Thiesen',
			url: 'https://www.uni-regensburg.de/en/university/dimas/team/dr-cassandra-mark-thiesen'
		},
		{ name: 'Duncan Money', url: 'https://duncan.money/' },
		{
			name: 'Emmanuel Ngue Um',
			url: 'https://github.com/Ngue-Um',
			family: 'Ngue Um',
			given: 'Emmanuel'
		},
		{ name: 'Érika Melek Delgado', url: 'https://www.kcl.ac.uk/people/erika-melek-delgado' },
		{ name: 'Fallou Ngom', url: 'https://www.bu.edu/anthrop/profile/fallou-ngom/' },
		{ name: 'Fu’ad Lawal', url: 'https://archivi.ng/' },
		{ name: 'Irene Mwendwa', url: 'https://www.linkedin.com/in/irenemwendwa/' },
		{ name: 'James Yékú', url: 'https://jamesyeku.com/' },
		{ name: 'Janeth David Nzenga' },
		{ name: 'Johannes Sibeko', url: 'https://applang.mandela.ac.za/Staff/Johannes-Sibeko' },
		{ name: 'Karen Byera Ijumba', url: 'https://openrestitution.africa/about-the-project/' },
		{ name: 'Kọ́lá Túbọ̀sún', url: 'https://kolatubosun.com/' },
		{ name: 'Leah Junck', url: 'https://www.globalcenter.ai/about/leah-junck' },
		{
			name: 'Menno van Zaanen',
			url: 'https://sadilar.org/en/dh-prof/',
			family: 'van Zaanen',
			given: 'Menno'
		},
		{ name: 'Nuraddin Aman' },
		{ name: 'Oumou Sidibé', url: 'https://www.archivesfemmesmali.com/' },
		{
			name: 'Susan Elizabeth Gagliardi',
			url: 'https://arthistory.emory.edu/people/bios/gagliardi-susan-elizabeth.html'
		},
		{
			name: 'Thompson Gyedu Kwarkye',
			url: 'https://economics.universityofgalway.ie/business-public-policy-law/school-of-law/research/researchclusters/technologyandrights/drthompsongyedukwarkye/'
		}
	],
	authorshipNote:
		'Frédérick Madore and Vincent Hiribarren, who convened the workshop, are listed first, followed by the remaining authors in alphabetical order. The order reflects the collaborative writing process and implies no hierarchy of contribution. We thank the two reviewers for their thoughtful comments on an earlier version of this text.',
	// Day is a placeholder until the series fixes one; only the month is public
	// ("Expected: September 2026" on the landing page).
	publicationDate: '2026-09-01',
	revisedDate: undefined,
	// Verbatim from the paper's own abstract — this is what the scholarly meta
	// tags and JSON-LD advertise, so it must match the published text.
	abstract:
		'African Studies scholars have been involved in Digital Humanities (DH) projects since the 2000s. Recent advances in artificial intelligence (AI), particularly large language models (LLMs), have expanded the possibilities for textual analysis and archival research, but implementation raises difficult questions: who controls access, whose data trains these systems without consent, whose languages remain underserved, and who bears the labour and environmental costs. This position paper is the collective work of a Volkswagen Foundation–funded scoping workshop in Hannover, Germany, in February 2026, with twenty-six scholars from sixteen countries. Across four working groups — language technologies; archives and visual heritage; infrastructure, governance, and access; and epistemologies, decoloniality, and ethics — one question recurred: for whom and for what purpose is this work undertaken? Ownership and sovereignty, access, sustainability, and standardisation emerged as transversal problems, which we set in dialogue with critiques of data colonialism and extractivism. We propose situated practices: licensing that conditions openness on return to source communities; digitisation agreements as living documents; ontologies built collaboratively; design grounded in access, governance, and sovereignty; and ethics treated as a process rather than a deliverable. Many of the problems we examine are common across DH and AI: consent, standardisation that erases variation, algorithmic bias, hidden labour, and the funding of innovation over maintenance. African contexts make them sharper and more visible, and Africa-based practice has produced concrete responses. We therefore argue that African epistemologies and decolonial critique belong at the centre of both fields, and that African scholars, practitioners, and institutions belong where these technologies are designed and governed.',
	// The paper's own keyword list, in its order.
	keywords: [
		'African epistemologies',
		'African languages',
		'data colonialism',
		'decolonial Digital Humanities (DH)',
		'digital archives',
		'digital preservation',
		'digital sovereignty',
		'large language models (LLMs)',
		'natural language processing (NLP)',
		'standardisation'
	],
	language: 'en',
	publisher: 'Leibniz-Zentrum Moderner Orient (ZMO)',
	journalTitle: 'ZMO Programmatic Texts',
	doi: undefined,
	// The series ISSN, not the paper's own identifier.
	issn: '2191-3242',
	// The series' terms, deliberately not the site's own CC BY-NC: this licence
	// permits commercial reuse and requires share-alike, which the site licence
	// does neither.
	licence: {
		name: 'CC BY-SA 4.0',
		url: 'https://creativecommons.org/licenses/by-sa/4.0/'
	},
	pdfPath: '/documents/position-paper.pdf',
	pdfAvailable: false
};
