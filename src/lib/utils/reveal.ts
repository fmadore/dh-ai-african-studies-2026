/**
 * Svelte action for scroll-triggered reveal animations
 * Uses Intersection Observer for performance
 * Respects prefers-reduced-motion
 */

import { prefersReducedMotion } from '$lib/utils/motion';

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

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	if (prefersReducedMotion()) {
		// Immediately show content without animation
		node.classList.add('revealed');
		return { destroy: () => {} };
	}

	// Add 'animating' class to enable CSS transitions (SSR-safe pattern)
	// This allows content to be visible during SSR, then animate when JS loads
	node.classList.add('animating');

	function createObserver(opts: RevealOptions): IntersectionObserver {
		const { threshold, rootMargin, once } = { ...DEFAULT_OPTIONS, ...opts };

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						node.classList.add('revealed');
						if (once) {
							observer.unobserve(node);
						}
					} else if (!once) {
						node.classList.remove('revealed');
					}
				});
			},
			{ threshold, rootMargin }
		);

		observer.observe(node);
		return observer;
	}

	let currentObserver = createObserver(options);

	return {
		destroy() {
			currentObserver.disconnect();
		},
		update(newOptions: RevealOptions) {
			currentObserver.disconnect();
			currentObserver = createObserver({ ...options, ...newOptions });
		}
	};
}
