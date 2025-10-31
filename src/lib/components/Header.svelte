<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	
	let activeUrl = $derived(page.url.pathname);
</script>

<Navbar class="border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
	<NavBrand href="/">
		<span class="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
			DH & AI in African Studies
		</span>
	</NavBrand>
	<div class="flex md:order-2 gap-2">
		<ThemeToggle />
		<NavHamburger />
	</div>
	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/schedule">Schedule</NavLi>
		<NavLi href="/speakers">Speakers</NavLi>
	</NavUl>
</Navbar>
