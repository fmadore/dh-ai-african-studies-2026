<script lang="ts">
	import { Heading, P, Accordion, AccordionItem, List, Li } from 'flowbite-svelte';
	import { BookOpenOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { PositionPaperMeta } from '$lib/reader/types';
	import SeriesNote from '$lib/components/SeriesNote.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';
	import { positionPaperAbout } from '$lib/data/position-paper-about';

	interface Props {
		meta: PositionPaperMeta;
	}

	let { meta }: Props = $props();

	const { purpose, contentsIntro, audienceIntro, audiences, process } = positionPaperAbout;

	let formattedDate = $derived(
		new Date(meta.publicationDate).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	const nameList = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
	let authorNames = $derived(nameList.format(meta.authors.map((a) => a.name)));
</script>

<header class="reader-masthead">
	<p class="text-caption reader-masthead__eyebrow">
		{meta.journalTitle} · {meta.language.toUpperCase()}
	</p>

	<Heading
		tag="h1"
		class="heading-display heading-lg text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
	>
		{meta.title}
	</Heading>

	{#if meta.subtitle}
		<P class="text-lead animate-hero-subtitle text-muted-ink">{meta.subtitle}</P>
	{/if}

	<dl class="reader-masthead__meta">
		<div>
			<dt class="text-caption">Authors</dt>
			<dd class="body-text-strong">{authorNames}</dd>
		</div>
		<div>
			<dt class="text-caption">Published</dt>
			<dd class="body-text">{formattedDate}</dd>
		</div>
		{#if meta.doi}
			<div>
				<dt class="text-caption">DOI</dt>
				<dd class="body-text">
					<a class="link-secondary" href="https://doi.org/{meta.doi}">{meta.doi}</a>
				</dd>
			</div>
		{/if}
	</dl>

	<div class="reader-masthead__abstract card-surface surface-padding-sm">
		<p class="text-caption">Abstract</p>
		<P class="body-text">{meta.abstract}</P>
	</div>

	<!-- Demoted landing-page content — still indexable and discoverable -->
	<Accordion class="reader-masthead__about">
		<AccordionItem>
			{#snippet header()}
				<span class="flex items-center gap-2 font-semibold">
					<BookOpenOutline class="h-4 w-4" />
					About this paper
				</span>
			{/snippet}
			{#snippet arrowup()}
				<ChevronDownOutline class="rotate-180" />
			{/snippet}
			{#snippet arrowdown()}
				<ChevronDownOutline />
			{/snippet}
			<div class="stack-lg">
				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Purpose</Heading>
					<P class="body-text">{purpose}</P>
				</section>

				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Contents</Heading>
					<P class="body-text">{contentsIntro}</P>
					<WorkStreamCards headingTag="h4" />
				</section>

				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Audience</Heading>
					<P class="body-text">{audienceIntro}</P>
					<List tag="ul" class="mt-2 space-y-2">
						{#each audiences as audience (audience.title)}
							<Li class="body-text">
								<strong>{audience.title}</strong>
								{audience.description}
							</Li>
						{/each}
					</List>
				</section>

				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Process</Heading>
					<P class="body-text">{process.published}</P>
				</section>

				<SeriesNote />
			</div>
		</AccordionItem>
	</Accordion>
</header>

<style>
	.reader-masthead {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}
	.reader-masthead__eyebrow {
		margin: 0;
	}
	.reader-masthead__meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-md);
		padding-block: var(--space-md);
		border-block: 1px solid var(--border-subtle);
		margin: 0;
	}
	.reader-masthead__meta dt {
		margin-block-end: var(--space-3xs);
	}
	.reader-masthead__meta dd {
		margin: 0;
	}
	.reader-masthead__abstract {
		border-inline-start: 3px solid var(--accent);
	}
</style>
