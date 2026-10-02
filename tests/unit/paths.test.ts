import { describe, expect, it } from 'vitest';
import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

const prefix = process.env.BASE_PATH || '';

describe('path utilities', () => {
	it('keeps external and non-navigation URLs unchanged', () => {
		expect(resolveAppPath('https://example.org')).toBe('https://example.org');
		expect(resolveAppPath('//cdn.example.org/file')).toBe('//cdn.example.org/file');
		expect(resolveAppPath('#details')).toBe('#details');
		expect(resolveAppPath('mailto:hello@example.org')).toBe('mailto:hello@example.org');
	});

	it('makes local application and asset paths absolute', () => {
		expect(resolveAppPath()).toBe(`${prefix}/`);
		expect(resolveAppPath('about')).toBe(`${prefix}/about`);
		expect(resolveAppPath('/about?view=details#team')).toBe(`${prefix}/about?view=details#team`);
		expect(resolveAssetPath('images/hero.jpg')).toBe(`${prefix}/images/hero.jpg`);
		expect(resolveAssetPath()).toBeUndefined();
	});
});
