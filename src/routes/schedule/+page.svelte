<script lang="ts">
	import { Heading, P, Card } from 'flowbite-svelte';
	import { CalendarMonthOutline } from 'flowbite-svelte-icons';
</script>

<svelte:head>
	<title>Schedule - DH & AI in African Studies</title>
	<meta name="description" content="Workshop schedule for Digital Humanities and AI in African Studies conference." />
</svelte:head>

<!-- Page Header -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-4xl rounded-3xl border border-primary-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg px-8 py-12 text-center">
		<Heading tag="h1" class="mb-4 heading-display heading-xl heading-color-light">Workshop Schedule</Heading>
		<P class="mb-0 text-lg text-gray-600 dark:text-gray-300">
			The detailed schedule for the three-day scoping workshop will be available soon.
		</P>
	</div>
</section>

<!-- Placeholder Content -->
<section class="py-12 px-4">
	<Card class="mx-auto max-w-4xl text-center p-12 bg-white dark:bg-gray-900 border border-primary-100 dark:border-gray-700 shadow-xl">
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
	<div class="mx-auto max-w-5xl rounded-3xl border border-primary-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg px-8 py-10">
		<Heading tag="h2" class="mb-6 text-center heading-section heading-lg heading-color-light">Important Dates</Heading>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="text-center p-6 bg-white dark:bg-gray-900 border border-primary-100 dark:border-gray-700 shadow-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">Workshop Dates</P>
				<P class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">June 15-17, 2026</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">Three-day intensive workshop</P>
			</Card>
			<Card class="text-center p-6 bg-white dark:bg-gray-900 border border-primary-100 dark:border-gray-700 shadow-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">Format</P>
				<P class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Hybrid</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">In-person &amp; Virtual participation</P>
			</Card>
			<Card class="text-center p-6 bg-white dark:bg-gray-900 border border-primary-100 dark:border-gray-700 shadow-sm">
				<P class="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">Location</P>
				<P class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">TBA</P>
				<P class="text-sm text-gray-600 dark:text-gray-300">To be announced</P>
			</Card>
		</div>
	</div>
</section>
