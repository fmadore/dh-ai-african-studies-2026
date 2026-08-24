<script lang="ts">
	import ConceptGraph from '$lib/components/ConceptGraph.svelte';
	import { resolveAppPath } from '$lib/utils/paths';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { reveal } from '$lib/utils/reveal';
	import type { ConceptGraphData } from '$lib/types/concept-graph';
	import type { PageData } from './$types';

	// Graph data and its build-time stats arrive as prerendered page data from
	// +page.server.ts, so the 128 KB JSON stays out of the route's JS chunk.
	let { data }: { data: PageData } = $props();
	let graph = $derived(data.graph as ConceptGraphData);

	const referencesHref = resolveAppPath('/references');

	/** The hero and the section intro used to state the same numbers 200px
	 *  apart. They are stated once, here, as a strip that doubles as a legend. */
	let stats = $derived([
		{ value: data.nodeCount, label: 'concepts' },
		{ value: data.seedCount, label: 'seeds' },
		{ value: data.extendedCount, label: 'expanded' },
		{ value: data.edgeCount, label: 'relationships' },
		{ value: data.groupCount, label: 'thematic groups' }
	]);

	let steps = $derived([
		{
			title: 'Reading & annotation',
			body: 'Every reference in the bibliography was read and annotated in an Obsidian vault, capturing key themes as interlinked concept notes.'
		},
		{
			title: 'Seed concepts',
			body: `A research note maps ${data.seedCount} seed concepts to the workshop's four thematic groups, drawn directly from the literature.`
		},
		{
			title: 'Network expansion',
			body: `Wiki-links between notes reveal implicit connections. Concepts linked by two or more seeds are included, adding ${data.extendedCount} nodes and ${data.edgeCount} relationships.`
		},
		{
			title: 'Visualisation',
			body: 'A Python script exports the graph as JSON. Node size reflects degree, so cross-cutting ideas stand out; seed concepts carry a glow ring.'
		}
	]);

	const seo = createSeoMeta({
		title: 'Concept Map',
		description:
			'Explore the interactive concept network connecting the key themes of the Digital Humanities and AI in African Studies workshop.',
		path: '/concepts',
		keywords: [
			'Concept Map',
			'Workshop Themes',
			'Network Visualization',
			'Digital Humanities',
			'AI in African Studies',
			'Knowledge Graph'
		]
	});

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />

<PageHero
	eyebrow="Resources"
	title="Concept Map"
	lede="An interactive network of the ideas behind the workshop, extracted from reading notes on its bibliography."
	width="wide"
	size="compact"
>
	<dl class="stat-strip">
		{#each stats as stat (stat.label)}
			<div class="stat">
				<dt class="stat__label">{stat.label}</dt>
				<dd class="stat__value">{stat.value}</dd>
			</div>
		{/each}
	</dl>
</PageHero>

<!-- A dark, full-bleed stage: edges gain contrast and labels stop competing
     with the surface. The /concepts/embed route already implies the graph
     wants to stand alone. -->
<section class="graph-stage band-ink band-bleed" aria-label="Thematic concept network">
	<div class="graph-stage__inner">
		<ConceptGraph data={graph} />
	</div>
	<p class="graph-stage__hint content-width-wide padding-inline-section">
		Select a node to see its connections and to find it in the
		<a href={referencesHref} class="link-secondary">bibliography</a>.
	</p>
</section>

<!-- Methodology -->
<section class="band padding-inline-section">
	<div class="content-width-wide animate-section-reveal" use:reveal>
		<div class="section-head">
			<p class="section-head__eyebrow">Method</p>
			<h2 class="heading-section">How This Map Was Built</h2>
		</div>

		<ol class="method-steps stagger-children" use:reveal>
			{#each steps as step, index (step.title)}
				<li class="method-step">
					<span class="method-step__number">{String(index + 1).padStart(2, '0')}</span>
					<h3 class="method-step__title">{step.title}</h3>
					<p class="text-body-sm">{step.body}</p>
				</li>
			{/each}
		</ol>

		<p class="text-body-sm mt-lg">
			Source notes live in an <a
				href="https://obsidian.md"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary">Obsidian</a
			>
			vault built from the workshop's
			<a href={referencesHref} class="link-secondary">bibliography</a>.
		</p>
	</div>
</section>

<style>
	.stat-strip {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg) var(--space-xl);
		margin: var(--space-md) 0 0;
		padding-top: var(--space-md);
		border-top: 1px solid var(--border-subtle);
	}

	.stat {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.125rem;
	}

	.stat__value {
		margin: 0;
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-bold);
		font-size: var(--text-2xl);
		line-height: 1;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	.stat__label {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.graph-stage {
		padding-block: var(--space-lg);
	}

	.graph-stage__inner {
		width: min(100% - var(--space-lg), var(--container-7xl));
		margin-inline: auto;
	}

	.graph-stage__hint {
		margin-top: var(--space-sm);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	/* Four columns with a mono step number and a two-to-four-word title: the
	   previous list ran each title into its body via an em-dash, producing
	   paragraphs that were hard to skim. */
	.method-steps {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (min-width: 640px) {
		.method-steps {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.method-steps {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.method-step {
		display: grid;
		gap: var(--space-2xs);
		align-content: start;
		padding-top: var(--space-sm);
		border-top: 2px solid var(--border-accent);
	}

	/* The body sans with tabular figures, not the undeclared system mono stack:
	   these are step markers, not code. */
	.method-step__number {
		font-family: var(--font-family-body);
		font-variant-numeric: tabular-nums;
		font-size: var(--text-xs);
		color: var(--text-accent);
	}

	.method-step__title {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-lg);
		line-height: var(--leading-heading);
		/* Was a hardcoded --color-gray-900 with a :global(.dark) override —
		   which is exactly what --text-primary is for. */
		color: var(--text-primary);
	}
</style>
