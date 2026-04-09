<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	let { value = $bindable(''), placeholder = 'Search...' } = $props();
</script>

{#snippet leftIcon()}
	<SearchOutline class="size-icon-md body-text-muted" />
{/snippet}

<div class="mx-auto w-full max-w-md">
	<Input
		bind:value
		{placeholder}
		size="lg"
		class="rounded-card focus-within:shadow-secondary focus-within:ring-secondary-300 dark:focus-within:ring-secondary-600 py-3! pl-12! text-lg! shadow-sm transition-all focus-within:ring-2"
		left={leftIcon}
	/>
</div>
