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
	import { readerPrefsBootScript } from '$lib/utils/reader-preferences.svelte';
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

	let seo = $derived(
		createSeoMeta({
			title: 'Position Paper',
			description: meta.abstract,
			path: '/position-paper/read',
			type: 'article',
			robots: 'index,follow',
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
		issue: meta.issue,
		pageStart: meta.pageStart,
		pageEnd: meta.pageEnd,
		abstractUrl: seo.canonical,
		doi: meta.doi,
		issn: meta.issn,
		licence: meta.licence
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

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static string, no interpolation -->
	{@html readerPrefsBootScript}
</svelte:head>

<ReaderShell {meta} {paper} canonicalUrl={seo.canonical} />
