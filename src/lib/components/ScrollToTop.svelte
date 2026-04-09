<script lang="ts">
	import { ArrowUpOutline } from 'flowbite-svelte-icons';

	let visible = $state(false);

	function handleScroll() {
		visible = window.scrollY > 300;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
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
		border: 1px solid var(--color-secondary-200);
		background-color: var(--color-surface-0);
		color: var(--color-secondary-600);
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-base);
		animation: fade-in 300ms var(--ease-out);
	}

	:global(.dark) .scroll-to-top {
		background-color: var(--color-surface-dark-elevated);
		border-color: var(--color-secondary-800);
		color: var(--color-secondary-400);
		box-shadow: var(--shadow-dark-md);
	}

	.scroll-to-top:hover {
		background-color: var(--color-secondary-600);
		border-color: var(--color-secondary-600);
		color: white;
		box-shadow: var(--shadow-secondary);
		transform: translateY(-2px);
	}

	:global(.dark) .scroll-to-top:hover {
		background-color: var(--color-secondary-600);
		border-color: var(--color-secondary-500);
		box-shadow: var(--shadow-dark-glow-secondary);
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
