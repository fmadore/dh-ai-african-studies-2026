import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const routes = [
	'/',
	'/about',
	'/schedule',
	'/participants',
	'/concepts',
	'/photos',
	'/interviews',
	'/references',
	'/position-paper'
];

const themes = ['light', 'dark'] as const;

async function setTheme(page: Page, theme: string) {
	await page.evaluate((selectedTheme) => {
		document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
	}, theme);
}

async function expectNoBrokenImages(page: Page) {
	const failed = await page
		.locator('img')
		.evaluateAll((images) =>
			(images as HTMLImageElement[])
				.filter((image) => image.complete && image.naturalWidth === 0)
				.map((image) => image.getAttribute('src'))
		);
	expect(failed).toEqual([]);
}

test.describe('public route smoke checks', () => {
	for (const theme of themes) {
		for (const route of routes) {
			test(`${theme} ${route}`, async ({ page }) => {
				await page.goto(route);
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
	await page.goto('/about');

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
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	await page.getByRole('button', { name: 'Dark mode' }).click({ timeout: 15_000 });
	await expect(page.locator('html')).toHaveClass(/dark/);
});

test('ARIA ID references resolve to one existing element', async ({ page }) => {
	for (const route of routes) {
		await page.goto(route);
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
	await page.goto('/photos');
	await page.waitForLoadState('networkidle');
	await page
		.getByRole('button', { name: /^View / })
		.first()
		.click({ timeout: 15_000 });
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Shift+Tab');
	expect(
		await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)
	).toBe(true);

	await page.goto('/concepts');
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
	for (const route of ['/about', '/participants', '/concepts', '/photos', '/references']) {
		test(`axe: ${theme} ${route}`, async ({ page }) => {
			await page.emulateMedia({ reducedMotion: 'reduce' });
			await page.goto(route);
			await setTheme(page, theme);
			await page.waitForTimeout(100);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();
			expect(results.violations).toEqual([]);
		});
	}
}
