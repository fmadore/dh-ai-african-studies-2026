/**
 * Pure BibTeX / RIS generation from CSL-JSON references.
 * Kept out of components so the logic is testable and reusable.
 */

import type { CslDate, CslName, CslReference } from '$lib/types/csl';

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

/** Generate BibTeX citation key from reference */
function generateBibtexKey(ref: CslReference): string {
	const author = ref.author?.[0]?.family || ref.editor?.[0]?.family || 'Unknown';
	const year = getCslYear(ref.issued) || 'nd';
	const titleWord = (ref.title?.split(' ')[0] || 'untitled').replace(/[^a-zA-Z]/g, '');
	return `${author}${year}${titleWord}`.replace(/\s+/g, '');
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

/** Format authors for BibTeX */
function formatBibtexAuthors(authors: CslName[]): string {
	if (!authors?.length) return '';
	return authors.map((a) => `${a.family || ''}, ${a.given || ''}`).join(' and ');
}

/** Generate BibTeX output */
export function generateBibtex(refs: CslReference[]): string {
	return refs
		.map((ref) => {
			const type = cslToBibtexType(ref.type);
			const key = generateBibtexKey(ref);
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
				fields.push(`  keywords = {${ref.tags.join(', ')}}`);
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
					lines.push(`AU  - ${a.family || ''}, ${a.given || ''}`);
				});
			}
			if (ref.editor?.length) {
				ref.editor.forEach((e) => {
					lines.push(`ED  - ${e.family || ''}, ${e.given || ''}`);
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
				const pages = ref.page.split('-');
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
