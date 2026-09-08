<script lang="ts">
	import {
		createSeoMeta,
		createWorkshopEventJsonLd,
		createWebPageJsonLd,
		createScholarlyMeta,
		createScholarlyArticleJsonLd
	} from '$lib/utils/seo';

	import AppButton from '$lib/components/AppButton.svelte';

	import PdfDownloadButton from '$lib/components/reader/PdfDownloadButton.svelte';

	import SeoHead from '$lib/components/SeoHead.svelte';

	import AuthorByline from '$lib/components/AuthorByline.svelte';
	import PaperKeywords from '$lib/components/PaperKeywords.svelte';

	import { positionPaperSeries as series } from '$lib/data/position-paper-series';

	import { positionPaperMeta } from '$lib/data/position-paper-meta';

	import { recommendedCitation } from '$lib/reader/citation-formatters';

	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

	import { copyToClipboard } from '$lib/utils/clipboard';

	const seo = createSeoMeta({
		path: '/position-paper',

		title: 'Position Paper',

		description: positionPaperMeta.abstract,

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

	/** Publication date from the shared bibliographic record. */

	const published = new Date(positionPaperMeta.publicationDate).toLocaleDateString('en-GB', {
		day: 'numeric',

		month: 'long',

		year: 'numeric'
	});

	const { licence } = positionPaperMeta;

	const status = [
		{ term: 'Status', detail: 'Published / Open access' },

		{ term: 'Published', detail: published },

		{ term: 'Issue', detail: positionPaperMeta.issue },

		{ term: 'Pages', detail: `${positionPaperMeta.pageStart}–${positionPaperMeta.pageEnd}` },

		{ term: 'Series', detail: series.name, href: series.url },

		// ISSN identifies the publication series.

		...(positionPaperMeta.issn ? [{ term: 'ISSN', detail: positionPaperMeta.issn }] : []),

		{ term: 'Publisher', detail: series.publisher, href: series.publisherUrl },

		{
			term: 'Access',

			detail: licence
				? `Open access · ${licence.name}`
				: 'Open access · licence confirmed on publication',

			href: licence?.url
		},

		{ term: 'DOI', detail: positionPaperMeta.doi, href: `https://doi.org/${positionPaperMeta.doi}` }
	];

	/**

	 * The paper is meant to be cited, so the page offers the citation up front —

	 * with every contributor named and the publication's total length.

	 */

	const citation = recommendedCitation(positionPaperMeta, seo.canonical);

	const scholarlyOptions = { ...positionPaperMeta, abstractUrl: seo.canonical };

	const scholarlySeo = { ...seo, meta: [...seo.meta, ...createScholarlyMeta(scholarlyOptions)] };

	const articleJsonLd = createScholarlyArticleJsonLd(scholarlyOptions);

	let citationCopied = $state(false);

	async function copyCitation() {
		citationCopied = await copyToClipboard(citation.text);

		if (citationCopied) setTimeout(() => (citationCopied = false), 2000);
	}
</script>

<SeoHead seo={scholarlySeo} jsonLd={[eventJsonLd, webPageJsonLd, articleJsonLd]} />

<!-- Published paper: full text, downloads and a complete bibliographic record. -->

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

				<div class="paper__actions">
					<AppButton href={resolveAppPath('/position-paper/read')}>Read the full paper</AppButton>

					{#if import.meta.env.PAPER_EPUB_AVAILABLE}
						<AppButton
							variant="secondary"
							href={resolveAssetPath('/documents/position-paper.epub')}
							download="position-paper.epub">Download EPUB</AppButton
						>
					{/if}

					<PdfDownloadButton
						size="lg"
						pdfPath={positionPaperMeta.pdfPath}
						pdfAvailable={positionPaperMeta.pdfAvailable}
						doi={positionPaperMeta.doi}
					/>
				</div>

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

					<p class="cite-block__text">
						{citation.beforeSeries} <em>{citation.series}</em>{citation.afterSeries}
					</p>

					<button type="button" class="cite-block__copy tap-target" onclick={copyCitation}>
						{citationCopied ? 'Citation copied' : 'Copy citation'}
					</button>
				</div>
			</header>

			<section aria-labelledby="paper-abstract">
				<h2 id="paper-abstract" class="heading-section">Abstract</h2>

				<p class="prose-serif">{positionPaperMeta.abstract}</p>
				<PaperKeywords keywords={positionPaperMeta.keywords} />
			</section>
		</div>
	</div>
</article>

<style>
	.paper__actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
		margin-block: var(--space-md);
	}

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
