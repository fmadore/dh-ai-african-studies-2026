import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { sitePath } from './helpers';

const routes = [
	'/',
	'/about',
	'/schedule',
	'/participants',
	'/concepts',
	'/photos',
	'/interviews',
	'/references',
	'/publications',
	'/position-paper',
	'/position-paper/read'
];

const themes = ['light', 'dark'] as const;

async function setTheme(page: Page, theme: string) {
	await page.evaluate((selectedTheme) => {
		document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
	}, theme);
}

/** The site's own images only: a YouTube thumbnail that fails to load says
 * nothing about this build, and made the check depend on a third party. */
async function expectNoBrokenImages(page: Page) {
	await page.locator('img:visible').evaluateAll(async (images) => {
		await Promise.all(
			images.map(async (image) => {
				const img = image as HTMLImageElement;
				const rect = img.getBoundingClientRect();
				const inViewport =
					rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
				if (
					new URL(img.currentSrc || img.src).origin === location.origin &&
					(img.loading !== 'lazy' || inViewport)
				) {
					// Trigger viewport images even before the browser's lazy-load task runs.
					img.loading = 'eager';
					await img.decode().catch(() => {});
				}
			})
		);
	});
	const failed = await page.locator('img').evaluateAll((images) =>
		(images as HTMLImageElement[])
			.filter((image) => new URL(image.currentSrc || image.src).origin === location.origin)
			.filter((image) => image.complete && image.naturalWidth === 0)
			.map((image) => image.getAttribute('src'))
	);
	expect(failed).toEqual([]);
}

test.describe('public route smoke checks', () => {
	for (const theme of themes) {
		for (const route of routes) {
			test(`${theme} ${route}`, async ({ page }) => {
				await page.goto(sitePath(route));
				await setTheme(page, theme);

				await expect(page.locator('main')).toHaveCount(1);
				await expect(page.locator('h1')).toHaveCount(1);
				if (theme === 'dark') {
					await expect(page.locator('html')).toHaveClass(/dark/);
				} else {
					await expect(page.locator('html')).not.toHaveClass(/dark/);
				}
				await expectNoBrokenImages(page);
			});
		}
	}
});

test('About stays within a mobile viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto(sitePath('/about'));

	const overflows = await page.locator('.about-layout, .section-nav').evaluateAll((elements) => {
		const viewportWidth = document.documentElement.clientWidth;
		return elements
			.filter((element) => element.getBoundingClientRect().right > viewportWidth + 1)
			.map((element) => ({
				className: element.className,
				right: element.getBoundingClientRect().right,
				viewportWidth
			}));
	});
	expect(overflows).toEqual([]);
});

test('theme toggle updates the document theme', async ({ page }) => {
	await page.goto(sitePath('/'));
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Dark mode' }).click({ timeout: 15_000 });
	await expect(page.locator('html')).toHaveClass(/dark/);
});

test('Outcomes disclosure opens, and closes when focus leaves it', async ({ page, isMobile }) => {
	test.skip(isMobile, 'the mobile menu nests Outcomes inside the hamburger panel');
	await page.goto(sitePath('/'));
	const toggle = page.getByRole('button', { name: 'Outcomes' });
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await expect(page.locator('#site-nav-outcomes')).toBeVisible();

	// Five links inside, then out of the group
	for (let step = 0; step < 6; step += 1) await page.keyboard.press('Tab');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(page.locator('#site-nav-outcomes')).toBeHidden();
});

test('reference filters live in the URL and survive a reload', async ({ page }) => {
	await page.goto(sitePath('/references?type=book&sort=title'));
	const book = page.getByRole('checkbox', { name: 'Book', exact: true });
	const filterButton = page.locator('.mobile-filters button');
	if (await filterButton.isVisible()) await filterButton.click();

	await expect(book).toBeChecked();
	await expect(page.getByLabel('Sort by')).toHaveValue('title');

	await page.getByRole('checkbox', { name: 'Report', exact: true }).check();
	await expect(page).toHaveURL(/\?type=book&type=report&sort=title$/);
	await page.reload();
	if (await filterButton.isVisible()) await filterButton.click();
	await expect(page.getByRole('checkbox', { name: 'Report', exact: true })).toBeChecked();
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('the desktop reference filters are part of the prerendered page', async ({
		page,
		isMobile
	}) => {
		test.skip(isMobile, 'below lg the filters are a sheet the Filters button opens');
		await page.goto(sitePath('/references'));
		await expect(page.locator('#reference-filters')).toBeVisible();
		await expect(page.locator('.mobile-filters')).toBeHidden();
	});
});

test('ARIA ID references resolve to one existing element', async ({ page }) => {
	for (const route of routes) {
		await page.goto(sitePath(route));
		const brokenReferences = await page
			.locator('[aria-controls], [aria-describedby], [aria-labelledby]')
			.evaluateAll((elements) => {
				const attributes = ['aria-controls', 'aria-describedby', 'aria-labelledby'];
				return elements.flatMap((element) =>
					attributes.flatMap((attribute) => {
						const value = element.getAttribute(attribute);
						return value
							? value
									.split(/\s+/u)
									.filter(
										(id) => document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length !== 1
									)
									.map((id) => ({ attribute, id, outerHTML: element.outerHTML.slice(0, 160) }))
							: [];
					})
				);
			});
		expect(brokenReferences, route).toEqual([]);
	}
});

test('photo dialog traps focus and graph controls remain keyboard reachable', async ({ page }) => {
	await page.goto(sitePath('/photos'));
	await page.waitForLoadState('networkidle');
	const opener = page.getByRole('button', { name: /^View / }).first();
	await opener.click({ timeout: 15_000 });
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Shift+Tab');
	expect(
		await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)
	).toBe(true);
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();

	await page.goto(sitePath('/concepts'));
	const nodes = page.locator('.node-group[role="button"]');
	await expect(nodes.first()).toBeVisible({ timeout: 15_000 });
	await expect(page.locator('.node-group[role="button"][tabindex="0"]')).toHaveCount(1);
	await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Zoom out' })).toBeVisible();

	const firstNode = page.locator('.node-group[role="button"][tabindex="0"]');
	await firstNode.focus();
	await page.keyboard.press('ArrowRight');
	expect(
		await page.evaluate(() => document.activeElement?.matches('.node-group[role="button"]'))
	).toBe(true);
});

for (const theme of themes) {
	for (const route of routes) {
		test(`axe: ${theme} ${route}`, async ({ page }) => {
			await page.emulateMedia({ reducedMotion: 'reduce' });
			await page.goto(sitePath(route));
			await setTheme(page, theme);
			await page.waitForTimeout(100);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();
			expect(results.violations).toEqual([]);
		});
	}
}
