<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	/** A call-to-action link styled as a button; the secondary variant is outlined. */
	interface Props {
		children: Snippet;
		variant?: 'primary' | 'secondary';
		href?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
		download?: HTMLAnchorAttributes['download'];
	}

	let {
		children,
		variant = 'primary',
		href,
		size = 'lg',
		class: className = '',
		download
	}: Props = $props();
</script>

<Button
	{href}
	{download}
	{size}
	outline={variant === 'secondary'}
	color={variant}
	class="btn-refined btn-refined--{variant} {className}"
>
	{@render children()}
</Button>

<style>
	:global(.btn-refined) {
		box-shadow: var(--shadow-xs);
		transition:
			transform var(--transition-base),
			box-shadow var(--transition-base);
	}
	:global(.btn-refined:hover) {
		transform: translateY(-1px);
	}
	:global(.btn-refined:active) {
		transform: translateY(0);
	}
	/* Neutral: a shadow describes distance from the surface below, never hue —
	   the darker terracotta fill already says the button is hovered. */
	:global(.btn-refined--primary:hover) {
		box-shadow: var(--shadow-md);
	}
	/* No backdrop-filter: an outline button over a flat page promoted a
	   compositing layer to blur nothing. */
	:global(.btn-refined--secondary:hover) {
		box-shadow: var(--shadow-sm);
	}
	/* Reduced motion keeps the fill and shadow change, drops the lift. */
	@media (prefers-reduced-motion: reduce) {
		:global(.btn-refined:hover) {
			transform: none;
		}
	}
</style>
