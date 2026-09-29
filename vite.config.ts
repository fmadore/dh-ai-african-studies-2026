import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { existsSync } from 'node:fs';

export default defineConfig({
	define: {
		'import.meta.env.PAPER_EPUB_AVAILABLE': existsSync(
			new URL('./static/documents/position-paper.epub', import.meta.url)
		)
	},
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rolldownOptions: {
			treeshake: {
				// flowbite-svelte declares no `sideEffects`, and its components import
				// the package barrel, so every theme module's top-level `tv()` call
				// (Carousel, Datepicker, Toggle, … ~60 of them) survived tree-shaking
				// into a ~61 KiB-gzip chunk that every page loaded eagerly. Its plain
				// .js modules only export; the .svelte components are unaffected.
				moduleSideEffects: [{ test: /flowbite-svelte[\\/]dist[\\/].*\.js$/, sideEffects: false }]
			}
		}
	},
	server: {
		// Vite does not read PORT on its own: left alone it takes 5173, or walks
		// to the next free port and says so only in its own stdout. Honouring the
		// variable lets a supervising tool assign the port and actually find the
		// server there.
		port: process.env.PORT ? Number(process.env.PORT) : undefined
	}
});
