<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Heading, P } from 'flowbite-svelte';

	interface Props {
		title: string;
		lede?: string;
		width?: 'default' | 'narrow' | 'wide';
		/** Extra hero content rendered below the lede (meta rows, credits, …) */
		children?: Snippet;
	}

	let { title, lede, width = 'default', children }: Props = $props();

	const widthClass: Record<NonNullable<Props['width']>, string> = {
		default: 'content-width',
		narrow: 'content-width-narrow',
		wide: 'content-width-wide'
	};
</script>

<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="{widthClass[width]} surface-panel surface-padding stack-sm relative text-center">
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
		>
			{title}
		</Heading>
		{#if lede}
			<P class="text-lead animate-hero-subtitle mx-auto max-w-3xl">{lede}</P>
		{/if}
		{@render children?.()}
	</div>
</section>
