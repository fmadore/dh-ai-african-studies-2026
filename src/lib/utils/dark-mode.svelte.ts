import { createSubscriber } from 'svelte/reactivity';

/**
 * Reactive dark mode detection shared across components.
 * Uses MutationObserver on <html> class list to track Flowbite's dark mode toggle.
 *
 * Module-level singleton: every consumer shares one subscriber (and therefore
 * one MutationObserver) instead of each component creating its own.
 * createSubscriber starts the observer on first subscription and stops it when
 * the last subscriber goes away.
 */
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

const darkMode = {
	get isDark() {
		if (typeof window === 'undefined') return false;
		subscriber();
		return document.documentElement.classList.contains('dark');
	}
};

export function useDarkMode() {
	return darkMode;
}
