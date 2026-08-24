<script lang="ts">
	import { DarkMode } from 'flowbite-svelte';

	let wrapper: HTMLElement | undefined = $state();

	/**
	 * Suppress every transition for the length of the flip. Base styles animate
	 * `color` on all links and buttons, so swapping the theme animated the whole
	 * page across — and any element whose transition was interrupted part-way
	 * kept the *old* theme's colour for good, leaving light-page links sitting
	 * at the dark-mode teal. Two frames is enough for the class swap to paint.
	 */
	function guardThemeSwap() {
		const root = document.documentElement;
		root.classList.add('theme-switching');
		requestAnimationFrame(() => {
			requestAnimationFrame(() => root.classList.remove('theme-switching'));
		});
	}

	// Capture phase, so the guard is in place before the toggle flips the class.
	$effect(() => {
		const el = wrapper;
		if (!el) return;
		el.addEventListener('click', guardThemeSwap, true);
		return () => el.removeEventListener('click', guardThemeSwap, true);
	});
</script>

<span bind:this={wrapper} class="contents">
	<DarkMode
		class="text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 min-h-11 min-w-11 transition-colors"
	/>
</span>
