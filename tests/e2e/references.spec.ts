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
