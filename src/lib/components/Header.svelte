<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';
	import {
		homeHref,
		isNavigationGroupActive,
		isNavigationLinkActive,
		primaryNavigation
	} from '$lib/data/navigation';

	let activeUrl = $derived(page.url.pathname);
	let menuOpen = $state(false);
	let outcomesOpen = $state(false);
	let scrolled = $state(false);
	let navEl: HTMLElement | undefined = $state();
	let hamburgerEl: HTMLButtonElement | undefined = $state();
	let outcomesButtonEl: HTMLButtonElement | undefined = $state();

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
		outcomesOpen = false;
	}

	function handleWindowClick(event: MouseEvent) {
		if (!outcomesOpen || !navEl) return;
		if (event.target instanceof Node && !navEl.contains(event.target)) {
			outcomesOpen = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key !== 'Escape') return;
		if (outcomesOpen) {
			outcomesOpen = false;
			outcomesButtonEl?.focus();
		} else if (menuOpen) {
			closeMenu();
			hamburgerEl?.focus();
		}
	}}
	onclick={handleWindowClick}
	onscroll={() => (scrolled = window.scrollY > 12)}
/>

<!-- Sticky: on References, Participants and Photos the navigation used to
     scroll away entirely. This is also the one surface where backdrop-filter
     earns its cost, because it genuinely overlaps moving content. -->
<header class="site-header surface-glass" class:site-header--scrolled={scrolled}>
	<nav class="content-width-wide site-nav" bind:this={navEl} aria-label="Primary">
		<div class="nav-bar">
			<a
				href={homeHref}
				class="logo-link brand-lockup"
				onclick={closeMenu}
				aria-label="DH & AI in African Studies"
			>
				<span class="brand-monogram" aria-hidden="true">
					<span>DH</span><span class="brand-monogram__dot">·</span><span>AI</span>
				</span>
				<span class="brand-wordmark">DH &amp; AI in African Studies</span>
			</a>

			<div class="nav-actions">
				<ThemeToggle />
				<button
					bind:this={hamburgerEl}
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
					{#each primaryNavigation as link (link.label)}
						{@const active = isNavigationGroupActive(link, activeUrl)}
						<li class="nav-item">
							{#if link.children}
								<button
									bind:this={outcomesButtonEl}
									type="button"
									class="nav-link nav-link--group"
									class:active
									aria-expanded={outcomesOpen}
									aria-haspopup="true"
									onclick={() => (outcomesOpen = !outcomesOpen)}
								>
									{link.label}
									<svg
										class="nav-chevron"
										class:nav-chevron--open={outcomesOpen}
										viewBox="0 0 10 6"
										aria-hidden="true"
									>
										<path
											d="M1 1l4 4 4-4"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</button>
								<ul class="nav-submenu" class:nav-submenu--open={outcomesOpen}>
									{#each link.children as child (child.href)}
										<li>
											<a
												href={child.href}
												class="nav-sublink"
												class:active={isNavigationLinkActive(child.href, activeUrl)}
												aria-current={isNavigationLinkActive(child.href, activeUrl)
													? 'page'
													: undefined}
												onclick={closeMenu}
											>
												{child.label}
											</a>
										</li>
									{/each}
								</ul>
							{:else}
								<a
									href={link.href}
									class="nav-link"
									class:active
									aria-current={active ? 'page' : undefined}
									onclick={closeMenu}
								>
									{link.label}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</nav>
</header>

<style>
	/* The blur itself comes from .surface-glass — one of only two places on the
	   site that keeps it, because this bar genuinely overlaps moving content. */
	.site-header {
		position: sticky;
		top: 0;
		z-index: var(--z-overlay);
		border-inline: 0;
		border-top: 0;
		border-bottom-color: transparent;
		transition:
			border-color var(--transition-base),
			box-shadow var(--transition-base);
	}

	.site-header--scrolled {
		border-bottom-color: var(--border-default);
		box-shadow: var(--shadow-xs);
	}

	.site-nav {
		padding-block: var(--space-sm);
	}

	.brand-lockup {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		text-decoration: none;
		min-height: 2.5rem;
	}

	/* Text-only wordmarks give a site no mark above the fold. The funder logos
	   in static/images/logo/ belong to institutions, not to this project, so
	   the identity here is a typographic monogram instead. */
	.brand-monogram {
		display: inline-flex;
		align-items: center;
		gap: 0.05em;
		padding: 0.2em 0.45em;
		border-radius: var(--radius-md);
		/* Starts at secondary-700, not -600: white at 14px only reached 3.7:1 on
		   the lighter end of the old ramp. */
		background: linear-gradient(135deg, var(--color-secondary-700), var(--color-secondary-800));
		color: #ffffff;
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-extrabold);
		font-size: var(--text-sm);
		letter-spacing: 0.02em;
		line-height: 1;
		flex-shrink: 0;
	}

	/* A step up the terracotta ramp: against the deepened teal tile, -300 sat at
	   1.75:1 and read as a smudge rather than as punctuation. */
	.brand-monogram__dot {
		color: var(--color-primary-200);
	}

	.brand-wordmark {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-bold);
		font-size: var(--text-lg);
		letter-spacing: var(--tracking-tight);
		color: var(--text-primary);
		white-space: nowrap;
	}

	@media (max-width: 400px) {
		.brand-wordmark {
			display: none;
		}
	}

	.nav-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xs);
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
		min-width: 2.75rem;
		min-height: 2.75rem;
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

	.nav-item {
		position: relative;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-3xs);
		width: 100%;
		/* The documented 2.75rem control target; the padding alone left these at
		   39px on the desktop bar. */
		min-height: 2.75rem;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		background: transparent;
		border: none;
		font: inherit;
		text-align: left;
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

	.nav-chevron {
		width: 0.625rem;
		height: 0.375rem;
		transition: transform var(--transition-micro);
	}

	.nav-chevron--open {
		transform: rotate(180deg);
	}

	.nav-submenu {
		display: none;
		list-style: none;
		margin: 0;
		padding: 0 0 0 var(--space-sm);
	}

	.nav-submenu--open {
		display: block;
	}

	.nav-sublink {
		display: block;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: var(--text-sm);
		transition:
			color var(--transition-micro),
			background-color var(--transition-micro);
	}

	.nav-sublink:hover {
		background-color: var(--bg-sunken);
		color: var(--text-primary);
	}

	.nav-sublink.active {
		color: var(--text-link);
		font-weight: var(--font-weight-semibold);
	}

	/* Desktop: inline nav from 1024px — six items fit comfortably */
	@media (min-width: 1024px) {
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
			align-items: center;
			gap: var(--space-3xs);
		}

		.nav-link {
			width: auto;
			border-radius: var(--radius-md);
			padding-inline: var(--space-sm);
			padding-block: var(--space-2xs);
			position: relative;
			white-space: nowrap;
		}

		.nav-link:hover:not(.active) {
			background-color: var(--accent-soft);
			color: var(--text-link);
		}

		/* A solid soft fill plus a 2px underline reads as a state. The former
		   40px teal bloom on a 90px pill read as a halo. */
		.nav-link.active {
			background-color: var(--accent-soft);
			color: var(--text-link);
			box-shadow: inset 0 -2px 0 0 var(--accent);
		}

		.nav-submenu {
			position: absolute;
			top: calc(100% + var(--space-2xs));
			left: 0;
			min-width: 12rem;
			padding: var(--space-2xs);
			border-radius: var(--radius-card);
			background-color: var(--surface-2);
			border: 1px solid var(--border-subtle);
			box-shadow: var(--shadow-md);
			z-index: var(--z-dropdown);
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
