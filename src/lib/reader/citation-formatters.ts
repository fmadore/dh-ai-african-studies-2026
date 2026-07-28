/**
 * Citation formatters for the position paper itself.
 * Outputs BibTeX / RIS / Chicago (author-date) / APA strings from
 * `positionPaperMeta`, used by the "How to cite" widget.
 */

import type { PositionPaperMeta } from './types';

function firstName(person: { name: string }): string {
	const parts = person.name.trim().split(/\s+/);
	return parts.slice(0, -1).join(' ') || person.name;
}

function lastName(person: { name: string }): string {
	const parts = person.name.trim().split(/\s+/);
	return parts.length > 1 ? parts[parts.length - 1] : person.name;
}

function bibtexKey(meta: PositionPaperMeta): string {
	const lead = meta.authors[0] ? lastName(meta.authors[0]) : 'Anon';
	const year = meta.publicationDate.slice(0, 4);
	const word = (meta.title.split(' ')[0] || 'untitled').replace(/[^a-zA-Z]/g, '');
	return `${lead}${year}${word}`;
}

function bibtexAuthors(meta: PositionPaperMeta): string {
	return meta.authors.map((a) => `${lastName(a)}, ${firstName(a)}`).join(' and ');
}

function escapeBibtex(s: string): string {
	return s
		.replace(/\\/g, '\\textbackslash{}')
		.replace(/[&%$#_{}]/g, '\\$&')
		.replace(/~/g, '\\textasciitilde{}')
		.replace(/\^/g, '\\textasciicircum{}');
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
	meta.authors.forEach((a) => lines.push(`AU  - ${lastName(a)}, ${firstName(a)}`));
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

function authorsChicago(meta: PositionPaperMeta): string {
	if (!meta.authors.length) return 'Anonymous';
	const formatted = meta.authors.map((a, i) => {
		if (i === 0) return `${lastName(a)}, ${firstName(a)}`;
		return `${firstName(a)} ${lastName(a)}`;
	});
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
	return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
}

export function toChicago(meta: PositionPaperMeta, canonicalUrl?: string): string {
	const year = meta.publicationDate.slice(0, 4);
	const parts: string[] = [];
	parts.push(`${authorsChicago(meta)}.`);
	parts.push(`${year}.`);
	parts.push(`"${meta.title}."`);
	parts.push(`${meta.journalTitle}.`);
	if (meta.doi) parts.push(`https://doi.org/${meta.doi}.`);
	else if (canonicalUrl) parts.push(`${canonicalUrl}.`);
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function authorsApa(meta: PositionPaperMeta): string {
	const initials = (name: string) =>
		name
			.trim()
			.split(/\s+/)
			.map((n) => `${n[0]}.`)
			.join(' ');
	const formatted = meta.authors.map((a) => `${lastName(a)}, ${initials(firstName(a))}`);
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
