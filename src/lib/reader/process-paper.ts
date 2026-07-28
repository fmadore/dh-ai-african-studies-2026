import { createMarkdownIt } from './markdown';
import { extractToc } from './toc-extractor';
import type { CslReference, ProcessedPaper, ResolvedReference } from './types';

/**
 * Parses the markdown source, resolves `[^ref:KEY]` footnotes against the
 * CSL-JSON reference database, and returns the SSR HTML + TOC + resolved
 * reference map.
 *
 * Run at build time from the +page.ts load() function.
 */
export function processPaper(source: string, references: CslReference[]): ProcessedPaper {
	const md = createMarkdownIt(references);

	// Normalise line endings — markdown-it tolerates CRLF in most paths but our
	// custom inline rule works on raw character codes, so be safe.
	const normalised = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	const env: {
		resolvedRefs?: Record<string, ResolvedReference>;
	} = {};

	const tokens = md.parse(normalised, env);
	const toc = extractToc(tokens);
	const html = md.renderer.render(tokens, md.options, env);

	return {
		html,
		toc,
		resolvedRefs: env.resolvedRefs ?? {}
	};
}
