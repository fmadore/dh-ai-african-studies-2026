<script lang="ts">
	import { Heading, P, Accordion, AccordionItem, Alert, Card, List, Li } from 'flowbite-svelte';
	import { BookOpenOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { PositionPaperMeta } from '$lib/reader/types';
	import { workStreams } from '$lib/data/work-streams';

	interface Props {
		meta: PositionPaperMeta;
	}

	let { meta }: Props = $props();

	const audiences = [
		{
			title: 'Research funders',
			description: 'seeking models for sustainable, equitable project support'
		},
		{
			title: 'Universities',
			description: 'developing curricula and training in digital methods'
		},
		{
			title: 'Technology developers',
			description: 'building tools for multilingual and cross-cultural research'
		},
		{
			title: 'Policy makers',
			description: 'working on data governance and digital infrastructure'
		}
	];

	let formattedDate = $derived(
		new Date(meta.publicationDate).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	let authorNames = $derived(
		meta.authors.length <= 1
			? meta.authors.map((a) => a.name).join('')
			: meta.authors.length === 2
				? meta.authors.map((a) => a.name).join(' and ')
				: meta.authors
						.slice(0, -1)
						.map((a) => a.name)
						.join(', ') +
					', and ' +
					meta.authors[meta.authors.length - 1].name
	);
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
					<P class="body-text">
						The paper synthesises the discussions from the workshop into a set of recommendations
						for researchers, funders and institutions working at the intersection of digital
						humanities, AI and African studies. It aims to provide a strategic reference point for
						this emerging field, which currently lacks shared standards and clear direction. The
						paper centres African perspectives while addressing infrastructure gaps and linguistic
						diversity.
					</P>
				</section>

				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Contents</Heading>
					<P class="body-text">The paper addresses three areas:</P>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each workStreams as stream (stream.id)}
							<Card class="card-surface surface-padding-xs stack-xs h-full">
								<Heading tag="h4" class="heading-sub text-base">{stream.title}</Heading>
								<P class="text-body-sm">{stream.description}</P>
							</Card>
						{/each}
					</div>
				</section>

				<section class="stack-xs">
					<Heading tag="h3" class="heading-sub text-lg">Audience</Heading>
					<P class="body-text">The paper is addressed to:</P>
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
					<P class="body-text">
						A drafting committee prepared the paper in the months following the workshop,
						incorporating participant feedback and professional editing. The goal was a document
						that is both rigorous and accessible to non-specialist readers in policy and funding
						contexts.
					</P>
				</section>

				<Alert color="teal" class="max-w-3xl">
					{#snippet icon()}
						<BookOpenOutline class="h-5 w-5" />
					{/snippet}
					<span class="font-semibold">About ZMO Programmatic Texts</span>
					<p class="mt-1 text-sm">
						This <a
							href="https://www.zmo.de/en/publications/translate-to-english-zmo-programmatic-texts"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium underline hover:no-underline">series</a
						>
						publishes conceptual articles engaging with interdisciplinary and inter-regional research
						conducted at the
						<a
							href="https://www.zmo.de/en"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium underline hover:no-underline">Leibniz-Zentrum Moderner Orient</a
						>.
					</p>
				</Alert>
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
