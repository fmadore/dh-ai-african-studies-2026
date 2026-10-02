import { describe, expect, it } from 'vitest';
import { processPaper } from '$lib/reader/process-paper';
import type { CslReference } from '$lib/reader/types';

const reference: CslReference = {
	id: '123/ABC',
	type: 'book',
	title: 'An Example',
	author: [{ family: 'Smith', given: 'John' }],
	issued: { 'date-parts': [[2024]] }
};

describe('CSL footnote rendering', () => {
	it('preserves distinct locators in static notes and reuses identical citations', () => {
		const { html, resolvedRefs } = processPaper(
			'One[^ref:123/ABC, 12]. Two[^ref:123/ABC, 48]. Again[^ref:123/ABC, 12 ].',
			[reference]
		);
		expect(html.match(/class="footnote-item"/g)).toHaveLength(2);
		expect(html).toContain('Cited location: 12.');
		expect(html).toContain('Cited location: 48.');
		expect(html).toContain('href="#fn1" id="fnref1:1"');
		expect(Object.keys(resolvedRefs)).toEqual(['123--ABC']);
	});

	it('does not collide with ordinary notes or similarly named reference keys', () => {
		const { html } = processPaper(
			'One[^ref:123/ABC, 12]. Two[^ref:123/ABC-12]. Note[^1].\n\n[^1]: An ordinary note.',
			[reference, { ...reference, id: '123/ABC-12', title: 'A Different Work' }]
		);
		expect(html.match(/class="footnote-item"/g)).toHaveLength(3);
		expect(html).toContain('A Different Work');
		expect(html).toContain('An ordinary note.');
	});

	it('escapes locator markup and keeps missing reference keys visible', () => {
		const { html } = processPaper('One[^ref:123/ABC, <script>]. Missing[^ref:unknown].', [
			reference
		]);
		expect(html).toContain('Cited location: &lt;script&gt;.');
		expect(html).not.toContain('<script>');
		expect(html).toContain('[?unknown ref: unknown]');
	});
});
