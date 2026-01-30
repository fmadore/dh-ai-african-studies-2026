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
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
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

export type JsonLdSchema = JsonLdEvent | JsonLdWebSite | JsonLdWebPage;

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

type NormalisedSeoOptions = Required<Omit<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>> & Pick<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>;

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

  const title = merged.appendSiteName && merged.title !== SITE_NAME ? `${merged.title} | ${SITE_NAME}` : merged.title;
  const canonical = resolveCanonicalUrl(merged.path);
  const imageUrl = merged.image ? resolveAssetUrl(merged.image) : undefined;
  const authorNames = merged.authors?.map(a => a.name).join(', ') ?? '';
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
    { key: 'twitter:card', name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
    { key: 'twitter:title', name: 'twitter:title', content: title },
    { key: 'twitter:description', name: 'twitter:description', content: merged.description },
    { key: 'robots', name: 'robots', content: merged.robots }
  ];

  // Add article:author tags for each author (used by Facebook/OpenGraph)
  // Use unique keys to avoid Svelte duplicate key warnings
  if (merged.authors && merged.authors.length > 0) {
    merged.authors.forEach((author, index) => {
      if (author.url) {
        meta.push({ key: `article:author:${index}`, property: 'article:author', content: author.url });
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
  try {
    const url = new URL(path, ensureTrailingSlash(SITE_BASE_URL));
    return ensureTrailingSlash(url.toString());
  } catch {
    return ensureTrailingSlash(`${ensureTrailingSlash(SITE_BASE_URL)}${path.replace(/^\//, '')}`);
  }
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
    jsonLd.startDate = options.startDate.includes('T') ? options.startDate : `${options.startDate}T09:00:00+01:00`;
  }

  if (options.endDate) {
    // If date doesn't include time, add a default time (17:00)
    jsonLd.endDate = options.endDate.includes('T') ? options.endDate : `${options.endDate}T17:00:00+01:00`;
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
 * Creates JSON-LD structured data for a WebSite.
 * Use this in the root layout for site-wide SEO.
 */
export function createWebSiteJsonLd(options: {
  name?: string;
  description?: string;
  publisherName?: string;
  publisherUrl?: string;
} = {}): JsonLdWebSite {
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
    jsonLd.author = authors.map(a => ({
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

/**
 * Serializes JSON-LD data for use in a script tag.
 * Returns a string that can be placed inside <script type="application/ld+json">.
 */
export function serializeJsonLd(data: JsonLdSchema): string {
  return JSON.stringify(data, null, 0);
}
