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
	server: {
		// Vite does not read PORT on its own: left alone it takes 5173, or walks
		// to the next free port and says so only in its own stdout. Honouring the
		// variable lets a supervising tool assign the port and actually find the
		// server there.
		port: process.env.PORT ? Number(process.env.PORT) : undefined
	}
});
