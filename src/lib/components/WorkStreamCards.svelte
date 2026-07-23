<script lang="ts">
	import { Card, Heading, P } from 'flowbite-svelte';
	import { workStreams } from '$lib/data/work-streams';
	import { reveal } from '$lib/utils/reveal';
</script>

<div class="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" use:reveal>
	{#each workStreams as stream (stream.id)}
		<Card class="card-surface surface-padding-sm stack-xs glow-border h-full">
			<Heading tag="h3" class="heading-sub text-lg">{stream.title}</Heading>
			<P class="text-body-sm">
				{stream.description}
			</P>
		</Card>
	{/each}
</div>
