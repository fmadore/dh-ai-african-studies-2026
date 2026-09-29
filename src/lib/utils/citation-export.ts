/**
 * Pure BibTeX / RIS generation from CSL-JSON references.
 * Kept out of components so the logic is testable and reusable.
 */

import type { CslDate, CslName, CslReference } from '$lib/types/csl';
import { stripDiacritics } from '$lib/utils/text';

/** Format date as YYYY-MM-DD from CSL date-parts */
export function formatCslDate(issued?: CslDate): string | null {
	const parts = issued?.['date-parts']?.[0];
	if (!parts) return null;
	const [year, month, day] = parts;

	if (year && month && day) {
		return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
	}
	if (year && month) return `${year}-${String(month).padStart(2, '0')}`;
	if (year) return String(year);
	return null;
}

/** Get year from CSL date-parts */
export function getCslYear(issued?: CslDate): string | null {
	const year = issued?.['date-parts']?.[0]?.[0];
	return year ? String(year) : null;
}

const BIBTEX_ESCAPES: Record<string, string> = {
	'\\': '\\textbackslash{}',
	'&': '\\&',
	'%': '\\%',
	$: '\\$',
	'#': '\\#',
	_: '\\_',
	'{': '\\{',
	'}': '\\}',
	'~': '\\textasciitilde{}',
	'^': '\\textasciicircum{}'
};

/**
 * Escape special BibTeX characters in a single pass — sequential replaces
 * would re-escape the braces inserted by earlier substitutions.
 */
export function escapeBibtex(str: string): string {
	if (!str) return '';
	return str.replace(/[\\&%$#_{}~^]/g, (char) => BIBTEX_ESCAPES[char]);
}

/**
 * Reduce a key component to ASCII letters and digits. BibTeX ends a key at a
 * comma and chokes on `&`, `'` and non-ASCII, all of which occur in this
 * bibliography's institutional author names.
 */
function toKeyPart(value: string): string {
	return stripDiacritics(value).replace(/[^A-Za-z0-9]/g, '');
}

function bibtexKeyBase(ref: CslReference): string {
	const creator = ref.author?.[0] ?? ref.editor?.[0];
	const author = toKeyPart(creator?.family || creator?.literal || '') || 'Unknown';
	const year = getCslYear(ref.issued) || 'nd';
	const titleWord = toKeyPart(ref.title?.split(/\s+/)[0] ?? '') || 'untitled';
	return `${author}${year}${titleWord}`;
}

/** 0 → a, 25 → z, 26 → aa … */
function alphabeticSuffix(index: number): string {
	let suffix = '';
	for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
		suffix = String.fromCharCode(97 + ((n - 1) % 26)) + suffix;
	}
	return suffix;
}

/**
 * One key per record, unique within the export: records whose author, year and
 * first title word coincide get a/b/c suffixes, since BibTeX drops (or refuses)
 * every repeated entry after the first.
 */
export function assignBibtexKeys(refs: CslReference[]): string[] {
	const bases = refs.map(bibtexKeyBase);
	const counts = new Map<string, number>();
	for (const base of bases) counts.set(base, (counts.get(base) ?? 0) + 1);

	const used = new Set(bases.filter((base) => counts.get(base) === 1));
	const nextSuffix = new Map<string, number>();
	return bases.map((base) => {
		if (counts.get(base) === 1) return base;
		let index = nextSuffix.get(base) ?? 0;
		let key = `${base}${alphabeticSuffix(index)}`;
		while (used.has(key)) key = `${base}${alphabeticSuffix(++index)}`;
		nextSuffix.set(base, index + 1);
		used.add(key);
		return key;
	});
}

/** Map CSL type to BibTeX type */
function cslToBibtexType(cslType: string): string {
	const typeMap: Record<string, string> = {
		'article-journal': 'article',
		'article-magazine': 'article',
		'article-newspaper': 'article',
		book: 'book',
		chapter: 'incollection',
		'paper-conference': 'inproceedings',
		thesis: 'phdthesis',
		report: 'techreport',
		webpage: 'misc',
		'post-weblog': 'misc',
		'entry-encyclopedia': 'inbook',
		motion_picture: 'misc',
		song: 'misc',
		speech: 'misc',
		article: 'article'
	};
	return typeMap[cslType] || 'misc';
}

/**
 * Zotero stores an institution as a single-field name: a lone `family` (or a
 * CSL `literal`) with no given name.
 */
function singleFieldName(name: CslName): string | null {
	if (name.given) return null;
	return name.family || name.literal || '';
}

/** Format one name for BibTeX */
function formatBibtexName(name: CslName): string {
	const single = singleFieldName(name);
	// Braced whole, so BibTeX neither splits "… Human and Peoples' Rights" at its
	// "and" nor reads the comma in "Ministry of Information, Communications …"
	// as "Last, First".
	if (single !== null) return `{${escapeBibtex(single)}}`;
	return `${escapeBibtex(name.family || '')}, ${escapeBibtex(name.given || '')}`;
}

/** Format authors for BibTeX */
function formatBibtexAuthors(authors: CslName[]): string {
	if (!authors?.length) return '';
	return authors.map(formatBibtexName).join(' and ');
}

/** Format one name for RIS: "Family, Given", or the institution as written */
function formatRisName(name: CslName): string {
	return singleFieldName(name) ?? `${name.family || ''}, ${name.given || ''}`;
}

/** Generate BibTeX output */
export function generateBibtex(refs: CslReference[]): string {
	const keys = assignBibtexKeys(refs);
	return refs
		.map((ref, index) => {
			const type = cslToBibtexType(ref.type);
			const key = keys[index];
			const fields: string[] = [];

			if (ref.author?.length) {
				fields.push(`  author = {${formatBibtexAuthors(ref.author)}}`);
			}
			if (ref.editor?.length) {
				fields.push(`  editor = {${formatBibtexAuthors(ref.editor)}}`);
			}
			if (ref.title) {
				fields.push(`  title = {${escapeBibtex(ref.title)}}`);
			}
			if (ref['container-title']) {
				const fieldName = type === 'article' ? 'journal' : 'booktitle';
				fields.push(`  ${fieldName} = {${escapeBibtex(ref['container-title'])}}`);
			}
			if (ref.issued) {
				const year = getCslYear(ref.issued);
				const fullDate = formatCslDate(ref.issued);
				if (year) fields.push(`  year = {${year}}`);
				if (fullDate) fields.push(`  date = {${fullDate}}`);
			}
			if (ref.volume) {
				fields.push(`  volume = {${ref.volume}}`);
			}
			if (ref.issue) {
				fields.push(`  number = {${ref.issue}}`);
			}
			if (ref.page) {
				fields.push(`  pages = {${ref.page}}`);
			}
			if (ref.publisher) {
				fields.push(`  publisher = {${escapeBibtex(ref.publisher)}}`);
			}
			if (ref['publisher-place']) {
				fields.push(`  address = {${escapeBibtex(ref['publisher-place'])}}`);
			}
			if (ref.DOI) {
				fields.push(`  doi = {${ref.DOI}}`);
			}
			if (ref.URL) {
				fields.push(`  url = {${ref.URL}}`);
			}
			if (ref.ISSN) {
				fields.push(`  issn = {${ref.ISSN}}`);
			}
			if (ref.ISBN) {
				fields.push(`  isbn = {${ref.ISBN}}`);
			}
			if (ref.abstract) {
				fields.push(`  abstract = {${escapeBibtex(ref.abstract)}}`);
			}
			if (ref.language) {
				fields.push(`  language = {${ref.language}}`);
				fields.push(`  langid = {${ref.language}}`);
			}
			if (ref.tags?.length) {
				fields.push(`  keywords = {${ref.tags.map(escapeBibtex).join(', ')}}`);
			}

			return `@${type}{${key},\n${fields.join(',\n')}\n}`;
		})
		.join('\n\n');
}

/** Map CSL type to RIS type */
function cslToRisType(cslType: string): string {
	const typeMap: Record<string, string> = {
		'article-journal': 'JOUR',
		'article-magazine': 'MGZN',
		'article-newspaper': 'NEWS',
		book: 'BOOK',
		chapter: 'CHAP',
		'paper-conference': 'CONF',
		thesis: 'THES',
		report: 'RPRT',
		webpage: 'ELEC',
		'post-weblog': 'BLOG',
		'entry-encyclopedia': 'ENCYC',
		motion_picture: 'MPCT',
		song: 'SOUND',
		speech: 'GEN',
		article: 'JOUR'
	};
	return typeMap[cslType] || 'GEN';
}

/** Generate RIS output */
export function generateRis(refs: CslReference[]): string {
	return refs
		.map((ref) => {
			const lines: string[] = [];

			lines.push(`TY  - ${cslToRisType(ref.type)}`);

			if (ref.author?.length) {
				ref.author.forEach((a) => {
					lines.push(`AU  - ${formatRisName(a)}`);
				});
			}
			if (ref.editor?.length) {
				ref.editor.forEach((e) => {
					lines.push(`ED  - ${formatRisName(e)}`);
				});
			}
			if (ref.title) {
				lines.push(`TI  - ${ref.title}`);
			}
			if (ref['container-title']) {
				lines.push(`JO  - ${ref['container-title']}`);
				lines.push(`T2  - ${ref['container-title']}`);
			}
			if (ref.issued) {
				const year = getCslYear(ref.issued);
				const fullDate = formatCslDate(ref.issued);
				if (year) lines.push(`PY  - ${year}`);
				if (fullDate) lines.push(`DA  - ${fullDate.replace(/-/g, '/')}`);
			}
			if (ref.volume) {
				lines.push(`VL  - ${ref.volume}`);
			}
			if (ref.issue) {
				lines.push(`IS  - ${ref.issue}`);
			}
			if (ref.page) {
				const pages = ref.page.split(/[-–—]/);
				if (pages[0]) lines.push(`SP  - ${pages[0]}`);
				if (pages[1]) lines.push(`EP  - ${pages[1]}`);
			}
			if (ref.publisher) {
				lines.push(`PB  - ${ref.publisher}`);
			}
			if (ref['publisher-place']) {
				lines.push(`CY  - ${ref['publisher-place']}`);
			}
			if (ref.DOI) {
				lines.push(`DO  - ${ref.DOI}`);
			}
			if (ref.URL) {
				lines.push(`UR  - ${ref.URL}`);
			}
			// RIS has a single SN tag; prefer ISBN for books, ISSN otherwise
			if (ref.type === 'book' || ref.type === 'chapter') {
				if (ref.ISBN) lines.push(`SN  - ${ref.ISBN}`);
				else if (ref.ISSN) lines.push(`SN  - ${ref.ISSN}`);
			} else if (ref.ISSN) {
				lines.push(`SN  - ${ref.ISSN}`);
			} else if (ref.ISBN) {
				lines.push(`SN  - ${ref.ISBN}`);
			}
			if (ref.abstract) {
				lines.push(`AB  - ${ref.abstract}`);
			}
			if (ref.language) {
				lines.push(`LA  - ${ref.language}`);
			}
			if (ref.tags?.length) {
				ref.tags.forEach((tag) => {
					lines.push(`KW  - ${tag}`);
				});
			}

			lines.push('ER  - ');

			return lines.join('\n');
		})
		.join('\n\n');
}
