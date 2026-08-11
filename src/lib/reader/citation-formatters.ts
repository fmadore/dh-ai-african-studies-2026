/**
 * Citation formatters for the position paper itself.
 * Outputs BibTeX / RIS / Chicago (author-date) / APA strings from
 * `positionPaperMeta`, used by the "How to cite" widget.
 */

import { escapeBibtex } from '$lib/utils/citation-export';
import type { Author } from '$lib/utils/seo';
import type { PositionPaperMeta } from './types';

function givenName(person: Author): string {
	if (person.given) return person.given;
	const parts = person.name.trim().split(/\s+/);
	return parts.slice(0, -1).join(' ') || person.name;
}

function familyName(person: Author): string {
	if (person.family) return person.family;
	const parts = person.name.trim().split(/\s+/);
	return parts.length > 1 ? parts[parts.length - 1] : person.name;
}

function bibtexKey(meta: PositionPaperMeta): string {
	const lead = meta.authors[0] ? familyName(meta.authors[0]) : 'Anon';
	const year = meta.publicationDate.slice(0, 4);
	const word = (meta.title.split(' ')[0] || 'untitled').replace(/[^a-zA-Z]/g, '');
	return `${lead}${year}${word}`;
}

// Reference managers want the whole byline, so BibTeX and RIS never truncate.
function bibtexAuthors(meta: PositionPaperMeta): string {
	return meta.authors.map((a) => `${familyName(a)}, ${givenName(a)}`).join(' and ');
}

export function toBibtex(meta: PositionPaperMeta): string {
	const fields: string[] = [];
	fields.push(`  author = {${bibtexAuthors(meta)}}`);
	fields.push(`  title = {${escapeBibtex(meta.title)}}`);
	fields.push(`  year = {${meta.publicationDate.slice(0, 4)}}`);
	fields.push(`  date = {${meta.publicationDate}}`);
	fields.push(`  journal = {${escapeBibtex(meta.journalTitle)}}`);
	fields.push(`  publisher = {${escapeBibtex(meta.publisher)}}`);
	fields.push(`  language = {${meta.language}}`);
	if (meta.doi) fields.push(`  doi = {${meta.doi}}`);
	if (meta.issn) fields.push(`  issn = {${meta.issn}}`);
	if (meta.abstract) fields.push(`  abstract = {${escapeBibtex(meta.abstract)}}`);
	if (meta.keywords.length) fields.push(`  keywords = {${meta.keywords.join(', ')}}`);
	return `@article{${bibtexKey(meta)},\n${fields.join(',\n')}\n}`;
}

export function toRis(meta: PositionPaperMeta): string {
	const lines: string[] = [];
	lines.push('TY  - JOUR');
	meta.authors.forEach((a) => lines.push(`AU  - ${familyName(a)}, ${givenName(a)}`));
	lines.push(`TI  - ${meta.title}`);
	lines.push(`JO  - ${meta.journalTitle}`);
	lines.push(`PB  - ${meta.publisher}`);
	lines.push(`PY  - ${meta.publicationDate.slice(0, 4)}`);
	lines.push(`DA  - ${meta.publicationDate.replace(/-/g, '/')}`);
	lines.push(`LA  - ${meta.language}`);
	if (meta.doi) lines.push(`DO  - ${meta.doi}`);
	if (meta.issn) lines.push(`SN  - ${meta.issn}`);
	if (meta.abstract) lines.push(`AB  - ${meta.abstract}`);
	meta.keywords.forEach((k) => lines.push(`KW  - ${k}`));
	lines.push('ER  - ');
	return lines.join('\n');
}

/**
 * Chicago 17th ed. (15.9): a reference-list entry names up to ten authors in
 * full; beyond that it lists the first seven and closes with "et al.".
 */
const CHICAGO_LIST_LIMIT = 10;
const CHICAGO_NAMES_SHOWN = 7;

function authorsChicago(meta: PositionPaperMeta): string {
	if (!meta.authors.length) return 'Anonymous';
	const truncated = meta.authors.length > CHICAGO_LIST_LIMIT;
	const listed = truncated ? meta.authors.slice(0, CHICAGO_NAMES_SHOWN) : meta.authors;
	const formatted = listed.map((a, i) => {
		if (i === 0) return `${familyName(a)}, ${givenName(a)}`;
		return `${givenName(a)} ${familyName(a)}`;
	});
	if (truncated) return `${formatted.join(', ')}, et al.`;
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
	return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
}

export function toChicago(meta: PositionPaperMeta, canonicalUrl?: string): string {
	const year = meta.publicationDate.slice(0, 4);
	const authors = authorsChicago(meta);
	const parts: string[] = [];
	// "et al." already carries its full stop.
	parts.push(authors.endsWith('.') ? authors : `${authors}.`);
	parts.push(`${year}.`);
	parts.push(`"${meta.title}."`);
	parts.push(`${meta.journalTitle}.`);
	if (meta.doi) parts.push(`https://doi.org/${meta.doi}.`);
	else if (canonicalUrl) parts.push(`${canonicalUrl}.`);
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * APA 7 (§9.8): up to twenty authors are all named; from twenty-one the entry
 * lists the first nineteen, an ellipsis, then the final author — no ampersand.
 */
const APA_LIST_LIMIT = 20;
const APA_NAMES_SHOWN = 19;

function authorsApa(meta: PositionPaperMeta): string {
	const initials = (name: string) =>
		name
			.trim()
			.split(/\s+/)
			.map((n) => `${n[0]}.`)
			.join(' ');
	const invert = (a: Author) => `${familyName(a)}, ${initials(givenName(a))}`;

	if (meta.authors.length > APA_LIST_LIMIT) {
		const head = meta.authors.slice(0, APA_NAMES_SHOWN).map(invert);
		return `${head.join(', ')}, ... ${invert(meta.authors[meta.authors.length - 1])}`;
	}

	const formatted = meta.authors.map(invert);
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
	return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
}

export function toApa(meta: PositionPaperMeta, canonicalUrl?: string): string {
	const year = meta.publicationDate.slice(0, 4);
	const parts: string[] = [];
	parts.push(`${authorsApa(meta)} (${year}).`);
	parts.push(`${meta.title}.`);
	parts.push(`${meta.journalTitle}.`);
	if (meta.doi) parts.push(`https://doi.org/${meta.doi}`);
	else if (canonicalUrl) parts.push(canonicalUrl);
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}
