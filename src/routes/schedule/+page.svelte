<script lang="ts">
	import { Heading, P, Card, Tabs, TabItem } from 'flowbite-svelte';
	import {
		CalendarMonthOutline,
		ClockOutline,
		MapPinAltOutline,
		UsersGroupOutline,
		LightbulbOutline,
		MessageCaptionOutline,
		FileLinesSolid
	} from 'flowbite-svelte-icons';
	import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { schedule, sessionTypes, type SessionType } from '$lib/data/schedule';

	const seo = createSeoMeta({
		title: 'Workshop Schedule',
		description:
			'Explore workshop timings, sessions, and key moments for the Digital Humanities and AI in African Studies scoping event.',
		path: '/schedule'
	});

	const eventJsonLd = createEventJsonLd({
		name: 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: seo.description,
		startDate: workshopInfo.dates.startISO,
		endDate: workshopInfo.dates.endISO,
		locationName: workshopInfo.location.venue,
		locationAddress: workshopInfo.location.venue,
		locationCity: workshopInfo.location.city,
		locationCountry: workshopInfo.location.country,
		organizerName: workshopInfo.organizers.full,
		funderName: workshopInfo.funder.name,
		funderUrl: workshopInfo.funder.url,
		url: seo.canonical
	});

	function getItemIcon(type: SessionType) {
		switch (type) {
			case 'plenary':
				return UsersGroupOutline;
			case 'subgroups':
				return MessageCaptionOutline;
			case 'world-cafe':
				return LightbulbOutline;
			case 'break':
				return ClockOutline;
			case 'social':
				return CalendarMonthOutline;
			default:
				return MessageCaptionOutline;
		}
	}

	function getItemStyles(type: SessionType) {
		switch (type) {
			case 'plenary':
				return {
					bg: 'bg-primary-50 dark:bg-primary-900/20',
					border: 'border-l-4 border-primary-300 dark:border-primary-600',
					icon: 'text-primary-600 dark:text-primary-400'
				};
			case 'subgroups':
				return {
					bg: 'bg-secondary-50 dark:bg-secondary-900/20',
					border: 'border-l-4 border-secondary-500',
					icon: 'text-secondary-600 dark:text-secondary-400'
				};
			case 'world-cafe':
				return {
					bg: 'bg-amber-50 dark:bg-amber-900/20',
					border: 'border-l-4 border-amber-500',
					icon: 'text-amber-600 dark:text-amber-400'
				};
			case 'break':
				return {
					bg: 'bg-gray-50 dark:bg-gray-800/50',
					border: 'border-l-4 border-gray-300 dark:border-gray-600',
					icon: 'text-gray-500 dark:text-gray-400'
				};
			case 'social':
				return {
					bg: 'bg-primary-100 dark:bg-primary-900/30',
					border: 'border-l-4 border-primary-500',
					icon: 'text-primary-600 dark:text-primary-400'
				};
			default:
				return {
					bg: 'bg-surface-0 dark:bg-surface-dark-elevated',
					border: 'border-l-4 border-gray-200 dark:border-gray-700',
					icon: 'text-gray-600 dark:text-gray-400'
				};
		}
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes, index (attributes.name ?? attributes.property ?? `meta-${index}`)}
		<meta {...attributes} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html `<script type="application/ld+json">${serializeJsonLd(eventJsonLd)}</script>`}
</svelte:head>

<!-- Page Header -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary top-20 -left-20"></div>
	<div class="decorative-blob decorative-blob-secondary bottom-20 -right-20"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading tag="h1" class="heading-display heading-xl text-gradient drop-shadow-md pb-2 tracking-tight">Workshop Schedule</Heading>
		<P class="text-lead max-w-3xl mx-auto">
			Three days of collaborative dialogue, knowledge sharing, and strategic planning at the intersection of Digital Humanities and AI in African Studies.
		</P>
		<div class="flex flex-wrap justify-center gap-4 mt-4">
			<div class="flex items-center gap-2 text-body-sm">
				<CalendarMonthOutline class="w-5 h-5 text-primary-600 dark:text-primary-400" />
				<span>{workshopInfo.dates.full}</span>
			</div>
			<div class="flex items-center gap-2 text-body-sm">
				<MapPinAltOutline class="w-5 h-5 text-primary-600 dark:text-primary-400" />
				<span>{workshopInfo.location.venue}, {workshopInfo.location.city}</span>
			</div>
		</div>
	</div>
</section>

<!-- Schedule Tabs -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-secondary top-0 right-0 opacity-50"></div>
	<div class="content-width-wide relative">
		<Tabs 
			tabStyle="pill" 
			class="mb-8"
			contentClass="mt-8"
		>
			{#each schedule as day (day.dayNumber)}
				<TabItem open={day.dayNumber === 1}>
					{#snippet titleSlot()}
						<div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-1">
							<span class="font-bold">Day {day.dayNumber}</span>
							<span class="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
							<span class="text-xs sm:text-sm opacity-80">{day.theme}</span>
						</div>
					{/snippet}
					
					<!-- Day Header -->
					<div class="surface-panel surface-padding mb-8 text-center stack-sm">
						<P class="text-label text-primary-600 dark:text-primary-400">{day.date}</P>
						<Heading tag="h2" class="heading-section heading-lg heading-color-light">
							{day.theme}
						</Heading>
						<P class="text-lead max-w-2xl mx-auto">
							{day.themeDescription}
						</P>
					</div>

					<!-- Schedule Items -->
					<div class="stack-md">
						{#each day.items as item (item.time + item.title)}
							{@const styles = getItemStyles(item.type)}
							{@const Icon = getItemIcon(item.type)}
							<article class="card-surface {styles.border} {styles.bg} surface-padding-sm rounded-lg transition-all hover:shadow-md">
								<div class="flex flex-col sm:flex-row gap-4">
									<!-- Time Column -->
									<div class="flex items-start gap-3 sm:w-40 shrink-0">
										<div class="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
											<Icon class="w-5 h-5 {styles.icon}" />
										</div>
										<span class="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
											{item.time}
										</span>
									</div>
									
									<!-- Content Column -->
									<div class="flex-1 stack-xs">
										<Heading tag="h3" class="heading-sub text-lg heading-color-light">
											{item.title}
										</Heading>
										{#if item.description}
											<P class="body-text">
												{item.description}
											</P>
										{/if}
										{#if item.facilitator || item.room}
											<div class="flex flex-wrap gap-4 text-sm">
												{#if item.facilitator}
													<span class="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
														<UsersGroupOutline class="w-4 h-4" />
														<span class="font-medium">Facilitator:</span> {item.facilitator}
													</span>
												{/if}
												{#if item.room}
													<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
														<MapPinAltOutline class="w-4 h-4 text-primary-500 dark:text-primary-400" />
														<span>{item.room}</span>
													</span>
												{/if}
											</div>
										{/if}
										{#if item.details && item.details.length > 0}
											<ul class="stack-xs mt-2">
												{#each item.details as detail}
													<li class="body-text flex items-baseline gap-2 text-sm">
														<span class="text-primary-500 dark:text-primary-400 shrink-0">•</span>
														<span>{detail}</span>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>
							</article>
						{/each}
					</div>
				</TabItem>
			{/each}
		</Tabs>
	</div>
</section>

<!-- Schedule Legend -->
<section class="bg-page py-8 px-4">
	<div class="content-width">
		<Card class="card-surface surface-padding-sm">
			<Heading tag="h3" class="heading-sub text-base mb-4 heading-color-light">Session Types</Heading>
			<div class="flex flex-wrap gap-6">
				{#each Object.entries(sessionTypes) as [type, meta] (type)}
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 rounded {meta.colorClass}"></div>
						<span class="text-body-sm">{meta.label}</span>
					</div>
				{/each}
			</div>
		</Card>
	</div>
</section>

<!-- Important Information -->
<section class="bg-page py-16 px-4 relative overflow-hidden">
	<div class="decorative-blob decorative-blob-primary bottom-20 -left-20"></div>
	<div class="content-width-wide surface-panel surface-padding stack-md relative">
		<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">
			Important Information
		</Heading>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
			<Card class="card-surface surface-padding-sm text-center stack-xs">
				<div class="flex justify-center mb-2">
					<CalendarMonthOutline class="w-8 h-8 text-primary-600 dark:text-primary-400" />
				</div>
				<P class="text-label text-primary-600 dark:text-primary-400">Workshop Dates</P>
				<P class="heading-sub heading-sm">{workshopInfo.dates.full}</P>
				<P class="text-body-sm">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center stack-xs">
				<div class="flex justify-center mb-2">
					<MapPinAltOutline class="w-8 h-8 text-primary-600 dark:text-primary-400" />
				</div>
				<P class="text-label text-primary-600 dark:text-primary-400">Venue</P>
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
			<Card class="card-surface surface-padding-sm text-center stack-xs sm:col-span-2 lg:col-span-1">
				<div class="flex justify-center mb-2">
					<FileLinesSolid class="w-8 h-8 text-primary-600 dark:text-primary-400" />
				</div>
				<P class="text-label text-primary-600 dark:text-primary-400">Note</P>
				<P class="text-body-sm">
					This schedule is preliminary and subject to adjustments. Final details will be communicated to participants closer to the event.
				</P>
			</Card>
		</div>
	</div>
</section>
