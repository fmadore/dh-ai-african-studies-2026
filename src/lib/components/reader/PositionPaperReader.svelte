<script lang="ts">
	import {
		createSeoMeta,
		createWorkshopEventJsonLd,
		createScholarlyMeta,
		createScholarlyArticleJsonLd,
		type ScholarlyMetaOptions
	} from '$lib/utils/seo';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ReaderShell from '$lib/components/reader/ReaderShell.svelte';
	import type { PositionPaperData } from '$lib/reader/load-paper';

	// Reader-only styles + webfonts. Imported here rather than from app.css so
	// they are bundled only when the reader route is built.
	import '$lib/reader/reader.css';

	interface Props {
		data: PositionPaperData;
	}

	let { data }: Props = $props();

	let meta = $derived(data.meta);
	let paper = $derived(data.paper);

	// `noindex` is belt-and-braces: this route is excluded from the public
	// build entirely (see scripts/paper-reader.mjs), so search engines should
	// never reach it. The tag only matters for a flagged preview deployment.
	let seo = $derived(
		createSeoMeta({
			title: 'Position Paper',
			description: meta.abstract,
			path: '/position-paper/read',
			type: 'article',
			robots: 'noindex,nofollow',
			authors: [...meta.authors],
			keywords: [...meta.keywords]
		})
	);

	let scholarlyOptions = $derived<ScholarlyMetaOptions>({
		title: meta.title,
		authors: [...meta.authors],
		publicationDate: meta.publicationDate,
		revisedDate: meta.revisedDate,
		abstract: meta.abstract,
		keywords: [...meta.keywords],
		language: meta.language,
		publisher: meta.publisher,
		journalTitle: meta.journalTitle,
		abstractUrl: seo.canonical,
		doi: meta.doi,
		issn: meta.issn
	});

	// Google Scholar / Dublin Core tags ride alongside the standard SEO set.
	let seoWithScholarly = $derived({
		...seo,
		meta: [...seo.meta, ...createScholarlyMeta(scholarlyOptions)]
	});

	let jsonLd = $derived([
		createScholarlyArticleJsonLd(scholarlyOptions),
		createWorkshopEventJsonLd({ description: seo.description, url: seo.canonical })
	]);
</script>

<SeoHead seo={seoWithScholarly} {jsonLd} />

<ReaderShell {meta} {paper} canonicalUrl={seo.canonical} />
