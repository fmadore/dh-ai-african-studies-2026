// Stable public entry point: import sites continue to use `$lib/utils/seo`.
export {
	createEventJsonLd,
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
	CreateWebPageJsonLdOptions,
	JsonLdEvent,
	JsonLdOrganization,
	JsonLdPeriodical,
	JsonLdPerson,
	JsonLdPlace,
	JsonLdPostalAddress,
	JsonLdSchema,
	JsonLdScholarlyArticle,
	JsonLdWebPage,
	JsonLdWebSite,
	ScholarlyMetaOptions,
	SeoLinkTag,
	SeoMetaResult,
	SeoMetaTag
} from './seo/types';
