<script lang="ts">
	import { untrack } from 'svelte';

	/**
	 * Sticky in-page navigation for long single-scroll pages.
	 *
	 * A left rail on wide screens, a horizontally scrolling strip on narrow
	 * ones. Anchor offsets come from --scroll-offset, so targets clear the
	 * sticky header without per-page magic numbers.
	 */
	interface Section {
		id: string;
		label: string;
	}

	interface Props {
		sections: Section[];
		label?: string;
	}

	let { sections, label = 'On this page' }: Props = $props();

	let activeId = $state(untrack(() => sections[0]?.id ?? ''));

	$effect(() => {
		const targets = sections
			.map((section) => document.getElementById(section.id))
			.filter((el): el is HTMLElement => el !== null);
		if (targets.length === 0) return;

		/**
		 * The callback only reports sections whose state *changed*, so the batch
		 * on its own is not enough to decide what is on screen — track the
		 * latest state of every section and pick the topmost one still visible.
		 */
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain bookkeeping; nothing renders from it
		const intersecting = new Set<string>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) intersecting.add(entry.target.id);
					else intersecting.delete(entry.target.id);
				}
				const topmost = targets.find((target) => intersecting.has(target.id));
				if (topmost) activeId = topmost.id;
			},
			{ rootMargin: '-15% 0px -70% 0px' }
		);

		targets.forEach((target) => observer.observe(target));
		return () => observer.disconnect();
	});
</script>

<nav class="section-nav no-print" aria-label={label}>
	<p class="section-nav__label">{label}</p>
	<ul class="section-nav__list">
		{#each sections as section (section.id)}
			<li>
				<a
					href="#{section.id}"
					class="section-nav__link"
					class:active={activeId === section.id}
					aria-current={activeId === section.id ? 'true' : undefined}
				>
					{section.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.section-nav {
		position: sticky;
		top: var(--scroll-offset);
		z-index: var(--z-sticky);
	}

	.section-nav__label {
		display: none;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: var(--space-sm);
	}

	.section-nav__list {
		display: flex;
		gap: var(--space-2xs);
		list-style: none;
		margin: 0;
		padding: 0 0 var(--space-2xs);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.section-nav__list::-webkit-scrollbar {
		display: none;
	}

	.section-nav__link {
		display: block;
		white-space: nowrap;
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		color: var(--text-muted);
		text-decoration: none;
		background-color: var(--bg-sunken);
		transition:
			color var(--transition-micro),
			background-color var(--transition-micro);
	}

	.section-nav__link:hover {
		color: var(--text-primary);
	}

	.section-nav__link.active {
		background-color: var(--accent-soft);
		color: var(--text-link);
		font-weight: var(--font-weight-semibold);
	}

	@media (min-width: 1024px) {
		.section-nav__label {
			display: block;
		}

		.section-nav__list {
			flex-direction: column;
			gap: 0;
			overflow: visible;
			border-left: 1px solid var(--border-subtle);
			padding: 0;
		}

		.section-nav__link {
			border-radius: 0;
			background-color: transparent;
			padding: var(--space-2xs) var(--space-sm);
			margin-left: -1px;
			border-left: 2px solid transparent;
		}

		.section-nav__link.active {
			background-color: transparent;
			border-left-color: var(--accent);
		}
	}
</style>
