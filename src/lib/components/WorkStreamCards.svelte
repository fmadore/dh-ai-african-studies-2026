<script lang="ts">
	import { workStreams } from '#lib/data/work-streams';
	import { reveal } from '#lib/utils/reveal';
</script>

<ol class="work-stream-grid stagger-children" use:reveal>
	{#each workStreams as stream (stream.id)}
		<li class="card-surface surface-padding-sm stack-xs work-stream">
			<span class="work-stream__index" aria-hidden="true">
				{String(stream.id).padStart(2, '0')}
			</span>
			<h3 class="heading-sub text-lg">
				{stream.title}
			</h3>
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
