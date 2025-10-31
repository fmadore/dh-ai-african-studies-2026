<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from 'flowbite-svelte';
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
	<main class="flex-1">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<Footer class="mt-auto border-t">
		<div class="w-full text-center">
			<FooterCopyright by="Volkswagen Foundation" year={2026} />
			<FooterLinkGroup class="mt-3 flex-wrap justify-center">
				<FooterLink href="/about">About</FooterLink>
				<FooterLink href="/contact">Contact</FooterLink>
				<FooterLink href="/privacy">Privacy Policy</FooterLink>
			</FooterLinkGroup>
		</div>
	</Footer>
</div>
