import { workshopInfo } from '$lib/data/workshop-info';

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

// JSON-LD Types
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
		| 'OfflineEventAttendanceMode'
		| 'OnlineEventAttendanceMode'
		| 'MixedEventAttendanceMode';
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

const SITE_NAME = 'Digital Humanities and AI in African Studies 2026';
const SITE_DESCRIPTION =
	'Charting New Territory: Digital Humanities and AI in African Studies — A conference funded by Volkswagen Foundation.';
const SITE_BASE_URL = 'https://fmadore.github.io/dh-ai-african-studies-2026';
const DEFAULT_LOCALE = 'en_US';

// Default authors for all pages
const DEFAULT_AUTHORS: Author[] = [
	{ name: 'Frédérick Madore', url: 'https://www.frederickmadore.com/' },
	{ name: 'Vincent Hiribarren', url: 'https://www.kcl.ac.uk/people/vincent-hiribarren' }
];

// Default keywords for the site
const DEFAULT_KEYWORDS = [
	'Digital Humanities',
	'Artificial Intelligence',
	'African Studies',
	'Workshop',
	'Conference',
	'Hanover',
	'Germany',
	'Volkswagen Foundation'
];

type NormalisedSeoOptions = Required<Omit<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>> &
	Pick<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>;

const DEFAULT_OPTIONS: Required<Omit<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>> = {
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	path: '/',
	type: 'website',
	robots: 'index,follow',
	appendSiteName: true,
	locale: DEFAULT_LOCALE
};

/**
 * Builds a canonical SEO meta payload that can be consumed from Svelte head blocks.
 */
export function createSeoMeta(options: CreateSeoMetaOptions = {}): SeoMetaResult {
	const merged = {
		...DEFAULT_OPTIONS,
		...options,
		title: options.title?.trim() || DEFAULT_OPTIONS.title,
		description: options.description?.trim() || DEFAULT_OPTIONS.description,
		path: normalisePath(options.path ?? DEFAULT_OPTIONS.path),
		image: options.image,
		authors: options.authors ?? DEFAULT_AUTHORS,
		keywords: options.keywords ?? DEFAULT_KEYWORDS
	} satisfies NormalisedSeoOptions;

	const title =
		merged.appendSiteName && merged.title !== SITE_NAME
			? `${merged.title} | ${SITE_NAME}`
			: merged.title;
	const canonical = resolveCanonicalUrl(merged.path);
	const imageUrl = merged.image ? resolveAssetUrl(merged.image) : undefined;
	const authorNames = merged.authors?.map((a) => a.name).join(', ') ?? '';
	const keywordsString = merged.keywords?.join(', ') ?? '';

	const meta: SeoMetaTag[] = [
		{ key: 'description', name: 'description', content: merged.description },
		{ key: 'author', name: 'author', content: authorNames },
		{ key: 'keywords', name: 'keywords', content: keywordsString },
		{ key: 'og:title', property: 'og:title', content: title },
		{ key: 'og:description', property: 'og:description', content: merged.description },
		{ key: 'og:url', property: 'og:url', content: canonical },
		{ key: 'og:type', property: 'og:type', content: merged.type },
		{ key: 'og:site_name', property: 'og:site_name', content: SITE_NAME },
		{ key: 'og:locale', property: 'og:locale', content: merged.locale },
		{
			key: 'twitter:card',
			name: 'twitter:card',
			content: imageUrl ? 'summary_large_image' : 'summary'
		},
		{ key: 'twitter:title', name: 'twitter:title', content: title },
		{ key: 'twitter:description', name: 'twitter:description', content: merged.description },
		{ key: 'robots', name: 'robots', content: merged.robots }
	];

	// Add article:author tags for each author (used by Facebook/OpenGraph).
	// article:* properties are only valid when og:type is 'article'.
	// Use unique keys to avoid Svelte duplicate key warnings
	if (merged.type === 'article' && merged.authors && merged.authors.length > 0) {
		merged.authors.forEach((author, index) => {
			if (author.url) {
				meta.push({
					key: `article:author:${index}`,
					property: 'article:author',
					content: author.url
				});
			}
		});
	}

	if (imageUrl) {
		meta.push(
			{ key: 'og:image', property: 'og:image', content: imageUrl },
			{ key: 'twitter:image', name: 'twitter:image', content: imageUrl }
		);
	}

	return {
		title,
		description: merged.description,
		canonical,
		meta,
		link: [{ rel: 'canonical', href: canonical }]
	};
}

function normalisePath(path: string): string {
	if (!path.length || path === '/') {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

function resolveCanonicalUrl(path: string): string {
	// The site is built with trailingSlash: 'never' (adapter-static emits
	// `about.html`), so on GitHub Pages only the slash-less URL exists.
	// Canonicals must match or they point at 404s.
	if (path === '/') {
		return ensureTrailingSlash(SITE_BASE_URL);
	}
	return `${SITE_BASE_URL}${path.replace(/\/$/, '')}`;
}

function resolveAssetUrl(asset: string): string {
	if (/^https?:\/\//i.test(asset)) {
		return asset;
	}

	return new URL(asset.replace(/^\//, ''), ensureTrailingSlash(SITE_BASE_URL)).toString();
}

function ensureTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}

// ============================================
// JSON-LD Structured Data Helpers
// ============================================

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

/**
 * Creates JSON-LD structured data for an Event.
 * Use this for the conference pages to improve search engine visibility.
 */
export function createEventJsonLd(options: CreateEventJsonLdOptions = {}): JsonLdEvent {
	const jsonLd: JsonLdEvent = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: options.name ?? 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: options.description ?? SITE_DESCRIPTION,
		url: options.url ?? SITE_BASE_URL,
		eventStatus: options.eventStatus ?? 'EventScheduled',
		eventAttendanceMode: options.eventAttendanceMode ?? 'OfflineEventAttendanceMode'
	};

	// Add dates with time component for better Google compatibility
	if (options.startDate) {
		// If date doesn't include time, add a default time (09:00)
		jsonLd.startDate = options.startDate.includes('T')
			? options.startDate
			: `${options.startDate}T09:00:00+01:00`;
	}

	if (options.endDate) {
		// If date doesn't include time, add a default time (17:00)
		jsonLd.endDate = options.endDate.includes('T')
			? options.endDate
			: `${options.endDate}T17:00:00+01:00`;
	}

	if (options.locationName) {
		const location: JsonLdPlace = {
			'@type': 'Place',
			name: options.locationName
		};

		// Use structured PostalAddress if city/country provided
		if (options.locationCity || options.locationCountry) {
			location.address = {
				'@type': 'PostalAddress',
				streetAddress: options.locationAddress,
				addressLocality: options.locationCity,
				addressCountry: options.locationCountry,
				postalCode: options.locationPostalCode
			};
		} else if (options.locationAddress) {
			location.address = options.locationAddress;
		}

		jsonLd.location = location;
	}

	if (options.organizerName) {
		jsonLd.organizer = {
			'@type': 'Organization',
			name: options.organizerName,
			url: options.organizerUrl
		};
	}

	if (options.funderName) {
		jsonLd.funder = {
			'@type': 'Organization',
			name: options.funderName,
			url: options.funderUrl
		};
	}

	if (options.image) {
		jsonLd.image = resolveAssetUrl(options.image);
	}

	return jsonLd;
}

/**
 * Creates the Event JSON-LD for THE workshop with all shared fields baked in.
 * Only `description` and `url` vary per page. Use this instead of repeating
 * the full createEventJsonLd call on every route — and only on pages that are
 * genuinely about the event (home, about, schedule); Google treats Event
 * markup on ancillary pages (photos, references, …) as spammy.
 */
export function createWorkshopEventJsonLd(options: {
	description: string;
	url: string;
}): JsonLdEvent {
	return createEventJsonLd({
		name: 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: options.description,
		startDate: workshopInfo.dates.startISO,
		endDate: workshopInfo.dates.endISO,
		locationName: workshopInfo.location.venue,
		locationAddress: workshopInfo.location.venue,
		locationCity: workshopInfo.location.city,
		locationCountry: workshopInfo.location.country,
		organizerName: workshopInfo.organizers.full,
		funderName: workshopInfo.funder.name,
		funderUrl: workshopInfo.funder.url,
		url: options.url
	});
}

/**
 * Creates JSON-LD structured data for a WebSite.
 * Use this in the root layout for site-wide SEO.
 */
export function createWebSiteJsonLd(
	options: {
		name?: string;
		description?: string;
		publisherName?: string;
		publisherUrl?: string;
	} = {}
): JsonLdWebSite {
	const jsonLd: JsonLdWebSite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: options.name ?? SITE_NAME,
		url: SITE_BASE_URL,
		description: options.description ?? SITE_DESCRIPTION
	};

	if (options.publisherName) {
		jsonLd.publisher = {
			'@type': 'Organization',
			name: options.publisherName,
			url: options.publisherUrl
		};
	}

	return jsonLd;
}

export interface CreateWebPageJsonLdOptions {
	name: string;
	description?: string;
	url: string;
	authors?: Author[];
	dateModified?: string;
}

/**
 * Creates JSON-LD structured data for a WebPage with author information.
 * Use this for individual pages to enhance their structured data.
 */
export function createWebPageJsonLd(options: CreateWebPageJsonLdOptions): JsonLdWebPage {
	const authors = options.authors ?? DEFAULT_AUTHORS;

	const jsonLd: JsonLdWebPage = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: options.name,
		url: options.url,
		description: options.description ?? SITE_DESCRIPTION,
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: SITE_BASE_URL
		}
	};

	// Add author(s)
	if (authors.length === 1) {
		jsonLd.author = {
			'@type': 'Person',
			name: authors[0].name,
			url: authors[0].url
		};
	} else if (authors.length > 1) {
		jsonLd.author = authors.map((a) => ({
			'@type': 'Person' as const,
			name: a.name,
			url: a.url
		}));
	}

	if (options.dateModified) {
		jsonLd.dateModified = options.dateModified;
	}

	return jsonLd;
}

// ============================================
// Scholarly Article Meta (Google Scholar + Dublin Core + OG article:*)
// ============================================

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

/**
 * Emit Google Scholar (`citation_*`), Dublin Core (`DC.*`), and OpenGraph
 * (`article:*`) meta tags for a scholarly article. Concatenate the result
 * with `createSeoMeta(...).meta` before rendering in `<svelte:head>`.
 */
export function createScholarlyMeta(opts: ScholarlyMetaOptions): SeoMetaTag[] {
	const tags: SeoMetaTag[] = [];
	const scholarDate = opts.publicationDate.replace(/-/g, '/');

	// --- Google Scholar ---
	tags.push({ key: 'citation_title', name: 'citation_title', content: opts.title });
	opts.authors.forEach((a, i) =>
		tags.push({
			key: `citation_author_${i}`,
			name: 'citation_author',
			content: a.name
		})
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
	opts.keywords.forEach((k, i) =>
		tags.push({ key: `citation_keywords_${i}`, name: 'citation_keywords', content: k })
	);

	// --- Dublin Core ---
	tags.push({ key: 'DC.title', name: 'DC.title', content: opts.title });
	opts.authors.forEach((a, i) =>
		tags.push({ key: `DC.creator_${i}`, name: 'DC.creator', content: a.name })
	);
	tags.push({ key: 'DC.date', name: 'DC.date', content: opts.publicationDate });
	tags.push({ key: 'DC.language', name: 'DC.language', content: opts.language });
	tags.push({ key: 'DC.publisher', name: 'DC.publisher', content: opts.publisher });
	tags.push({ key: 'DC.description', name: 'DC.description', content: opts.abstract });
	tags.push({ key: 'DC.type', name: 'DC.type', content: 'Text' });
	tags.push({ key: 'DC.format', name: 'DC.format', content: 'text/html' });
	// The licence URI, not its short name: `dc:rights` is machine-read.
	if (opts.licence) {
		tags.push({ key: 'DC.rights', name: 'DC.rights', content: opts.licence.url });
	}
	if (opts.doi) {
		tags.push({ key: 'DC.identifier', name: 'DC.identifier', content: `doi:${opts.doi}` });
	} else {
		tags.push({ key: 'DC.identifier', name: 'DC.identifier', content: opts.abstractUrl });
	}
	opts.keywords.forEach((k, i) =>
		tags.push({ key: `DC.subject_${i}`, name: 'DC.subject', content: k })
	);

	// --- OpenGraph article:* ---
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
	opts.keywords.forEach((k, i) =>
		tags.push({ key: `article:tag_${i}`, property: 'article:tag', content: k })
	);

	return tags;
}

/**
 * JSON-LD `ScholarlyArticle` structured data for Google Scholar / Rich Results.
 */
export function createScholarlyArticleJsonLd(opts: ScholarlyMetaOptions): JsonLdScholarlyArticle {
	const authorNodes: JsonLdPerson[] = opts.authors.map((a) => ({
		'@type': 'Person' as const,
		name: a.name,
		url: a.url
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

/**
 * Returns a complete JSON-LD script tag as an HTML string.
 * Use with {@html jsonLdScript(data)} to avoid ESLint parsing issues
 * with <script> tags appearing in Svelte templates.
 * `<` is escaped so data can never terminate the script element.
 */
export function jsonLdScript(data: JsonLdSchema): string {
	const json = JSON.stringify(data, null, 0).replace(/</g, '\\u003C');
	return '<script type="application/ld+json">' + json + '</script>';
}
