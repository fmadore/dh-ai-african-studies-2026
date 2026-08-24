<script lang="ts">
	import { CalendarMonthOutline, MapPinAltOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta, createWorkshopEventJsonLd, createWebPageJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import {
		schedule,
		scheduleLastUpdated,
		sessionTypes,
		isQuietItem,
		worldCafeFormat,
		type ScheduleItem
	} from '$lib/data/schedule';
	import UrlTabs, { type Tab } from '$lib/components/UrlTabs.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PageHero from '$lib/components/PageHero.svelte';
	import { resolveAppPath } from '$lib/utils/paths';
	import { reveal } from '$lib/utils/reveal';

	interface DayTab extends Tab {
		dayNumber: number;
		date: string;
		theme: string;
		themeDescription: string;
		outcome?: string;
		photoCategory?: 'Day 1' | 'Day 2' | 'Day 3';
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

	const dayTabs = schedule.map((day) => ({
		id: `day${day.dayNumber}`,
		label: `Day ${day.dayNumber}`,
		dayNumber: day.dayNumber,
		date: day.date,
		theme: day.theme,
		themeDescription: day.themeDescription,
		outcome: day.outcome,
		photoCategory: day.photoCategory,
		items: day.items
	}));

	const listFormatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

	/** "09:00–09:45" → ["09:00", "09:45"] so the column can stack start over end */
	function splitTime(time: string): [string, string | null] {
		const parts = time.split(/[–-]/).map((part) => part.trim());
		return [parts[0], parts[1] ?? null];
	}

	function photosHref(category?: string) {
		const base = resolveAppPath('/photos');
		return category ? `${base}?day=${encodeURIComponent(category)}` : base;
	}

	function isMapLink(detail: string) {
		return detail.includes('maps.app.goo.gl') || detail.includes('google.com/maps');
	}

	const interviewsHref = resolveAppPath('/interviews');
</script>

<SeoHead {seo} jsonLd={[eventJsonLd, webPageJsonLd]} />

<PageHero
	eyebrow="Programme"
	title="Workshop Schedule"
	lede="Three days of collaborative dialogue, knowledge sharing and strategic planning at the intersection of Digital Humanities and AI in African Studies."
	width="wide"
>
	<div class="gap-lg text-body-sm mt-sm flex flex-wrap items-center">
		<span class="gap-xs flex items-center">
			<CalendarMonthOutline class="size-icon-md text-accent" aria-hidden="true" />
			{workshopInfo.dates.full}
		</span>
		<span class="gap-xs flex items-center">
			<MapPinAltOutline class="size-icon-md text-accent" aria-hidden="true" />
			<a
				href={workshopInfo.location.url}
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary">{workshopInfo.location.venue}, {workshopInfo.location.city}</a
			>
		</span>
		<span class="text-caption" style="max-width:none"
			>Schedule as run · last edited {scheduleLastUpdated}</span
		>
	</div>
</PageHero>

<section class="band-tight padding-inline-section">
	<div class="content-width-wide">
		<UrlTabs
			tabs={dayTabs}
			paramName="day"
			defaultTab="day1"
			tabStyle="pill"
			class="schedule-tabs"
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
				{@const hasWorldCafe = day.items.some((item) => item.type === 'world-cafe')}

				<!-- Day header — a record of what happened, not a live programme -->
				<header class="day-head animate-section-reveal" use:reveal>
					<div class="section-head">
						<p class="section-head__eyebrow">{day.date}</p>
						<h2 class="heading-section">{day.theme}</h2>
					</div>
					<p class="prose-serif">{day.themeDescription}</p>
					{#if day.outcome}
						<p class="day-outcome">
							<span class="text-label text-accent">What came of it</span>
							{day.outcome}
							<a href={photosHref(day.photoCategory)} class="link-secondary">Photos from this day</a
							>
							· <a href={interviewsHref} class="link-secondary">Participant interviews</a>
						</p>
					{/if}
				</header>

				<!-- One neutral card. Session type is a chip, not a tinted row with a
				     4px left border fighting a 20px radius. -->
				<ol class="day-list card-surface">
					{#each day.items as item (item.time + item.title)}
						{@const [start, end] = splitTime(item.time)}
						{#if isQuietItem(item)}
							<li class="day-row day-row--quiet avoid-break">
								<span class="day-row__time">{start}</span>
								<p class="text-body-sm">
									{item.title}{#if item.rooms?.length}<span class="text-subtle-ink"
											>&nbsp;· {item.rooms.join(', ')}</span
										>{/if}
								</p>
							</li>
						{:else}
							<li class="day-row avoid-break">
								<span class="day-row__time">
									{start}{#if end}<br /><span class="day-row__time-end">{end}</span>{/if}
								</span>
								<div class="day-row__body">
									<span class="session-chip session-chip--{sessionTypes[item.type].chipTone}">
										{sessionTypes[item.type].label}
									</span>
									<h3 class="day-row__title">{item.title}</h3>

									{#if item.facilitators?.length || item.rooms?.length}
										<p class="day-row__meta">
											{#if item.facilitators?.length}{listFormatter.format(item.facilitators)}{/if}
											{#if item.facilitators?.length && item.rooms?.length}&nbsp;·&nbsp;{/if}
											{#if item.rooms?.length}{item.rooms.join(' · ')}{/if}
										</p>
									{/if}

									{#if item.description}
										<p class="text-body-sm">{item.description}</p>
									{/if}

									{#if item.details?.length}
										<ul class="day-row__details">
											{#each item.details as detail (detail)}
												<li>
													{#if detail.startsWith('http')}
														<a
															href={detail}
															target="_blank"
															rel="noopener noreferrer"
															class="link-secondary"
															>{isMapLink(detail) ? 'View on Google Maps' : detail}</a
														>
													{:else}
														{detail}
													{/if}
												</li>
											{/each}
										</ul>
									{/if}

									{#if item.deliverables?.length}
										<div class="day-row__deliverable">
											<span class="text-label text-accent">
												{item.deliverables.length > 1 ? 'Deliverables' : 'Deliverable'}
											</span>
											{#if item.deliverables.length === 1}
												<p class="text-body-sm">{item.deliverables[0]}</p>
											{:else}
												<ul class="day-row__details">
													{#each item.deliverables as deliverable (deliverable)}
														<li>{deliverable}</li>
													{/each}
												</ul>
											{/if}
										</div>
									{/if}
								</div>
							</li>
						{/if}
					{/each}
				</ol>

				{#if hasWorldCafe}
					<!-- Explained once, as a footnote, rather than in an identical
					     popover instantiated on every day tab -->
					<aside class="day-footnote" aria-label="World Café format">
						<p class="text-label text-accent">The World Café format</p>
						<ul class="day-row__details">
							{#each worldCafeFormat as line (line)}
								<li>{line}</li>
							{/each}
						</ul>
					</aside>
				{/if}
			{/snippet}
		</UrlTabs>
	</div>
</section>

<!-- Practical details -->
<section class="band-tight band-sunken padding-inline-section">
	<div class="content-width-wide">
		<div class="section-head">
			<p class="section-head__eyebrow">Practical</p>
			<h2 class="heading-section">Dates and Venue</h2>
		</div>
		<dl class="practical-grid">
			<div>
				<dt class="text-label">Workshop dates</dt>
				<dd class="heading-sub heading-sm">{workshopInfo.dates.full}</dd>
				<dd class="text-body-sm">{workshopInfo.duration.description}</dd>
			</div>
			<div>
				<dt class="text-label">Venue</dt>
				<dd class="heading-sub heading-sm">
					<a
						href={workshopInfo.location.url}
						target="_blank"
						rel="noopener noreferrer"
						class="link-secondary">{workshopInfo.location.venue}</a
					>
				</dd>
				<dd class="text-body-sm">
					{workshopInfo.location.city}, {workshopInfo.location.country}
				</dd>
			</div>
		</dl>
	</div>
</section>

<style>
	.day-head {
		margin-bottom: var(--space-lg);
	}

	.day-outcome {
		margin-top: var(--space-md);
		padding-left: var(--space-md);
		border-left: 2px solid var(--border-accent);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--text-secondary);
		max-width: var(--measure-prose);
	}

	.day-outcome :global(.text-label) {
		display: block;
	}

	.day-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.day-row {
		display: grid;
		grid-template-columns: 5.25rem minmax(0, 1fr);
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--border-subtle);
	}

	.day-row:last-child {
		border-bottom: none;
	}

	/* Roughly 40% of every day's height went to catering, at full card weight */
	.day-row--quiet {
		align-items: baseline;
		padding-block: var(--space-xs);
		background-color: var(--bg-sunken);
		color: var(--text-muted);
	}

	/* Tabular figures in the body sans line the times up just as well as a mono
	   stack would, without borrowing an undeclared system face for it. */
	.day-row__time {
		font-family: var(--font-family-body);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.day-row--quiet .day-row__time {
		color: var(--text-subtle);
	}

	.day-row__time-end {
		color: var(--text-subtle);
	}

	.day-row__body {
		display: grid;
		gap: var(--space-2xs);
		justify-items: start;
		min-width: 0;
	}

	.day-row__title {
		font-family: var(--font-family-display);
		font-weight: var(--font-weight-semibold);
		font-size: var(--text-lg);
		line-height: var(--leading-heading);
		color: var(--text-primary);
	}

	.day-row__meta {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.day-row__details {
		display: grid;
		gap: var(--space-3xs);
		margin: 0;
		padding-left: 1.1em;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--text-secondary);
	}

	.day-row__deliverable {
		margin-top: var(--space-2xs);
		padding-left: var(--space-sm);
		border-left: 2px solid var(--border-accent);
	}

	/* ---------- Session chips ---------- */
	.session-chip {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		line-height: 1;
	}

	.session-chip--brand {
		color: var(--brand);
	}

	.session-chip--accent {
		color: var(--text-accent);
	}

	.session-chip--neutral {
		color: var(--text-subtle);
	}

	.day-footnote {
		margin-top: var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-card);
		background-color: var(--bg-sunken);
		border: 1px solid var(--border-subtle);
		max-width: var(--measure-prose);
	}

	.day-footnote :global(.text-label) {
		display: block;
		margin-bottom: var(--space-2xs);
	}

	.practical-grid {
		display: grid;
		gap: var(--space-xl);
		margin: 0;
	}

	@media (min-width: 640px) {
		.practical-grid {
			grid-template-columns: repeat(2, minmax(0, 20rem));
		}
	}

	.practical-grid dd {
		margin: var(--space-3xs) 0 0;
	}
</style>
