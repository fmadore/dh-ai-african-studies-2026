export interface SeoMetaTag {
	name?: string;
	property?: string;
	content: string;
	/** Unique key for Svelte #each loops when property/name may be duplicated */
	key?: string;
}

export interface SeoLinkTag {
	rel: string;
	href: string;
}

export interface Author {
	name: string;
	url?: string;
	/**
	 * Explicit name parts for citation formatting. Set them only where the
	 * default rule — last whitespace-delimited word is the family name — gets
	 * it wrong, e.g. "Menno van Zaanen" or "Emmanuel Ngue Um".
	 */
	family?: string;
	given?: string;
}

export interface CreateSeoMetaOptions {
	title?: string;
	description?: string;
	path?: string;
	image?: string;
	type?: 'website' | 'article';
	robots?: string;
	appendSiteName?: boolean;
	locale?: string;
	authors?: Author[];
	keywords?: string[];
}

export interface SeoMetaResult {
	title: string;
	description: string;
	canonical: string;
	meta: SeoMetaTag[];
	link: SeoLinkTag[];
}

export interface JsonLdOrganization {
	'@type': 'Organization';
	name: string;
	url?: string;
	logo?: string;
}

export interface JsonLdPostalAddress {
	'@type': 'PostalAddress';
	streetAddress?: string;
	addressLocality?: string;
	addressCountry?: string;
	postalCode?: string;
}

export interface JsonLdPlace {
	'@type': 'Place';
	name: string;
	address?: JsonLdPostalAddress | string;
}

export interface JsonLdEvent {
	'@context': 'https://schema.org';
	'@type': 'Event';
	name: string;
	description?: string;
	startDate?: string;
	endDate?: string;
	location?: JsonLdPlace;
	organizer?: JsonLdOrganization;
	funder?: JsonLdOrganization;
	image?: string;
	url?: string;
	eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
	eventAttendanceMode?:
		'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

export interface JsonLdWebSite {
	'@context': 'https://schema.org';
	'@type': 'WebSite';
	name: string;
	url: string;
	description?: string;
	publisher?: JsonLdOrganization;
}

export interface JsonLdPerson {
	'@type': 'Person';
	name: string;
	url?: string;
}

export interface JsonLdWebPage {
	'@context': 'https://schema.org';
	'@type': 'WebPage';
	name: string;
	url: string;
	description?: string;
	author?: JsonLdPerson | JsonLdPerson[];
	isPartOf?: {
		'@type': 'WebSite';
		name: string;
		url: string;
	};
	dateModified?: string;
}

export interface JsonLdPeriodical {
	'@type': 'Periodical';
	name: string;
	issn?: string;
	publisher?: JsonLdOrganization;
}

export interface JsonLdScholarlyArticle {
	'@context': 'https://schema.org';
	'@type': 'ScholarlyArticle';
	headline: string;
	name: string;
	author: JsonLdPerson | JsonLdPerson[];
	datePublished: string;
	dateModified?: string;
	abstract?: string;
	inLanguage?: string;
	keywords?: string;
	publisher?: JsonLdOrganization;
	isPartOf?: JsonLdPeriodical;
	isAccessibleForFree?: boolean;
	license?: string;
	mainEntityOfPage?: string;
	url?: string;
	identifier?: string;
}

export type JsonLdSchema = JsonLdEvent | JsonLdWebSite | JsonLdWebPage | JsonLdScholarlyArticle;

export interface CreateEventJsonLdOptions {
	name?: string;
	description?: string;
	startDate?: string;
	endDate?: string;
	locationName?: string;
	locationAddress?: string;
	locationCity?: string;
	locationCountry?: string;
	locationPostalCode?: string;
	image?: string;
	url?: string;
	organizerName?: string;
	organizerUrl?: string;
	funderName?: string;
	funderUrl?: string;
	eventStatus?: JsonLdEvent['eventStatus'];
	eventAttendanceMode?: JsonLdEvent['eventAttendanceMode'];
}

export interface CreateWebPageJsonLdOptions {
	name: string;
	description?: string;
	url: string;
	authors?: Author[];
	dateModified?: string;
}

export interface ScholarlyMetaOptions {
	title: string;
	authors: Author[];
	/** ISO 8601 'YYYY-MM-DD' — required for Google Scholar. */
	publicationDate: string;
	/** ISO 8601 'YYYY-MM-DD'. */
	revisedDate?: string;
	abstract: string;
	keywords: string[];
	/** BCP 47 tag, e.g. 'en'. */
	language: string;
	publisher: string;
	/** Parent periodical / series title. Mapped to `citation_journal_title`. */
	journalTitle?: string;
	/** Absolute URL of the HTML landing page (what Google Scholar indexes). */
	abstractUrl: string;
	/** Absolute URL of the PDF, when available. */
	pdfUrl?: string;
	doi?: string;
	issn?: string;
	/** Reuse terms, emitted as `DC.rights` and schema.org `license`. */
	licence?: { name: string; url: string };
}
