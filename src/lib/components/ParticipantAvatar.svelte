<script lang="ts">
	interface Props {
		src?: string;
		alt: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { src, alt, size = 'md' }: Props = $props();

	// A missing photo and a photo that 404s should land in the same place:
	// the glyph fallback, never a broken-image icon inside the ring.
	let failed = $state(false);

	// A teal halo plus a shadow plus 4px of padding, on 28 faces, is a lot of
	// chrome. A hairline ring is enough to separate a portrait from the card.
	//
	// Sized by class rather than by Tailwind's numeric width scale: this project
	// redefines `--spacing-12` as a fluid clamp, so `w-12 h-12` did not resolve
	// to 3rem — it rendered a 28–33px thumbnail beside a three-line identity
	// block. A portrait is a fixed object, not a spacing step.
	const sizeClasses: Record<NonNullable<Props['size']>, string> = {
		sm: 'participant-avatar--sm',
		md: 'participant-avatar--md',
		lg: 'participant-avatar--lg'
	};
</script>

{#if src && !failed}
	<!-- Plain img so loading="lazy" works (Flowbite Avatar doesn't forward it) -->
	<img
		{src}
		{alt}
		width="112"
		height="112"
		loading="lazy"
		decoding="async"
		onerror={() => (failed = true)}
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

	:global(.participant-avatar--sm) {
		width: 3rem;
		height: 3rem;
	}

	:global(.participant-avatar--md) {
		width: 6rem;
		height: 6rem;
	}

	:global(.participant-avatar--lg) {
		width: 6rem;
		height: 6rem;
	}

	@media (min-width: 768px) {
		:global(.participant-avatar--lg) {
			width: 7rem;
			height: 7rem;
		}
	}

	.participant-avatar--fallback {
		display: grid;
		place-items: center;
		border-radius: var(--radius-full);
		background: var(--bg-sunken);
		color: var(--text-subtle);
	}

	/* Inset the glyph from the SVG, not from padding: percentage padding
	   resolves against the *card* width, and border-box then refuses to shrink
	   the avatar below it — which blew the placeholder up to ~3x a real photo. */
	.participant-avatar--fallback svg {
		width: 56%;
		height: 56%;
	}
</style>
