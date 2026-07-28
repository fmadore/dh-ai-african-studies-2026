import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import anchor from 'markdown-it-anchor';
import GithubSlugger from 'github-slugger';
import { createReferenceRule } from './reference-resolver';
import type { CslReference } from './types';

/**
 * Builds a configured markdown-it instance for the position paper.
 *
 * Features:
 *  - footnotes (`[^1]` standard + `[^ref:KEY]` resolved against references.json)
 *  - heading anchors on H2/H3 via github-slugger (used by the TOC extractor)
 *  - renderer overrides adding stable `data-footnote-ref` / `data-ref-key` /
 *    `data-ref-slug` attributes so client-side Svelte can hydrate popovers.
 */
export function createMarkdownIt(references: CslReference[]): MarkdownIt {
	const md = new MarkdownIt({
		html: false,
		linkify: true,
		typographer: true
	});

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

	// Override footnote_ref renderer — add data attributes when the token was
	// produced by our `csl_ref` rule. meta.refSlug is set there.
	const defaultFootnoteRef = md.renderer.rules.footnote_ref;
	md.renderer.rules.footnote_ref = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		const meta = (token.meta ?? {}) as {
			refKey?: string;
			refSlug?: string;
			locator?: string | null;
		};
		const base = defaultFootnoteRef
			? defaultFootnoteRef(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);

		// Every footnote ref gets the data-footnote-ref marker, regardless of source.
		let html = base.replace('<sup', '<sup data-footnote-ref');
		if (meta.refKey && meta.refSlug) {
			html = html.replace(
				'<sup data-footnote-ref',
				`<sup data-footnote-ref data-ref-key="${escapeAttr(meta.refKey)}" data-ref-slug="${escapeAttr(meta.refSlug)}"`
			);
			if (meta.locator) {
				html = html.replace(
					'<sup data-footnote-ref',
					`<sup data-footnote-ref data-ref-locator="${escapeAttr(meta.locator)}"`
				);
			}
		}
		return html;
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

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
