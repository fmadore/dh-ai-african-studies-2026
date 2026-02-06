<script lang="ts">
	import { UserCircleSolid } from 'flowbite-svelte-icons';
	import { handleImageError } from '$lib/utils/image-error';

	interface Props {
		src?: string;
		alt: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { src, alt, size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: { container: 'w-12 h-12', icon: 'w-8 h-8' },
		md: { container: 'w-24 h-24', icon: 'w-14 h-14' },
		lg: { container: 'w-28 h-28 md:w-36 md:h-36', icon: 'w-14 h-14 md:w-16 md:h-16' }
	};

	let classes = $derived(sizeClasses[size]);
</script>

<div class="relative {classes.container}">
	{#if src}
		<img
			{src}
			{alt}
			class="{classes.container} rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700 shadow-md"
			onerror={handleImageError}
		/>
		<!-- Placeholder shown on image load error -->
		<div
			class="{classes.container} rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 hidden items-center justify-center absolute top-0 left-0 shadow-md"
		>
			<UserCircleSolid class="{classes.icon} text-gray-400 dark:text-gray-500" />
		</div>
	{:else}
		<div
			class="{classes.container} rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 flex items-center justify-center shadow-md"
		>
			<UserCircleSolid class="{classes.icon} text-gray-400 dark:text-gray-500" />
		</div>
	{/if}
</div>
