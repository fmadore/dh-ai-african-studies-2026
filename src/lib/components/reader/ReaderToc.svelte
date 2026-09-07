<script lang="ts">
	import type { TocItem } from '$lib/reader/types';
	import { ListOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { fade, slide } from 'svelte/transition';
	import { prefersReducedMotion } from '$lib/utils/motion';

	interface Props {
		toc: TocItem[];
		/** Root prose element to observe for headings. */
		proseRoot: HTMLElement | null;
	}

	let { toc, proseRoot }: Props = $props();

	let activeId = $state('');
	let mobileOpen = $state(false);
	let desktopOpen = $state(true);
	let mobileToggle: HTMLButtonElement;

	$effect(() => {
		if (!proseRoot || typeof window === 'undefined') return;
		if (toc.length === 0) return;

		const headings = toc
			.map((item) => proseRoot.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`))
			.filter((el): el is HTMLElement => el !== null);

		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
				if (visible) activeId = visible.target.id;
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);

		headings.forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	});

	function handleLinkClick(event: MouseEvent, id: string) {
		event.preventDefault();
		mobileOpen = false;
		activeId = id;
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'start'
		});
		// Update URL hash without extra scroll jump.
		history.replaceState(null, '', `#${id}`);
		if (window.matchMedia('(max-width: 1023px)').matches)
			mobileToggle?.focus({ preventScroll: true });
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && mobileOpen) {
			mobileOpen = false;
			mobileToggle?.focus({ preventScroll: true });
		}
	}}
/>

{#snippet tocList()}
	<ul class="reader-toc__list">
		{#each toc as item (item.id)}
			<li>
				<a
					class="reader-toc__link"
					data-level={item.level}
					href="#{item.id}"
					aria-current={activeId === item.id ? 'true' : undefined}
					onclick={(e) => handleLinkClick(e, item.id)}>{item.text}</a
				>
			</li>
		{/each}
	</ul>
{/snippet}

<!-- Desktop sidebar -->
<nav class="reader-toc hidden lg:block" aria-label="Table of contents">
	<button
		type="button"
		class="reader-toc__toggle"
		aria-expanded={desktopOpen}
		aria-controls="reader-toc-desktop-panel"
		onclick={() => (desktopOpen = !desktopOpen)}
	>
		<ListOutline class="h-4 w-4" />
		{desktopOpen ? 'Hide sections' : 'Show sections'}
	</button>
	<div id="reader-toc-desktop-panel" hidden={!desktopOpen}>
		{@render tocList()}
	</div>
</nav>

<!-- Mobile toggle + sheet -->
<div class="reader-toc-mobile lg:hidden">
	<button
		bind:this={mobileToggle}
		type="button"
		onclick={() => (mobileOpen = !mobileOpen)}
		class="reader-toc__toggle reader-toc-mobile__toggle"
		aria-expanded={mobileOpen}
		aria-controls="reader-toc-mobile-panel"
	>
		<span class="flex items-center gap-2 font-semibold">
			<ListOutline class="h-4 w-4" />
			{mobileOpen ? 'Hide sections' : 'Sections'}
		</span>
		{#if mobileOpen}
			<CloseOutline class="h-4 w-4" />
		{/if}
	</button>

	{#if mobileOpen}
		<div
			id="reader-toc-mobile-panel"
			class="reader-toc-mobile__panel"
			in:slide={{ duration: prefersReducedMotion() ? 0 : 200 }}
			out:fade={{ duration: prefersReducedMotion() ? 0 : 150 }}
		>
			<nav
				class="card-surface surface-padding-sm reader-toc-mobile-inner"
				aria-label="Table of contents"
			>
				{@render tocList()}
			</nav>
		</div>
	{/if}
</div>
