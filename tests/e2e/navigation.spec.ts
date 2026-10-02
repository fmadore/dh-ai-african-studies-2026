import { expect, test } from './fixtures';
import { sitePath } from './helpers';

const themes = [
	'Methodological Integration & Digital Preservation',
	'Fostering Equitable Collaboration',
	'Ethical Frameworks & Digital Sovereignty'
];

test.describe('prerendered archive without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('all programme days remain readable and section links work', async ({ page }) => {
		await page.goto(sitePath('/schedule?day=day2'));
		for (const theme of themes)
			await expect(page.getByRole('heading', { name: theme, exact: true })).toBeVisible();
		await page
			.getByRole('navigation', { name: 'Programme days' })
			.getByRole('link', { name: /Day 3/ })
			.click();
		await expect(page).toHaveURL(/#.*day3-panel$/);
		await expect(page.locator('.day-list')).toHaveCount(3);
	});

	test('directory, biographies and thematic groups are readable', async ({ page }) => {
		await page.goto(sitePath('/participants?view=groups'));
		await expect(page.locator('.participant-grid')).toBeVisible();
		await expect(
			page.locator('.participant-card__name').filter({ hasText: 'Frédérick Madore' }).first()
		).toBeVisible();
		await expect(page.locator('.participant-card__detail').first()).toBeVisible();
		await expect(page.locator('.thematic-group').first()).toBeVisible();
	});
});

test('programme tabs hydrate deep links and support roving keyboard navigation', async ({
	page
}) => {
	await page.goto(sitePath('/schedule?source=archive&day=day2'));
	const first = page.getByRole('tab', { name: /Day 1/ });
	const second = page.getByRole('tab', { name: /Day 2/ });
	const third = page.getByRole('tab', { name: /Day 3/ });
	await expect(second).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByRole('tabpanel')).toHaveCount(1);
	await second.focus();
	await second.press('ArrowRight');
	await expect(third).toBeFocused();
	await expect(third).toHaveAttribute('aria-selected', 'true');
	await expect(page).toHaveURL(/source=archive&day=day3$/);
	await third.press('ArrowRight');
	await expect(first).toBeFocused();
	await expect(first).toHaveAttribute('aria-selected', 'true');
	await expect(page).toHaveURL(/\?source=archive$/);
	await first.press('End');
	await expect(third).toBeFocused();
	await expect(third).toHaveAttribute('aria-selected', 'true');
	await third.press('Home');
	await expect(first).toBeFocused();
	await expect(first).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
	await page.emulateMedia({ media: 'print' });
	for (let index = 0; index < themes.length; index++)
		await expect(page.locator('.day-head').nth(index)).toHaveCSS('opacity', '1');
	for (const theme of themes)
		await expect(page.getByRole('heading', { name: theme, exact: true })).toBeVisible();
});

test('map pins switch from thematic groups to the filtered participant directory', async ({
	page
}) => {
	await page.goto(sitePath('/participants?view=groups'));
	await expect(page.getByRole('tab', { name: 'By Thematic Group' })).toHaveAttribute(
		'aria-selected',
		'true'
	);
	const pin = page.locator('.custom-map-marker').first();
	await expect(pin).toBeVisible();
	const affiliation = (await pin.getAttribute('aria-label'))!.split(' from ')[1];
	await pin.press('Enter');
	await expect(page.getByRole('tab', { name: 'All Participants' })).toHaveAttribute(
		'aria-selected',
		'true'
	);
	await expect(page.getByLabel('Search participants')).toHaveValue(affiliation);
	await expect(page.getByLabel('Search participants')).toBeFocused();
	await expect(page.locator('.participant-grid')).toBeVisible();
});

test('gallery selection follows same-route navigation and browser Back', async ({ page }) => {
	await page.goto(sitePath('/photos?day=Day%201'));
	await expect(page.getByRole('button', { name: /^Day 1 / })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	// Exercise an ordinary SvelteKit link without replacing the mounted gallery.
	await page.evaluate((href) => {
		const link = document.createElement('a');
		link.href = href;
		link.textContent = 'Next gallery day';
		document.querySelector('main')!.prepend(link);
	}, sitePath('/photos?day=Day%202'));
	await page.getByRole('link', { name: 'Next gallery day' }).click();
	await expect(page.getByRole('button', { name: /^Day 2 / })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(page.locator('.photo-day')).toHaveCount(1);
	await expect(page.locator('.photo-day')).toHaveAttribute('aria-label', 'Day 2');
	await page.goBack();
	await expect(page.getByRole('button', { name: /^Day 1 / })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.getByRole('button', { name: /^All / }).click();
	await expect(page.locator('.photo-day')).toHaveCount(3);
	await expect(page).not.toHaveURL(/day=/);
});

test('failed basemap styles show a useful fallback and can be retried', async ({ page }) => {
	let failStyle = true;
	await page.route('https://tiles.openfreemap.org/styles/*', (route) =>
		failStyle ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.fallback()
	);
	await page.goto(sitePath('/participants'));
	await expect(page.getByText('The interactive map could not be loaded.')).toBeVisible();
	await expect(page.locator('.participant-grid')).toBeVisible();
	failStyle = false;
	await page.getByRole('button', { name: 'Retry map' }).click();
	await expect(page.locator('.map-canvas canvas')).toBeVisible();
	await expect(page.getByText('The interactive map could not be loaded.')).toBeHidden();
	await expect(page.locator('.custom-map-marker').first()).toBeVisible();
});

test('tile errors retain the map and participant controls', async ({ page }) => {
	await page.route('https://tiles.openfreemap.org/styles/*', (route) =>
		route.fulfill({
			json: {
				version: 8,
				sources: {
					unavailable: {
						type: 'raster',
						tiles: ['https://tiles.invalid.test/{z}/{x}/{y}.png'],
						tileSize: 256
					}
				},
				layers: [{ id: 'raster', type: 'raster', source: 'unavailable' }]
			}
		})
	);
	await page.route('https://tiles.invalid.test/**', (route) =>
		route.fulfill({ status: 503, body: 'Unavailable' })
	);
	await page.goto(sitePath('/participants'));
	await expect(
		page.getByText('Some map tiles could not be loaded.', { exact: false })
	).toBeVisible();
	await expect(page.locator('.map-canvas canvas')).toBeVisible();
	await expect(page.locator('.custom-map-marker').first()).toBeVisible();
	await expect(page.getByText('The interactive map could not be loaded.')).toBeHidden();
});
