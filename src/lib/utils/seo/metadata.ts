import {
	DEFAULT_AUTHORS,
	DEFAULT_KEYWORDS,
	DEFAULT_OG_IMAGE,
	DEFAULT_OG_IMAGE_ALT,
	DEFAULT_OPTIONS,
	OG_IMAGE_HEIGHT,
	OG_IMAGE_WIDTH,
	SITE_NAME
} from './constants';
import type { CreateSeoMetaOptions, SeoMetaResult, SeoMetaTag } from './types';
import { normalisePath, resolveAssetUrl, resolveCanonicalUrl } from './url';

type NormalisedSeoOptions = Required<Omit<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>> &
	Pick<CreateSeoMetaOptions, 'image' | 'authors' | 'keywords'>;

/** Builds a canonical SEO meta payload for Svelte head blocks. */
export function createSeoMeta(options: CreateSeoMetaOptions = {}): SeoMetaResult {
	const merged = {
		...DEFAULT_OPTIONS,
		...options,
		title: options.title?.trim() || DEFAULT_OPTIONS.title,
		description: options.description?.trim() || DEFAULT_OPTIONS.description,
		path: normalisePath(options.path ?? DEFAULT_OPTIONS.path),
		image: options.image ?? DEFAULT_OG_IMAGE,
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

		if (merged.image === DEFAULT_OG_IMAGE) {
			meta.push(
				{ key: 'og:image:width', property: 'og:image:width', content: OG_IMAGE_WIDTH },
				{ key: 'og:image:height', property: 'og:image:height', content: OG_IMAGE_HEIGHT },
				{ key: 'og:image:alt', property: 'og:image:alt', content: DEFAULT_OG_IMAGE_ALT },
				{ key: 'twitter:image:alt', name: 'twitter:image:alt', content: DEFAULT_OG_IMAGE_ALT }
			);
		}
	}

	return {
		title,
		description: merged.description,
		canonical,
		meta,
		link: [{ rel: 'canonical', href: canonical }]
	};
}
