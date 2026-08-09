import type {
	JsonLdOrganization,
	JsonLdPerson,
	JsonLdScholarlyArticle,
	ScholarlyMetaOptions,
	SeoMetaTag
} from './types';

/** Emits Google Scholar, Dublin Core, and OpenGraph article meta tags. */
export function createScholarlyMeta(opts: ScholarlyMetaOptions): SeoMetaTag[] {
	const tags: SeoMetaTag[] = [];
	const scholarDate = opts.publicationDate.replace(/-/g, '/');

	tags.push({ key: 'citation_title', name: 'citation_title', content: opts.title });
	opts.authors.forEach((author, index) =>
		tags.push({ key: `citation_author_${index}`, name: 'citation_author', content: author.name })
	);
	tags.push({
		key: 'citation_publication_date',
		name: 'citation_publication_date',
		content: scholarDate
	});
	if (opts.journalTitle) {
		tags.push({
			key: 'citation_journal_title',
			name: 'citation_journal_title',
			content: opts.journalTitle
		});
	}
	tags.push({ key: 'citation_publisher', name: 'citation_publisher', content: opts.publisher });
	tags.push({
		key: 'citation_abstract_html_url',
		name: 'citation_abstract_html_url',
		content: opts.abstractUrl
	});
	if (opts.pdfUrl) {
		tags.push({ key: 'citation_pdf_url', name: 'citation_pdf_url', content: opts.pdfUrl });
	}
	if (opts.doi) tags.push({ key: 'citation_doi', name: 'citation_doi', content: opts.doi });
	if (opts.issn) tags.push({ key: 'citation_issn', name: 'citation_issn', content: opts.issn });
	tags.push({ key: 'citation_language', name: 'citation_language', content: opts.language });
	opts.keywords.forEach((keyword, index) =>
		tags.push({ key: `citation_keywords_${index}`, name: 'citation_keywords', content: keyword })
	);

	tags.push({ key: 'DC.title', name: 'DC.title', content: opts.title });
	opts.authors.forEach((author, index) =>
		tags.push({ key: `DC.creator_${index}`, name: 'DC.creator', content: author.name })
	);
	tags.push({ key: 'DC.date', name: 'DC.date', content: opts.publicationDate });
	tags.push({ key: 'DC.language', name: 'DC.language', content: opts.language });
	tags.push({ key: 'DC.publisher', name: 'DC.publisher', content: opts.publisher });
	tags.push({ key: 'DC.description', name: 'DC.description', content: opts.abstract });
	tags.push({ key: 'DC.type', name: 'DC.type', content: 'Text' });
	tags.push({ key: 'DC.format', name: 'DC.format', content: 'text/html' });
	if (opts.licence) {
		tags.push({ key: 'DC.rights', name: 'DC.rights', content: opts.licence.url });
	}
	if (opts.doi) {
		tags.push({ key: 'DC.identifier', name: 'DC.identifier', content: `doi:${opts.doi}` });
	} else {
		tags.push({ key: 'DC.identifier', name: 'DC.identifier', content: opts.abstractUrl });
	}
	opts.keywords.forEach((keyword, index) =>
		tags.push({ key: `DC.subject_${index}`, name: 'DC.subject', content: keyword })
	);

	tags.push({
		key: 'article:published_time',
		property: 'article:published_time',
		content: opts.publicationDate
	});
	if (opts.revisedDate) {
		tags.push({
			key: 'article:modified_time',
			property: 'article:modified_time',
			content: opts.revisedDate
		});
	}
	tags.push({ key: 'article:section', property: 'article:section', content: 'Research' });
	opts.keywords.forEach((keyword, index) =>
		tags.push({ key: `article:tag_${index}`, property: 'article:tag', content: keyword })
	);

	return tags;
}

/** JSON-LD ScholarlyArticle data for Google Scholar and rich results. */
export function createScholarlyArticleJsonLd(opts: ScholarlyMetaOptions): JsonLdScholarlyArticle {
	const authorNodes: JsonLdPerson[] = opts.authors.map((author) => ({
		'@type': 'Person' as const,
		name: author.name,
		url: author.url
	}));

	const publisherOrg: JsonLdOrganization = {
		'@type': 'Organization',
		name: opts.publisher
	};

	const jsonLd: JsonLdScholarlyArticle = {
		'@context': 'https://schema.org',
		'@type': 'ScholarlyArticle',
		headline: opts.title,
		name: opts.title,
		author: authorNodes.length === 1 ? authorNodes[0] : authorNodes,
		datePublished: opts.publicationDate,
		abstract: opts.abstract,
		inLanguage: opts.language,
		keywords: opts.keywords.join(', '),
		publisher: publisherOrg,
		isAccessibleForFree: true,
		url: opts.abstractUrl,
		mainEntityOfPage: opts.abstractUrl
	};

	if (opts.revisedDate) jsonLd.dateModified = opts.revisedDate;
	if (opts.licence) jsonLd.license = opts.licence.url;

	if (opts.journalTitle) {
		jsonLd.isPartOf = {
			'@type': 'Periodical',
			name: opts.journalTitle,
			publisher: publisherOrg
		};
		if (opts.issn) jsonLd.isPartOf.issn = opts.issn;
	}

	if (opts.doi) jsonLd.identifier = `doi:${opts.doi}`;

	return jsonLd;
}
