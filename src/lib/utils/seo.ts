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
}

export interface SeoMetaResult {
  title: string;
  description: string;
  canonical: string;
  meta: SeoMetaTag[];
  link: SeoLinkTag[];
}

const SITE_NAME = 'Digital Humanities and AI in African Studies 2026';
const SITE_DESCRIPTION =
  'Charting New Territory: Digital Humanities and AI in African Studies — A conference funded by Volkswagen Foundation.';
const SITE_BASE_URL = 'https://fmadore.github.io/dh-ai-african-studies-2026';

type NormalisedSeoOptions = Required<Omit<CreateSeoMetaOptions, 'image'>> & Pick<CreateSeoMetaOptions, 'image'>;

const DEFAULT_OPTIONS: Required<Omit<CreateSeoMetaOptions, 'image'>> = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: '/',
  type: 'website',
  robots: 'index,follow',
  appendSiteName: true
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
