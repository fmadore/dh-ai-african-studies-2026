/**
 * Svelte action for scroll-triggered reveal animations
 * Uses Intersection Observer for performance
 * Respects prefers-reduced-motion
 */

export interface RevealOptions {
	/** Threshold for triggering (0-1, default 0.15) */
	threshold?: number;
	/** Root margin for earlier/later triggering */
	rootMargin?: string;
	/** Whether to only trigger once */
	once?: boolean;
}

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
	const { threshold = 0.15, rootMargin = '0px', once = true } = options;

	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReducedMotion) {
		// Immediately show content without animation
		node.classList.add('revealed');
		return { destroy: () => {} };
	}

	// Add 'animating' class to enable CSS transitions (SSR-safe pattern)
	// This allows content to be visible during SSR, then animate when JS loads
	node.classList.add('animating');

	let currentObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					node.classList.add('revealed');
					if (once) {
						currentObserver.unobserve(node);
					}
				} else if (!once) {
					node.classList.remove('revealed');
				}
			});
		},
		{ threshold, rootMargin }
	);

	currentObserver.observe(node);

	return {
		destroy() {
			currentObserver.disconnect();
		},
		update(newOptions: RevealOptions) {
			// Re-observe with new options if needed
			currentObserver.disconnect();
			currentObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							node.classList.add('revealed');
							if (newOptions.once ?? once) {
								currentObserver.unobserve(node);
							}
						} else if (!(newOptions.once ?? once)) {
							node.classList.remove('revealed');
						}
					});
				},
				{
					threshold: newOptions.threshold ?? threshold,
					rootMargin: newOptions.rootMargin ?? rootMargin
				}
			);
			currentObserver.observe(node);
		}
	};
}
