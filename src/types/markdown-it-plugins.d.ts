declare module 'markdown-it-footnote' {
	import type { PluginSimple } from 'markdown-it';
	const plugin: PluginSimple;
	export default plugin;
}

declare module 'markdown-it-anchor' {
	import type MarkdownIt from 'markdown-it';

	interface AnchorOptions {
		level?: number | number[];
		slugify?: (str: string) => string;
		permalink?: unknown;
		permalinkClass?: string;
		permalinkSymbol?: string;
		permalinkBefore?: boolean;
		permalinkHref?: (slug: string, state: unknown) => string;
		callback?: (token: unknown, info: { slug: string; title: string }) => void;
		renderPermalink?: unknown;
		uniqueSlugStartIndex?: number;
		tabIndex?: number | false;
		getTokensText?: (tokens: unknown[]) => string;
	}

	const plugin: (md: MarkdownIt, options?: AnchorOptions) => void;
	export default plugin;
}
