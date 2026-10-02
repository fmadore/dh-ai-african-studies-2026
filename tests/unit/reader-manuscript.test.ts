import { expect, it } from 'vitest';
import source from '$lib/content/position-paper.md?raw';
import references from '$lib/data/references.json';
import { processPaper } from '$lib/reader/process-paper';
import type { CslReference } from '$lib/reader/types';

it('resolves the published manuscript citations and all generated internal targets', () => {
	const paper = processPaper(source, references as unknown as CslReference[]);
	expect(paper.citations.issues).toEqual([]);
	expect(paper.citations.linked).toBe(78);
	const ids = [...paper.html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
	expect(new Set(ids).size).toBe(ids.length);
	for (const [, target] of paper.html.matchAll(/\bhref="#([^"]+)"/g)) {
		expect(ids, `Missing fragment target ${target}`).toContain(decodeURIComponent(target));
	}
	for (const item of paper.toc) expect(ids).toContain(item.id);
});
