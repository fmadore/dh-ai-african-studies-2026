<script lang="ts">
	import { Heading, P, Button } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons';
	import type { CslReference } from '$lib/types/csl';
	import { formatCitation, getAccessLink } from '$lib/utils/references';
	import { formatType } from '$lib/utils/formatters';

	interface Props {
		reference: CslReference;
		selectedTags: string[];
		expanded: boolean;
		ontoggleexpand: (id: string) => void;
		ontoggletag: (tag: string) => void;
	}

	let { reference: ref, selectedTags, expanded, ontoggleexpand, ontoggletag }: Props = $props();

	let info = $derived(formatCitation(ref));
	let accessLink = $derived(getAccessLink(ref));
</script>

<article class="card-surface group glow-border surface-padding w-full max-w-none">
	<div class="stack-sm">
		<!-- Header: Type & Year -->
		<div
			class="body-text-muted flex items-start justify-between text-xs font-semibold tracking-wider uppercase"
		>
			<div class="gap-xs flex items-center">
				<span class="reference-type-pill">
					{formatType(ref.type)}
				</span>
				{#if ref['container-title']}
					<span class="text-subtle-ink hidden sm:inline">•</span>
					<span class="body-text-muted hidden italic sm:inline">
						{ref['container-title']}
					</span>
				{/if}
			</div>
			<span>{info.year}</span>
		</div>

		<!-- Title -->
		<Heading tag="h3" class="text-xl leading-tight font-bold">
			{#if accessLink}
				<a
					href={accessLink}
					target="_blank"
					rel="noopener noreferrer"
					class="group-hover:text-secondary-600 dark:group-hover:text-secondary-400 inline-flex items-center gap-1 text-left underline-offset-4 transition-colors hover:underline"
				>
					{ref.title}
				</a>
			{:else}
				<span>{ref.title}</span>
			{/if}
		</Heading>

		<!-- Authors -->
		<P class="body-text border-secondary-200 dark:border-secondary-700 border-l-2 pl-3 font-medium">
			{info.authors}
		</P>

		<!-- Abstract with dedicated expand toggle -->
		{#if ref.abstract}
			<P
				id="abstract-{ref.id}"
				class={'body-text-muted text-sm transition-all duration-500 ' +
					(expanded ? '' : 'line-clamp-3')}
			>
				{ref.abstract}
			</P>
			<button
				type="button"
				class="abstract-toggle"
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
		<div
			class="border-surface-300 dark:border-surface-dark-elevated mt-2 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex flex-wrap gap-2">
				{#if ref.tags && ref.tags.length > 0}
					{#each ref.tags as tag (tag)}
						<button
							type="button"
							onclick={() => ontoggletag(tag)}
							aria-pressed={selectedTags.includes(tag)}
							class="inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium transition-colors {selectedTags.includes(
								tag
							)
								? 'bg-secondary-200 text-secondary-800 border-secondary-300 dark:bg-secondary-800 dark:text-secondary-100 dark:border-secondary-600'
								: 'bg-secondary-50 text-secondary-700 border-secondary-100 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800 dark:hover:bg-secondary-900/50'}"
						>
							#{tag}
						</button>
					{/each}
				{/if}
			</div>

			{#if accessLink}
				<Button
					href={accessLink}
					target="_blank"
					rel="noopener noreferrer"
					size="xs"
					color="light"
					class="hover:text-secondary-600 dark:hover:text-secondary-400 font-medium sm:ml-auto"
				>
					Access publication
				</Button>
			{/if}
		</div>
	</div>
</article>

<style>
	.reference-type-pill {
		background-color: var(--accent-soft);
		color: var(--text-link);
		border-radius: var(--radius-md);
		padding: var(--space-3xs) var(--space-xs);
	}

	.abstract-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3xs);
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color var(--transition-micro);
	}

	.abstract-toggle:hover {
		color: var(--text-link-hover);
	}
</style>
