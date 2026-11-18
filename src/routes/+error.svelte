<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import AppButton from '#lib/components/AppButton.svelte';
	import { workshopInfo } from '#lib/data/workshop-info';
	import { createSeoMeta } from '#lib/utils/seo';
	import { resolveAppPath } from '#lib/utils/paths';
	import { reveal } from '#lib/utils/reveal';

	/*
	 * Served two ways: as build/404.html, the adapter's client-rendered fallback
	 * that GitHub Pages returns (with a 404 status) for any unknown URL, and by
	 * the client router when a navigation fails. Either way there is no single
	 * URL to call canonical, so the canonical link and og:url are dropped.
	 */
	let notFound = $derived(page.status === 404);

	let seo = $derived.by(() => {
		const meta = createSeoMeta({
			title: notFound ? 'Page not found' : 'Something went wrong',
			description: 'This page is not part of the workshop archive.',
			robots: 'noindex'
		});
		return {
			...meta,
			meta: meta.meta.filter((tag) => tag.key !== 'og:url'),
			link: []
		};
	});

	const destinations = [
		{
			href: resolveAppPath('/position-paper'),
			label: 'Position paper',
			note: 'The collective paper the workshop produced.'
		},
		{
			href: resolveAppPath('/participants'),
			label: 'Participants',
			note: 'Who took part, and where they work.'
		}
	];
</script>

<SeoHead {seo} />

<PageHero
	eyebrow={notFound ? 'Error 404' : `Error ${page.status}`}
	title={notFound ? 'Page not found' : 'Something went wrong'}
	lede={notFound
		? 'This address is not part of the archive. The page may have moved, or the link may have a typo.'
		: 'This page could not be loaded. Please try again in a moment.'}
/>

<section class="band padding-inline-section">
	<div class="content-width animate-section-reveal" use:reveal>
		<div class="section-head">
			<p class="section-head__eyebrow">Where to go next</p>
			<h2 class="heading-section">Explore the archive</h2>
		</div>

		<p class="prose-serif">
			The workshop took place on {workshopInfo.dates.full} in {workshopInfo.location.city}. Its
			outcomes, the people who took part and the record of the three days remain available here.
		</p>

		<ul class="destinations">
			{#each destinations as destination (destination.href)}
				<li>
					<a class="link-secondary tap-target" href={destination.href}>{destination.label}</a>
					<span class="text-caption">{destination.note}</span>
				</li>
			{/each}
		</ul>

		<div class="error-action">
			<AppButton href={resolveAppPath('/')}>Back to the home page</AppButton>
		</div>
	</div>
</section>

<style>
	.destinations {
		display: grid;
		gap: var(--space-sm);
		margin-top: var(--space-lg);
		list-style: none;
		padding: 0;
	}

	.destinations li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2xs) var(--space-sm);
	}

	.error-action {
		margin-top: var(--space-xl);
	}
</style>
