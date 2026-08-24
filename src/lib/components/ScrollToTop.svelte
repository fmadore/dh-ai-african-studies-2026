<script lang="ts">
	import { ArrowUpOutline } from 'flowbite-svelte-icons';

	let visible = $state(false);

	function handleScroll() {
		visible = window.scrollY > 300;
	}

	// Compute initial visibility (back-navigation restore, anchor deep links)
	$effect(() => {
		handleScroll();
	});

	function scrollToTop() {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	}
</script>

<svelte:window onscroll={handleScroll} />

{#if visible}
	<button onclick={scrollToTop} aria-label="Scroll to top" class="scroll-to-top">
		<ArrowUpOutline class="h-5 w-5" />
	</button>
{/if}

<style>
	.scroll-to-top {
		position: fixed;
		bottom: var(--space-lg);
		right: var(--space-lg);
		z-index: var(--z-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--border-accent);
		background-color: var(--bg-raised);
		color: var(--accent);
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition:
			transform var(--transition-base),
			box-shadow var(--transition-base),
			background-color var(--transition-base),
			color var(--transition-base);
		animation: fade-in 300ms var(--ease-standard);
	}

	.scroll-to-top:hover {
		background-color: var(--accent);
		border-color: var(--accent);
		color: var(--text-on-accent);
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
	}

	.scroll-to-top:active {
		transform: translateY(0);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top {
			animation: none;
			transition: none;
		}
		.scroll-to-top:hover {
			transform: none;
		}
	}
</style>
