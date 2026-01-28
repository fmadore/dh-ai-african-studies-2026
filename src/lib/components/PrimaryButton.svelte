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
</script>

{#if href}
	<Button 
		{href}
		{size}
		{disabled}
		{target}
		{rel}
		color="primary"
		class="shadow-lg hover:shadow-primary transition-all hover:scale-[1.02] active:scale-[0.98] {className}"
	>
		{@render children()}
	</Button>
{:else}
	<Button 
		{size}
		{disabled}
		{onclick}
		color="primary"
		class="shadow-lg hover:shadow-primary transition-all hover:scale-[1.02] active:scale-[0.98] {className}"
	>
		{@render children()}
	</Button>
{/if}
