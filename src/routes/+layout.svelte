<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import favicon from '$lib/assets/favicon.png';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

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
