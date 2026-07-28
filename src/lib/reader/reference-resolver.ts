import type MarkdownIt from 'markdown-it';
import type { CslReference, ResolvedReference } from './types';

/** Convert a Zotero-style id (e.g. "3005271/NGAA6PM6") into a URL-safe slug. */
export function refIdToSlug(refId: string): string {
	return refId.replace(/\//g, '--');
}

function getYear(ref: CslReference): string {
	return String(ref.issued?.['date-parts']?.[0]?.[0] ?? 'n.d.');
}

function authorLastNames(ref: CslReference): string {
	const people = ref.author?.length ? ref.author : ref.editor;
	if (!people?.length) return 'Anonymous';
	const families = people.map((p) => p.family ?? p.literal ?? '').filter(Boolean);
	if (families.length === 0) return 'Anonymous';
	if (families.length === 1) return families[0];
	if (families.length === 2) return `${families[0]} and ${families[1]}`;
	return `${families[0]} et al.`;
}

function authorsFull(ref: CslReference): string {
	const people = ref.author?.length ? ref.author : ref.editor;
	if (!people?.length) return 'Anonymous';
	const formatted = people.map((p) => {
		if (p.literal) return p.literal;
		const given = p.given ?? '';
		const family = p.family ?? '';
		return [given, family].filter(Boolean).join(' ').trim() || 'Anonymous';
	});
	if (formatted.length === 1) return formatted[0];
	if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
	return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
}

/** Chicago author-date short form: "Madore 2023" or "Madore 2023, 45". */
export function formatShort(ref: CslReference, locator?: string): string {
	const base = `${authorLastNames(ref)} ${getYear(ref)}`;
	return locator ? `${base}, ${locator}` : base;
}

/** Full Chicago author-date entry. */
export function formatFull(ref: CslReference): string {
	const parts: string[] = [];
	parts.push(`${authorsFull(ref)}.`);
	parts.push(`${getYear(ref)}.`);
	if (ref.title) parts.push(`"${ref.title}."`);
	if (ref['container-title']) parts.push(`${ref['container-title']}`);
	if (ref.volume || ref.issue) {
		const vol = ref.volume ? ref.volume : '';
		const issue = ref.issue ? ` (${ref.issue})` : '';
		if (vol || issue) parts.push(`${vol}${issue}:`);
	}
	if (ref.page) parts.push(`${ref.page}.`);
	if (ref.publisher) parts.push(`${ref.publisher}.`);
	if (ref.DOI) parts.push(`DOI: ${ref.DOI}.`);
	else if (ref.URL) parts.push(`${ref.URL}.`);
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Pattern for `[^ref:KEY]` or `[^ref:KEY, LOCATOR]`.
 * KEY is the Zotero id which contains letters, digits, and slashes.
 * LOCATOR is anything up to the closing `]`.
 */
const REF_PATTERN = /^\[\^ref:([A-Za-z0-9/_-]+)(?:,\s*([^\]]+))?\]/;

// markdown-it-footnote's env structure, described as the plugin uses it.
interface FootnoteTokenLike {
	type: string;
	tag: string;
	attrs: null;
	map: null;
	nesting: number;
	level: number;
	children: null;
	content: string;
	markup: string;
	info: string;
	meta: null;
	block: boolean;
	hidden: boolean;
}
interface FootnoteEntry {
	label: string;
	count: number;
	tokens?: FootnoteTokenLike[];
}
interface FootnoteEnv {
	refs: Record<string, number>;
	list: FootnoteEntry[];
}
interface ResolverEnv {
	footnotes?: FootnoteEnv;
	resolvedRefs?: Record<string, ResolvedReference>;
}

/** Creates a markdown-it plugin that translates `[^ref:KEY]` into footnote refs. */
export function createReferenceRule(references: CslReference[]) {
	const byId = new Map(references.map((r) => [r.id, r]));

	return function refPlugin(md: MarkdownIt): void {
		// markdown-it-footnote registers `footnote_ref` for `[^name]`. Our rule
		// matches the more specific `[^ref:KEY]` pattern and must run first.
		md.inline.ruler.before('footnote_ref', 'csl_ref', (state, silent) => {
			const pos = state.pos;
			if (state.src.charCodeAt(pos) !== 0x5b /* [ */) return false;
			if (state.src.charCodeAt(pos + 1) !== 0x5e /* ^ */) return false;

			const slice = state.src.slice(pos);
			const match = REF_PATTERN.exec(slice);
			if (!match) return false;
			const [full, refId, locator] = match;

			const csl = byId.get(refId);
			if (!csl) {
				// Unknown key: emit visible error so authors notice.
				if (!silent) {
					const token = state.push('text', '', 0);
					token.content = `[?unknown ref: ${refId}]`;
				}
				state.pos += full.length;
				return true;
			}

			if (silent) {
				state.pos += full.length;
				return true;
			}

			const env = state.env as ResolverEnv;
			if (!env.footnotes) env.footnotes = { refs: {}, list: [] };
			if (!env.footnotes.refs) env.footnotes.refs = {};
			if (!env.footnotes.list) env.footnotes.list = [];
			if (!env.resolvedRefs) env.resolvedRefs = {};

			const slug = refIdToSlug(refId);
			if (!env.resolvedRefs[slug]) {
				env.resolvedRefs[slug] = {
					refId,
					slug,
					short: formatShort(csl),
					full: formatFull(csl),
					csl
				};
			}

			const label = `ref-${slug}`;
			const key = `:${label}`;
			let footnoteId: number;
			if (env.footnotes.refs[key] === undefined) {
				footnoteId = env.footnotes.list.length;
				env.footnotes.refs[key] = footnoteId;
				// Use a plain text token for the footnote body — avoids re-entering
				// the parser (which would re-trigger the footnote_tail rule and
				// produce a nested footnote block).
				env.footnotes.list.push({
					label,
					count: 0,
					tokens: [
						{
							type: 'text',
							tag: '',
							attrs: null,
							map: null,
							nesting: 0,
							level: 0,
							children: null,
							content: formatFull(csl),
							markup: '',
							info: '',
							meta: null,
							block: false,
							hidden: false
						}
					]
				});
			} else {
				footnoteId = env.footnotes.refs[key];
			}

			const footnoteSubId = env.footnotes.list[footnoteId].count;
			env.footnotes.list[footnoteId].count = footnoteSubId + 1;

			const token = state.push('footnote_ref', '', 0);
			token.meta = {
				id: footnoteId,
				subId: footnoteSubId,
				label,
				refKey: refId,
				refSlug: slug,
				locator: locator ?? null
			};

			state.pos += full.length;
			return true;
		});
	};
}
