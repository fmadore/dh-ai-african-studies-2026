<script lang="ts">
	import { Button, Dropdown, DropdownItem, Spinner } from 'flowbite-svelte';
	import { DownloadOutline, ChevronDownOutline } from 'flowbite-svelte-icons';

	interface Props {
		references: any[];
		filename?: string;
	}

	let { references, filename = 'references' }: Props = $props();

	let isExporting = $state(false);

	// Format date as YYYY-MM-DD from CSL date-parts
	function formatDate(issued: any): string | null {
		if (!issued?.['date-parts']?.[0]) return null;
		const parts = issued['date-parts'][0];
		const year = parts[0];
		const month = parts[1] ? String(parts[1]).padStart(2, '0') : null;
		const day = parts[2] ? String(parts[2]).padStart(2, '0') : null;

		if (year && month && day) return `${year}-${month}-${day}`;
		if (year && month) return `${year}-${month}`;
		if (year) return String(year);
		return null;
	}

	// Get year from CSL date-parts
	function getYear(issued: any): string | null {
		if (!issued?.['date-parts']?.[0]?.[0]) return null;
		return String(issued['date-parts'][0][0]);
	}

	// Escape special BibTeX characters
	function escapeBibtex(str: string): string {
		if (!str) return '';
		return str
			.replace(/\\/g, '\\textbackslash{}')
			.replace(/[&%$#_{}]/g, '\\$&')
			.replace(/~/g, '\\textasciitilde{}')
			.replace(/\^/g, '\\textasciicircum{}');
	}

	// Generate BibTeX citation key from reference
	function generateBibtexKey(ref: any): string {
		const author = ref.author?.[0]?.family || ref.editor?.[0]?.family || 'Unknown';
		const year = getYear(ref.issued) || 'nd';
		const titleWord = (ref.title?.split(' ')[0] || 'untitled').replace(/[^a-zA-Z]/g, '');
		return `${author}${year}${titleWord}`.replace(/\s+/g, '');
	}

	// Map CSL type to BibTeX type
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

	// Format authors for BibTeX
	function formatBibtexAuthors(authors: any[]): string {
		if (!authors?.length) return '';
		return authors.map((a) => `${a.family || ''}, ${a.given || ''}`).join(' and ');
	}

	// Generate BibTeX output
	function generateBibtex(refs: any[]): string {
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
					const year = getYear(ref.issued);
					const fullDate = formatDate(ref.issued);
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

	// Map CSL type to RIS type
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

	// Generate RIS output
	function generateRis(refs: any[]): string {
		return refs
			.map((ref) => {
				const lines: string[] = [];

				lines.push(`TY  - ${cslToRisType(ref.type)}`);

				if (ref.author?.length) {
					ref.author.forEach((a: any) => {
						lines.push(`AU  - ${a.family || ''}, ${a.given || ''}`);
					});
				}
				if (ref.editor?.length) {
					ref.editor.forEach((e: any) => {
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
					const year = getYear(ref.issued);
					const fullDate = formatDate(ref.issued);
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
				if (ref.ISSN) {
					lines.push(`SN  - ${ref.ISSN}`);
				}
				if (ref.ISBN) {
					lines.push(`SN  - ${ref.ISBN}`);
				}
				if (ref.abstract) {
					lines.push(`AB  - ${ref.abstract}`);
				}
				if (ref.language) {
					lines.push(`LA  - ${ref.language}`);
				}
				if (ref.tags?.length) {
					ref.tags.forEach((tag: string) => {
						lines.push(`KW  - ${tag}`);
					});
				}

				lines.push('ER  - ');

				return lines.join('\n');
			})
			.join('\n\n');
	}

	async function exportToFormat(format: 'bibtex' | 'ris') {
		if (references.length === 0) return;

		isExporting = true;

		try {
			let content: string;
			let extension: string;
			let mimeType: string;

			if (format === 'bibtex') {
				content = generateBibtex(references);
				extension = 'bib';
				mimeType = 'application/x-bibtex';
			} else {
				content = generateRis(references);
				extension = 'ris';
				mimeType = 'application/x-research-info-systems';
			}

			// Create and download the file
			const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${filename}.${extension}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			isExporting = false;
		}
	}
</script>

<Button
	color="light"
	size="sm"
	class="font-medium"
	disabled={isExporting || references.length === 0}
>
	{#if isExporting}
		<Spinner size="4" class="mr-2" />
		Exporting...
	{:else}
		<DownloadOutline class="mr-2 h-4 w-4" />
		Export to Zotero
		<ChevronDownOutline class="ml-1 h-3 w-3" />
	{/if}
</Button>
<Dropdown simple class="z-(--z-popover) w-48">
	<DropdownItem onclick={() => exportToFormat('bibtex')}>
		<span class="text-primary-ink block font-medium">BibTeX (.bib)</span>
		<span class="text-subtle-ink block text-xs">Best for LaTeX users</span>
	</DropdownItem>
	<DropdownItem onclick={() => exportToFormat('ris')}>
		<span class="text-primary-ink block font-medium">RIS (.ris)</span>
		<span class="text-subtle-ink block text-xs">Universal format</span>
	</DropdownItem>
</Dropdown>
