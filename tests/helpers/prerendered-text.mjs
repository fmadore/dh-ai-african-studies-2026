import assert from 'node:assert/strict';
import { parseDocument } from 'htmlparser2';

const excluded = new Set(['script', 'style', 'template', 'noscript']);
const boundaries = new Set([
	'address',
	'article',
	'aside',
	'blockquote',
	'br',
	'dd',
	'div',
	'dl',
	'dt',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hr',
	'li',
	'main',
	'nav',
	'ol',
	'p',
	'pre',
	'section',
	'table',
	'td',
	'th',
	'tr',
	'ul'
]);

/** Read source content, not a sanitizer or a substitute for CSS visibility tests. */
export function prerenderedMainText(html) {
	const document = parseDocument(html, { decodeEntities: true });
	const mains = [];
	function findMain(node) {
		if (excluded.has(node.name) || Object.hasOwn(node.attribs ?? {}, 'hidden')) return;
		if (node.name === 'main') mains.push(node);
		for (const child of node.children ?? []) findMain(child);
	}
	findMain(document);
	assert.equal(mains.length, 1, 'Expected exactly one prerendered main element');

	function textOf(node) {
		if (node.type === 'text') return node.data;
		if (excluded.has(node.name) || Object.hasOwn(node.attribs ?? {}, 'hidden')) return '';
		const text = (node.children ?? []).map(textOf).join('');
		return boundaries.has(node.name) ? ` ${text} ` : text;
	}
	// Entities have already been decoded once by the parser.
	return textOf(mains[0]).replace(/\s+/gu, ' ').trim();
}
