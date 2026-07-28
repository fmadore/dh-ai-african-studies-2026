import type { Author } from '$lib/utils/seo';
import type { CslReference } from '$lib/types/csl';

export type { CslReference };

export interface TocItem {
	level: 2 | 3;
	id: string;
	text: string;
}

export interface ResolvedReference {
	/** Zotero/CSL id, e.g. "3005271/NGAA6PM6" */
	refId: string;
	/** URL-safe slug (slashes replaced with `--`) */
	slug: string;
	/** Short author-date form, e.g. "Madore 2023, 45" */
	short: string;
	/** Full Chicago citation */
	full: string;
	/** Raw CSL entry, for downstream use if needed */
	csl: CslReference;
}

export interface ProcessedPaper {
	/** Server-rendered HTML string. */
	html: string;
	/** Headings (H2/H3) flattened for TOC rendering. */
	toc: TocItem[];
	/** Map of ref slug → resolved reference, for popover rendering. */
	resolvedRefs: Record<string, ResolvedReference>;
}

export interface PositionPaperMeta {
	title: string;
	subtitle?: string;
	authors: Author[];
	/** ISO 8601 date, e.g. '2026-04-15'. */
	publicationDate: string;
	/** ISO 8601 date of last revision, if any. */
	revisedDate?: string;
	abstract: string;
	keywords: string[];
	/** BCP 47 language tag, e.g. 'en'. */
	language: string;
	/** Publisher name — the journal/series. */
	publisher: string;
	/** Parent periodical / series title. */
	journalTitle: string;
	doi?: string;
	issn?: string;
	/** Static asset path to the PDF. */
	pdfPath: string;
	/** Flip to `true` once the PDF is uploaded. */
	pdfAvailable: boolean;
}

export type ReaderFontFamily = 'sans' | 'serif' | 'accessible';
export type ReaderFontSize = 90 | 100 | 115 | 130;

export interface ReaderPreferencesState {
	fontFamily: ReaderFontFamily;
	fontSize: ReaderFontSize;
}
