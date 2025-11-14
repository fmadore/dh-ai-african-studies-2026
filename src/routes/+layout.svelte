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

<div class="flex min-h-screen flex-col bg-page">
	<!-- Navigation -->
	<Header />

	<!-- Main Content -->
	<main class="flex-1 stack-lg bg-page-soft">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<Footer />
</div>
