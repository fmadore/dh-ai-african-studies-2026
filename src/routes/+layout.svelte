<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Digital Humanities and AI in African Studies 2026</title>
	<meta name="description" content="Charting New Territory: Digital Humanities and AI in African Studies - A conference funded by Volkswagen Foundation" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Navigation -->
	<Header />

	<!-- Main Content -->
	<main class="flex-1 bg-page">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<Footer />
</div>
