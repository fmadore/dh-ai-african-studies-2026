<script lang="ts">
	import { createSeoMeta, createScholarlyMeta, createScholarlyArticleJsonLd } from '#lib/utils/seo';
	import { paperScholarlyOptions } from '#lib/utils/paper-scholarly';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import ReaderShell from '#lib/components/reader/ReaderShell.svelte';
	import { readerPrefsBootScript } from '#lib/utils/reader-preferences.svelte';
	import type { PositionPaperData } from '#lib/reader/load-paper';
	import { paperSummary } from '#lib/data/position-paper-meta';

	// Reader-only styles + webfonts. Imported here rather than from app.css so
	// they are bundled only when the reader route is built.
	import '#lib/reader/reader.css';

	interface Props {
		data: PositionPaperData;
	}

	let { data }: Props = $props();

	let meta = $derived(data.meta);
	let paper = $derived(data.paper);

	let seo = $derived(
		createSeoMeta({
			// Distinct from the landing page's "Position Paper", which shares the
			// summary as its description; the full abstract rides in citation_abstract
			title: 'Position Paper: Full Text',
			description: paperSummary,
			path: '/position-paper/read',
			type: 'article',
			robots: 'index,follow',
			authors: [...meta.authors],
			keywords: [...meta.keywords]
		})
	);

	// Same record as the landing page; here the reader is both landing and full text.
	let scholarlyOptions = $derived(
		paperScholarlyOptions(meta, { abstractUrl: seo.canonical, fullTextUrl: seo.canonical })
	);

	// Google Scholar / Dublin Core tags ride alongside the standard SEO set.
	let seoWithScholarly = $derived({
		...seo,
		meta: [...seo.meta, ...createScholarlyMeta(scholarlyOptions)]
	});

	// ScholarlyArticle only: Event data belongs to home, about and schedule, and
	// here it would have named the reader's own URL as the workshop's.
	let jsonLd = $derived(createScholarlyArticleJsonLd(scholarlyOptions));
</script>

<SeoHead seo={seoWithScholarly} {jsonLd} />

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static string, no interpolation -->
	{@html readerPrefsBootScript}
</svelte:head>

<ReaderShell {meta} {paper} canonicalUrl={seo.canonical} />
