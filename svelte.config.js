import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Configure for GitHub Pages static site generation
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		},
		prerender: {
			// Neither endpoint is linked from any page (the sitemap is for
			// crawlers, the references data is fetched at runtime), so the
			// prerenderer needs the hints
			entries: ['*', '/sitemap.xml', '/references/data.json']
		}
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
