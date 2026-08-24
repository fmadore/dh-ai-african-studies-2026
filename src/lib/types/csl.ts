/**
 * Pragmatic CSL-JSON typings for the fields this site actually uses.
 * The full CSL spec has many more fields; extend as needed.
 */

export interface CslName {
	family?: string;
	given?: string;
	literal?: string;
}

export interface CslDate {
	'date-parts'?: [number, number?, number?][];
	raw?: string;
	literal?: string;
}

export interface CslReference {
	id: string;
	type: string;
	title?: string;
	abstract?: string;
	author?: CslName[];
	editor?: CslName[];
	issued?: CslDate;
	'container-title'?: string;
	publisher?: string;
	'publisher-place'?: string;
	volume?: string | number;
	issue?: string | number;
	page?: string;
	edition?: string | number;
	URL?: string;
	DOI?: string;
	ISBN?: string;
	ISSN?: string;
	language?: string;
	genre?: string;
	source?: string;
	note?: string;
	accessed?: CslDate;
	/** Custom field added by scripts/fetch_references.py from Zotero tags */
	tags?: string[];
}

/**
 * The lean per-record shape the references list renders from. Everything the
 * collapsed card, the facets, search, and sorting touch — and nothing else.
 * The complete records stay in the prerendered /references/data.json and are
 * fetched only for abstract expansion and Zotero export.
 */
export type ReferenceListItem = Pick<
	CslReference,
	| 'id'
	| 'type'
	| 'title'
	| 'author'
	| 'editor'
	| 'issued'
	| 'container-title'
	| 'DOI'
	| 'URL'
	| 'language'
	| 'tags'
> & {
	/** Opening of the abstract — enough to fill the collapsed three-line clamp. */
	abstractPreview?: string;
	/** True when the preview IS the whole abstract, so expanding needs no fetch. */
	abstractIsComplete: boolean;
};
