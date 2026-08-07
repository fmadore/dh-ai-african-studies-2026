import markdownit, { type MarkdownIt } from 'markdown-it';
import footnote from 'markdown-it-footnote';
import anchor from 'markdown-it-anchor';
import GithubSlugger from 'github-slugger';
import { createReferenceRule } from './reference-resolver';
import { createCitationRule, type CitationReport } from './citations';
import type { CslReference } from './types';

/**
 * Builds a configured markdown-it instance for the position paper.
 *
 * Features:
 *  - footnotes (`[^1]` standard + `[^ref:KEY]` resolved against references.json)
 *  - heading anchors on H2/H3 via github-slugger (used by the TOC extractor)
 *  - renderer overrides adding stable `data-footnote-ref` / `data-ref-key` /
 *    `data-ref-slug` attributes so client-side Svelte can hydrate popovers.
 *  - author-date citations linked to the paper's own reference list
 */
export function createMarkdownIt(
	references: CslReference[],
	onCitationReport?: (_report: CitationReport) => void
): MarkdownIt {
	const md = markdownit({
		html: false,
		linkify: true,
		typographer: true
	});

	// `typographer` bundles two core rules. `smartquotes` is kept as a safety net
	// for hand-edits, but `replacements` is disabled: it rewrites `(c)` as `©`,
	// which mangles the paper's `(a) Access + (b) Governance + (c) Sovereignty`
	// label. Its useful substitutions (`---`, `--`, `...`) have nothing to do
	// here — the markdown is converted from .docx and already carries literal
	// em dashes, en dashes, and ellipses.
	md.core.ruler.disable('replacements');

	md.use(footnote);
	md.use(anchor, {
		level: [2, 3],
		slugify: (() => {
			const slugger = new GithubSlugger();
			return (str: string) => slugger.slug(str);
		})(),
		permalink: false,
		tabIndex: false
	});
	md.use(createReferenceRule(references));
	// Registered last so its core rule runs at the end of the chain, after
	// linkify and smartquotes have settled the text it scans.
	md.use(createCitationRule(onCitationReport));

	// Render footnote refs ourselves so the `data-*` hooks the Svelte popover
	// reads are emitted directly, rather than being spliced into the plugin's
	// output string afterwards. The anchor name and caption still come from
	// markdown-it-footnote's own helpers, so ids and backrefs stay consistent
	// with the notes list it renders at the end of the document.
	md.renderer.rules.footnote_ref = (tokens, idx, options, env, self) => {
		const meta = (tokens[idx].meta ?? {}) as {
			subId?: number;
			refKey?: string;
			refSlug?: string;
			locator?: string | null;
		};
		const esc = md.utils.escapeHtml;

		const anchor = self.rules.footnote_anchor_name?.(tokens, idx, options, env, self) ?? '';
		const caption = self.rules.footnote_caption?.(tokens, idx, options, env, self) ?? '';
		const backrefId = meta.subId ? `${anchor}:${meta.subId}` : anchor;

		// Present on every footnote ref, whatever produced it.
		const attrs = ['data-footnote-ref'];
		if (meta.refKey && meta.refSlug) {
			attrs.push(`data-ref-key="${esc(meta.refKey)}"`);
			attrs.push(`data-ref-slug="${esc(meta.refSlug)}"`);
			if (meta.locator) attrs.push(`data-ref-locator="${esc(meta.locator)}"`);
		}

		return `<sup class="footnote-ref" ${attrs.join(' ')}><a href="#fn${anchor}" id="fnref${backrefId}">${caption}</a></sup>`;
	};

	// Wrap the footnote block in an <aside> for semantics + styling scope.
	const defaultBlockOpen = md.renderer.rules.footnote_block_open;
	md.renderer.rules.footnote_block_open = (tokens, idx, options, env, self) => {
		const inner = defaultBlockOpen
			? defaultBlockOpen(tokens, idx, options, env, self)
			: '<hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list">';
		return `<aside class="reader-footnotes" aria-labelledby="reader-footnotes-heading"><h2 id="reader-footnotes-heading" class="reader-footnotes-heading">Notes</h2>${inner.replace('<hr class="footnotes-sep">', '')}`;
	};
	const defaultBlockClose = md.renderer.rules.footnote_block_close;
	md.renderer.rules.footnote_block_close = (tokens, idx, options, env, self) => {
		const inner = defaultBlockClose
			? defaultBlockClose(tokens, idx, options, env, self)
			: '</ol></section>';
		return `${inner}</aside>`;
	};

	return md;
}
