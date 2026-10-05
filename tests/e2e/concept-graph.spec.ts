import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures';
import { sitePath } from './helpers';

test('concept search supports result-button and combobox keyboard activation', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(sitePath('/concepts'));
	await expect(page.locator('.node-group').first()).toBeVisible();
	const search = page.getByRole('combobox', { name: 'Search concepts' });
	await search.fill('archive');
	const result = page.locator('.search-result-btn').first();
	const label = await result.locator('.search-result-label').innerText();
	await result.focus();
	await page.keyboard.press('Enter');
	await expect(
		page.getByRole('button', { name: `Clear selection: ${label}`, exact: true })
	).toBeVisible();
	await search.fill('archive');
	await search.press('ArrowDown');
	await search.press('Enter');
	await expect(page.locator('.selection-pill')).toBeVisible();
	await expect(search).toHaveValue('');
});

test('group buttons announce their toggled state', async ({ page }) => {
	await page.goto(sitePath('/concepts'));
	const filter = page
		.getByRole('group', { name: 'Filter concepts by group' })
		.getByRole('button', { name: 'Extended', exact: true });
	await expect(filter).toHaveAttribute('aria-pressed', 'true');
	await filter.click();
	await expect(filter).toHaveAttribute('aria-pressed', 'false');
	await page.getByRole('button', { name: 'All', exact: true }).click();
	await expect(filter).toHaveAttribute('aria-pressed', 'true');
});

test('reduced-motion graph fits after resize and leaves node positions stationary', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 1200, height: 900 });
	await page.goto(sitePath('/concepts'));
	await expect(page.locator('.node-group').first()).toHaveAttribute('transform', /^translate\(/);
	const positions = () =>
		page
			.locator('.node-group')
			.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('transform')));
	const before = await positions();
	await page.setViewportSize({ width: 390, height: 700 });
	await page.getByRole('button', { name: 'Recenter graph' }).click();
	await expect
		.poll(async () =>
			page.locator('.graph-svg').evaluate((svg) => {
				const bounds = svg.getBoundingClientRect();
				return Array.from(svg.querySelectorAll('.node-group')).every((node) => {
					const rect = node.getBoundingClientRect();
					return (
						rect.left >= bounds.left &&
						rect.right <= bounds.right &&
						rect.top >= bounds.top &&
						rect.bottom <= bounds.bottom
					);
				});
			})
		)
		.toBe(true);
	await expect.poll(positions).toEqual(before);
});

test('short embeds allow selected details and the text directory to scroll into view', async ({
	page
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 800, height: 400 });
	await page.goto(sitePath('/concepts/embed'));
	const search = page.getByRole('combobox', { name: 'Search concepts' });
	await expect(page.locator('.node-group').first()).toBeVisible();
	await search.fill('archive');
	await search.press('Enter');
	await page.locator('.detail-panel').scrollIntoViewIfNeeded();
	await expect(page.locator('.detail-panel')).toBeInViewport();
	const directory = page.locator('.graph-text-view > summary');
	await directory.scrollIntoViewIfNeeded();
	await expect(directory).toBeInViewport();
});

test('failed D3 chunk leaves a retry control and a working text directory', async ({ page }) => {
	const manifest = JSON.parse(
		readFileSync('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
	);
	const chunk = manifest['node_modules/d3-force/src/index.js'].file as string;
	await page.route(`**/${chunk}`, (route) => route.abort());
	await page.goto(sitePath('/concepts'));
	await expect(
		page.getByText('The interactive graph could not be loaded.', { exact: true })
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Reload page and retry' })).toBeVisible();
	await expect(page.locator('.graph-text-view')).toHaveAttribute('open', '');
	const first = page.locator('.graph-text-list details').first();
	await first.locator('summary').click();
	await expect(first.getByText('Connected to:', { exact: true })).toBeVisible();
	await page.unroute(`**/${chunk}`);
	await page.getByRole('button', { name: 'Reload page and retry' }).click();
	await expect(page.locator('.node-group').first()).toHaveAttribute('transform', /^translate\(/);
});

test.describe('concept directory without JavaScript', () => {
	test.use({ javaScriptEnabled: false });
	test('all concepts and relationships are available as native disclosures', async ({ page }) => {
		await page.goto(sitePath('/concepts'));
		await page.locator('.graph-text-view > summary').click();
		const concepts = page.locator('.graph-text-list details');
		expect(await concepts.count()).toBeGreaterThan(100);
		await concepts.first().locator('summary').click();
		await expect(concepts.first().getByText('Connected to:', { exact: true })).toBeVisible();
	});
});

test('mobile detail sheet is opaque and leaves the searched node in view', async ({
	page,
	isMobile
}) => {
	test.skip(!isMobile, 'The bottom sheet is the phone layout');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(sitePath('/concepts'));
	await expect(page.locator('.node-group').first()).toHaveAttribute('transform', /^translate\(/);
	const search = page.getByRole('combobox', { name: 'Search concepts' });
	await search.fill('Data Sovereignty');
	await search.press('Enter');
	const sheet = page.getByRole('dialog', { name: 'Data Sovereignty' });
	await expect(sheet).toBeVisible();
	await expect(page.getByRole('button', { name: 'Close detail panel' })).toBeFocused();
	// The sheet overlays the graph; a translucent one showed labels through its text
	expect(await sheet.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/^rgb\(/);
	await expect(page.locator('.scroll-to-top')).toBeHidden();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const node = document
					.querySelector('.node-group[aria-pressed="true"]')!
					.getBoundingClientRect();
				const sheetTop = document.querySelector('.detail-panel')!.getBoundingClientRect().top;
				const y = node.top + node.height / 2;
				return y > 0 && y < sheetTop;
			})
		)
		.toBe(true);
});

test('fullscreen falls back to an expanded stage without the Fullscreen API', async ({ page }) => {
	// iPhone Safari has no element fullscreen, and the button used to do nothing
	await page.addInitScript(() => {
		delete (Element.prototype as Partial<Element>).requestFullscreen;
	});
	await page.goto(sitePath('/concepts'));
	await expect(page.locator('.node-group').first()).toBeVisible();
	await page.getByRole('button', { name: 'Fullscreen', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Exit fullscreen' })).toBeVisible();
	const viewport = page.viewportSize()!;
	await expect
		.poll(() => page.locator('.concept-graph-wrapper').boundingBox())
		.toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });
	// Neither the sticky header nor the back-to-top button paints over the stage
	const covered = await page.evaluate(() =>
		[
			[innerWidth / 2, 4],
			[innerWidth - 46, innerHeight - 46]
		].every(([x, y]) => document.elementFromPoint(x, y)?.closest('.concept-graph-wrapper'))
	);
	expect(covered).toBe(true);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Fullscreen', exact: true })).toBeVisible();
});
