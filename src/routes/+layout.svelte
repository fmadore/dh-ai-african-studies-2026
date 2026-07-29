<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isEmbed = $derived(page.url.pathname.endsWith('/embed'));

	/**
	 * The ambient dot mesh is a single fixed layer on the shell rather than a
	 * per-section div. It is suppressed on the concept map, where a 32px dot
	 * lattice sits directly behind a force layout of dots.
	 */
	let suppressMesh = $derived(page.url.pathname.replace(/\/$/, '').endsWith('/concepts'));
</script>

{#if isEmbed}
	{@render children?.()}
{:else}
	<div class="app-shell bg-page flex min-h-screen flex-col" class:app-shell--no-mesh={suppressMesh}>
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
