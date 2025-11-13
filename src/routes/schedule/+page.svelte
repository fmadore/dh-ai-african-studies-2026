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
<section class="bg-page py-16 px-4">
	<div class="content-width surface-panel surface-padding text-center stack-sm">
		<Heading tag="h1" class="heading-display heading-xl heading-color-light">Workshop Schedule</Heading>
		<P class="body-text text-lg">
			The detailed schedule for the three-day scoping workshop will be available soon.
		</P>
	</div>
</section>

<!-- Placeholder Content -->
<section class="bg-page py-16 px-4">
	<Card class="content-width card-surface surface-padding text-center stack-md">
		<div class="flex justify-center">
			<CalendarMonthOutline size="xl" class="h-24 w-24 text-primary-600 dark:text-primary-400" />
		</div>
		<Heading tag="h2" class="heading-section heading-lg heading-color-light">
			Schedule Coming Soon
		</Heading>
		<P class="body-text text-lg">
			We are currently finalizing the workshop program. The detailed schedule will include:
		</P>
		<div class="max-w-2xl mx-auto stack-sm">
			<P class="body-text flex items-start">
				<span class="mr-2 text-primary-600 dark:text-primary-400">•</span>
				<span>Keynote presentations and panel discussions</span>
			</P>
			<P class="body-text flex items-start">
				<span class="mr-2 text-primary-600 dark:text-primary-400">•</span>
				<span>Thematic work streams and collaborative sessions</span>
			</P>
			<P class="body-text flex items-start">
				<span class="mr-2 text-primary-600 dark:text-primary-400">•</span>
				<span>Networking opportunities and informal discussions</span>
			</P>
			<P class="body-text flex items-start">
				<span class="mr-2 text-primary-600 dark:text-primary-400">•</span>
				<span>Breakout sessions focused on key research areas</span>
			</P>
		</div>
		<P class="body-text-muted">
			Please check back soon for the complete schedule of events.
		</P>
	</Card>
</section>

<!-- Key Dates -->
<section class="bg-page py-16 px-4">
	<div class="content-width-wide surface-panel surface-padding stack-md">
		<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">
			Important Dates
		</Heading>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<Card class="card-surface surface-padding-sm text-center stack-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Workshop Dates</P>
				<P class="body-text-strong text-2xl font-bold">{workshopInfo.dates.full}</P>
				<P class="body-text text-sm">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center stack-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Format</P>
				<P class="body-text-strong text-2xl font-bold">{workshopInfo.format.type}</P>
				<P class="body-text text-sm">{workshopInfo.format.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center stack-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Location</P>
				<P class="body-text-strong text-2xl font-bold">{workshopInfo.location.venue}</P>
				<P class="body-text text-sm">{workshopInfo.location.city}, {workshopInfo.location.country}</P>
			</Card>
		</div>
	</div>
</section>
