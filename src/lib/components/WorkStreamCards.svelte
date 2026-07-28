<script lang="ts">
	import { Card, Heading, P } from 'flowbite-svelte';
	import { workStreams } from '$lib/data/work-streams';
	import { reveal } from '$lib/utils/reveal';

	interface Props {
		/** Heading level for the card titles, so the cards fit the surrounding
		 * document outline (h3 on the landing page, h4 inside the reader panel). */
		headingTag?: 'h3' | 'h4';
	}

	let { headingTag = 'h3' }: Props = $props();
</script>

<div class="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" use:reveal>
	{#each workStreams as stream (stream.id)}
		<Card class="card-surface surface-padding-sm stack-xs glow-border h-full">
			<Heading tag={headingTag} class="heading-sub text-lg">{stream.title}</Heading>
			<P class="text-body-sm">
				{stream.description}
			</P>
		</Card>
	{/each}
</div>
