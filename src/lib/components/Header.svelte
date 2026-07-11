<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import { resolveAppPath } from '$lib/utils/paths';

	let activeUrl = $derived(page.url.pathname);
	let menuOpen = $state(false);

	const homeHref = resolveAppPath('/');

	const navLinks = [
		{ href: homeHref, label: 'Home' },
		{ href: resolveAppPath('/about'), label: 'About' },
		{ href: resolveAppPath('/participants'), label: 'Participants' },
		{ href: resolveAppPath('/concepts'), label: 'Concepts' },
		{ href: resolveAppPath('/schedule'), label: 'Schedule' },
		{ href: resolveAppPath('/position-paper'), label: 'Position Paper' },
		{ href: resolveAppPath('/references'), label: 'References' },
		{ href: resolveAppPath('/photos'), label: 'Photos' },
		{ href: resolveAppPath('/interviews'), label: 'Interviews' }
	] as const;

	function stripTrailingSlash(path: string): string {
		return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
	}

	/**
	 * Trailing-slash-tolerant match that also highlights parent routes for
	 * nested paths (e.g. /participants/x keeps Participants active).
	 * The Home link only matches exactly, so it doesn't light up everywhere.
	 */
	function isActive(href: string, current: string): boolean {
		const target = stripTrailingSlash(href);
		const path = stripTrailingSlash(current);
		if (target === stripTrailingSlash(homeHref)) {
			return path === target;
		}
		return path === target || path.startsWith(`${target}/`);
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}}
/>

<header class="bg-page padding-inline-lg relative z-(--z-overlay) py-3">
	<nav class="content-width-wide surface-panel surface-padding-xs">
		<div class="nav-bar">
			<a href={resolveAppPath('/')} class="logo-link">
				<span class="brand-wordmark"> DH &amp; AI in African Studies </span>
			</a>

			<div class="nav-actions">
				<ThemeToggle />
				<button
					type="button"
					class="nav-hamburger"
					aria-label="Toggle navigation menu"
					aria-expanded={menuOpen}
					aria-controls="site-nav-menu"
					onclick={toggleMenu}
				>
					<svg
						class="h-5 w-5"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 17 14"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M1 1h15M1 7h15M1 13h15"
						/>
					</svg>
				</button>
			</div>

			<div class="nav-menu" class:nav-menu--open={menuOpen} id="site-nav-menu">
				<ul class="nav-links">
					{#each navLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								class="nav-link"
								class:active={isActive(link.href, activeUrl)}
								aria-current={isActive(link.href, activeUrl) ? 'page' : undefined}
								onclick={closeMenu}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</nav>
</header>

<style>
	.brand-wordmark {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-bold);
		font-size: var(--text-xl);
		letter-spacing: var(--tracking-tight);
		color: var(--text-primary);
		white-space: nowrap;
		padding-bottom: 0.125rem;
		align-self: center;
	}

	.nav-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-shrink: 0;
	}

	/* Hamburger */
	.nav-hamburger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xs);
		border-radius: var(--radius-md);
		color: var(--text-muted);
		background-color: transparent;
		cursor: pointer;
		transition:
			background-color var(--transition-micro),
			color var(--transition-micro);
	}

	.nav-hamburger:hover {
		background-color: var(--bg-sunken);
		color: var(--text-primary);
	}

	/* Nav menu wrapper — hidden by default on small screens */
	.nav-menu {
		display: none;
		width: 100%;
		padding: var(--space-sm) 0;
	}

	.nav-menu--open {
		display: block;
		animation: navSlideDown 220ms var(--ease-standard);
	}

	.nav-links {
		display: flex;
		flex-direction: column;
		list-style: none;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		margin: 0;
		padding: 0;
		gap: var(--space-3xs);
	}

	.nav-link {
		display: block;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		transition:
			color var(--transition-micro),
			background-color var(--transition-micro);
	}

	.nav-link:hover {
		background-color: var(--bg-sunken);
		color: var(--text-primary);
	}

	.nav-link.active {
		background-color: var(--accent-soft);
		color: var(--text-link);
	}

	/* Desktop: inline nav at 1280px+ */
	@media (min-width: 1280px) {
		.nav-hamburger {
			display: none;
		}

		.nav-menu,
		.nav-menu--open {
			display: flex;
			align-items: center;
			width: auto;
			padding: 0;
			animation: none;
		}

		.nav-actions {
			order: 2;
		}

		.nav-links {
			flex-direction: row;
			gap: var(--space-3xs);
		}

		.nav-link {
			border-radius: var(--radius-full);
			padding-inline: var(--space-md);
			padding-block: var(--space-2xs);
		}

		.nav-link:hover:not(.active) {
			background-color: var(--accent-soft);
			color: var(--text-link);
		}

		.nav-link.active {
			background-color: var(--accent-soft);
			color: var(--text-link);
			box-shadow: var(--glow-accent);
		}
	}

	@keyframes navSlideDown {
		from {
			opacity: 0;
			transform: translateY(-0.4rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-menu--open {
			animation: none;
		}
	}
</style>
