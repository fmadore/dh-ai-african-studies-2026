import { describe, expect, it } from 'vitest';
import { fitGraphView } from '$lib/components/concept-graph/graph-viewport';
import type { ConceptNode } from '$lib/types/concept-graph';

const node = (id: string, x: number, y: number, degree = 10): ConceptNode => ({
	id,
	label: id,
	group: 'Extended',
	seed: false,
	degree,
	x,
	y
});
const radius = (degree: number) => degree;

describe('fit graph to viewport', () => {
	it('fits circle bounds after a desktop-to-mobile resize, including nodes outside the old canvas', () => {
		const nodes = [
			node('left', -200, 100, 20),
			node('right', 1200, 300),
			node('bottom', 500, 900, 15)
		];
		for (const [width, height] of [
			[1200, 700],
			[350, 400],
			[700, 240]
		]) {
			const view = fitGraphView(nodes, width, height, radius);
			for (const n of nodes) {
				expect((n.x! - radius(n.degree)) * view.k + view.x).toBeGreaterThanOrEqual(31);
				expect((n.x! + radius(n.degree)) * view.k + view.x).toBeLessThanOrEqual(width - 31);
				expect((n.y! - radius(n.degree)) * view.k + view.y).toBeGreaterThanOrEqual(31);
				expect((n.y! + radius(n.degree)) * view.k + view.y).toBeLessThanOrEqual(height - 31);
			}
		}
	});

	it('handles empty and unpositioned data without invalid transforms', () => {
		expect(fitGraphView([], 350, 400, radius)).toEqual({ x: 0, y: 0, k: 1 });
		expect(fitGraphView([node('pending', NaN, NaN)], 350, 400, radius)).toEqual({
			x: 0,
			y: 0,
			k: 1
		});
		const view = fitGraphView([node('only', 100, 150)], 350, 400, radius);
		expect(view.k).toBeLessThanOrEqual(1.4);
		expect(100 * view.k + view.x).toBe(175);
		expect(150 * view.k + view.y).toBe(200);
	});
});
