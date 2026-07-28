import type Token from 'markdown-it/lib/token.mjs';
import type { TocItem } from './types';

/**
 * Walks parsed markdown-it tokens and emits a flat TOC list for H2/H3
 * headings. Heading ids come from markdown-it-anchor (github-slugger).
 */
export function extractToc(tokens: Token[]): TocItem[] {
	const items: TocItem[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const t = tokens[i];
		if (t.type !== 'heading_open') continue;
		if (t.tag !== 'h2' && t.tag !== 'h3') continue;

		const inline = tokens[i + 1];
		if (!inline || inline.type !== 'inline') continue;

		const id = t.attrGet('id');
		if (!id) continue;

		items.push({
			level: t.tag === 'h2' ? 2 : 3,
			id,
			text: inline.content
		});
	}
	return items;
}
