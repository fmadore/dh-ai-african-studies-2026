<script lang="ts">
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
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

	const { series } = positionPaperAbout;

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
		// Identifies the series, so it belongs beside it rather than next to the
		// paper's own (still unassigned) DOI.
		...(positionPaperMeta.issn ? [{ term: 'ISSN', detail: positionPaperMeta.issn }] : []),
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
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Until the text exists, this is a bibliographic record, not a landing page:
     the masthead carries everything a reader can act on, and the body says
     when the rest arrives. -->
<article class="paper padding-inline-section band-tight">
	<div class="content-width">
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

			<section>
				<div class="section-head">
					<p class="section-head__eyebrow">Full text</p>
					<h2 class="heading-section">Coming soon</h2>
				</div>
				<p class="prose-serif">
					The full text will be published on this page, in open access, as soon as
					{series.name} releases it. For questions before then, contact the
					<a href={resolveAppPath('/about')} class="link-secondary">co-organisers</a>.
				</p>
			</section>
		</div>
	</div>
</article>

<style>
	.paper__body {
		display: grid;
		gap: var(--space-3xl);
		min-width: 0;
		max-width: 46rem;
		margin-inline: auto;
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
</style>
