<script lang="ts">
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { citationString, siteCitation, siteLicence } from '$lib/data/site-meta';
	import { copyToClipboard } from '$lib/utils/clipboard';

	/**
	 * The trimmed marks (see scripts/optimize_images.mjs) — the originals carry
	 * so much whitespace that at a shared box height the Africa Multiple logo
	 * rendered barely a third the size of its neighbours.
	 *
	 * `height` is per-mark on purpose: a 5:1 wordmark and a square roundel look
	 * the same weight only at different heights, so one shared value would make
	 * the wide ones dominate.
	 */
	const funders = [
		{
			href: 'https://www.volkswagenstiftung.de/en',
			src: resolveAssetPath('/images/logo/trimmed/vwst.webp'),
			alt: 'Volkswagen Foundation',
			width: 460,
			heightPx: 89,
			height: '1.4rem'
		},
		{
			href: 'https://www.zmo.de/en',
			src: resolveAssetPath('/images/logo/trimmed/zmo.webp'),
			alt: 'Leibniz-Zentrum Moderner Orient',
			width: 600,
			heightPx: 520,
			height: '2.5rem'
		},
		{
			href: 'https://www.kcl.ac.uk/',
			src: resolveAssetPath("/images/logo/King's_College_London_logo.svg"),
			alt: "King's College London",
			width: 923,
			heightPx: 703,
			height: '2.75rem'
		},
		{
			href: 'https://www.africamultiple.uni-bayreuth.de/en/index.html',
			src: resolveAssetPath('/images/logo/trimmed/africa-multiple.webp'),
			alt: 'Africa Multiple Cluster of Excellence',
			width: 600,
			heightPx: 148,
			height: '1.6rem'
		}
	];

	/** For a research archive the footer is prime real estate, not a colophon. */
	const columns = [
		{
			title: 'Workshop',
			links: [
				{ href: resolveAppPath('/about'), label: 'About' },
				{ href: resolveAppPath('/schedule'), label: 'Schedule' },
				{ href: resolveAppPath('/participants'), label: 'Participants' }
			]
		},
		{
			title: 'Outcomes',
			links: [
				{ href: resolveAppPath('/position-paper'), label: 'Position paper' },
				{ href: resolveAppPath('/photos'), label: 'Photos' },
				{ href: resolveAppPath('/interviews'), label: 'Interviews' }
			]
		},
		{
			title: 'Resources',
			links: [
				{ href: resolveAppPath('/references'), label: 'References' },
				{ href: resolveAppPath('/concepts'), label: 'Concept map' },
				{
					href: 'https://github.com/fmadore/dh-ai-african-studies-2026',
					label: 'Source code',
					external: true
				}
			]
		}
	];

	let copied = $state(false);

	async function copyCitation() {
		copied = await copyToClipboard(citationString);
		if (copied) setTimeout(() => (copied = false), 2000);
	}
</script>

<footer class="site-footer band-sunken mt-auto">
	<div class="content-width-wide padding-inline-lg py-2xl stack-xl">
		<!-- One plate, not four chips. Two of these marks are raster files with
		     their own white background and a third is a red brand block, so a
		     light plate is unavoidable; making it a single band means it reads
		     as a funders strip instead of four ragged rectangles. -->
		<div class="funder-plate">
			<ul class="funder-row">
				{#each funders as funder (funder.href)}
					<li>
						<a href={funder.href} target="_blank" rel="noopener noreferrer" class="funder-link">
							<img
								src={funder.src}
								alt={funder.alt}
								width={funder.width}
								height={funder.heightPx}
								loading="lazy"
								decoding="async"
								style="--mark-height: {funder.height}"
							/>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="footer-grid">
			{#each columns as column (column.title)}
				<nav class="stack-2xs" aria-label={column.title}>
					<p class="footer-heading">{column.title}</p>
					{#each column.links as link (link.href)}
						<a
							href={link.href}
							class="footer-link"
							target={link.external ? '_blank' : undefined}
							rel={link.external ? 'noopener noreferrer' : undefined}
						>
							{link.label}
						</a>
					{/each}
				</nav>
			{/each}

			<div class="stack-2xs">
				<p class="footer-heading">Cite this site</p>
				<p class="footer-citation">
					{siteCitation.authors} ({siteCitation.year}).
					<em>{siteCitation.title}</em>. {siteCitation.publisher}.
				</p>
				<button type="button" class="footer-copy tap-target" onclick={copyCitation}>
					{copied ? 'Citation copied' : 'Copy citation'}
				</button>
				<p class="footer-licence">
					{siteLicence.scope} are licensed under
					<a
						href={siteLicence.url}
						target="_blank"
						rel="noopener noreferrer"
						class="link-secondary"
						title={siteLicence.fullName}>{siteLicence.name}</a
					>: {siteLicence.summary}
					{siteLicence.exception}
				</p>
			</div>
		</div>

		<p class="footer-colophon">
			© {siteCitation.year}
			<a
				href="https://www.frederickmadore.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="link-subtle">Frédérick Madore</a
			>
			and
			<a
				href="https://www.vincenthiribarren.com/"
				target="_blank"
				rel="noopener noreferrer"
				class="link-subtle">Vincent Hiribarren</a
			>
		</p>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--border-default);
	}

	.funder-plate {
		/* White, and the raster marks are flattened onto white at build time, so
		   image and plate meet without a visible seam. Dark mode dims the whole
		   plate rather than tinting the background, for the same reason. */
		background: #ffffff;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-card);
		padding: var(--space-md) var(--space-lg);
		transition: opacity var(--transition-base);
	}

	:global(.dark) .funder-plate {
		opacity: 0.86;
		border-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .funder-plate:hover {
		opacity: 1;
	}

	.funder-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md) clamp(1.5rem, 5vw, 3.5rem);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.funder-link {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		transition: opacity var(--transition-micro);
	}

	.funder-link:hover {
		opacity: 0.7;
	}

	.funder-link img {
		height: var(--mark-height, 2rem);
		width: auto;
		max-width: 11rem;
		object-fit: contain;
	}

	@media (max-width: 480px) {
		.funder-plate {
			padding: var(--space-sm) var(--space-md);
		}

		.funder-row {
			gap: var(--space-md) var(--space-lg);
		}
	}

	.footer-grid {
		display: grid;
		gap: var(--space-xl);
		grid-template-columns: 1fr;
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-subtle);
	}

	@media (min-width: 640px) {
		.footer-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.footer-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.6fr);
		}
	}

	.footer-heading {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-accent);
		margin-bottom: var(--space-3xs);
	}

	.footer-link {
		display: block;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		text-decoration: none;
		padding-block: var(--space-3xs);
		transition: color var(--transition-micro);
	}

	.footer-link:hover {
		color: var(--text-link);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.footer-citation {
		font-family: var(--font-family-serif);
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
		color: var(--text-secondary);
	}

	.footer-copy {
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		cursor: pointer;
		padding-inline: 0;
		transition: color var(--transition-micro);
	}

	.footer-copy:hover {
		color: var(--text-link-hover);
	}

	.footer-licence,
	.footer-colophon {
		font-size: var(--text-xs);
		line-height: var(--leading-normal);
		color: var(--text-subtle);
	}

	.footer-colophon {
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-subtle);
	}
</style>
