import { createSubscriber } from 'svelte/reactivity';

/**
 * Reactive dark mode detection shared across components.
 * Uses MutationObserver on <html> class list to track Flowbite's dark mode toggle.
 */
export function useDarkMode() {
	const subscriber = createSubscriber((update) => {
		if (typeof window === 'undefined') return;
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'class') update();
			}
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	let isDark = $derived.by(() => {
		if (typeof window === 'undefined') return false;
		subscriber();
		return document.documentElement.classList.contains('dark');
	});

	return {
		get isDark() {
			return isDark;
		}
	};
}
