import { test as base, expect } from '@playwright/test';

/** All journeys fail on uncaught application errors, not external console noise. */
export const test = base.extend<{ applicationErrors: void }>({
	applicationErrors: [
		async ({ page }, use) => {
			const errors: string[] = [];
			page.on('pageerror', (error) => errors.push(error.message));
			// Most journeys do not test the tile provider. Map-specific tests can
			// override this deterministic style with geometry or a failed request.
			await page.route('https://tiles.openfreemap.org/styles/*', (route) =>
				route.fulfill({
					json: {
						version: 8,
						sources: {},
						layers: [
							{ id: 'background', type: 'background', paint: { 'background-color': '#eeeeee' } }
						]
					}
				})
			);
			await use();
			expect(errors, 'uncaught browser errors').toEqual([]);
		},
		{ auto: true }
	]
});

export { expect };
