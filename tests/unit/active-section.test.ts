import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeActiveSection } from '#lib/utils/active-section';

type Entry = { target: Element; isIntersecting: boolean };

let callback: (entries: Entry[]) => void;
let options: { rootMargin?: string } = {};
const disconnect = vi.fn();

class FakeObserver {
	constructor(cb: (entries: Entry[]) => void, opts: { rootMargin?: string }) {
		callback = cb;
		options = opts;
	}
	observe() {}
	disconnect = disconnect;
}

function heading(id: string, top: number) {
	return { id, top, getBoundingClientRect() { return { top: this.top }; } } as unknown as
		HTMLElement & { top: number };
}

describe('observeActiveSection', () => {
	beforeEach(() => {
		vi.stubGlobal('IntersectionObserver', FakeObserver);
		vi.stubGlobal('window', { innerHeight: 1000 });
		disconnect.mockReset();
	});
	afterEach(() => vi.unstubAllGlobals());

	it('keeps state across batches and falls back to the last heading above the band', () => {
		const a = heading('a', 100);
		const b = heading('b', 900);
		const seen: string[] = [];
		const stop = observeActiveSection([a, b], (id) => seen.push(id));
		expect(options.rootMargin).toBe('-20% 0px -70% 0px');

		callback([{ target: a, isIntersecting: true }]);
		// B enters while A is still in the band: the topmost stays active
		callback([{ target: b, isIntersecting: true }]);
		expect(seen).toEqual(['a', 'a']);
		// A leaves through the top: B
		callback([{ target: a, isIntersecting: false }]);
		expect(seen.at(-1)).toBe('b');

		// Scrolling back up: B leaves through the bottom into the tail of A
		a.top = -400;
		b.top = 850;
		callback([{ target: b, isIntersecting: false }]);
		expect(seen.at(-1)).toBe('a');

		stop();
		expect(disconnect).toHaveBeenCalled();
	});

	it('reports nothing above the first heading', () => {
		const seen: string[] = [];
		observeActiveSection([heading('a', 600)], (id) => seen.push(id));
		callback([{ target: heading('x', 0), isIntersecting: false }]);
		expect(seen).toEqual([]);
	});
});
