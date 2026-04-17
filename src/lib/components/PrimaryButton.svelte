<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		children: Snippet;
		href?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
	{disabled}
	color="primary"
	class="btn-refined btn-refined--primary {className}"
>
	{@render children()}
</Button>

<style>
	:global(.btn-refined) {
		box-shadow: var(--shadow-md);
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
</style>
