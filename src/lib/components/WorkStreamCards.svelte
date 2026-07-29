<script lang="ts">
	import { workStreams } from '$lib/data/work-streams';
	import { reveal } from '$lib/utils/reveal';

	interface Props {
		/** Heading level for the card titles, so the cards fit the surrounding
		 * document outline (h3 on the landing page, h4 inside the reader panel). */
		headingTag?: 'h3' | 'h4';
	}

	let { headingTag = 'h3' }: Props = $props();
</script>

<ol class="work-stream-grid stagger-children" use:reveal>
	{#each workStreams as stream (stream.id)}
		<li class="card-surface surface-padding-sm stack-xs work-stream">
			<span class="work-stream__index" aria-hidden="true">
				{String(stream.id).padStart(2, '0')}
			</span>
			<svelte:element this={headingTag} class="heading-sub text-lg">
				{stream.title}
			</svelte:element>
			<p class="text-body-sm">{stream.description}</p>
		</li>
	{/each}
</ol>

<style>
	/* An ordered list, not a Flowbite Timeline: these are three concurrent
	   streams, not a chronology — and the timeline left an empty date slot on
	   every item. Same three streams, one representation, site-wide. */
	.work-stream-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (min-width: 640px) {
		.work-stream-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.work-stream {
		height: 100%;
	}

	.work-stream__index {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-bold);
		font-size: var(--text-sm);
		letter-spacing: var(--tracking-wider);
		color: var(--text-accent);
	}
</style>
