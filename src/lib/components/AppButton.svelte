<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		children: Snippet;
		variant?: 'primary' | 'secondary';
		href?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		/** Only applies to the secondary variant (defaults to outline) */
		outline?: boolean;
		disabled?: boolean;
		class?: string;
		onclick?: HTMLButtonAttributes['onclick'];
		target?: HTMLAnchorAttributes['target'];
		rel?: HTMLAnchorAttributes['rel'];
	}

	let {
		children,
		variant = 'primary',
		href,
		size = 'lg',
		outline,
		disabled = false,
		class: className = '',
		onclick,
		target,
		rel
	}: Props = $props();

	let extraProps = $derived(href ? { href, target, rel } : { onclick });
	let isOutline = $derived(outline ?? variant === 'secondary');
</script>

<Button
	{...extraProps}
	{size}
	{disabled}
	outline={isOutline}
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
	:global(.btn-refined--primary:hover) {
		box-shadow: var(--shadow-brand);
	}
	/* No backdrop-filter: an outline button over a flat page promoted a
	   compositing layer to blur nothing. */
	:global(.btn-refined--secondary:hover) {
		box-shadow: var(--shadow-sm);
	}
</style>
