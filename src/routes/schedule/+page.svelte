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
<section class="py-12 px-4">
	<div class="surface-panel surface-padding text-center space-y-4 content-width">
		<Heading tag="h1" class="heading-display heading-xl heading-color-light">Workshop Schedule</Heading>
		<P class="text-lg text-gray-600 dark:text-gray-300">
			The detailed schedule for the three-day scoping workshop will be available soon.
		</P>
	</div>
</section>

<!-- Placeholder Content -->
<section class="py-12 px-4">
	<Card class="card-surface surface-padding text-center content-width">
		<div class="flex justify-center mb-6">
			<CalendarMonthOutline size="xl" class="w-24 h-24 text-primary-600 dark:text-primary-400" />
		</div>
		<Heading tag="h2" class="mb-4 heading-section heading-lg heading-color-light">Schedule Coming Soon</Heading>
		<P class="text-lg mb-6 text-gray-700 dark:text-gray-300">
			We are currently finalizing the workshop program. The detailed schedule will include:
		</P>
		<div class="text-left max-w-2xl mx-auto space-y-3 mb-8">
			<P class="flex items-start text-gray-700 dark:text-gray-300">
				<span class="text-primary-600 dark:text-primary-400 mr-2">•</span>
				<span>Keynote presentations and panel discussions</span>
			</P>
			<P class="flex items-start text-gray-700 dark:text-gray-300">
				<span class="text-primary-600 dark:text-primary-400 mr-2">•</span>
				<span>Thematic work streams and collaborative sessions</span>
			</P>
			<P class="flex items-start text-gray-700 dark:text-gray-300">
				<span class="text-primary-600 dark:text-primary-400 mr-2">•</span>
				<span>Networking opportunities and informal discussions</span>
			</P>
			<P class="flex items-start text-gray-700 dark:text-gray-300">
				<span class="text-primary-600 dark:text-primary-400 mr-2">•</span>
				<span>Breakout sessions focused on key research areas</span>
			</P>
		</div>
		<P class="text-gray-600 dark:text-gray-300">
			Please check back soon for the complete schedule of events.
		</P>
	</Card>
</section>

<!-- Key Dates -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-5xl surface-panel surface-padding">
		<Heading tag="h2" class="mb-6 text-center heading-section heading-lg heading-color-light">Important Dates</Heading>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm text-center space-y-2">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Workshop Dates</P>
				<P class="text-2xl font-bold text-gray-800 dark:text-gray-100">{workshopInfo.dates.full}</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center space-y-2">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Format</P>
				<P class="text-2xl font-bold text-gray-800 dark:text-gray-100">{workshopInfo.format.type}</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">{workshopInfo.format.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center space-y-2">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400">Location</P>
				<P class="text-2xl font-bold text-gray-800 dark:text-gray-100">{workshopInfo.location.venue}</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">{workshopInfo.location.city}, {workshopInfo.location.country}</P>
			</Card>
		</div>
	</div>
</section>
