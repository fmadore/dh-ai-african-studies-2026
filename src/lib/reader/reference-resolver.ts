import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type { CslReference, ResolvedReference } from './types';

/** Convert a Zotero-style id (e.g. "3005271/NGAA6PM6") into a URL-safe slug. */
export function refIdToSlug(refId: string): string {
	return refId.replace(/\//g, '--');
}

function getYear(ref: CslReference): string {
	return String(ref.issued?.['date-parts']?.[0]?.[0] ?? 'n.d.');
}

/** "A", "A and B", "A, B, and C" — including the serial comma. */
const nameList = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

/** Authors, falling back to editors when a work has no author. */
function contributorsOf(ref: CslReference) {
	return ref.author?.length ? ref.author : (ref.editor ?? []);
}

/**
 * Surnames for the short form. Chicago author-date lists up to three names
 * in full and only abbreviates to "et al." from four onwards.
 */
function authorLastNames(ref: CslReference): string {
	const families = contributorsOf(ref)
		.map((p) => p.family ?? p.literal ?? '')
		.filter(Boolean);
	if (families.length === 0) return 'Anonymous';
	if (families.length > 3) return `${families[0]} et al.`;
	return nameList.format(families);
}

function authorsFull(ref: CslReference): string {
	const formatted = contributorsOf(ref)
		.map((p) => p.literal ?? [p.given, p.family].filter(Boolean).join(' ').trim())
		.filter(Boolean);
	if (formatted.length === 0) return 'Anonymous';
	return nameList.format(formatted);
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
interface FootnoteEntry {
	label: string;
	count: number;
	tokens?: Token[];
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
			const fullCitation = formatFull(csl);
			if (!env.resolvedRefs[slug]) {
				env.resolvedRefs[slug] = {
					refId,
					slug,
					short: formatShort(csl),
					full: fullCitation,
					csl
				};
			}

			const label = `ref-${slug}`;
			const key = `:${label}`;
			let footnoteId: number;
			if (env.footnotes.refs[key] === undefined) {
				footnoteId = env.footnotes.list.length;
				env.footnotes.refs[key] = footnoteId;
				// A plain text token for the footnote body — avoids re-entering the
				// parser, which would re-trigger the footnote_tail rule and produce
				// a nested footnote block.
				const bodyToken = new state.Token('text', '', 0);
				bodyToken.content = fullCitation;
				env.footnotes.list.push({ label, count: 0, tokens: [bodyToken] });
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
