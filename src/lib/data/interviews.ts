/**
 * Participant video interviews recorded during the workshop.
 */

export interface Interview {
	participantName: string;
	affiliation: string;
	youtubeId: string;
	topic: string;
	description: string;
}

export const interviews: Interview[] = [
	{
		participantName: 'Emmanuel Ngue Um',
		affiliation: 'University of Yaoundé I',
		youtubeId: 'IpSY7i_bses',
		topic: 'AI, Digital Humanities, and African Indigenous Languages',
		description:
			"Linguist Emmanuel Ngue Um discusses how artificial intelligence and digital humanities can help preserve and teach indigenous languages. He presents his work building language technology models — speech recognition, synthesis, and machine translation — to create digital teaching resources for local languages. Emmanuel explains how AI is accelerating linguistic research: large language models can use transfer learning to support low-resource languages with as little as one hour of recorded data. He also reflects on what AI's ability to process and replicate speech reveals about the nature of human language and cognition."
	},
	{
		participantName: 'Duncan Money',
		affiliation: 'Zambia Congress of Trade Unions (ZCTU) project',
		youtubeId: 'wZNZSDVfO-I',
		topic: 'AI, Digitization, and Ownership of Archival Material',
		description:
			'Consulting historian and researcher Duncan Money discusses the practical challenges of digitisation work, which is labour-intensive and tedious yet requires careful attention to detail, and considers how AI could automate parts of the process. Drawing on his experience of digitising the Zambia Congress of Trade Unions archive, he reflects on the potential of AI to reduce the burden on project staff. He also raises critical questions about ownership. While agreements around physical and digital copies have been relatively straightforward to enforce, feeding archival material into large language models threatens to undermine established ownership arrangements. This creates unresolved challenges regarding how digitised material can be governed and used.'
	},
	{
		participantName: 'Karen Byera Ijumba',
		affiliation: 'Open Restitution Africa',
		youtubeId: 'uGettNm8W_s',
		topic: 'Digital Tools for Restitution Process Data in Africa',
		description:
			'Karen Byera Ijumba presents Open Restitution Africa, a project that addresses gaps in the data on the restitution process by tracking the return of cultural artefacts, human remains and spirit representations taken from Africa to Europe. She explains how digital tools can be used to collect, consolidate and transparently manage dynamic datasets across countries and knowledge holders. Karen highlights the creative use of low-fi digital tools across the region, where researchers adapt everyday technologies like phones, Excel, and WordPress to produce accessible outputs despite limited resources. She also reflects on how the risks of digital temporality have inspired a context-responsive approach to digital humanities — one that embraces what digital interventions can achieve within their lifespan.'
	},
	{
		participantName: 'Fallou Ngom',
		affiliation: 'Boston University',
		youtubeId: 'GXv8OQVLYk4',
		topic: 'Digital Preservation of African Ajami Manuscripts',
		description:
			'Anthropologist Fallou Ngom discusses his work preserving Ajami manuscripts — African languages written with adapted forms of the Arabic script — that have been overlooked for centuries due to colonial definitions of literacy that recognise only European languages. He describes how digital tools have enabled him to build the African Ajami Library, containing over 30,000 pages in 11 languages, and to digitise more than 50,000 pages of classical Arabic and Ajami texts from Senegal and Fouta Djallon spanning the 18th to the 21st century. He also reflects on the challenges of uneven internet access and limited local training, and explains how his projects address the digital gap through knowledge transfer workshops and equipment donations. These multilingual sources fundamentally challenge dominant narratives about African literacy and enrich the African library.'
	},
	{
		participantName: 'Menno van Zaanen',
		affiliation: 'South African Centre for Digital Language Resources',
		youtubeId: 'yYB4dGN6h-M',
		topic: "Building Digital Language Resources for South Africa's Official Languages",
		description:
			"Digital humanities professor Menno van Zaanen discusses the challenges of collecting digital language resources for South Africa's 12 official languages, including sign language. He describes how data scarcity necessitates an opportunistic approach involving the scraping of government websites, the digitisation of archives and the gathering of social media content, while also acknowledging the biases this introduces. This is because tools trained on government text perform poorly on literary or informal language. He raises critical questions about ownership and community consent, using sign language data collection as an example. Here, researchers must resist the impulse to act on behalf of communities without first understanding what they actually want. He reflects on the difficult trade-offs between comprehensive, structured data collection and the practical need to secure whatever resources are available before they disappear from the digital space."
	},
	{
		participantName: 'Albrecht Hofheinz',
		affiliation: 'University of Oslo',
		youtubeId: 'VE3r8xbumnY',
		topic: 'Leveraging OCR and AI to Explore Arabic Manuscript Collections',
		description:
			"Middle East studies and Arabic scholar Albrecht Hofheinz discusses how he combines Google's optical character recognition with large language models (LLMs) to process collections of Arabic handwritten manuscripts at scale. He explains that training handwritten text recognition on individual hands is not feasible for single-page documents, and that untrained OCR alone produces only 20 to 60 percent correct words. Yet by feeding these imperfect results into reasoning LLMs, he now obtains detailed automated summaries that help him identify which documents warrant closer human inspection. He reflects on the ethical dilemma of submitting manuscript images to commercial APIs and notes that while reasoning LLMs can sometimes catch contextual errors, human vetting remains essential."
	}
];
