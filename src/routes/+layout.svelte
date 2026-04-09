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
	<div class="bg-page relative flex min-h-screen flex-col overflow-x-hidden">
		<!-- Navigation -->
		<Header />

		<!-- Main Content -->
		<main class="relative z-10 flex-1">
			{@render children?.()}
		</main>

		<!-- Footer -->
		<Footer />
	</div>

	<ScrollToTop />
{/if}
