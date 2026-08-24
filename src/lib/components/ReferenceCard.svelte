<script lang="ts">
	import { ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons';
	import type { CslReference } from '$lib/types/csl';
	import { formatCitation, getAccessLink } from '$lib/utils/references';
	import { formatType } from '$lib/utils/formatters';

	interface Props {
		reference: CslReference;
		selectedTags: string[];
		expanded: boolean;
		ontoggleexpand: (_id: string) => void;
		ontoggletag: (_tag: string) => void;
	}

	let { reference: ref, selectedTags, expanded, ontoggleexpand, ontoggletag }: Props = $props();

	let info = $derived(formatCitation(ref));
	let accessLink = $derived(getAccessLink(ref));
	const TAG_LIMIT = 6;
	let tagsExpanded = $state(false);
	let tags = $derived(ref.tags ?? []);
	let visibleTags = $derived(tagsExpanded ? tags : tags.slice(0, TAG_LIMIT));
	let hiddenTagCount = $derived(Math.max(0, tags.length - TAG_LIMIT));
	const tagRegionId = $derived(`reference-tags-${ref.id}`);
</script>

<!--
	A bibliography set in serif reads as a bibliography: title and abstract take
	the reading face, while every piece of machinery — type pill, keywords,
	access button — stays sans. Padding is `sm` and there is no hover lift:
	twenty of these per page made for a very long and very twitchy scroll.
-->
<article class="card-surface reference-card">
	<div class="reference-card__body">
		<!-- Type & Year -->
		<div class="reference-card__head">
			<span class="reference-type-pill">{formatType(ref.type)}</span>
			{#if ref['container-title']}
				<span class="text-subtle-ink hidden sm:inline">•</span>
				<span class="reference-card__container hidden truncate italic sm:inline">
					{ref['container-title']}
				</span>
			{/if}
			<span class="reference-card__year">{info.year}</span>
		</div>

		<!-- Title -->
		<h3 class="reference-card__title">
			{#if accessLink}
				<a href={accessLink} target="_blank" rel="noopener noreferrer" class="reference-card__link">
					{ref.title}
				</a>
			{:else}
				{ref.title}
			{/if}
		</h3>

		<!-- Authors: a plain line of names, not a pull-quote -->
		<p class="reference-card__authors">{info.authors}</p>

		<!-- Abstract with dedicated expand toggle -->
		{#if ref.abstract}
			<p id="abstract-{ref.id}" class="reference-card__abstract {expanded ? '' : 'line-clamp-3'}">
				{ref.abstract}
			</p>
			<button
				type="button"
				class="abstract-toggle tap-target tap-target-flush"
				aria-expanded={expanded}
				aria-controls="abstract-{ref.id}"
				onclick={() => ontoggleexpand(ref.id)}
			>
				{#if expanded}
					Show less
					<ChevronUpOutline class="size-icon-sm" aria-hidden="true" />
				{:else}
					Show full abstract
					<ChevronDownOutline class="size-icon-sm" aria-hidden="true" />
				{/if}
			</button>
		{/if}

		<!-- Tags & Actions -->
		{#if tags.length > 0 || accessLink}
			<div class="reference-card__foot">
				<div id={tagRegionId} class="flex flex-wrap gap-2">
					{#each visibleTags as tag (tag)}
						<button
							type="button"
							onclick={() => ontoggletag(tag)}
							aria-pressed={selectedTags.includes(tag)}
							class="tag-filter tap-target-compact"
							class:is-active={selectedTags.includes(tag)}
						>
							#{tag}
						</button>
					{/each}
					{#if hiddenTagCount > 0}
						<button
							type="button"
							class="tag-overflow tap-target-compact"
							aria-expanded={tagsExpanded}
							aria-controls={tagRegionId}
							onclick={() => (tagsExpanded = !tagsExpanded)}
						>
							{tagsExpanded ? 'Show fewer keywords' : `+${hiddenTagCount} more keywords`}
						</button>
					{/if}
				</div>

				{#if accessLink}
					<a
						href={accessLink}
						target="_blank"
						rel="noopener noreferrer"
						class="reference-card__access tap-target tap-target-flush"
					>
						Access publication
					</a>
				{/if}
			</div>
		{/if}
	</div>
</article>

<style>
	.reference-card {
		padding: var(--space-lg);
		width: 100%;
	}

	.reference-card:hover {
		border-color: var(--border-accent);
	}

	/* Rhythm, not a single repeated interval. The head is the title's own kicker
	   and the authors belong to the title, so both sit tight against it; the
	   abstract opens a second block and gets real air; its toggle closes back up
	   against the paragraph it controls. `.stack-xs` put an identical 10px
	   between all five, which gave the title no more standing than its metadata. */
	.reference-card__title,
	.reference-card__authors,
	.abstract-toggle {
		margin-top: var(--space-3xs);
	}

	.reference-card__abstract {
		margin-top: var(--space-sm);
	}

	/* Not uppercase: this line carries container titles like "Luxembourg Centre
	   for Contemporary and Digital History (C²DH)", where the casing is part of
	   the name. Size and weight keep it reading as metadata instead. Tracking is
	   gone with the uppercase it was compensating for — on mixed-case 12px text
	   it only loosened the words. */
	.reference-card__head {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		color: var(--text-muted);
		min-width: 0;
	}

	/* The row has its own order of importance: classification and year are scan
	   anchors, the container title is context. It used to carry
	   `.body-text-muted`, which re-set it to 15px inside a 12px row — the least
	   important item in the card's metadata was the largest. */
	.reference-card__container {
		min-width: 0;
		color: var(--text-muted);
	}

	.reference-card__year {
		margin-left: auto;
		flex-shrink: 0;
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.reference-type-pill {
		background-color: var(--accent-soft);
		color: var(--text-link);
		border-radius: var(--radius-control);
		padding: var(--space-3xs) var(--space-xs);
		font-weight: var(--font-weight-semibold);
		flex-shrink: 0;
	}

	.reference-card__title {
		font-family: var(--font-family-serif);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-semibold);
		/* Explicit, not `--leading-snug`: scholarly titles wrap to two or three
		   lines in a serif with long descenders, which needs the looser step. */
		line-height: 1.35;
		color: var(--text-primary);
		max-width: var(--measure-prose);
	}

	.reference-card__link {
		color: inherit;
		text-decoration: none;
		text-underline-offset: 4px;
		transition: color var(--transition-micro);
	}

	.reference-card__link:hover {
		color: var(--text-link);
		text-decoration: underline;
	}

	.reference-card__authors {
		font-size: var(--text-sm);
		color: var(--text-muted);
		max-width: var(--measure-prose);
	}

	.reference-card__abstract {
		font-family: var(--font-family-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: var(--measure-prose);
	}

	.abstract-toggle {
		gap: var(--space-3xs);
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: color var(--transition-micro);
	}

	.abstract-toggle:hover {
		color: var(--text-link-hover);
	}

	/* More air above the rule than below it, so it reads as the boundary between
	   the record and its controls. At 6px above / 12px below it was glued to the
	   paragraph it was meant to separate from. */
	.reference-card__foot {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--border-subtle);
	}

	@media (min-width: 640px) {
		.reference-card__foot {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	/* These were py-0.5 chips. `.tap-target-compact` gives them the full 44px
	   on touch pointers without bloating a dense keyword row on the desktop. */
	.tag-filter {
		padding: 0 var(--space-xs);
		border-radius: var(--radius-control);
		border: 1px solid var(--border-subtle);
		background-color: var(--bg-sunken);
		color: var(--text-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background-color var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.tag-filter:hover {
		color: var(--text-link);
		border-color: var(--border-accent);
	}

	.tag-filter.is-active {
		background-color: var(--accent-soft);
		border-color: var(--border-accent);
		color: var(--text-link);
	}

	/* Solid, not dashed: a dashed strong border is this system's empty-state
	   silhouette, and borrowing it for a live control in a chip row read as a
	   placeholder. Teal text is what marks it as the row's one action. */
	.tag-overflow {
		padding-inline: var(--space-xs);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-control);
		background: transparent;
		color: var(--text-link);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition:
			border-color var(--transition-micro),
			color var(--transition-micro);
	}

	.tag-overflow:hover {
		border-color: var(--border-accent);
		color: var(--text-link-hover);
	}

	.reference-card__access {
		flex-shrink: 0;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-link);
		text-decoration: none;
	}

	.reference-card__access:hover {
		color: var(--text-link-hover);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
