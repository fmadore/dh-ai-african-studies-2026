/**
 * Shared formatting utilities for reference data and dates
 */

/**
 * "9 September 2026" from an ISO calendar date. Pinned to UTC: `new Date()`
 * reads a bare date as UTC midnight, so formatting it in the local zone would
 * print the previous day on any machine west of Greenwich.
 */
export function formatLongDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

const typeMap: Record<string, string> = {
	'article-magazine': 'Magazine Article',
	'article-newspaper': 'Newspaper Article',
	'article-journal': 'Journal Article',
	'entry-encyclopedia': 'Encyclopedia Entry',
	motion_picture: 'Video',
	'paper-conference': 'Conference Paper',
	'post-weblog': 'Blog Post',
	broadcast: 'Podcast',
	song: 'Audio Recording',
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
