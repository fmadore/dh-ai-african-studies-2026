import { expect, test } from './fixtures';
import { sitePath } from './helpers';
import sharp from 'sharp';

test('basemap worker renders geometry through theme, zoom and resize changes', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	// A GeoJSON source exercises the real bundled worker without depending on
	// the public tile service. A background-only canvas must fail this test.
	await page.route('https://tiles.openfreemap.org/styles/*', async (route) => {
		const dark = route.request().url().endsWith('/dark');
		await route.fulfill({
			json: {
				version: 8,
				sources: {
					land: {
						type: 'geojson',
						data: {
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'Polygon',
								coordinates: [
									[
										[-60, -40],
										[60, -40],
										[60, 70],
										[-60, 70],
										[-60, -40]
									]
								]
							}
						}
					}
				},
				layers: [
					{ id: 'background', type: 'background', paint: { 'background-color': '#ffffff' } },
					{
						id: 'land',
						type: 'fill',
						source: 'land',
						paint: { 'fill-color': dark ? '#0000ff' : '#00ff00' }
					}
				]
			}
		});
	});
	await page.goto(sitePath('/participants'));
	const map = page.locator('.map-canvas');
	await map.scrollIntoViewIfNeeded();
	const canvas = map.locator('canvas');
	await expect(canvas).toBeVisible();
	const originalCanvas = await canvas.elementHandle();
	for (const dark of [false, true, false]) {
		await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark);
		await expect
			.poll(
				async () => {
					const { data, info } = await sharp(await canvas.screenshot())
						.removeAlpha()
						.raw()
						.toBuffer({ resolveWithObject: true });
					let colored = 0;
					for (let i = 0; i < data.length; i += info.channels) {
						if (data[i] < 30 && data[i + (dark ? 2 : 1)] > 220 && data[i + (dark ? 1 : 2)] < 30)
							colored++;
					}
					return colored / (info.width * info.height);
				},
				{ timeout: 20_000 }
			)
			.toBeGreaterThan(0.01);
		await expect(canvas).toHaveCount(1);
		await expect(originalCanvas!.evaluate((element) => element.isConnected)).resolves.toBe(true);
		await map.getByRole('button', { name: 'Zoom in', exact: true }).click();
		await page.setViewportSize({ width: dark ? 900 : 700, height: 850 });
	}
	await map.locator('.custom-map-marker').first().press('Enter');
	await expect(page.locator('.participant-popup')).toBeVisible();
	expect(errors).toEqual([]);
});

test('missing WebGL2 shows the participant directory fallback', async ({ page }) => {
	await page.addInitScript(() => {
		const getContext = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (
			this: HTMLCanvasElement,
			...args: Parameters<typeof getContext>
		) {
			if (String(args[0]).startsWith('webgl')) return null;
			return getContext.apply(this, args);
		} as typeof getContext;
	});
	await page.goto(sitePath('/participants'));
	await expect(page.getByText('The interactive map could not be loaded.')).toBeVisible();
	await expect(
		page.getByText(
			'The directory below lists every participant with their affiliation and country.'
		)
	).toBeVisible();
});

test('a theme flipped while the map chunks load is the only basemap requested', async ({
	page
}) => {
	const styleRequests: string[] = [];
	await page.route('https://tiles.openfreemap.org/styles/*', async (route) => {
		styleRequests.push(route.request().url());
		await route.fulfill({
			json: {
				version: 8,
				sources: {},
				layers: [
					{ id: 'background', type: 'background', paint: { 'background-color': '#0000ff' } }
				]
			}
		});
	});
	// Hold back the chunk that carries Leaflet (its source names leafletjs.com),
	// so the theme can change between the effect starting and the map existing.
	let release!: () => void;
	const gate = new Promise<void>((resolve) => (release = resolve));
	await page.route('**/*.js', async (route) => {
		const response = await route.fetch();
		const body = await response.text();
		if (body.includes('leafletjs.com')) await gate;
		await route.fulfill({ response, body });
	});

	await page.goto(sitePath('/participants'));
	// The toolbar appears on hydration, by which point the map effect has run.
	await expect(page.getByLabel('Search participants')).toBeVisible();
	await page.evaluate(() => document.documentElement.classList.add('dark'));
	release();

	await expect(page.locator('.map-canvas canvas')).toBeVisible();
	await expect.poll(() => styleRequests.length).toBeGreaterThan(0);
	// A light style created mid-flip and then swapped by setStyle() could leave
	// a blank map; the map must start on the theme showing when it is built.
	await page.waitForTimeout(500);
	expect(styleRequests.every((url) => url.endsWith('/dark'))).toBe(true);
	await expect(page.getByText('The interactive map could not be loaded.')).toHaveCount(0);
});

test('a pin keeps the directory search and leaves a clean URL', async ({ page }) => {
	await page.goto(sitePath('/participants'));
	await expect(page.getByLabel('Search participants')).toBeVisible();
	const marker = page.locator('.custom-map-marker').first();
	await marker.scrollIntoViewIfNeeded();
	await marker.press('Enter');
	const search = page.getByLabel('Search participants');
	await expect(search).toBeFocused();
	await expect(search).not.toHaveValue('');
	await expect(page).toHaveURL(new RegExp(`${sitePath('/participants')}$`));
	await expect(page.getByRole('status').filter({ hasText: 'of' })).toContainText('participants');
});
