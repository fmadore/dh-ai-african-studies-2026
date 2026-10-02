/** The same origin-relative URL in root previews and GitHub Pages builds. */
export function sitePath(path = '/'): string {
	const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
