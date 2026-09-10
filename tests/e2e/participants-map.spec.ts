import { expect, test } from '@playwright/test';
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
	await page.goto(`${process.env.BASE_PATH || ''}/participants`);
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
	await page.goto(`${process.env.BASE_PATH || ''}/participants`);
	await expect(page.getByText('The interactive map could not be loaded.')).toBeVisible();
	await expect(
		page.getByText(
			'The directory above lists every participant with their affiliation and country.'
		)
	).toBeVisible();
});
