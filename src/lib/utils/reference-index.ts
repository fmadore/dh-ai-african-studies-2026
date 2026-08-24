/**
 * Derives the lean list index from the full CSL records at build time.
 * Abstracts are half of references.json; the collapsed card only ever shows
 * three clamped lines of one, so the index carries a preview and the full
 * text stays in the prerendered /references/data.json.
 */

import type { CslReference, ReferenceListItem } from '$lib/types/csl';

/* Three lines at the card's 68ch measure show ~210 characters; 300 keeps the
 * clamp full (and short abstracts intact) without shipping the other half of
 * the record. */
const PREVIEW_LENGTH = 300;

export function toReferenceListItem(ref: CslReference): ReferenceListItem {
	const abstract = ref.abstract?.trim();
	let abstractPreview: string | undefined;
	let abstractIsComplete = true;

	if (abstract) {
		if (abstract.length <= PREVIEW_LENGTH) {
			abstractPreview = abstract;
		} else {
			const cut = abstract.slice(0, PREVIEW_LENGTH);
			const lastSpace = cut.lastIndexOf(' ');
			abstractPreview = `${cut.slice(0, lastSpace > 0 ? lastSpace : PREVIEW_LENGTH).trimEnd()}…`;
			abstractIsComplete = false;
		}
	}

	return {
		id: ref.id,
		type: ref.type,
		title: ref.title,
		author: ref.author,
		editor: ref.editor,
		issued: ref.issued,
		'container-title': ref['container-title'],
		DOI: ref.DOI,
		URL: ref.URL,
		language: ref.language,
		tags: ref.tags,
		abstractPreview,
		abstractIsComplete
	};
}
