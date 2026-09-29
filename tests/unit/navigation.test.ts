import { describe, expect, it } from 'vitest';
import {
	isNavigationGroupActive,
	isNavigationLinkActive,
	primaryNavigation
} from '$lib/data/navigation';
import { nextGraphNode } from '$lib/components/concept-graph/graph-navigation';
import type { ConceptNode } from '$lib/types/concept-graph';

describe('primary navigation state', () => {
	it('matches the home link only on the root', () => {
		expect(isNavigationLinkActive('/', '/')).toBe(true);
		expect(isNavigationLinkActive('/', '/about')).toBe(false);
	});

	it('matches nested routes and tolerates trailing slashes', () => {
		expect(isNavigationLinkActive('/position-paper', '/position-paper/read')).toBe(true);
		expect(isNavigationLinkActive('/position-paper', '/position-paper/')).toBe(true);
		expect(isNavigationLinkActive('/photos', '/photos-archive')).toBe(false);
	});

	it('marks the Outcomes group active on any of its child routes', () => {
		const outcomes = primaryNavigation.find((link) => link.children)!;
		expect(isNavigationGroupActive(outcomes, '/references')).toBe(true);
		expect(isNavigationGroupActive(outcomes, '/schedule')).toBe(false);
	});
});

describe('concept graph keyboard navigation', () => {
	const node = (id: string, x?: number, y?: number): ConceptNode =>
		({ id, label: id, group: 'Extended', seed: false, degree: 1, x, y }) as ConceptNode;

	it('follows the layout in the pressed direction', () => {
		const nodes = [
			node('centre', 0, 0),
			node('right', 50, 5),
			node('far', 200, 0),
			node('up', 0, -40)
		];
		expect(nextGraphNode(nodes, 'centre', 'ArrowRight')?.id).toBe('right');
		expect(nextGraphNode(nodes, 'centre', 'ArrowUp')?.id).toBe('up');
		expect(nextGraphNode(nodes, 'right', 'ArrowLeft')?.id).toBe('centre');
	});

	it('falls back to source order before the simulation has positions', () => {
		const nodes = [node('a'), node('b'), node('c')];
		expect(nextGraphNode(nodes, 'a', 'ArrowRight')?.id).toBe('b');
		expect(nextGraphNode(nodes, 'a', 'ArrowLeft')?.id).toBe('c');
		expect(nextGraphNode(nodes, 'b', 'End')?.id).toBe('c');
		expect(nextGraphNode([], 'a', 'Home')).toBeUndefined();
	});
});
