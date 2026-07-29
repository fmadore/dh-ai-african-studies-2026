<script lang="ts">
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SectionNav from '$lib/components/SectionNav.svelte';
	import WorkStreamCards from '$lib/components/WorkStreamCards.svelte';
	import AuthorByline from '$lib/components/AuthorByline.svelte';
	import { positionPaperAbout } from '$lib/data/position-paper-about';
	import { positionPaperMeta } from '$lib/data/position-paper-meta';
	import { toChicago } from '$lib/reader/citation-formatters';
	import { resolveAppPath } from '$lib/utils/paths';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const seo = createSeoMeta({
		path: '/position-paper',
		title: 'Position Paper',
		description:
			"The workshop's main output is a co-authored position paper, to be published in open access in the ZMO Programmatic Texts series.",
		type: 'article',
		keywords: [
			'Position Paper',
			'ZMO Programmatic Texts',
			'Open Access',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Policy Recommendations',
			'Research Framework'
		]
	});

	const eventJsonLd = createWorkshopEventJsonLd({
		description: seo.description,
		url: seo.canonical
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});

	const { purpose, contentsIntro, audienceIntro, audiences, process, series } = positionPaperAbout;

	/** Expected period, from the bibliographic record the reader already uses. */
	const expected = new Date(positionPaperMeta.publicationDate).toLocaleDateString('en-GB', {
		month: 'long',
		year: 'numeric'
	});

	const { licence } = positionPaperMeta;

	const status = [
		{ term: 'Status', detail: 'Forthcoming — in preparation' },
		{ term: 'Expected', detail: expected },
		{ term: 'Series', detail: series.name, href: series.url },
		{ term: 'Publisher', detail: series.publisher, href: series.publisherUrl },
		{
			term: 'Access',
			detail: licence
				? `Open access · ${licence.name}`
				: 'Open access · licence confirmed on publication',
			href: licence?.url
		},
		{ term: 'DOI', detail: positionPaperMeta.doi ?? 'Assigned on publication' }
	];

	/**
	 * The paper is meant to be cited, so the page offers the citation up front —
	 * from the same formatter the reader's "How to cite" widget uses, so the two
	 * cannot drift apart.
	 */
	const provisionalCitation = toChicago(positionPaperMeta, seo.canonical);

	let citationCopied = $state(false);

	async function copyCitation() {
		citationCopied = await copyToClipboard(provisionalCitation);
		if (citationCopied) setTimeout(() => (citationCopied = false), 2000);
	}

	const sections = [
		{ id: 'abstract', label: 'Abstract' },
		{ id: 'purpose', label: 'Purpose' },
		{ id: 'contents', label: 'Contents' },
		{ id: 'audience', label: 'Audience' },
		{ id: 'process', label: 'Process' }
	];
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Set as a publication rather than a landing page: one article column, a
     sticky mini-TOC and the reading face, so it previews the paper itself. -->
<article class="paper padding-inline-section band-tight">
	<div class="content-width-wide paper__layout">
		<div class="paper__aside">
			<SectionNav {sections} label="Contents" />
		</div>

		<div class="paper__body print-expand-links">
			<header class="paper__masthead">
				<p class="text-label text-accent">Workshop output</p>
				<h1 class="heading-display">{positionPaperMeta.title}</h1>
				<div class="paper__authors">
					<AuthorByline
						authors={positionPaperMeta.authors}
						note={positionPaperMeta.authorshipNote}
					/>
				</div>

				<!-- The page previously said "forthcoming" and "open access" but gave
				     no date and no follow-up path. -->
				<dl class="status-block">
					{#each status as row (row.term)}
						<div class="status-row">
							<dt>{row.term}</dt>
							<dd>
								{#if row.href}
									<a
										href={row.href}
										target="_blank"
										rel="noopener noreferrer"
										class="link-secondary">{row.detail}</a
									>
								{:else}
									{row.detail}
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
				<p class="text-body-sm">
					Publication will be announced here. For questions before then, contact the
					<a href={resolveAppPath('/about')} class="link-secondary">co-organisers</a>.
				</p>

				<!-- Citation up front: the point of publishing this open access is
				     that it gets cited, so the reference is offered rather than
				     left to be reconstructed from the masthead. -->
				<div class="cite-block">
					<p class="text-label text-accent">Cite this paper</p>
					<p class="cite-block__text">{provisionalCitation}</p>
					<button type="button" class="cite-block__copy tap-target" onclick={copyCitation}>
						{citationCopied ? 'Citation copied' : 'Copy citation'}
					</button>
					<p class="text-caption">Provisional — page numbers and DOI follow on publication.</p>
				</div>
			</header>

			<section id="abstract" class="paper__section">
				<div class="section-head">
					<p class="section-head__eyebrow">Abstract</p>
					<h2 class="heading-section">What the paper argues</h2>
				</div>
				<p class="prose-serif">{positionPaperMeta.abstract}</p>
			</section>

			<section id="purpose" class="paper__section">
				<div class="section-head">
					<p class="section-head__eyebrow">01</p>
					<h2 class="heading-section">Purpose</h2>
				</div>
				<p class="prose-serif">{purpose}</p>
			</section>

			<section id="contents" class="paper__section">
				<div class="section-head">
					<p class="section-head__eyebrow">02</p>
					<h2 class="heading-section">Contents</h2>
				</div>
				<p class="prose-serif mb-lg">{contentsIntro}</p>

				<WorkStreamCards />
			</section>

			<section id="audience" class="paper__section">
				<div class="section-head">
					<p class="section-head__eyebrow">03</p>
					<h2 class="heading-section">Audience</h2>
				</div>
				<p class="prose-serif mb-md">{audienceIntro}</p>
				<dl class="audience-list">
					{#each audiences as audience (audience.title)}
						<div>
							<dt>{audience.title}</dt>
							<dd class="text-body-sm">{audience.description}</dd>
						</div>
					{/each}
				</dl>
			</section>

			<section id="process" class="paper__section">
				<div class="section-head">
					<p class="section-head__eyebrow">04</p>
					<h2 class="heading-section">Process</h2>
				</div>
				<p class="prose-serif">{process.forthcoming}</p>
			</section>
		</div>
	</div>
</article>

<style>
	.paper__layout {
		display: grid;
		gap: var(--space-xl);
		align-items: start;
	}

	@media (min-width: 1024px) {
		.paper__layout {
			grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
			gap: var(--space-3xl);
		}
	}

	.paper__aside {
		order: -1;
	}

	.paper__body {
		display: grid;
		gap: var(--space-3xl);
		min-width: 0;
		max-width: 46rem;
	}

	.paper__masthead {
		display: grid;
		gap: var(--space-sm);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--border-default);
	}

	.paper__authors {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-secondary);
	}

	.paper__section {
		scroll-margin-top: var(--scroll-offset);
	}

	/* ---------- Status block ---------- */
	.status-block {
		display: grid;
		gap: 0;
		margin: var(--space-md) 0 0;
		border-top: 1px solid var(--border-subtle);
	}

	.status-row {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: var(--space-md);
		padding-block: var(--space-2xs);
		border-bottom: 1px solid var(--border-subtle);
	}

	.status-row dt {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-subtle);
	}

	.status-row dd {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	/* ---------- Citation ---------- */
	.cite-block {
		display: grid;
		justify-items: start;
		gap: var(--space-2xs);
		margin-top: var(--space-sm);
		padding: var(--space-md);
		border-radius: var(--radius-card);
		background-color: var(--bg-sunken);
		border: 1px solid var(--border-subtle);
	}

	.cite-block__text {
		font-family: var(--font-family-serif);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--text-secondary);
		max-width: var(--measure-prose);
	}

	.cite-block__copy {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		cursor: pointer;
		padding-inline: 0;
		transition: color var(--transition-micro);
	}

	.cite-block__copy:hover {
		color: var(--text-link-hover);
	}

	/* ---------- Audience ---------- */
	.audience-list {
		display: grid;
		gap: var(--space-sm);
		margin: 0;
	}

	.audience-list dt {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
	}

	.audience-list dd {
		margin: 0;
	}
</style>
