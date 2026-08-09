import { SITE_BASE_URL } from './constants';

export function normalisePath(path: string): string {
	if (!path.length || path === '/') {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

export function resolveCanonicalUrl(path: string): string {
	// The site is built with trailingSlash: 'never' (adapter-static emits
	// `about.html`), so on GitHub Pages only the slash-less URL exists.
	// Canonicals must match or they point at 404s.
	if (path === '/') {
		return ensureTrailingSlash(SITE_BASE_URL);
	}
	return `${SITE_BASE_URL}${path.replace(/\/$/, '')}`;
}

export function resolveAssetUrl(asset: string): string {
	if (/^https?:\/\//i.test(asset)) {
		return asset;
	}

	return new URL(asset.replace(/^\//, ''), ensureTrailingSlash(SITE_BASE_URL)).toString();
}

export function ensureTrailingSlash(value: string): string {
	return value.endsWith('/') ? value : `${value}/`;
}
