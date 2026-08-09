<script lang="ts">
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
		width="112"
		height="112"
		loading="lazy"
		decoding="async"
		class="{sizeClasses[size]} participant-avatar rounded-full object-cover"
	/>
{:else}
	<!-- The person’s name is already adjacent to every avatar use. Keep this
	     fallback decorative rather than nesting Flowbite’s role="button" inside
	     a participant disclosure button. -->
	<div
		class="{sizeClasses[size]} participant-avatar participant-avatar--fallback"
		aria-hidden="true"
	>
		<svg viewBox="0 0 16 16" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 7a7 7 0 0 1 14 0H1Z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>
{/if}

<style>
	:global(.participant-avatar) {
		flex-shrink: 0;
		box-shadow: 0 0 0 1px var(--border-default);
	}

	.participant-avatar--fallback {
		display: grid;
		place-items: center;
		padding: 22%;
		border-radius: var(--radius-full);
		background: var(--bg-sunken);
		color: var(--text-subtle);
	}

	.participant-avatar--fallback svg {
		width: 100%;
		height: 100%;
	}
</style>
