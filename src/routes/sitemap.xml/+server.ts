import type { RequestHandler } from './$types';

export const prerender = true;

const SITE_BASE_URL = 'https://fmadore.github.io/dh-ai-african-studies-2026';

/**
 * Canonical routes only — no query-string variants (they are non-canonical
 * duplicates) and no /concepts/embed (noindex-only iframe view).
 */
const routes: { path: string; priority: string }[] = [
	{ path: '', priority: '1.0' },
	{ path: '/about', priority: '0.8' },
	{ path: '/participants', priority: '0.8' },
	{ path: '/concepts', priority: '0.7' },
	{ path: '/schedule', priority: '0.8' },
	{ path: '/position-paper', priority: '0.8' },
	{ path: '/references', priority: '0.7' },
	{ path: '/photos', priority: '0.6' },
	{ path: '/interviews', priority: '0.7' }
];

export const GET: RequestHandler = () => {
	// Generated at build time, so lastmod tracks each deployment
	const lastmod = new Date().toISOString().slice(0, 10);

	const urls = routes
		.map(
			(route) => `  <url>
    <loc>${SITE_BASE_URL}${route.path || '/'}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route.priority}</priority>
  </url>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
};
