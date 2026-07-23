<script lang="ts">
	import { Heading, P, Card, Popover, Alert } from 'flowbite-svelte';
	import {
		CalendarMonthOutline,
		MapPinAltOutline,
		UsersGroupOutline,
		LightbulbOutline,
		MessageCaptionOutline,
		MugSaucerOutline,
		BowlFoodOutline,
		BurgerOutline,
		ClipboardCheckOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import {
		schedule,
		scheduleLastUpdated,
		sessionTypes,
		type SessionType,
		type ScheduleItem
	} from '$lib/data/schedule';
	import UrlTabs, { type Tab } from '$lib/components/UrlTabs.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { reveal } from '$lib/utils/reveal';

	// Extended tab interface for schedule days
	interface DayTab extends Tab {
		dayNumber: number;
		date: string;
		theme: string;
		themeDescription: string;
		items: ScheduleItem[];
	}

	const seo = createSeoMeta({
		title: 'Workshop Schedule',
		description:
			'Explore workshop timings, sessions, and key moments for the Digital Humanities and AI in African Studies scoping event.',
		path: '/schedule',
		keywords: [
			'Workshop Schedule',
			'Conference Program',
			'Session Timetable',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Hanover',
			'February 2026'
		]
	});

	const eventJsonLd = createWorkshopEventJsonLd({
		description: seo.description,
		url: seo.canonical
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});

	// Transform schedule data to tabs format
	const dayTabs = schedule.map((day) => ({
		id: `day${day.dayNumber}`,
		label: `Day ${day.dayNumber}`,
		dayNumber: day.dayNumber,
		date: day.date,
		theme: day.theme,
		themeDescription: day.themeDescription,
		items: day.items
	}));

	const listFormatter = new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction'
	});

	function getItemIcon(type: SessionType, title: string) {
		// Check title for specific meal/break types
		const lowerTitle = title.toLowerCase();
		if (lowerTitle.includes('lunch')) {
			return BowlFoodOutline;
		}
		if (lowerTitle.includes('coffee') || lowerTitle.includes('registration')) {
			return MugSaucerOutline;
		}
		if (lowerTitle.includes('dinner')) {
			return BurgerOutline;
		}

		switch (type) {
			case 'plenary':
				return UsersGroupOutline;
			case 'subgroups':
				return MessageCaptionOutline;
			case 'world-cafe':
				return LightbulbOutline;
			case 'poster':
				return ClipboardCheckOutline;
			case 'break':
				return MugSaucerOutline;
			case 'social':
				return CalendarMonthOutline;
			default:
				return MessageCaptionOutline;
		}
	}

	function getItemStyles(type: SessionType) {
		const meta = sessionTypes[type];
		return { bg: meta.cardBg, border: meta.cardBorder, icon: meta.iconColor };
	}
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<!-- Page Header -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="content-width surface-panel surface-padding stack-sm relative text-center">
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal animate-hero-title pb-2 tracking-tight drop-shadow-md"
			>Workshop Schedule</Heading
		>
		<P class="text-lead animate-hero-subtitle mx-auto max-w-3xl">
			Three days of collaborative dialogue, knowledge sharing, and strategic planning at the
			intersection of Digital Humanities and AI in African Studies.
		</P>
		<div class="gap-md stack-item-md animate-hero-lede flex flex-wrap justify-center">
			<div class="gap-sm text-body-sm flex items-center">
				<CalendarMonthOutline class="size-icon-md text-accent" />
				<span>{workshopInfo.dates.full}</span>
			</div>
			<div class="gap-sm text-body-sm flex items-center">
				<MapPinAltOutline class="size-icon-md text-accent" />
				<span>{workshopInfo.location.venue}, {workshopInfo.location.city}</span>
			</div>
		</div>
		<P class="text-caption stack-item-md">Last updated: {scheduleLastUpdated}</P>
	</div>
</section>

<!-- Schedule Tabs -->
<section class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide relative">
		<UrlTabs
			tabs={dayTabs}
			paramName="day"
			defaultTab="day1"
			tabStyle="pill"
			class="stack-item-md schedule-tabs"
			contentClass="stack-item-md"
		>
			{#snippet tabTitle(tab)}
				{@const day = tab as DayTab}
				<div class="gap-xs sm:gap-sm px-sm py-xs flex flex-col items-center sm:flex-row">
					<span class="font-semibold">{day.label}</span>
					<span class="text-subtle-ink hidden sm:inline">•</span>
					<span class="text-body-sm hidden sm:inline">{day.theme}</span>
				</div>
			{/snippet}
			{#snippet children(_activeTabId, tab)}
				{@const day = tab as DayTab}
				<!-- Day Header with integrated legend -->
				<div class="surface-panel surface-padding mb-lg stack-sm animate-section-reveal" use:reveal>
					<div class="stack-sm text-center">
						<P class="text-label text-accent">{day.date}</P>
						<Heading
							tag="h2"
							class="heading-section heading-lg heading-color-light accent-underline"
						>
							{day.theme}
						</Heading>
						<P class="text-lead mx-auto max-w-2xl">
							{day.themeDescription}
						</P>
					</div>
					<!-- Session type legend -->
					<div
						class="gap-x-lg gap-y-sm pt-md stack-item-md flex flex-wrap justify-center border-t border-(--border-subtle)"
					>
						{#each Object.entries(sessionTypes) as [type, meta] (type)}
							<div class="gap-xs flex items-center">
								<div class="size-legend-dot rounded-sm {meta.colorClass}"></div>
								<span class="text-caption">{meta.label}</span>
								{#if type === 'world-cafe'}
									<button
										id="world-cafe-info-{day.dayNumber}"
										type="button"
										class="cursor-pointer text-amber-500 transition-colors hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
										aria-label="What is a World Café?"
									>
										<InfoCircleOutline class="size-icon-sm" />
									</button>
									<Popover
										triggeredBy="#world-cafe-info-{day.dayNumber}"
										trigger="click"
										placement="bottom"
										arrow
										class="z-(--z-popover) w-80 text-sm sm:w-96"
									>
										<div class="p-1">
											<h4 class="text-primary-ink mb-2 font-semibold">What is a World Café?</h4>
											<ul class="text-body-sm space-y-1.5 leading-relaxed">
												<li class="flex items-start gap-1.5">
													<span class="mt-0.5 shrink-0 text-amber-500">•</span>
													<span
														>Interactive discussion format where participants rotate between four
														thematic tables in three timed rounds (25 minutes each)</span
													>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="mt-0.5 shrink-0 text-amber-500">•</span>
													<span
														>Each table is anchored by a table host who stays for the entire
														session, briefs newcomers on prior discussions, and captures key points</span
													>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="mt-0.5 shrink-0 text-amber-500">•</span>
													<span
														>Participants build on the keywords and key pointers prepared during the
														small-group working sessions</span
													>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="mt-0.5 shrink-0 text-amber-500">•</span>
													<span
														>Between rounds, participants disperse individually across tables to
														maximise cross-pollination of ideas</span
													>
												</li>
											</ul>
										</div>
									</Popover>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<!-- Schedule Items -->
				<div class="stack-md stagger-children" use:reveal>
					{#each day.items as item (item.time + item.title)}
						{@const styles = getItemStyles(item.type)}
						{@const Icon = getItemIcon(item.type, item.title)}
						<article
							class="card-surface {styles.border} {styles.bg} surface-padding-sm glow-border"
						>
							<div class="gap-md flex flex-col sm:flex-row">
								<!-- Time Column -->
								<div class="gap-sm flex shrink-0 items-start sm:w-40">
									<div class="p-sm schedule-time-icon rounded-md">
										<Icon class="size-icon-md {styles.icon}" />
									</div>
									<span
										class="text-body-sm text-secondary-ink font-mono font-semibold whitespace-nowrap"
									>
										{item.time}
									</span>
								</div>
								<!-- Content Column -->
								<div class="stack-xs flex-1">
									<Heading tag="h3" class="heading-sub heading-color-light text-lg">
										{item.title}
									</Heading>
									{#if item.description}
										<P class="body-text">
											{item.description}
										</P>
									{/if}
									{#if (item.facilitators && item.facilitators.length > 0) || (item.rooms && item.rooms.length > 0)}
										<div class="gap-md text-body-sm flex flex-wrap">
											{#if item.facilitators && item.facilitators.length > 0}
												<span class="gap-xs text-muted-ink inline-flex items-center">
													<UsersGroupOutline class="size-icon-sm" />
													<span class="font-medium">Facilitators:</span>
													{listFormatter.format(item.facilitators)}
												</span>
											{/if}
											{#if item.rooms && item.rooms.length > 0}
												<div class="gap-xs inline-flex items-center">
													<MapPinAltOutline class="size-icon-sm text-accent" />
													{#each item.rooms as room (room)}
														<span class="px-sm py-xs schedule-room-pill rounded-full">
															{room}
														</span>
													{/each}
												</div>
											{/if}
										</div>
									{/if}
									{#if item.details && item.details.length > 0}
										<ul class="stack-xs stack-item-sm">
											{#each item.details as detail (detail)}
												<li class="body-text gap-sm text-body-sm flex items-baseline">
													<span class="text-accent shrink-0">•</span>
													<span
														>{#if detail.startsWith('https://') || detail.startsWith('http://')}<a
																href={detail}
																target="_blank"
																rel="noopener noreferrer"
																class="link-secondary"
																>{detail.includes('maps.app.goo.gl') ||
																detail.includes('google.com/maps')
																	? 'View on Google Maps'
																	: detail}</a
															>{:else}{detail}{/if}</span
													>
												</li>
											{/each}
										</ul>
									{/if}
									{#if item.deliverables && item.deliverables.length > 0}
										<Alert color="teal" class="stack-item-sm !p-3">
											{#snippet icon()}
												<ClipboardCheckOutline class="h-4 w-4" />
											{/snippet}
											<span class="text-body-sm font-semibold">
												{item.deliverables.length > 1 ? 'Deliverables:' : 'Deliverable:'}
											</span>
											{#if item.deliverables.length === 1}
												<p class="text-body-sm mt-1">{item.deliverables[0]}</p>
											{:else}
												<ul class="mt-1 space-y-1">
													{#each item.deliverables as deliverable (deliverable)}
														<li class="text-body-sm gap-sm flex items-baseline">
															<span class="shrink-0">•</span>
															<span>{deliverable}</span>
														</li>
													{/each}
												</ul>
											{/if}
										</Alert>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/snippet}
		</UrlTabs>
	</div>
</section>

<!-- Important Information -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="bg-radial-glow-bottom"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-md animate-section-reveal relative"
		use:reveal
	>
		<Heading
			tag="h2"
			class="heading-section heading-lg heading-color-light accent-underline text-center"
		>
			Important Information
		</Heading>
		<div
			class="gap-lg stagger-children mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-2"
			use:reveal
		>
			<Card class="card-surface surface-padding-sm stack-xs glow-border text-center">
				<div class="stack-item-sm flex justify-center">
					<CalendarMonthOutline class="size-icon-lg text-accent" />
				</div>
				<P class="text-label text-accent">Workshop Dates</P>
				<P class="heading-sub heading-sm">{workshopInfo.dates.full}</P>
				<P class="text-body-sm">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm stack-xs glow-border text-center">
				<div class="stack-item-sm flex justify-center">
					<MapPinAltOutline class="size-icon-lg text-accent" />
				</div>
				<P class="text-label text-accent">Venue</P>
				<P class="heading-sub heading-sm">
					<a
						href={workshopInfo.location.url}
						target="_blank"
						rel="noopener noreferrer"
						class="link-secondary"
					>
						{workshopInfo.location.venue}
					</a>
				</P>
				<P class="text-body-sm">{workshopInfo.location.city}, {workshopInfo.location.country}</P>
			</Card>
		</div>
	</div>
</section>

<style>
	.schedule-time-icon {
		background-color: color-mix(in srgb, var(--bg-raised) 60%, transparent);
	}

	:global(.dark) .schedule-time-icon {
		background-color: color-mix(in srgb, var(--bg-overlay) 60%, transparent);
	}

	.schedule-room-pill {
		background-color: var(--bg-sunken);
		color: var(--text-secondary);
		font-size: var(--text-xs);
	}

	:global(.dark) .schedule-room-pill {
		background-color: color-mix(in srgb, var(--bg-overlay) 70%, transparent);
	}
</style>
