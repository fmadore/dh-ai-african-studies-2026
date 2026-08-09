import { describe, expect, it } from 'vitest';
import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

describe('path utilities', () => {
	it('keeps external and non-navigation URLs unchanged', () => {
		expect(resolveAppPath('https://example.org')).toBe('https://example.org');
		expect(resolveAppPath('//cdn.example.org/file')).toBe('//cdn.example.org/file');
		expect(resolveAppPath('#details')).toBe('#details');
		expect(resolveAppPath('mailto:hello@example.org')).toBe('mailto:hello@example.org');
	});

	it('makes local application and asset paths absolute', () => {
		expect(resolveAppPath()).toBe('/');
		expect(resolveAppPath('about')).toBe('/about');
		expect(resolveAssetPath('images/hero.jpg')).toBe('/images/hero.jpg');
		expect(resolveAssetPath()).toBeUndefined();
	});
});
