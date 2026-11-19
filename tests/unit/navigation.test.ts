import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveAppPath } from '#lib/utils/paths';
import {
	footerNavigation,
	isNavigationGroupActive,
	isNavigationLinkActive,
	primaryNavigation
} from '#lib/data/navigation';
import { nextGraphNode } from '#lib/components/concept-graph/graph-navigation';
import type { ConceptNode } from '#lib/types/concept-graph';

describe('primary navigation state', () => {
	it('matches the home link only on the root', () => {
		expect(isNavigationLinkActive(resolveAppPath('/'), resolveAppPath('/'))).toBe(true);
		expect(isNavigationLinkActive(resolveAppPath('/'), resolveAppPath('/about'))).toBe(false);
	});

	it('matches nested routes and tolerates trailing slashes', () => {
		expect(isNavigationLinkActive('/position-paper', '/position-paper/read')).toBe(true);
		expect(isNavigationLinkActive('/position-paper', '/position-paper/')).toBe(true);
		expect(isNavigationLinkActive('/photos', '/photos-archive')).toBe(false);
	});

	it('marks the Outcomes group active on any of its child routes', () => {
		const outcomes = primaryNavigation.find((link) => link.children)!;
		expect(isNavigationGroupActive(outcomes, resolveAppPath('/references'))).toBe(true);
		expect(isNavigationGroupActive(outcomes, resolveAppPath('/schedule'))).toBe(false);
	});
});

describe('footer navigation', () => {
	const prefix = resolveAppPath('/').replace(/\/$/, '');
	const internal = footerNavigation
		.flatMap((column) => column.links)
		.filter((link) => !link.external);

	it('renders the same columns, labels and order as before', () => {
		expect(
			footerNavigation.map((column) => ({
				title: column.title,
				links: column.links.map((link) => [link.label, link.href])
			}))
		).toEqual([
			{
				title: 'Workshop',
				links: [
					['About', resolveAppPath('/about')],
					['Schedule', resolveAppPath('/schedule')],
					['Participants', resolveAppPath('/participants')]
				]
			},
			{
				title: 'Outcomes',
				links: [
					['Position paper', resolveAppPath('/position-paper')],
					['Publications & reports', resolveAppPath('/publications')],
					['Photos', resolveAppPath('/photos')],
					['Interviews', resolveAppPath('/interviews')]
				]
			},
			{
				title: 'Resources',
				links: [
					['References', resolveAppPath('/references')],
					['Concept map', resolveAppPath('/concepts')],
					['Source code', 'https://github.com/fmadore/dh-ai-african-studies-2026']
				]
			}
		]);
	});

	it('links every internal entry to a real route', () => {
		for (const link of internal) {
			const route = link.href.slice(prefix.length).replace(/^\//, '');
			expect(existsSync(`src/routes/${route}/+page.svelte`), link.href).toBe(true);
		}
	});

	it('shares its routes with the header rather than redeclaring them', () => {
		const headerHrefs = primaryNavigation.flatMap((link) => [
			link.href,
			...(link.children ?? []).map((child) => child.href)
		]);
		for (const link of internal) expect(headerHrefs).toContain(link.href);
	});

	it('marks only off-site links as external', () => {
		for (const link of footerNavigation.flatMap((column) => column.links)) {
			expect(Boolean(link.external), link.href).toBe(/^https?:\/\//.test(link.href));
		}
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
