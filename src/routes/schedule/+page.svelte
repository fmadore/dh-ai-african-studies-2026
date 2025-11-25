<script lang="ts">
	import { Heading, P, Card } from 'flowbite-svelte';
	import { CalendarMonthOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';

	const seo = createSeoMeta({
		title: 'Workshop Schedule',
		description: 'Explore workshop timings, sessions, and key moments for the Digital Humanities and AI in African Studies scoping event.',
		path: '/schedule'
	});
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes, index (attributes.name ?? attributes.property ?? `meta-${index}`)}
		<meta {...attributes} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
</svelte:head>

<!-- Page Header -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading tag="h1" class="heading-display heading-xl text-gradient drop-shadow-md pb-2 tracking-tight">Workshop Schedule</Heading>
		<P class="text-lead">
			The detailed schedule for the three-day scoping workshop will be available soon.
		</P>
	</div>
</section>

<!-- Placeholder Content -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-secondary top-0 right-0 opacity-50"></div>
	<Card class="content-width card-surface surface-padding text-center stack-md relative">
		<div class="flex justify-center">
			<CalendarMonthOutline size="xl" class="h-24 w-24 text-primary-600 dark:text-primary-400" />
		</div>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light">
			Schedule Coming Soon
		</Heading>
		<P class="text-lead">
			We are currently finalizing the workshop program. The detailed schedule will include:
		</P>
		<ul class="max-w-2xl mx-auto stack-xs text-left">
			<li class="body-text flex items-start gap-2">
				<span class="text-primary-500 dark:text-primary-400 mt-1">•</span>
				<span>Keynote presentations and panel discussions</span>
			</li>
			<li class="body-text flex items-start gap-2">
				<span class="text-primary-500 dark:text-primary-400 mt-1">•</span>
				<span>Thematic work streams and collaborative sessions</span>
			</li>
			<li class="body-text flex items-start gap-2">
				<span class="text-primary-500 dark:text-primary-400 mt-1">•</span>
				<span>Networking opportunities and informal discussions</span>
			</li>
			<li class="body-text flex items-start gap-2">
				<span class="text-primary-500 dark:text-primary-400 mt-1">•</span>
				<span>Breakout sessions focused on key research areas</span>
			</li>
		</ul>
		<P class="body-text-muted">
			Please check back soon for the complete schedule of events.
		</P>
	</Card>
</section>

<!-- Key Dates -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-20 -left-20"></div>
	<div class="content-width-wide surface-panel surface-padding stack-md relative">
		<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">
			Important Dates
		</Heading>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
			<Card class="card-surface surface-padding-sm text-center stack-xs">
				<P class="text-label text-primary-600 dark:text-primary-400">Workshop Dates</P>
				<P class="heading-sub heading-sm">{workshopInfo.dates.full}</P>
				<P class="text-body-sm">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center stack-xs">
				<P class="text-label text-primary-600 dark:text-primary-400">Location</P>
				<P class="heading-sub heading-sm">
					<a
						href={workshopInfo.location.url}
						target="_blank"
						rel="noopener noreferrer"
						class="underline decoration-primary-300 dark:decoration-primary-600 underline-offset-2 hover:decoration-primary-500 dark:hover:decoration-primary-400 transition-colors"
					>
						{workshopInfo.location.venue}
					</a>
				</P>
				<P class="text-body-sm">{workshopInfo.location.city}, {workshopInfo.location.country}</P>
			</Card>
		</div>
	</div>
</section>
