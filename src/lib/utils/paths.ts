import { asset, resolve } from '$app/paths';
import type { AssetPath } from '$app/types';

const PROTOCOL_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;

export function resolveAppPath(path = '/'): string {
	if (!path || path === '/') {
		return resolve('');
	}

	if (
		PROTOCOL_PATTERN.test(path) ||
		path.startsWith('#') ||
		path.startsWith('mailto:') ||
		path.startsWith('tel:')
	) {
		return path;
	}

	// Callers include data-driven links, so narrow the argument tuple at this boundary.
	return resolve(...([path.replace(/^\//, '')] as Parameters<typeof resolve>));
}

export function resolveAssetPath(path?: string): string | undefined {
	if (!path) {
		return undefined;
	}

	if (PROTOCOL_PATTERN.test(path)) {
		return path;
	}

	return asset(path.replace(/^\//, '') as AssetPath);
}
