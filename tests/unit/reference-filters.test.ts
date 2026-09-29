import { describe, expect, it } from 'vitest';
import { ReferenceFilterState } from '$lib/utils/reference-filters.svelte';

describe('reference filter state', () => {
	it('round-trips through the query string, omitting defaults', () => {
		const filters = new ReferenceFilterState();
		filters.readFrom(
			new URLSearchParams('q=archive&type=book&tag=AI&tag=Archives&lang=fr&sort=title')
		);

		expect(filters.criteria).toEqual({
			searchQuery: 'archive',
			selectedTypes: ['book'],
			selectedYears: [],
			selectedTags: ['AI', 'Archives'],
			selectedLanguages: ['fr']
		});
		expect(filters.selectedSort).toBe('title');
		expect(filters.activeCount).toBe(5);

		const params = new URLSearchParams();
		filters.writeTo(params);
		expect(params.toString()).toBe('q=archive&type=book&tag=AI&tag=Archives&lang=fr&sort=title');
	});

	it('ignores an unknown sort and writes nothing for the unfiltered list', () => {
		const filters = new ReferenceFilterState();
		filters.readFrom(new URLSearchParams('sort=random'));
		const params = new URLSearchParams();
		filters.writeTo(params);

		expect(filters.selectedSort).toBe('newest');
		expect(params.toString()).toBe('');
	});

	it('changes its key with the result set, and resets everything', () => {
		const filters = new ReferenceFilterState();
		const initial = filters.key;
		filters.toggleTag('AI');
		expect(filters.key).not.toBe(initial);
		filters.toggleTag('AI');
		expect(filters.key).toBe(initial);

		filters.readFrom(new URLSearchParams('q=x&year=2024&sort=oldest'));
		filters.reset();
		expect(filters.activeCount).toBe(0);
		expect(filters.selectedSort).toBe('newest');
		expect(filters.key).toBe(initial);
	});
});
