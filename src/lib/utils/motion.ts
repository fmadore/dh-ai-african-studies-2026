/**
 * Returns `true` when the user has requested reduced motion.
 * SSR-safe: returns `false` on the server.
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
