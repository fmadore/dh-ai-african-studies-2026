<script lang="ts">
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { citationString, siteCitation, siteLicence } from '$lib/data/site-meta';
	import { copyToClipboard } from '$lib/utils/clipboard';

	const foundationLogo = resolveAssetPath('/images/logo/VWST-logo.jpg');
	const zmoLogo = resolveAssetPath('/images/logo/ZMO-logo.png');
	const kclLogo = resolveAssetPath("/images/logo/King's_College_London_logo.svg");
	const bayreuthLogo = resolveAssetPath('/images/logo/uni-bayreuth-africa-multiple-logo.jpeg');

	const funders = [
		{
			href: 'https://www.volkswagenstiftung.de/en',
			src: foundationLogo,
			alt: 'Volkswagen Foundation'
		},
		{ href: 'https://www.zmo.de/en', src: zmoLogo, alt: 'Leibniz-Zentrum Moderner Orient' },
		{ href: 'https://www.kcl.ac.uk/', src: kclLogo, alt: "King's College London" },
		{
			href: 'https://www.africamultiple.uni-bayreuth.de/en/index.html',
			src: bayreuthLogo,
			alt: 'Africa Multiple Cluster of Excellence'
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
		<!-- Funder + host marks. Same-height chips, dimmed as a whole in dark
		     mode: at 4rem and full brightness these were the brightest thing on
		     a near-black page, at the very bottom of it, on other people's
		     logos. -->
		<ul class="logo-row">
			{#each funders as funder (funder.href)}
				<li>
					<a href={funder.href} target="_blank" rel="noopener noreferrer" class="logo-chip">
						<img src={funder.src} alt={funder.alt} />
					</a>
				</li>
			{/each}
		</ul>

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

	.logo-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* One height, one padding, images centred — the marks have wildly different
	   aspect ratios, so sizing the chip to its image made four different boxes. */
	.logo-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 3.25rem;
		min-width: 5.5rem;
		padding-inline: var(--space-sm);
		border-radius: var(--radius-sm);
		/* Pure white, not #f2f1ef: half these marks are JPEGs carrying their own
		   white background, and any other tint leaves a visible rectangle inside
		   the chip. The dimming below is applied to the whole chip instead, so
		   image and backdrop darken together and the seam disappears. */
		background: #ffffff;
		border: 1px solid var(--border-subtle);
		transition:
			opacity var(--transition-micro),
			box-shadow var(--transition-micro);
	}

	/* Cap by width as well as height, so a very wide mark (Volkswagen Stiftung)
	   is not squeezed to half the optical size of a square one. */
	.logo-chip img {
		max-height: 2rem;
		max-width: 8rem;
		width: auto;
		object-fit: contain;
	}

	:global(.dark) .logo-chip {
		opacity: 0.82;
		border-color: rgba(255, 255, 255, 0.1);
	}

	.logo-chip:hover {
		box-shadow: var(--shadow-xs);
	}

	:global(.dark) .logo-chip:hover {
		opacity: 1;
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
