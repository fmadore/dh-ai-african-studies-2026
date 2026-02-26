<script lang="ts">
	import { Heading, P } from 'flowbite-svelte';
	import { VideoCameraOutline } from 'flowbite-svelte-icons';
	import {
		createSeoMeta,
		createEventJsonLd,
		createWebPageJsonLd,
		serializeJsonLd
	} from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { reveal } from '$lib/utils/reveal';

	interface Interview {
		participantName: string;
		affiliation: string;
		youtubeId: string;
		topic: string;
		description: string;
	}

	const interviews: Interview[] = [
		{
			participantName: 'Emmanuel Ngue Um',
			affiliation: 'University of Yaoundé I',
			youtubeId: 'IpSY7i_bses',
			topic: 'AI, Digital Humanities, and African Indigenous Languages',
			description:
				'Linguist Emmanuel Ngue Um discusses how artificial intelligence and digital humanities can help preserve and teach indigenous languages. He presents his work building language technology models — speech recognition, synthesis, and machine translation — to create digital teaching resources for local languages. Emmanuel explains how AI is accelerating linguistic research: large language models can use transfer learning to support low-resource languages with as little as one hour of recorded data. He also reflects on what AI\'s ability to process and replicate speech reveals about the nature of human language and cognition.'
		}
	];

	const seo = createSeoMeta({
		title: 'Interviews',
		description:
			'Short video interviews with participants of the Charting New Territory workshop on Digital Humanities and AI in African Studies, held 18–20 February 2026 in Hanover, Germany.',
		path: '/interviews',
		keywords: [
			'Workshop Interviews',
			'Participant Videos',
			'Digital Humanities',
			'AI',
			'African Studies',
			'Hanover',
			'Workshop 2026'
		]
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

	const webPageJsonLd = createWebPageJsonLd({
		name: seo.title,
		description: seo.description,
		url: seo.canonical
	});
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
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>
	<div class="content-width surface-panel surface-padding text-center stack-sm relative">
		<Heading
			tag="h1"
			class="heading-display heading-xl text-gradient-teal drop-shadow-md pb-2 tracking-tight animate-hero-title"
		>
			Interviews
		</Heading>
		<P class="text-lead mx-auto max-w-3xl animate-hero-subtitle">
			Short interviews with workshop participants sharing their perspectives on Digital Humanities
			and AI in African Studies.
		</P>
		<p class="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 animate-hero-subtitle" style="animation-delay: 100ms;">
			Filmed by <a href="https://calumbrett.myportfolio.com/" target="_blank" rel="noopener noreferrer" class="text-secondary-500 dark:text-secondary-400 hover:text-secondary-400 dark:hover:text-secondary-300 transition-colors">Calum Houston</a>
		</p>
	</div>
</section>

<!-- Interviews Grid -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div
		class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal"
		use:reveal
	>
		{#if interviews.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
				{#each interviews as interview (interview.participantName)}
					<div class="card-surface surface-padding stack-md rounded-lg glow-border">
						{#if interview.youtubeId}
							<div class="aspect-video w-full overflow-hidden rounded-md">
								<iframe
									src="https://www.youtube-nocookie.com/embed/{interview.youtubeId}"
									title="Interview with {interview.participantName}"
									frameborder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowfullscreen
									class="h-full w-full"
									loading="lazy"
								></iframe>
							</div>
						{:else}
							<div class="aspect-video w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
								<div class="text-center stack-xs">
									<VideoCameraOutline class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
									<p class="text-sm text-gray-500 dark:text-gray-400">Video coming soon</p>
								</div>
							</div>
						{/if}
						<div class="stack-xs">
							<Heading tag="h2" class="heading-sub heading-color-light">
								{interview.participantName}
							</Heading>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{interview.affiliation}
							</p>
							<Heading tag="h3" class="text-base! font-medium! text-secondary-600 dark:text-secondary-400">
								{interview.topic}
							</Heading>
							<P class="body-text-muted text-sm">
								{interview.description}
							</P>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="text-center padding-block-xl card-surface surface-padding border border-dashed border-gray-300 dark:border-gray-700"
			>
				<div class="stack-sm flex flex-col items-center">
					<VideoCameraOutline
						class="w-16 h-16 text-surface-400 dark:text-surface-dark-overlay"
					/>
					<Heading tag="h2" class="heading-section text-gradient-teal">Coming Soon</Heading>
					<P class="body-text-muted max-w-md mx-auto">
						Short interviews with workshop participants will be added here soon. Check back to
						hear their perspectives on Digital Humanities and AI in African Studies.
					</P>
				</div>
			</div>
		{/if}
	</div>
</section>
