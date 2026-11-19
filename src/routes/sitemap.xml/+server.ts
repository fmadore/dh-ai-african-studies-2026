import type { RequestHandler } from './$types';
import { SITE_BASE_URL } from '#lib/utils/seo/constants';
import { paperPublicationDate } from '#lib/data/position-paper-meta';

export const prerender = true;

/**
 * Canonical routes only — no query-string variants (they are non-canonical
 * duplicates) and no /concepts/embed (noindex-only iframe view).
 *
 * `lastmod` only where a real content date exists. Stamping every URL with the
 * build date claimed all eleven pages changed on each deploy, which teaches
 * crawlers to ignore the field; an omitted lastmod is honest.
 */
const routes: { path: string; priority: string; lastmod?: string }[] = [
	{ path: '', priority: '1.0' },
	{ path: '/about', priority: '0.8' },
	{ path: '/participants', priority: '0.8' },
	{ path: '/concepts', priority: '0.7' },
	{ path: '/schedule', priority: '0.8' },
	{ path: '/position-paper', priority: '0.8', lastmod: paperPublicationDate },
	{ path: '/position-paper/read', priority: '0.9', lastmod: paperPublicationDate },
	{ path: '/references', priority: '0.7' },
	{ path: '/publications', priority: '0.7' },
	{ path: '/photos', priority: '0.6' },
	{ path: '/interviews', priority: '0.7' }
];

export const GET: RequestHandler = () => {
	const urls = routes
		.map(
			(route) => `  <url>
    <loc>${SITE_BASE_URL}${route.path || '/'}</loc>${
			route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : ''
		}
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
