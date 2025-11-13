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
		<NavBrand href={navLinks[0].href} class="logo-link">
			<span class="self-center whitespace-nowrap text-xl font-semibold text-gradient">
				DH & AI in African Studies
			</span>
		</NavBrand>
		<div class="flex md:order-2 gap-2">
			<ThemeToggle />
			<NavHamburger />
		</div>
		<NavUl {activeUrl} class="nav-links">
			{#each navLinks as link (link.href)}
				<NavLi href={link.href}>{link.label}</NavLi>
			{/each}
		</NavUl>
	</Navbar>
</header>
