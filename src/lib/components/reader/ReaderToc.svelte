<script lang="ts">
	import type { TocItem } from '$lib/reader/types';
	import { Button } from 'flowbite-svelte';
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
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'start'
		});
		// Update URL hash without extra scroll jump.
		history.replaceState(null, '', `#${id}`);
	}
</script>

<!-- Desktop sidebar -->
<nav class="reader-toc hidden lg:block" aria-label="Table of contents">
	<p class="reader-toc__heading">On this page</p>
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
</nav>

<!-- Mobile toggle + sheet -->
<div class="reader-toc-mobile lg:hidden">
	<Button
		color="light"
		onclick={() => (mobileOpen = !mobileOpen)}
		class="w-full items-center justify-between text-left"
		aria-expanded={mobileOpen}
		aria-controls="reader-toc-mobile-panel"
	>
		<span class="flex items-center gap-2 font-semibold">
			<ListOutline class="h-4 w-4" />
			Table of contents
		</span>
		{#if mobileOpen}
			<CloseOutline class="h-4 w-4" />
		{/if}
	</Button>

	{#if mobileOpen}
		<div
			id="reader-toc-mobile-panel"
			class="mt-3"
			in:slide={{ duration: prefersReducedMotion() ? 0 : 200 }}
			out:fade={{ duration: prefersReducedMotion() ? 0 : 150 }}
		>
			<nav
				class="card-surface surface-padding-sm reader-toc-mobile-inner"
				aria-label="Table of contents"
			>
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
			</nav>
		</div>
	{/if}
</div>
