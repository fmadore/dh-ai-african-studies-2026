// Stable public entry point: import sites continue to use `#lib/utils/seo`.
export {
	createEventJsonLd,
	createImageGalleryJsonLd,
	createVideoObjectJsonLd,
	createWebPageJsonLd,
	createWebSiteJsonLd,
	createWorkshopEventJsonLd,
	jsonLdScript
} from './seo/json-ld';
export { createSeoMeta } from './seo/metadata';
export { createScholarlyArticleJsonLd, createScholarlyMeta } from './seo/scholarly';
export type {
	Author,
	CreateEventJsonLdOptions,
	CreateSeoMetaOptions,
	CreateVideoObjectJsonLdOptions,
	CreateWebPageJsonLdOptions,
	JsonLdEvent,
	JsonLdOrganization,
	JsonLdPeriodical,
	JsonLdPerson,
	JsonLdPlace,
	JsonLdPostalAddress,
	JsonLdSchema,
	JsonLdScholarlyArticle,
	JsonLdVideoObject,
	JsonLdWebPage,
	JsonLdWebSite,
	ScholarlyMetaOptions,
	SeoLinkTag,
	SeoMetaResult,
	SeoMetaTag,
	WebPageType
} from './seo/types';
