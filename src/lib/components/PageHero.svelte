<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Short eyebrow above the title (e.g. "Outcome", "Programme") */
		eyebrow?: string;
		lede?: string;
		width?: 'default' | 'narrow' | 'wide';
		/** `compact` trims the vertical padding for pages whose content is the point (photos) */
		size?: 'default' | 'compact';
		/** Extra hero content rendered below the lede (meta rows, credits, …) */
		children?: Snippet;
	}

	let { title, eyebrow, lede, width = 'default', size = 'default', children }: Props = $props();

	const widthClass: Record<NonNullable<Props['width']>, string> = {
		default: 'content-width',
		narrow: 'content-width-narrow',
		wide: 'content-width-wide'
	};
</script>

<!--
	Left-aligned, no panel, no gradient, no drop shadow.
	· The gradient is reserved for the homepage h1 — nine gradient page titles
	  turn a signature into wallpaper, and the terracotta end of the ramp is
	  the lowest-contrast text on the site.
	· `drop-shadow` on background-clipped text renders against the glyph alpha
	  and reads as smudge.
-->
<section
	class="padding-inline-section relative {size === 'compact'
		? 'pt-2xl pb-lg'
		: 'padding-block-section'}"
>
	<div class="{widthClass[width]} stack-sm relative">
		{#if eyebrow}
			<p class="text-label text-accent animate-hero-eyebrow">{eyebrow}</p>
		{/if}
		<h1 class="heading-display animate-hero-title text-balance">
			{title}
		</h1>
		{#if lede}
			<p class="text-lead animate-hero-subtitle">{lede}</p>
		{/if}
		{@render children?.()}
	</div>
</section>

<style>
	.pt-2xl {
		padding-top: var(--space-2xl);
	}

	.pb-lg {
		padding-bottom: var(--space-lg);
	}
</style>
