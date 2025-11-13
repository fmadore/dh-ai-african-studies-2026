<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import { resolveAppPath } from '$lib/utils/paths';

	let activeUrl = $derived(page.url.pathname);

	const navLinks = [
		{ href: resolveAppPath('/'), label: 'Home' },
		{ href: resolveAppPath('/about'), label: 'About' },
		{ href: resolveAppPath('/participants'), label: 'Participants' },
		{ href: resolveAppPath('/schedule'), label: 'Schedule' },
		{ href: resolveAppPath('/position-paper'), label: 'Position Paper' }
	] as const;
</script>

<header class="bg-page py-6 px-4">
	<Navbar class="content-width-wide surface-panel surface-padding-xs">
		<NavBrand href={navLinks[0].href} class="hover:opacity-80 transition-opacity">
			<span class="self-center whitespace-nowrap text-xl font-semibold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400">
				DH & AI in African Studies
			</span>
		</NavBrand>
		<div class="flex md:order-2 gap-2">
			<ThemeToggle />
			<NavHamburger />
		</div>
		<NavUl {activeUrl} class="text-sm font-medium [&>li>a]:rounded-full [&>li>a]:px-4 [&>li>a]:py-2 [&>li>a]:transition-colors [&>li>a:hover]:bg-primary-50 [&>li>a:hover]:text-primary-600 dark:[&>li>a:hover]:bg-white/5 dark:[&>li>a:hover]:text-primary-300 [&>li>a.active]:bg-primary-100 [&>li>a.active]:text-primary-700 dark:[&>li>a.active]:bg-white/10 dark:[&>li>a.active]:text-primary-200">
		{#each navLinks as link (link.href)}
			<NavLi href={link.href}>{link.label}</NavLi>
		{/each}
	</NavUl>
	</Navbar>
</header>
