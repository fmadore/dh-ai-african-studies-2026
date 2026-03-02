<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-page relative overflow-x-hidden">
	<!-- Navigation -->
	<Header />

	<!-- Main Content -->
	<main class="flex-1 relative z-10">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<Footer />
</div>

<ScrollToTop />
