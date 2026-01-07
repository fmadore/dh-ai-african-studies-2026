<script lang="ts">
	import { Button } from "flowbite-svelte";
	import type { Snippet } from "svelte";
	import type {
		HTMLAnchorAttributes,
		HTMLButtonAttributes,
	} from "svelte/elements";

	interface Props {
		children: Snippet;
		href?: string;
		size?: "xs" | "sm" | "md" | "lg" | "xl";
		outline?: boolean;
		disabled?: boolean;
		class?: string;
		onclick?: HTMLButtonAttributes["onclick"];
		target?: HTMLAnchorAttributes["target"];
		rel?: HTMLAnchorAttributes["rel"];
	}

	let {
		children,
		href,
		size = "lg",
		outline = true,
		disabled = false,
		class: className = "",
		onclick,
		target,
		rel,
	}: Props = $props();
</script>

{#if href}
	<Button
		{href}
		{size}
		{outline}
		{disabled}
		{target}
		{rel}
		color="secondary"
		class="backdrop-blur-sm transition-base {className}"
	>
		{@render children()}
	</Button>
{:else}
	<Button
		{size}
		{outline}
		{disabled}
		{onclick}
		color="secondary"
		class="backdrop-blur-sm transition-base {className}"
	>
		{@render children()}
	</Button>
{/if}
