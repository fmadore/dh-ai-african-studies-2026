import { describe, expect, it } from 'vitest';
import {
	buildAdjacency,
	sortedNeighbors,
	withGroupActive
} from '#lib/components/concept-graph/graph-selection';
import type { ConceptGroup, ConceptNode } from '#lib/types/concept-graph';

describe('graph selection', () => {
	it('counts each neighbour once, even when a pair is linked in both directions', () => {
		const resolved = { id: 'b' } as ConceptNode;
		const adjacency = buildAdjacency([
			{ source: 'a', target: 'b' },
			{ source: resolved, target: 'a' },
			{ source: 'c', target: 'a' }
		]);
		expect(sortedNeighbors(adjacency, 'a')).toEqual(['b', 'c']);
		expect(sortedNeighbors(adjacency, 'b')).toEqual(['a']);
		expect(sortedNeighbors(adjacency, 'missing')).toEqual([]);
	});

	it("re-enables a hidden neighbour's group and leaves an active one untouched", () => {
		const active = new Set<ConceptGroup>(['The Archive']);
		expect(withGroupActive(active, 'The Archive')).toBe(active);
		const next = withGroupActive(active, 'Extended');
		expect([...next].sort()).toEqual(['Extended', 'The Archive']);
		expect(active.has('Extended')).toBe(false);
	});
});
