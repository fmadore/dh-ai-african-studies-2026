<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import type { PositionPaperMeta } from '$lib/reader/types';
	import AuthorByline from '$lib/components/AuthorByline.svelte';

	interface Props {
		meta: PositionPaperMeta;
	}

	let { meta }: Props = $props();

	let formattedDate = $derived(
		new Date(meta.publicationDate).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<header class="reader-masthead">
	<p class="text-caption reader-masthead__eyebrow">
		{meta.journalTitle} · {meta.language.toUpperCase()}
	</p>

	<Heading tag="h1" class="heading-display heading-lg animate-hero-title pb-2 tracking-tight">
		{meta.title}
	</Heading>

	{#if meta.subtitle}
		<P class="text-lead animate-hero-subtitle text-muted-ink">{meta.subtitle}</P>
	{/if}

	<dl class="reader-masthead__meta">
		<div class="reader-masthead__authors">
			<dt class="text-caption">Authors</dt>
			<dd class="body-text-strong">
				<AuthorByline authors={meta.authors} note={meta.authorshipNote} />
			</dd>
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

	<section
		class="reader-masthead__abstract card-surface surface-padding-sm"
		aria-labelledby="abstract-heading"
	>
		<Heading tag="h2" id="abstract-heading" class="text-caption">Abstract</Heading>
		<P class="body-text">{meta.abstract}</P>
	</section>
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
	/* A byline this long needs the full measure, not a 12rem column. */
	.reader-masthead__authors {
		grid-column: 1 / -1;
	}
	.reader-masthead__meta dt {
		margin-block-end: var(--space-3xs);
	}
	.reader-masthead__meta dd {
		margin: 0;
	}
</style>
