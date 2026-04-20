<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	let { value = $bindable(''), placeholder = 'Search...' } = $props();
</script>

{#snippet leftIcon()}
	<SearchOutline class="size-icon-md text-muted-ink" />
{/snippet}

<div class="search-filter mx-auto w-full max-w-md">
	<Input
		bind:value
		{placeholder}
		size="lg"
		class="search-filter__input py-3! pl-12! text-lg!"
		left={leftIcon}
	/>
</div>

<style>
	.search-filter :global(.search-filter__input) {
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-xs);
		transition:
			box-shadow var(--transition-base),
			border-color var(--transition-base);
	}

	.search-filter :global(.search-filter__input:focus-within) {
		box-shadow: var(--shadow-accent);
		border-color: var(--border-accent);
	}
</style>
