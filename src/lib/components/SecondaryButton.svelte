<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		children: Snippet;
		href?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		outline?: boolean;
		disabled?: boolean;
		class?: string;
		onclick?: HTMLButtonAttributes['onclick'];
		target?: HTMLAnchorAttributes['target'];
		rel?: HTMLAnchorAttributes['rel'];
	}

	let {
		children,
		href,
		size = 'lg',
		outline = true,
		disabled = false,
		class: className = '',
		onclick,
		target,
		rel
	}: Props = $props();

	let extraProps = $derived(href ? { href, target, rel } : { onclick });
</script>

<Button
	{...extraProps}
	{size}
	{outline}
	{disabled}
	color="secondary"
	class="btn-refined btn-refined--secondary {className}"
>
	{@render children()}
</Button>

<style>
	:global(.btn-refined--secondary) {
		-webkit-backdrop-filter: blur(6px);
		backdrop-filter: blur(6px);
	}
	:global(.btn-refined--secondary:hover) {
		box-shadow: var(--shadow-accent);
	}
</style>
