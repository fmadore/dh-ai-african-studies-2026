<script lang="ts">
	import PageHero from '$lib/components/PageHero.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import AppButton from '$lib/components/AppButton.svelte';
	import { positionPaperMeta } from '$lib/data/position-paper-meta';
	import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

	const bulletinUrl =
		'https://www.frederickmadore.com/publications/madore-2026-conversation-coauthorship-dh-ai';
	const reports = [
		{
			type: 'Blog post',
			image: '/images/publications/digital-history-bielefeld.webp',
			language: 'German',
			lang: 'de',
			title:
				'Charting New Territory: Digital Humanities und Künstliche Intelligenz in den African Studies',
			authors: 'Frédérick Madore & Vincent Hiribarren',
			venue: 'Digital History Bielefeld',
			date: '31 March 2026',
			datetime: '2026-03-31',
			description:
				'A blog post on the Hanover workshop and the relationship between digital humanities, artificial intelligence and African studies.',
			url: 'https://doi.org/10.58079/15z9p',
			action: 'Read the blog post'
		},
		{
			type: 'University news',
			language: 'English',
			lang: 'en',
			title:
				'Dr Johannes Sibeko among global leaders shaping the future of digital humanities and AI',
			authors: 'Nelson Mandela University',
			venue: 'University news',
			date: '26 February 2026',
			datetime: '2026-02-26',
			description:
				'Johannes Sibeko reflects on African languages, data sovereignty and what the workshop means for the university’s Digital Humanities Hub.',
			url: 'https://news.mandela.ac.za/News/Dr-Johannes-Sibeko-among-global-leaders-shaping-th',
			action: 'Read the news story'
		}
	];
	const seo = createSeoMeta({
		title: 'Publications & reports',
		description:
			'Publications, workshop reports, news coverage and conference presentations from Charting New Territory: Digital Humanities and AI in African Studies.',
		path: '/publications'
	});
	const jsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
</script>

<SeoHead {seo} {jsonLd} />
<PageHero
	eyebrow="Outcomes"
	title="Publications & reports"
	lede="The workshop’s collective position paper, alongside reports, reflections and conference contributions."
	width="wide"
	size="compact"
/>

<div class="padding-inline-section archive">
	<div class="content-width-wide">
		<section class="paper-lead" aria-labelledby="paper-title">
			<p class="text-label text-accent">Central workshop outcome · Published 7 September 2026</p>
			<h2 id="paper-title">
				<a href={resolveAppPath('/position-paper')}>{positionPaperMeta.title}</a>
			</h2>
			<p class="prose-serif">
				The workshop’s central outcome is a collectively authored position paper on the purposes,
				responsibilities and conditions of digital humanities and AI in African studies.
			</p>
			<p class="byline">Frédérick Madore, Vincent Hiribarren and fellow workshop participants</p>
			<p class="text-caption">
				{positionPaperMeta.journalTitle}, no. {positionPaperMeta.issue}, pp. {positionPaperMeta.pageStart}–{positionPaperMeta.pageEnd}
				· {positionPaperMeta.publisher}
			</p>
			<div class="paper-action">
				<AppButton href={resolveAppPath('/position-paper/read')}>Read the position paper</AppButton>
				<a class="link-secondary" href={resolveAppPath('/position-paper')}
					>Publication details and downloads</a
				>
			</div>
		</section>
		<section class="reports" aria-labelledby="reports-title">
			<h2 id="reports-title" class="heading-section">Reports &amp; coverage</h2>
			<article class="feature">
				<figure>
					<a href={bulletinUrl} aria-label="Read From Conversation to Co-authorship">
						<img
							src={resolveAssetPath('/images/publications/zmo-bulletin-48.webp')}
							alt="Article page from ZMO Bulletin 48, with photographs of the workshop participants and organisers."
							width="600"
							height="848"
						/>
					</a>
					<figcaption class="text-caption">Article preview · ZMO Bulletin 48, p. 10</figcaption>
				</figure>
				<div class="feature-copy">
					<p class="text-label text-accent">Bulletin article · English</p>
					<h3><a href={bulletinUrl}>From Conversation to Co-authorship</a></h3>
					<p class="subtitle">
						A Workshop on Digital Humanities and AI in African Studies, 18–20 February 2026,
						Herrenhausen, Hanover
					</p>
					<p class="byline">Frédérick Madore</p>
					<p class="text-caption">
						ZMO Bulletin · No. 48 · p. 10 · <time datetime="2026-05">May 2026</time>
					</p>
					<p class="prose-serif">
						A reflection on how an interdisciplinary gathering in Hanover became a collaborative
						writing project, bringing researchers into conversation across digital humanities, AI
						and African studies.
					</p>
					<a class="read-link" href={bulletinUrl}
						>Read the article <span aria-hidden="true">↗</span></a
					>
				</div>
			</article>

			<div class="report-grid">
				{#each reports as report (report.url)}
					<article class="report">
						{#if report.image}
							<a class="report-preview" href={report.url} aria-label="Read {report.title}">
								<img
									src={resolveAssetPath(report.image)}
									alt="Screenshot of the Digital History Bielefeld blog post."
									width="800"
									height="800"
									loading="lazy"
								/>
							</a>
						{/if}
						<p class="text-label text-accent">{report.type} · {report.language}</p>
						<h3 lang={report.lang}><a href={report.url}>{report.title}</a></h3>
						<p class="byline">{report.authors}</p>
						<p class="text-caption">
							{report.venue} · <time datetime={report.datetime}>{report.date}</time>
						</p>
						<p class="prose-serif-sm">{report.description}</p>
						<a class="read-link" href={report.url}
							>{report.action} <span aria-hidden="true">↗</span></a
						>
					</article>
				{/each}
			</div>
		</section>

		<section class="conference" aria-labelledby="conference-title">
			<div>
				<h2 id="conference-title" class="heading-section">Conference contribution</h2>
				<p class="text-caption"><time datetime="2026-06-30">30 June 2026</time> · Paris, France</p>
			</div>
			<article>
				<p class="text-label text-accent">REAF 2026 · French</p>
				<h3 lang="fr">
					Retour sur une note de synthèse analysant la relation entre Humanités Numériques, l’IA et
					les Études Africaines (Hanovre, février 2026)
				</h3>
				<p class="byline">Vincent Hiribarren &amp; Frédérick Madore</p>
				<p class="prose-serif-sm">
					Presented in the session <span lang="fr"
						>« Humanités numériques (DH) et IA dans les études africaines »</span
					>
					at the <span lang="fr">9èmes Rencontres des études africaines en France (REAF)</span>.
				</p>
			</article>
		</section>
	</div>
</div>

<style>
	.archive {
		padding-block: var(--space-lg) var(--space-4xl);
	}
	.paper-lead {
		padding: var(--space-2xl);
		background: var(--bg-sunken);
		border-radius: var(--radius-panel);
	}
	.paper-lead h2 {
		max-width: 30ch;
		font-size: clamp(2rem, 3vw, 3rem);
		margin-top: var(--space-sm);
	}
	.paper-lead .prose-serif {
		max-width: 68ch;
	}
	.paper-action {
		margin-top: var(--space-lg);
	}
	.feature {
		display: grid;
		grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
		gap: var(--space-3xl);
		align-items: center;
		padding: var(--space-xl);
		margin-top: var(--space-lg);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-card);
	}
	figure {
		margin: 0;
		min-width: 0;
	}
	figure a {
		display: block;
		max-width: 23rem;
		margin-inline: auto;
	}
	figure img {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--border-default);
	}
	figcaption {
		text-align: center;
		margin-top: var(--space-sm);
	}
	.feature-copy {
		min-width: 0;
	}
	h2,
	h3 {
		font-family: var(--font-family-display);
		font-weight: 600;
		line-height: 1.2;
		text-wrap: balance;
	}
	.feature h3 {
		font-size: clamp(1.375rem, 1.6vw, 1.75rem);
		margin-block: var(--space-sm);
	}
	h2 a,
	h3 a {
		color: var(--text-primary);
		text-decoration: none;
	}
	h2 a:hover,
	h3 a:hover {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
	.subtitle {
		font-size: var(--text-xl);
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: var(--space-lg);
	}
	.byline {
		font-weight: 600;
		margin-block: var(--space-md) var(--space-2xs);
	}
	.prose-serif,
	.prose-serif-sm {
		margin-top: var(--space-md);
	}
	.read-link {
		display: inline-flex;
		gap: var(--space-sm);
		align-items: center;
		min-height: 2.75rem;
		margin-top: var(--space-md);
		color: var(--text-accent);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.25em;
	}
	.reports {
		margin-top: var(--space-3xl);
	}
	.report-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-xl);
		margin-top: var(--space-lg);
	}
	.report {
		padding: var(--space-xl);
		background: var(--bg-raised);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-card);
	}
	.report-preview {
		display: block;
		max-width: 14rem;
		margin-bottom: var(--space-lg);
	}
	.report-preview img {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--border-default);
	}
	h3 {
		font-size: clamp(1.375rem, 1.6vw, 1.75rem);
		margin-top: var(--space-sm);
	}
	.conference {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: var(--space-3xl);
		padding-block: var(--space-2xl);
		margin-top: var(--space-3xl);
		border-block: 1px solid var(--border-default);
	}
	.conference .text-caption {
		margin-top: var(--space-sm);
	}
	@media (max-width: 700px) {
		.feature,
		.report-grid,
		.conference {
			grid-template-columns: minmax(0, 1fr);
		}
		.feature,
		.conference {
			gap: var(--space-xl);
		}
		.feature,
		.paper-lead {
			padding: var(--space-lg);
		}
		figure a {
			max-width: 10rem;
		}
	}
</style>
