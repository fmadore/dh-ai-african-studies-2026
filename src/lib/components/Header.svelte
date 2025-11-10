<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	
	let activeUrl = $derived(page.url.pathname);
</script>

<Navbar class="border-b bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-800">
	<NavBrand href="/" class="hover:opacity-80 transition-opacity">
		<span class="self-center whitespace-nowrap text-xl font-semibold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400">
			DH & AI in African Studies
		</span>
	</NavBrand>
	<div class="flex md:order-2 gap-2">
		<ThemeToggle />
		<NavHamburger />
	</div>
	<NavUl {activeUrl} class="[&>li>a]:hover:text-primary-600 dark:[&>li>a]:hover:text-primary-400 [&>li>a.active]:text-primary-700 dark:[&>li>a.active]:text-primary-500">
		<NavLi href="/">Home</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/participants">Participants</NavLi>
		<NavLi href="/schedule">Schedule</NavLi>
	</NavUl>
</Navbar>
