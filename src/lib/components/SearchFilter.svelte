<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	let {
		value = $bindable(''),
		label = 'Search',
		placeholder = 'Search...'
	}: { value?: string; label?: string; placeholder?: string } = $props();

	const inputId = $props.id();
</script>

{#snippet leftIcon()}
	<SearchOutline class="size-icon-md text-muted-ink" />
{/snippet}

<div class="search-filter mx-auto w-full max-w-md">
	<label class="search-filter__label" for={inputId}>{label}</label>
	<Input
		bind:value
		id={inputId}
		type="search"
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

	/* The focus outline is the state signal; the shadow only says the field has
	   come forward, so it steps up one neutral rung rather than glowing teal. */
	.search-filter :global(.search-filter__input:focus-within) {
		box-shadow: var(--shadow-sm);
		border-color: var(--border-accent);
	}

	.search-filter__label {
		display: block;
		margin-bottom: var(--space-2xs);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
</style>
