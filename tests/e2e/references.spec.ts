import { test, expect } from './fixtures';
import { sitePath } from './helpers';
import records from '../../src/lib/data/references.json' with { type: 'json' };

for (const format of ['bib', 'ris'] as const) {
	test(`filtered bibliography downloads complete ${format} records`, async ({ page }) => {
		await page.goto(sitePath('/references?type=book'));
		await expect(page.locator('.filter-chip').first()).toContainText('Book');
		await page.getByRole('button', { name: 'Export to Zotero' }).click();
		const downloadPromise = page.waitForEvent('download');
		await page
			.getByText(format === 'bib' ? 'BibTeX (.bib)' : 'RIS (.ris)', { exact: true })
			.click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toBe(`dh-ai-african-studies-references.${format}`);
		const stream = await download.createReadStream();
		const chunks: Buffer[] = [];
		for await (const chunk of stream) chunks.push(Buffer.from(chunk));
		const text = Buffer.concat(chunks).toString('utf8');
		const entries = text.match(format === 'bib' ? /^@\w+\{/gm : /^TY {2}- /gm) ?? [];
		expect(entries).toHaveLength(records.filter((record) => record.type === 'book').length);
	});
}

test('failed reference export can retry the data request', async ({ page }) => {
	let requests = 0;
	await page.route('**/references/data.json', async (route) => {
		requests++;
		if (requests === 1) await route.abort();
		else await route.continue();
	});
	await page.goto(sitePath('/references'));
	await page.getByRole('button', { name: 'Export to Zotero' }).click();
	await page.getByText('BibTeX (.bib)', { exact: true }).click();
	await expect(
		page.getByText('The export could not load the reference data', { exact: false })
	).toBeVisible();
	await page.getByRole('button', { name: 'Export to Zotero' }).click();
	const download = page.waitForEvent('download');
	await page.getByText('BibTeX (.bib)', { exact: true }).click();
	await download;
	await expect(page.locator('.export-failed')).toHaveCount(0);
	expect(requests).toBe(2);
});

test('navigation to the unfiltered bibliography resets reused page state', async ({ page }) => {
	await page.goto(sitePath('/references?q=archives'));
	await expect(page.locator('.filter-chip').first()).toContainText('archives');
	await page.locator('footer').getByRole('link', { name: 'References', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`${sitePath('/references')}$`));
	await expect(page.locator('.filter-chip')).toHaveCount(0);
});

test('"Clear all" removes every filter but keeps the sort order', async ({ page }) => {
	await page.goto(sitePath('/references?q=archives&type=book&sort=title'));
	await expect(page.locator('.filter-chip')).toHaveCount(2);
	await page.locator('.active-filters').getByRole('button', { name: 'Clear all' }).click();
	await expect(page.locator('.filter-chip')).toHaveCount(0);
	await expect(page).toHaveURL(new RegExp(`${sitePath('/references')}\\?sort=title$`));
	await expect(page.getByLabel('Sort by')).toHaveValue('title');
});

test('the result count is announced as a status', async ({ page }) => {
	await page.goto(sitePath('/references?per=50'));
	const status = page.getByRole('status').filter({ hasText: 'Showing' });
	// "1–50" is only shown once the query string has been read: hydrated.
	await expect(status).toContainText('1–50');
	const filtersToggle = page.locator('.mobile-filters button');
	if (await filtersToggle.isVisible()) await filtersToggle.click();
	await page.getByLabel('Search', { exact: true }).pressSequentially('archives', { delay: 30 });
	await expect(page).toHaveURL(/\?q=archives&per=50$/);
	await expect(status).toContainText('Showing');
	// Typing kept its field: the URL write is a shallow navigation.
	await expect(page.getByLabel('Search', { exact: true })).toBeFocused();
	await expect(page.getByLabel('Search', { exact: true })).toHaveValue('archives');
});

test('turning a page keeps the clicked button and moves focus to the results', async ({
	page
}) => {
	await page.goto(sitePath('/references?page=4'));
	const pagination = page.getByRole('navigation', { name: 'References pagination' });
	await expect(pagination.getByRole('button', { name: 'Page 4' })).toHaveAttribute(
		'aria-current',
		'page'
	);
	const pageFive = await pagination.getByRole('button', { name: 'Page 5' }).elementHandle();
	await pagination.getByRole('button', { name: 'Page 5' }).click();
	await expect(page).toHaveURL(/[?&]page=5$/);
	// Keyed by page number: the same element is now the current page, rather
	// than a reused slot relabelled "6".
	await expect.poll(() => pageFive!.getAttribute('aria-current')).toBe('page');
	expect(await pageFive!.textContent()).toContain('5');
	await expect(page.getByRole('region', { name: 'Results' })).toBeFocused();
});
