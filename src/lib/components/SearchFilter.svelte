<script lang="ts">
	import { Input } from "flowbite-svelte";
	import { SearchOutline } from "flowbite-svelte-icons";

	let { value = $bindable(""), placeholder = "Search..." } = $props();
</script>

{#snippet leftIcon()}
	<SearchOutline class="size-icon-md body-text-muted" />
{/snippet}

<div class="w-full max-w-md mx-auto">
	<Input
		bind:value
		{placeholder}
		size="lg"
		class="pl-12! py-3! text-lg! rounded-card shadow-sm transition-all focus-within:shadow-secondary focus-within:ring-2 focus-within:ring-secondary-300 dark:focus-within:ring-secondary-600"
		left={leftIcon}
	/>
</div>
