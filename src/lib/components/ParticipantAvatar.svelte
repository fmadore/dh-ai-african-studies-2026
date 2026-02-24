<script lang="ts">
	import { Avatar } from 'flowbite-svelte';

	interface Props {
		src?: string;
		alt: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { src, alt, size = 'md' }: Props = $props();

	// Map our sizes to Tailwind classes (Flowbite Avatar uses w-/h- for custom sizing)
	const sizeClasses: Record<string, string> = {
		sm: 'w-12 h-12',
		md: 'w-24 h-24',
		lg: 'w-28 h-28 md:w-36 md:h-36'
	};
</script>

<Avatar
	{src}
	{alt}
	border
	class="{sizeClasses[size]} ring-secondary-200 dark:ring-secondary-700 shadow-md"
/>
