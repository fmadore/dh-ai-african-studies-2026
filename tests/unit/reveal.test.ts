import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reveal } from '#lib/utils/reveal';

type Callback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;

class FakeObserver {
	static instances: FakeObserver[] = [];
	observed = new Set<Element>();
	disconnected = false;
	constructor(
		public callback: Callback,
		public options: { threshold?: number; rootMargin?: string }
	) {
		FakeObserver.instances.push(this);
	}
	observe(node: Element) {
		this.observed.add(node);
	}
	unobserve(node: Element) {
		this.observed.delete(node);
	}
	disconnect() {
		this.disconnected = true;
		this.observed.clear();
	}
	fire(target: Element, isIntersecting: boolean) {
		this.callback([{ target, isIntersecting }]);
	}
}

function fakeNode() {
	const classes = new Set<string>();
	return {
		classList: {
			add: (name: string) => classes.add(name),
			remove: (name: string) => classes.delete(name),
			contains: (name: string) => classes.has(name)
		}
	} as unknown as HTMLElement;
}

describe('reveal action', () => {
	beforeEach(() => {
		FakeObserver.instances = [];
		vi.stubGlobal('IntersectionObserver', FakeObserver);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('shares one observer between nodes with the same options', () => {
		const a = fakeNode();
		const b = fakeNode();
		const ra = reveal(a);
		const rb = reveal(b);

		expect(FakeObserver.instances).toHaveLength(1);
		const [observer] = FakeObserver.instances;
		expect(observer.options.rootMargin).toBe('0px 0px -12% 0px');
		expect(observer.options.threshold).toBe(0);
		expect(a.classList.contains('animating')).toBe(true);

		observer.fire(a, true);
		expect(a.classList.contains('revealed')).toBe(true);
		expect(b.classList.contains('revealed')).toBe(false);
		// `once` (the default) stops watching a revealed node
		expect(observer.observed.has(a)).toBe(false);
		expect(observer.observed.has(b)).toBe(true);

		ra.destroy();
		rb.destroy();
		expect(observer.disconnected).toBe(true);
	});

	it('creates a separate observer for different options', () => {
		const ra = reveal(fakeNode());
		const rb = reveal(fakeNode(), { rootMargin: '0px' });
		expect(FakeObserver.instances).toHaveLength(2);
		ra.destroy();
		rb.destroy();
	});

	it('toggles revealed when once is false and cleans up on destroy', () => {
		const node = fakeNode();
		const action = reveal(node, { once: false });
		const [observer] = FakeObserver.instances;

		observer.fire(node, true);
		expect(node.classList.contains('revealed')).toBe(true);
		observer.fire(node, false);
		expect(node.classList.contains('revealed')).toBe(false);

		action.destroy();
		expect(observer.disconnected).toBe(true);
		// A late entry for a released node is ignored
		observer.fire(node, true);
		expect(node.classList.contains('revealed')).toBe(false);
	});

	it('re-observes with new options on update', () => {
		const node = fakeNode();
		const action = reveal(node);
		action.update?.({ rootMargin: '0px' });
		expect(FakeObserver.instances).toHaveLength(2);
		expect(FakeObserver.instances[0].disconnected).toBe(true);
		expect(FakeObserver.instances[1].observed.has(node)).toBe(true);
		action.destroy();
	});

	it('reveals immediately under reduced motion without observing', () => {
		vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
		const node = fakeNode();
		reveal(node);
		expect(node.classList.contains('revealed')).toBe(true);
		expect(node.classList.contains('animating')).toBe(false);
		expect(FakeObserver.instances).toHaveLength(0);
	});
});
