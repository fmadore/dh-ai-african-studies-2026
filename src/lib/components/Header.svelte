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
		{ href: resolveAppPath('/position-paper'), label: 'Position Paper' },
		{ href: resolveAppPath('/references'), label: 'References' }
	] as const;
</script>

<header class="bg-page padding-block-xl padding-inline-lg relative z-(--z-overlay)">
	<Navbar class="content-width-wide surface-panel surface-padding-xs">
		<NavBrand href={navLinks[0].href} class="logo-link">
			<span class="self-center whitespace-nowrap text-xl font-display font-bold tracking-tight text-gradient drop-shadow-md pb-1">
				DH & AI in African Studies
			</span>
		</NavBrand>
		<div class="flex md:order-2 gap-2">
			<ThemeToggle />
			<NavHamburger class="nav-hamburger" />
		</div>
		<NavUl {activeUrl} class="nav-links nav-menu">
			{#each navLinks as link (link.href)}
				<NavLi href={link.href}>{link.label}</NavLi>
			{/each}
		</NavUl>
	</Navbar>
</header>

<style>
	/* Mobile menu animation */
	:global(.nav-hamburger) {
		transition: transform var(--transition-fast), opacity var(--transition-fast);
	}

	:global(.nav-hamburger:hover) {
		transform: scale(1.05);
	}

	:global(.nav-hamburger:active) {
		transform: scale(0.95);
	}

	/* Animate mobile menu appearance */
	:global(.nav-menu) {
		transition: opacity var(--transition-base), transform var(--transition-base);
	}

	@media (max-width: 767px) {
		:global(.nav-menu[hidden]) {
			opacity: 0;
			transform: translateY(-0.5rem);
		}

		:global(.nav-menu:not([hidden])) {
			opacity: 1;
			transform: translateY(0);
			animation: slideDown 0.2s ease-out;
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
