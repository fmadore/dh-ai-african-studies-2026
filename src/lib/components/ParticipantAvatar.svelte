<script lang="ts">
	import { Avatar } from 'flowbite-svelte';

	interface Props {
		src?: string;
		alt: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { src, alt, size = 'md' }: Props = $props();

	// A teal halo plus a shadow plus 4px of padding, on 28 faces, is a lot of
	// chrome. A hairline ring is enough to separate a portrait from the card.
	const sizeClasses: Record<NonNullable<Props['size']>, string> = {
		sm: 'w-12 h-12',
		md: 'w-24 h-24',
		lg: 'w-24 h-24 md:w-28 md:h-28'
	};
</script>

{#if src}
	<!-- Plain img so loading="lazy" works (Flowbite Avatar doesn't forward it) -->
	<img
		{src}
		{alt}
		loading="lazy"
		decoding="async"
		class="{sizeClasses[size]} participant-avatar rounded-full object-cover"
	/>
{:else}
	<Avatar {alt} class="{sizeClasses[size]} participant-avatar object-cover" />
{/if}

<style>
	:global(.participant-avatar) {
		flex-shrink: 0;
		box-shadow: 0 0 0 1px var(--border-default);
	}
</style>
