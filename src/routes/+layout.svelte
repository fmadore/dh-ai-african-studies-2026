<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Footer, FooterCopyright, FooterLinkGroup, FooterLink, DarkMode } from 'flowbite-svelte';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
	let activeUrl = $derived(page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Digital Humanities and AI in African Studies 2026</title>
	<meta name="description" content="Charting New Territory: Digital Humanities and AI in African Studies - A conference funded by Volkswagen Foundation" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Navigation -->
	<Navbar class="border-b">
		<NavBrand href="/">
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				DH & AI in African Studies
			</span>
		</NavBrand>
		<div class="flex md:order-2 gap-2">
			<DarkMode class="text-primary-500 dark:text-primary-600" />
			<NavHamburger />
		</div>
		<NavUl {activeUrl}>
			<NavLi href="/">Home</NavLi>
			<NavLi href="/about">About</NavLi>
			<NavLi href="/schedule">Schedule</NavLi>
			<NavLi href="/speakers">Speakers</NavLi>
			<NavLi href="/register">Register</NavLi>
		</NavUl>
	</Navbar>

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
