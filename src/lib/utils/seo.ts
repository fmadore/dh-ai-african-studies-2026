export interface SeoMetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SeoLinkTag {
  rel: string;
  href: string;
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

export interface JsonLdEvent {
  '@context': 'https://schema.org';
  '@type': 'Event';
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    '@type': 'Place';
    name: string;
    address?: string;
  };
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

export type JsonLdSchema = JsonLdEvent | JsonLdWebSite;

const SITE_NAME = 'Digital Humanities and AI in African Studies 2026';
const SITE_DESCRIPTION =
  'Charting New Territory: Digital Humanities and AI in African Studies — A conference funded by Volkswagen Foundation.';
const SITE_BASE_URL = 'https://fmadore.github.io/dh-ai-african-studies-2026';
const DEFAULT_LOCALE = 'en_US';

type NormalisedSeoOptions = Required<Omit<CreateSeoMetaOptions, 'image'>> & Pick<CreateSeoMetaOptions, 'image'>;

const DEFAULT_OPTIONS: Required<Omit<CreateSeoMetaOptions, 'image'>> = {
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
    image: options.image
  } satisfies NormalisedSeoOptions;

  const title = merged.appendSiteName && merged.title !== SITE_NAME ? `${merged.title} | ${SITE_NAME}` : merged.title;
  const canonical = resolveCanonicalUrl(merged.path);
  const imageUrl = merged.image ? resolveAssetUrl(merged.image) : undefined;

  const meta: SeoMetaTag[] = [
    { name: 'description', content: merged.description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: merged.description },
    { property: 'og:url', content: canonical },
    { property: 'og:type', content: merged.type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: merged.locale },
    { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: merged.description },
    { name: 'robots', content: merged.robots }
  ];

  if (imageUrl) {
    meta.push({ property: 'og:image', content: imageUrl }, { name: 'twitter:image', content: imageUrl });
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
    name: options.name ?? SITE_NAME,
    description: options.description ?? SITE_DESCRIPTION,
    url: options.url ?? SITE_BASE_URL,
    eventStatus: options.eventStatus ?? 'EventScheduled',
    eventAttendanceMode: options.eventAttendanceMode ?? 'OfflineEventAttendanceMode'
  };

  if (options.startDate) {
    jsonLd.startDate = options.startDate;
  }

  if (options.endDate) {
    jsonLd.endDate = options.endDate;
  }

  if (options.locationName) {
    jsonLd.location = {
      '@type': 'Place',
      name: options.locationName,
      address: options.locationAddress
    };
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

/**
 * Serializes JSON-LD data for use in a script tag.
 * Returns a string that can be placed inside <script type="application/ld+json">.
 */
export function serializeJsonLd(data: JsonLdSchema): string {
  return JSON.stringify(data, null, 0);
}
