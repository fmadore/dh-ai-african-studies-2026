<script lang="ts">
	import { Heading, P, Card, Popover } from "flowbite-svelte";
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
		InfoCircleOutline,
	} from "flowbite-svelte-icons";
	import {
		createSeoMeta,
		createEventJsonLd,
		createWebPageJsonLd,
		serializeJsonLd,
	} from "$lib/utils/seo";
	import { workshopInfo } from "$lib/data/workshop-info";
	import {
		schedule,
		sessionTypes,
		type SessionType,
		type ScheduleItem,
	} from "$lib/data/schedule";
	import UrlTabs, { type Tab } from "$lib/components/UrlTabs.svelte";
	import { reveal } from "$lib/utils/reveal";

	// Extended tab interface for schedule days
	interface DayTab extends Tab {
		dayNumber: number;
		date: string;
		theme: string;
		themeDescription: string;
		items: ScheduleItem[];
	}

	const seo = createSeoMeta({
		title: "Workshop Schedule",
		description:
			"Explore workshop timings, sessions, and key moments for the Digital Humanities and AI in African Studies scoping event.",
		path: "/schedule",
		keywords: [
			"Workshop Schedule",
			"Conference Program",
			"Session Timetable",
			"Digital Humanities",
			"AI",
			"African Studies",
			"Hanover",
			"February 2026"
		]
	});

	const eventJsonLd = createEventJsonLd({
		name: "Charting New Territory: Digital Humanities and AI in African Studies",
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
		url: seo.canonical,
	});
	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical,
	});

	// Transform schedule data to tabs format
	const dayTabs = schedule.map((day) => ({
		id: `day${day.dayNumber}`,
		label: `Day ${day.dayNumber}`,
		dayNumber: day.dayNumber,
		date: day.date,
		theme: day.theme,
		themeDescription: day.themeDescription,
		items: day.items,
	}));

	const listFormatter = new Intl.ListFormat("en", {
		style: "long",
		type: "conjunction",
	});

	function getItemIcon(type: SessionType, title: string) {
		// Check title for specific meal/break types
		const lowerTitle = title.toLowerCase();
		if (lowerTitle.includes("lunch")) {
			return BowlFoodOutline;
		}
		if (
			lowerTitle.includes("coffee") ||
			lowerTitle.includes("registration")
		) {
			return MugSaucerOutline;
		}
		if (lowerTitle.includes("dinner")) {
			return BurgerOutline;
		}

		switch (type) {
			case "plenary":
				return UsersGroupOutline;
			case "subgroups":
				return MessageCaptionOutline;
			case "world-cafe":
				return LightbulbOutline;
			case "poster":
				return ClipboardCheckOutline;
			case "break":
				return MugSaucerOutline;
			case "social":
				return CalendarMonthOutline;
			default:
				return MessageCaptionOutline;
		}
	}

	function getItemStyles(type: SessionType) {
		switch (type) {
			case "plenary":
				return {
					bg: "bg-primary-50 dark:bg-primary-900/20",
					border: "border-l-4 border-primary-300 dark:border-primary-600",
					icon: "text-primary-600 dark:text-primary-400",
				};
			case "subgroups":
				return {
					bg: "bg-secondary-50 dark:bg-secondary-900/20",
					border: "border-l-4 border-secondary-500",
					icon: "text-accent",
				};
			case "world-cafe":
				return {
					bg: "bg-amber-50 dark:bg-amber-900/20",
					border: "border-l-4 border-amber-500",
					icon: "text-amber-600 dark:text-amber-400",
				};
			case "poster":
				return {
					bg: "bg-violet-50 dark:bg-violet-900/20",
					border: "border-l-4 border-violet-500",
					icon: "text-violet-600 dark:text-violet-400",
				};
			case "break":
				return {
					bg: "bg-gray-50 dark:bg-gray-800/50",
					border: "border-l-4 border-gray-300 dark:border-gray-600",
					icon: "text-gray-500 dark:text-gray-400",
				};
			case "social":
				return {
					bg: "bg-primary-100 dark:bg-primary-900/30",
					border: "border-l-4 border-primary-500",
					icon: "text-primary-600 dark:text-primary-400",
				};
			default:
				return {
					bg: "bg-surface-0 dark:bg-surface-dark-elevated",
					border: "border-l-4 border-gray-200 dark:border-gray-700",
					icon: "text-gray-600 dark:text-gray-400",
				};
		}
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	{#each seo.meta as attributes (attributes.key)}
		<meta name={attributes.name} property={attributes.property} content={attributes.content} />
	{/each}
	{#each seo.link as attributes, index (`link-${index}-${attributes.href}`)}
		<link {...attributes} />
	{/each}
	{@html `<script type="application/ld+json">${serializeJsonLd(eventJsonLd)}</script>`}
	{@html `<script type="application/ld+json">${serializeJsonLd(webPageJsonLd)}</script>`}
</svelte:head>

<!-- Page Header -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div
		class="content-width surface-panel surface-padding text-center stack-sm relative"
	>
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal drop-shadow-md pb-2 tracking-tight animate-hero-title"
			>Workshop Schedule</Heading
		>
		<P class="text-lead max-w-3xl mx-auto animate-hero-subtitle">
			Three days of collaborative dialogue, knowledge sharing, and
			strategic planning at the intersection of Digital Humanities and AI
			in African Studies.
		</P>
		<div class="flex flex-wrap justify-center gap-md stack-item-md animate-hero-subtitle" style="animation-delay: 200ms;">
			<div class="flex items-center gap-sm text-body-sm">
				<CalendarMonthOutline
					class="size-icon-md text-accent"
				/>
				<span>{workshopInfo.dates.full}</span>
			</div>
			<div class="flex items-center gap-sm text-body-sm">
				<MapPinAltOutline
					class="size-icon-md text-accent"
				/>
				<span
					>{workshopInfo.location.venue}, {workshopInfo.location
						.city}</span
				>
			</div>
		</div>
		<P class="text-caption stack-item-md">Last updated: 19 February 2026</P>
	</div>
</section>

<!-- Schedule Tabs -->
<section
	class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden"
>
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
				<div
					class="flex flex-col sm:flex-row items-center gap-xs sm:gap-sm px-sm py-xs"
				>
					<span class="font-semibold">{day.label}</span>
					<span
						class="hidden sm:inline text-gray-500 dark:text-gray-400"
						>•</span
					>
					<span class="hidden sm:inline text-body-sm">{day.theme}</span>
				</div>
			{/snippet}
			{#snippet children(activeTabId, tab)}
				{@const day = tab as DayTab}
				<!-- Day Header with integrated legend -->
				<div class="surface-panel surface-padding mb-lg stack-sm animate-section-reveal" use:reveal>
					<div class="text-center stack-sm">
						<P
							class="text-label text-accent"
							>{day.date}</P
						>
						<Heading
							tag="h2"
							class="heading-section heading-lg heading-color-light accent-underline"
						>
							{day.theme}
						</Heading>
						<P class="text-lead max-w-2xl mx-auto">
							{day.themeDescription}
						</P>
					</div>
					<!-- Session type legend -->
					<div
						class="flex flex-wrap justify-center gap-x-lg gap-y-sm pt-md stack-item-md border-t border-gray-200 dark:border-gray-700"
					>
						{#each Object.entries(sessionTypes) as [type, meta] (type)}
							<div class="flex items-center gap-xs">
								<div
									class="size-legend-dot rounded-sm {meta.colorClass}"
								></div>
								<span class="text-caption">{meta.label}</span>
								{#if type === 'world-cafe'}
									<button
										id="world-cafe-info-{day.dayNumber}"
										type="button"
										class="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
										aria-label="What is a World Café?"
									>
										<InfoCircleOutline class="size-icon-sm" />
									</button>
									<Popover
										triggeredBy="#world-cafe-info-{day.dayNumber}"
										trigger="click"
										placement="bottom"
										arrow
										class="w-80 sm:w-96 text-sm z-50"
									>
										<div class="p-1">
											<h4 class="font-semibold text-gray-900 dark:text-white mb-2">What is a World Café?</h4>
											<ul class="space-y-1.5 text-gray-600 dark:text-gray-300 text-body-sm leading-relaxed">
												<li class="flex items-start gap-1.5">
													<span class="text-amber-500 shrink-0 mt-0.5">•</span>
													<span>Interactive discussion format where participants rotate between four thematic tables in three timed rounds (25 minutes each)</span>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="text-amber-500 shrink-0 mt-0.5">•</span>
													<span>Each table is anchored by a table host who stays for the entire session, briefs newcomers on prior discussions, and captures key points</span>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="text-amber-500 shrink-0 mt-0.5">•</span>
													<span>Participants build on the keywords and key pointers prepared during the small-group working sessions</span>
												</li>
												<li class="flex items-start gap-1.5">
													<span class="text-amber-500 shrink-0 mt-0.5">•</span>
													<span>Between rounds, participants disperse individually across tables to maximise cross-pollination of ideas</span>
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
							class="card-surface {styles.border} {styles.bg} surface-padding-sm rounded-lg transition-base hover:shadow-md glow-border"
						>
							<div class="flex flex-col sm:flex-row gap-md">
								<!-- Time Column -->
								<div
									class="flex items-start gap-sm sm:w-40 shrink-0"
								>
									<div
										class="p-sm rounded-lg bg-white/50 dark:bg-gray-800/50"
									>
										<Icon
											class="size-icon-md {styles.icon}"
										/>
									</div>
									<span
										class="font-mono text-body-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap"
									>
										{item.time}
									</span>
								</div>
								<!-- Content Column -->
								<div class="flex-1 stack-xs">
									<Heading
										tag="h3"
										class="heading-sub text-lg heading-color-light"
									>
										{item.title}
									</Heading>
									{#if item.description}
										<P class="body-text">
											{item.description}
										</P>
									{/if}
									{#if (item.facilitators && item.facilitators.length > 0) || (item.rooms && item.rooms.length > 0)}
										<div
											class="flex flex-wrap gap-md text-body-sm"
										>
											{#if item.facilitators && item.facilitators.length > 0}
												<span
													class="inline-flex items-center gap-xs text-gray-600 dark:text-gray-400"
												>
													<UsersGroupOutline
														class="size-icon-sm"
													/>
													<span class="font-medium"
														>Facilitators:</span
													>
													{listFormatter.format(
														item.facilitators,
													)}
												</span>
											{/if}
											{#if item.rooms && item.rooms.length > 0}
												<div
													class="inline-flex items-center gap-xs"
												>
													<MapPinAltOutline
														class="size-icon-sm text-secondary-500 dark:text-secondary-400"
													/>
													{#each item.rooms as room, i}
														<span
															class="px-sm py-xs rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300"
														>
															{room}
														</span>
													{/each}
												</div>
											{/if}
										</div>
									{/if}
									{#if item.details && item.details.length > 0}
										<ul class="stack-xs stack-item-sm">
											{#each item.details as detail}
												<li
													class="body-text flex items-baseline gap-sm text-body-sm"
												>
													<span
														class="text-secondary-500 dark:text-secondary-400 shrink-0"
														>•</span
													>
													<span
													>{#if detail.startsWith('https://') || detail.startsWith('http://')}<a
															href={detail}
															target="_blank"
															rel="noopener noreferrer"
															class="link-secondary"
															>{detail.includes('maps.app.goo.gl') || detail.includes('google.com/maps')
																? 'View on Google Maps'
																: detail}</a
														>{:else}{detail}{/if}</span
												>
												</li>
											{/each}
										</ul>
									{/if}
									{#if item.deliverables && item.deliverables.length > 0}
										<div
											class="stack-item-sm p-sm rounded-lg bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700/50"
										>
											<div
												class="flex items-start gap-sm"
											>
												<ClipboardCheckOutline
													class="size-icon-md text-accent shrink-0 mt-0.5"
												/>
												<div>
													<span
														class="font-semibold text-secondary-700 dark:text-secondary-300 text-body-sm"
													>
														{item.deliverables
															.length > 1
															? "Deliverables:"
															: "Deliverable:"}
													</span>
													{#if item.deliverables.length === 1}
														<p
															class="text-body-sm text-accent stack-item-xs"
														>
															{item
																.deliverables[0]}
														</p>
													{:else}
														<ul
															class="stack-item-xs stack-xs"
														>
															{#each item.deliverables as deliverable}
																<li
																	class="text-body-sm text-accent flex items-baseline gap-sm"
																>
																	<span
																		class="text-secondary-500 shrink-0"
																		>•</span
																	>
																	<span
																		>{deliverable}</span
																	>
																</li>
															{/each}
														</ul>
													{/if}
												</div>
											</div>
										</div>
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
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="bg-radial-glow-bottom"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-md relative animate-section-reveal"
		use:reveal
	>
		<Heading
			tag="h2"
			class="text-center heading-section heading-lg heading-color-light accent-underline"
		>
			Important Information
		</Heading>
		<div
			class="grid grid-cols-1 gap-lg sm:grid-cols-2 max-w-3xl mx-auto stagger-children"
			use:reveal
		>
			<Card class="card-surface surface-padding-sm text-center stack-xs glow-border">
				<div class="flex justify-center stack-item-sm">
					<CalendarMonthOutline
						class="size-icon-lg text-accent"
					/>
				</div>
				<P class="text-label text-accent"
					>Workshop Dates</P
				>
				<P class="heading-sub heading-sm">{workshopInfo.dates.full}</P>
				<P class="text-body-sm">{workshopInfo.duration.description}</P>
			</Card>
			<Card class="card-surface surface-padding-sm text-center stack-xs glow-border">
				<div class="flex justify-center stack-item-sm">
					<MapPinAltOutline
						class="size-icon-lg text-accent"
					/>
				</div>
				<P class="text-label text-accent"
					>Venue</P
				>
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
				<P class="text-body-sm"
					>{workshopInfo.location.city}, {workshopInfo.location
						.country}</P
				>
			</Card>
		</div>
	</div>
</section>
