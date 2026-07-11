<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import ConceptGraph from '$lib/components/ConceptGraph.svelte';
	import graphData from '$lib/data/concept-graph.json';
	import { resolveAppPath } from '$lib/utils/paths';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { reveal } from '$lib/utils/reveal';
	import type { ConceptGraphData } from '$lib/types/concept-graph';

	const data = graphData as ConceptGraphData;
	const nodeCount = data.nodes.length;
	const edgeCount = data.edges.length;
	const seedCount = data.nodes.filter((n) => n.seed).length;
	const extendedCount = nodeCount - seedCount;

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

<!-- Hero Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>

	<div class="content-width surface-panel surface-padding stack-md relative">
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 text-center tracking-tight drop-shadow-md"
		>
			Concept Map
		</Heading>
		<P class="text-lead animate-hero-subtitle mx-auto max-w-2xl text-center">
			An interactive network of <strong>{nodeCount}</strong> concepts and
			<strong>{edgeCount}</strong> relationships extracted from reading notes on the workshop's
			<a href={resolveAppPath('/references')} class="link-secondary">bibliography</a>.
		</P>
	</div>
</section>

<!-- Graph Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>

	<div class="content-width-wide surface-panel surface-padding stack-lg relative">
		<!-- Graph -->
		<div class="stack-md animate-section-reveal" use:reveal>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline text-center"
			>
				Thematic Network
			</Heading>
			<P class="body-text stack-item-sm mx-auto max-w-2xl text-center">
				{seedCount} seed concepts identified from reading notes on the workshop's
				<a href={resolveAppPath('/references')} class="link-secondary">bibliography</a>, expanded
				into a network of {nodeCount} interconnected ideas.
			</P>

			<ConceptGraph {data} />
		</div>

		<!-- Methodology -->
		<div class="stack-md animate-section-reveal" use:reveal>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline text-center"
			>
				How This Map Was Built
			</Heading>

			<ol class="methodology-steps stagger-children mx-auto max-w-3xl" use:reveal>
				<li class="step">
					<span class="step-badge" aria-hidden="true">1</span>
					<div>
						<strong class="step-title">Reading & Annotation</strong>
						<span class="body-text-muted"
							>&mdash; Each reference in the workshop's
							<a href={resolveAppPath('/references')} class="link-secondary">bibliography</a>
							was read and annotated in an
							<a
								href="https://obsidian.md"
								target="_blank"
								rel="noopener noreferrer"
								class="link-secondary">Obsidian</a
							>
							vault, capturing key themes as interlinked concept notes.
						</span>
					</div>
				</li>
				<li class="step">
					<span class="step-badge" aria-hidden="true">2</span>
					<div>
						<strong class="step-title">Seed Concepts</strong>
						<span class="body-text-muted"
							>&mdash; A research note maps <strong>{seedCount}</strong> seed concepts to the workshop's
							four thematic groups, drawn directly from the literature.
						</span>
					</div>
				</li>
				<li class="step">
					<span class="step-badge" aria-hidden="true">3</span>
					<div>
						<strong class="step-title">Network Expansion</strong>
						<span class="body-text-muted"
							>&mdash; Wiki-links between notes reveal implicit connections. Concepts linked by two
							or more seeds are included, producing <strong>{extendedCount}</strong> additional
							nodes and
							<strong>{edgeCount}</strong> relationships.
						</span>
					</div>
				</li>
				<li class="step">
					<span class="step-badge" aria-hidden="true">4</span>
					<div>
						<strong class="step-title">Visualization</strong>
						<span class="body-text-muted"
							>&mdash; A Python script exports the graph as JSON. Node size reflects degree
							(connections), making cross-cutting ideas visually prominent. Seed concepts are marked
							with a glow ring.
						</span>
					</div>
				</li>
			</ol>
		</div>
	</div>
</section>

<style>
	.methodology-steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.step {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		line-height: var(--leading-relaxed);
	}

	.step-badge {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-full);
		background: linear-gradient(135deg, var(--color-secondary-400), var(--color-secondary-600));
		color: white;
		font-size: 0.7rem;
		font-weight: var(--font-weight-bold);
		position: relative;
		top: 0.15em;
	}

	.step-title {
		color: var(--color-gray-900);
	}

	:global(.dark) .step-title {
		color: var(--color-gray-100);
	}
</style>
