import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { sitePath } from './helpers';

async function openHydratedReader(page: Page) {
	await page.goto(sitePath('/position-paper/read'));
	// The controls already exist in the static HTML. Anchor-copy buttons are
	// inserted by ReaderProse's effect after hydration has attached handlers.
	await expect(page.locator('.anchor-copy-button').first()).toBeAttached();
}

test('reader section navigation preserves Back and Forward routing', async ({ page, isMobile }) => {
	await openHydratedReader(page);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	if (isMobile) await page.getByRole('button', { name: 'Sections', exact: true }).click();
	const toc = page.getByRole('navigation', { name: 'Table of contents' }).filter({ visible: true });
	await toc.getByRole('link', { name: '1 Introduction', exact: true }).click();
	await expect(page).toHaveURL(/#1-introduction$/);
	await page.locator('footer').getByRole('link', { name: 'Participants', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`${sitePath('/participants')}/?$`));
	await page.goBack();
	await expect(page.locator('.reader-prose')).toBeVisible();
	await expect(page).toHaveURL(/\/position-paper\/read\/?#1-introduction$/);
	await page.goForward();
	await expect(page.locator('.reader-prose')).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${sitePath('/participants')}/?$`));
});

test('modified section clicks retain ordinary new-tab behavior', async ({
	page,
	context,
	isMobile
}) => {
	test.skip(isMobile, 'modifier-key clicks are a desktop interaction');
	await openHydratedReader(page);
	const originalUrl = page.url();
	const link = page
		.getByRole('navigation', { name: 'Table of contents' })
		.getByRole('link', { name: '1 Introduction', exact: true });
	const [opened] = await Promise.all([
		context.waitForEvent('page'),
		link.click({ modifiers: ['ControlOrMeta'] })
	]);
	await expect(opened).toHaveURL(/#1-introduction$/);
	expect(page.url()).toBe(originalUrl);
	await opened.close();
});

test('citation dialog restores focus and follows through to the bibliography', async ({ page }) => {
	await openHydratedReader(page);
	const citation = page.locator('a[data-cite]').first();
	const target = await citation.getAttribute('href');
	await citation.focus();
	await citation.click();
	const dialog = page.getByRole('dialog', { name: 'Reference', exact: true });
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(citation).toBeFocused();
	await citation.click();
	await dialog.getByRole('button', { name: 'Show in the reference list' }).click();
	await expect(dialog).toBeHidden();
	await expect(page).toHaveURL(new RegExp(`${target}$`));
	await expect(page.locator(target!)).toBeInViewport();
});

test('reader preferences survive reload and are scoped to the reader route', async ({ page }) => {
	await openHydratedReader(page);
	await page.getByRole('button', { name: 'Set font to accessible', exact: true }).click();
	await page.getByRole('button', { name: 'Largest text', exact: true }).click();
	await page.reload();
	await expect(page.locator('.anchor-copy-button').first()).toBeAttached();
	await expect(page.locator('html')).toHaveAttribute('data-reader-font', 'accessible');
	await expect(page.locator('html')).toHaveAttribute('data-reader-size', '130');
	await expect(page.getByRole('button', { name: 'Largest text', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await page.locator('footer').getByRole('link', { name: 'About', exact: true }).click();
	await expect(page.locator('html')).not.toHaveAttribute('data-reader-font');
	await expect(page.locator('html')).not.toHaveAttribute('data-reader-size');
});

test.describe('reader without JavaScript', () => {
	test.use({ javaScriptEnabled: false });
	test('citations and notes remain ordinary working fragment links', async ({ page }) => {
		await page.goto(sitePath('/position-paper/read'));
		const citation = page.locator('a[data-cite]').first();
		const citationTarget = await citation.getAttribute('href');
		await citation.click();
		await expect(page.locator(citationTarget!)).toBeInViewport();
		const note = page.locator('sup[data-footnote-ref] a').first();
		const noteTarget = await note.getAttribute('href');
		await note.click();
		await expect(page.locator(noteTarget!)).toBeInViewport();
	});
});
