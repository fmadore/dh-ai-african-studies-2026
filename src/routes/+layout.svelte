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
	<!-- Global ambient background -->
	<div class="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
		<div class="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary-500 opacity-5 blur-[120px]"></div>
		<div class="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary-500 opacity-5 blur-[120px]"></div>
	</div>

	<!-- Navigation -->
	<Header />

	<!-- Main Content -->
	<main class="flex-1 relative z-10">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<Footer />
</div>
