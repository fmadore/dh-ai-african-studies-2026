<script lang="ts">
	import { page } from "$app/state";
	import ThemeToggle from "./ThemeToggle.svelte";
	import { resolveAppPath } from "$lib/utils/paths";

	let activeUrl = $derived(page.url.pathname);
	let menuOpen = $state(false);

	const navLinks = [
		{ href: resolveAppPath("/"), label: "Home" },
		{ href: resolveAppPath("/about"), label: "About" },
		{ href: resolveAppPath("/participants"), label: "Participants" },
		{ href: resolveAppPath("/concepts"), label: "Concepts" },
		{ href: resolveAppPath("/schedule"), label: "Schedule" },
		{ href: resolveAppPath("/position-paper"), label: "Position Paper" },
		{ href: resolveAppPath("/references"), label: "References" },
		{ href: resolveAppPath("/photos"), label: "Photos" },
		{ href: resolveAppPath("/interviews"), label: "Interviews" },
	] as const;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<header class="bg-page py-3 padding-inline-lg relative z-(--z-overlay)">
	<nav class="content-width-wide surface-panel surface-padding-xs">
		<div class="nav-bar">
			<a href={resolveAppPath("/")} class="logo-link">
				<span class="self-center whitespace-nowrap text-xl font-display font-bold tracking-tight heading-color-light drop-shadow-md pb-1">
					DH & AI in African Studies
				</span>
			</a>

			<div class="nav-actions">
				<ThemeToggle />
				<button
					type="button"
					class="nav-hamburger"
					aria-label="Toggle navigation menu"
					aria-expanded={menuOpen}
					onclick={toggleMenu}
				>
					<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
						<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
					</svg>
				</button>
			</div>

			<div class="nav-menu" class:nav-menu--open={menuOpen}>
				<ul class="nav-links">
					{#each navLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								class="nav-link"
								class:active={activeUrl === link.href}
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
	.nav-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* Hamburger button */
	.nav-hamburger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: var(--radius-lg);
		color: var(--color-gray-500);
		cursor: pointer;
		transition: transform var(--transition-fast), opacity var(--transition-fast);
	}

	.nav-hamburger:hover {
		background-color: var(--color-gray-100);
		transform: scale(1.05);
	}

	:global(.dark) .nav-hamburger:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.nav-hamburger:active {
		transform: scale(0.95);
	}

	/* Nav menu wrapper — hidden by default (mobile) */
	.nav-menu {
		display: none;
		width: 100%;
		padding: var(--space-sm) 0;
	}

	.nav-menu--open {
		display: block;
		animation: slideDown 0.25s var(--ease-spring);
	}

	.nav-links {
		display: flex;
		flex-direction: column;
		list-style: none;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
	}

	/* Individual nav link */
	.nav-link {
		display: block;
		padding: 0.5rem 1rem 0.5rem 0.75rem;
		border-radius: var(--radius-sm);
		color: var(--color-gray-700);
		text-decoration: none;
		transition: color var(--transition-fast), background-color var(--transition-fast);
	}

	:global(.dark) .nav-link {
		color: var(--color-gray-400);
	}

	.nav-link:hover {
		background-color: var(--color-gray-100);
		color: var(--color-primary-600);
	}

	:global(.dark) .nav-link:hover {
		background-color: rgba(255, 255, 255, 0.05);
		color: var(--color-primary-300);
	}

	.nav-link.active {
		background-color: var(--color-secondary-100);
		color: var(--color-secondary-700);
	}

	:global(.dark) .nav-link.active {
		background-color: rgba(13, 148, 136, 0.15);
		color: var(--color-secondary-300);
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
		}

		.nav-link {
			border-radius: var(--radius-full);
			padding-inline: var(--space-sm);
			padding-block: calc(var(--space-sm) * 0.8);
		}

		.nav-link:hover {
			background-color: var(--color-primary-50);
			color: var(--color-primary-600);
		}

		:global(.dark) .nav-link:hover {
			background-color: rgba(255, 255, 255, 0.05);
			color: var(--color-primary-300);
		}

		.nav-link.active {
			box-shadow: 0 0 12px -3px rgba(13, 148, 136, 0.3);
		}

		:global(.dark) .nav-link.active {
			box-shadow: 0 0 16px -4px rgba(13, 148, 136, 0.4);
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

	@media (prefers-reduced-motion: reduce) {
		.nav-menu--open {
			animation: none;
		}
	}
</style>
