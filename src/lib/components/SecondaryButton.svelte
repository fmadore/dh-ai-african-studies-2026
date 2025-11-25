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
</script>

<Button 
	{href}
	{size}
	{outline}
	{disabled}
	{onclick}
	{target}
	{rel}
	color="secondary" 
	class="backdrop-blur-sm transition-all {className}"
>
	{@render children()}
</Button>
