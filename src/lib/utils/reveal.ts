/**
 * Svelte action for scroll-triggered reveal animations
 * Uses Intersection Observer for performance
 * Respects prefers-reduced-motion
 */

import { prefersReducedMotion } from '#lib/utils/motion';

export interface RevealOptions {
	/**
	 * Intersection threshold (0-1, default 0).
	 * Keep this at 0 unless the observed element is guaranteed to be short:
	 * a fixed ratio can be unreachable for elements taller than the viewport,
	 * leaving them permanently hidden.
	 */
	threshold?: number;
	/**
	 * Root margin for earlier/later triggering.
	 * The default shrinks the viewport bottom so elements reveal once they are
	 * meaningfully on screen, independent of their own height.
	 */
	rootMargin?: string;
	/** Whether to only trigger once */
	once?: boolean;
}

const DEFAULT_OPTIONS: Required<RevealOptions> = {
	threshold: 0,
	rootMargin: '0px 0px -12% 0px',
	once: true
};

interface SharedObserver {
	observer: IntersectionObserver;
	/** Each observed node and whether it stops watching after its first reveal. */
	targets: Map<Element, boolean>;
}

/**
 * One observer per distinct threshold/rootMargin pair. A gallery page used to
 * build an observer per card (65 of them) for identical options; the browser
 * batches every target of one observer into a single callback instead.
 */
const sharedObservers = new Map<string, SharedObserver>();

function observe(node: HTMLElement, threshold: number, rootMargin: string, once: boolean) {
	const key = `${threshold}|${rootMargin}`;
	let shared = sharedObservers.get(key);
	if (!shared) {
		const targets = new Map<Element, boolean>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const targetOnce = targets.get(entry.target);
					if (targetOnce === undefined) continue;
					if (entry.isIntersecting) {
						entry.target.classList.add('revealed');
						if (targetOnce) release(key, entry.target);
					} else if (!targetOnce) {
						entry.target.classList.remove('revealed');
					}
				}
			},
			{ threshold, rootMargin }
		);
		shared = { observer, targets };
		sharedObservers.set(key, shared);
	}
	shared.targets.set(node, once);
	shared.observer.observe(node);
	return key;
}

/** Stop watching one node; drop the observer once nothing is left on it. */
function release(key: string, node: Element) {
	const shared = sharedObservers.get(key);
	if (!shared || !shared.targets.delete(node)) return;
	shared.observer.unobserve(node);
	if (shared.targets.size === 0) {
		shared.observer.disconnect();
		sharedObservers.delete(key);
	}
}

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	if (prefersReducedMotion()) {
		// Immediately show content without animation
		node.classList.add('revealed');
		return { destroy: () => {} };
	}

	// Add 'animating' class to enable CSS transitions (SSR-safe pattern)
	// This allows content to be visible during SSR, then animate when JS loads
	node.classList.add('animating');

	function start(opts: RevealOptions) {
		const { threshold, rootMargin, once } = { ...DEFAULT_OPTIONS, ...opts };
		return observe(node, threshold, rootMargin, once);
	}

	let currentKey = start(options);

	return {
		destroy() {
			release(currentKey, node);
		},
		update(newOptions: RevealOptions) {
			release(currentKey, node);
			currentKey = start({ ...options, ...newOptions });
		}
	};
}
