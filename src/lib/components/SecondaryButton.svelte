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
	class="hover:shadow-secondary backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] {className}"
>
	{@render children()}
</Button>
