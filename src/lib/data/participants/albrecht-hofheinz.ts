import type { Participant } from '$lib/types/participant';

export const albrechtHofheinz: Participant = {
	name: 'Albrecht Hofheinz',
	affiliation: 'University of Oslo',
	affiliationCoordinates: {
		latitude: 59.9139,
		longitude: 10.7522
	},
	country: 'Norway',
	role: 'Participant',
	website: 'https://www.hf.uio.no/ikos/english/people/aca/middle-east-studies/tenured/albrech/',
	bio: "Albrecht Hofheinz is Associate Professor of Arab Studies at the University of Oslo, with decades-long research and humanitarian experience in the Sudan and other African contexts. He has published on Sufism, Islamic reform movements and local history in the Sudan; Arabic manuscript cultures in Africa; and social media and sociocultural dynamics in the contemporary Arab world. Among larger cooperative projects, he co-edited Brill's \"Arabic Literature of Africa\" and led the digitisation and cataloguing unit of the \"Timbuktu Manuscripts Project\" (2000-2009). Combining traditional philological expertise with innovative digital methods, he recently turned to developing AI-powered approaches for analysing Arabic manuscripts from the Sudan, addressing both opportunities and challenges of applying these technologies to endangered African archives.",
	researchRegions: ['Sudan', 'Mali', 'Egypt', 'Morocco', 'Yemen'],
	thematicGroup: 'The Archive: Preservation, Community Custody & Visual Heritage',
	photoUrl: '/images/participants/albrecht-hofheinz.jpeg',
	questionsOfInterest: [
		'HTR (Handwritten Text Recognition) for Arabic: how to advance the technology?',
		"AI, copyright, corporate interests, and the digital divide: how to avoid a new 'colonial' order?",
		'Visual AI in particular is still heavily stereotypical/biased — how can this be overcome, not least in education settings?'
	]
};
