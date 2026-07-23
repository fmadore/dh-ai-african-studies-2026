<script lang="ts">
	import type { JsonLdSchema, SeoMetaResult } from '$lib/utils/seo';
	import { jsonLdScript } from '$lib/utils/seo';

	interface Props {
		seo: SeoMetaResult;
		jsonLd?: JsonLdSchema | JsonLdSchema[];
	}

	let { seo, jsonLd }: Props = $props();

	let schemas = $derived(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []);
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{#each schemas as schema, index (index)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- jsonLdScript escapes `<` -->
		{@html jsonLdScript(schema)}
	{/each}
</svelte:head>
