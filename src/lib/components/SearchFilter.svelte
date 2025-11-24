<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	let { value = $bindable(''), placeholder = 'Search...' } = $props();
</script>

<div class="w-full max-w-md mx-auto">
	<Input
		bind:value
		{placeholder}
		size="lg"
		class="pl-12! py-3! text-lg! rounded-xl! shadow-sm focus:ring-primary-500! focus:border-primary-500! dark:focus:ring-primary-500! dark:focus:border-primary-500!"
	>
		<svelte:fragment slot="left">
			<SearchOutline class="w-6 h-6 text-gray-500 dark:text-gray-400" />
		</svelte:fragment>
	</Input>
</div>
