import { base } from '$app/paths';

const PROTOCOL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;

function ensureLeadingSlash(path: string): string {
	if (!path.length) {
		return '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

export function resolveAppPath(path = '/'): string {
	if (!path || path === '/') {
		return base || '/';
	}

	if (
		PROTOCOL_PATTERN.test(path) ||
		path.startsWith('#') ||
		path.startsWith('mailto:') ||
		path.startsWith('tel:')
	) {
		return path;
	}

	return `${base}${ensureLeadingSlash(path)}`;
}

export function resolveAssetPath(path?: string): string | undefined {
	if (!path) {
		return undefined;
	}

	if (PROTOCOL_PATTERN.test(path)) {
		return path;
	}

	return `${base}${ensureLeadingSlash(path)}`;
}
