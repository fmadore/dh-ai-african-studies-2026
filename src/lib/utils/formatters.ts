/**
 * Shared formatting utilities for reference data
 */

const typeMap: Record<string, string> = {
	'article-magazine': 'Magazine Article',
	'article-newspaper': 'Newspaper Article',
	'article-journal': 'Journal Article',
	'entry-encyclopedia': 'Encyclopedia Entry',
	motion_picture: 'Video',
	'paper-conference': 'Conference Paper',
	'post-weblog': 'Blog Post',
	song: 'Podcast',
	speech: 'Presentation',
	article: 'Preprint'
};

export function formatType(type: string): string {
	return typeMap[type] || type.replace(/-|_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const languageMap: Record<string, string> = {
	en: 'English',
	fr: 'French',
	es: 'Spanish',
	pt: 'Portuguese',
	ar: 'Arabic',
	sw: 'Swahili',
	de: 'German'
};

export function formatLanguage(langCode: string): string {
	return languageMap[langCode.toLowerCase()] || langCode.toUpperCase();
}
