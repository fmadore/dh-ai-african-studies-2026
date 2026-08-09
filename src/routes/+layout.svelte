<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isEmbed = $derived(page.url.pathname.endsWith('/embed'));
</script>

{#if isEmbed}
	{@render children?.()}
{:else}
	<div class="app-shell bg-page flex min-h-screen flex-col">
		<a class="skip-link" href="#main-content">Skip to main content</a>

		<!-- Navigation -->
		<Header />

		<!-- Main Content -->
		<main id="main-content" class="relative z-10 flex-1" tabindex="-1">
			{@render children?.()}
		</main>

		<!-- Footer -->
		<Footer />
	</div>

	<ScrollToTop />
{/if}

<style>
	.skip-link {
		position: fixed;
		z-index: var(--z-notification);
		inset-block-start: var(--space-sm);
		inset-inline-start: var(--space-md);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-control);
		background: var(--surface-ink);
		color: var(--color-gray-50);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		transform: translateY(calc(-100% - var(--space-md)));
		transition: transform var(--transition-micro);
	}

	.skip-link:focus-visible {
		transform: translateY(0);
	}
</style>
