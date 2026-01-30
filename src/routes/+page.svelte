<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem } from "flowbite-svelte";
	import {
		CalendarMonthOutline,
		MapPinAltOutline,
	} from "flowbite-svelte-icons";
	import {
		createSeoMeta,
		createEventJsonLd,
		serializeJsonLd,
	} from "$lib/utils/seo";
	import { workshopInfo } from "$lib/data/workshop-info";
	import { resolveAppPath, resolveAssetPath } from "$lib/utils/paths";
	import { participants } from "$lib/data/participants";
	import { workStreams } from "$lib/data/work-streams";
	import { reveal } from "$lib/utils/reveal";
	import PrimaryButton from "$lib/components/PrimaryButton.svelte";
	import SecondaryButton from "$lib/components/SecondaryButton.svelte";

	const seo = createSeoMeta({ path: "/" });
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
	const aboutHref = resolveAppPath("/about");
	const participantsHref = resolveAppPath("/participants");
	const positionPaperHref = resolveAppPath("/position-paper");

	const organizers = participants
		.filter((p) => p.role === "Co-organizer")
		.map((p) => ({
			...p,
			photoUrl: resolveAssetPath(p.photoUrl),
		}));

	const keyHighlights = [
		{
			title: "Date",
			description: workshopInfo.dates.full,
			icon: CalendarMonthOutline,
		},
		{
			title: "Location",
			description: workshopInfo.location.full,
			icon: MapPinAltOutline,
			href: workshopInfo.location.url,
		},
	];

	const workshopGoals = [
		{
			title: "From Assessment to Action",
			description:
				"We prioritise production over presentation. Each day, participants progress from mapping current barriers to co-designing actionable strategies, ensuring that African epistemologies remain at the centre of this process. Daily synthesis sessions connect insights across groups.",
		},
		{
			title: "Structured Work Streams",
			description:
				"Three integrated work streams will tackle critical intersections through facilitated dialogue rather than traditional panels: Methodological Integration, Equitable North–South/South–South Collaboration and Ethical Frameworks.",
		},
		{
			title: "Position Paper",
			description:
				"The workshop will culminate in the creation of a co-authored strategic roadmap. This document will outline the future direction of the field, providing practical recommendations to inform future research, funding policies and institutional decision-making.",
		},
	];
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

<!-- Hero Section - Future Forward -->
<section class="relative overflow-hidden gradient-hero-future min-h-[85vh] flex items-center">
	<!-- Grid mesh background -->
	<div class="bg-grid-mesh"></div>

	<!-- Radial glow effects -->
	<div class="bg-radial-glow animate-pulse-glow"></div>
	<div class="bg-radial-glow-bottom"></div>

	<!-- Decorative elements -->
	<div
		class="decorative-circle w-64 h-64 top-20 -left-32 animate-float opacity-50"
		aria-hidden="true"
	></div>
	<div
		class="decorative-circle w-48 h-48 bottom-32 -right-24 animate-float-delayed opacity-40"
		aria-hidden="true"
	></div>
	<div
		class="decorative-line w-96 top-1/3 left-0 opacity-60"
		aria-hidden="true"
	></div>
	<div
		class="decorative-line w-64 bottom-1/4 right-0 opacity-40"
		aria-hidden="true"
	></div>

	<div
		class="relative content-width-wide container-responsive py-16 md:py-24"
	>
		<!-- Asymmetric layout container -->
		<div class="grid lg:grid-cols-12 gap-8 items-center">
			<!-- Main content - takes more space on left -->
			<div class="lg:col-span-8 xl:col-span-7 stack-lg">
				<div class="stack-md">
					<h1
						class="heading-display heading-xl text-gradient-teal tracking-tight drop-shadow-md pb-2 animate-hero-title"
					>
						Charting New Territory
					</h1>
					<p class="heading-sub drop-shadow-sm opacity-90 max-w-2xl animate-hero-subtitle">
						Digital Humanities and AI in African Studies
					</p>
					<p
						class="text-sm font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-widest animate-hero-subtitle"
						style="animation-delay: 200ms;"
					>
						A Scoping Workshop
					</p>
				</div>

				<p
					class="text-lead max-w-2xl drop-shadow-sm animate-hero-subtitle"
					style="animation-delay: 180ms;"
				>
					A working meeting bringing together researchers from Africa, Europe,
					and beyond. Through facilitated discussions and structured
					deliberation—prioritising collaboration over presentations—participants
					will move from assessing current practices to developing actionable
					strategies. The outcome: a co-authored position paper guiding the
					ethical integration of digital humanities and AI in African studies.
				</p>

				<div class="flex flex-col gap-4 sm:flex-row">
					<div class="animate-hero-cta">
						<PrimaryButton href={aboutHref} size="xl">About</PrimaryButton>
					</div>
					<div class="animate-hero-cta-2">
						<SecondaryButton href={participantsHref} size="xl">
							Participants
						</SecondaryButton>
					</div>
					<div class="animate-hero-cta-3">
						<SecondaryButton href={positionPaperHref} size="xl">
							Position Paper
						</SecondaryButton>
					</div>
				</div>
			</div>

			<!-- Decorative accent panel on right (visible on lg+) -->
			<div class="hidden lg:block lg:col-span-4 xl:col-span-5 relative">
				<div
					class="absolute inset-0 bg-linear-to-br from-secondary-100/40 to-primary-100/20 dark:from-secondary-900/30 dark:to-primary-900/20 rounded-3xl transform rotate-3 glow-teal"
					aria-hidden="true"
				></div>
				<div
					class="absolute inset-4 bg-linear-to-tr from-secondary-50/60 to-white/80 dark:from-secondary-950/40 dark:to-gray-900/60 rounded-2xl transform -rotate-1"
					aria-hidden="true"
				></div>
			</div>
		</div>
	</div>
</section>

<!-- Key Information -->
<section
	class="bg-page padding-block-section-sm padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh opacity-50"></div>

	<div
		class="content-width-wide surface-panel surface-padding relative animate-section-reveal stagger-children"
		use:reveal
	>
		<div class="auto-grid auto-grid-sm">
			{#each keyHighlights as highlight (highlight.title)}
				{@const Icon = highlight.icon}
				<article
					class="highlight-card card-surface surface-padding-sm glow-border"
				>
					<div class="highlight-card__icon glow-teal" aria-hidden="true">
						<Icon size="lg" aria-hidden="true" />
					</div>
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-sm"
							>{highlight.title}</Heading
						>
						<P class="text-body-lg">
							{#if highlight.href}
								<a
									href={highlight.href}
									target="_blank"
									rel="noopener noreferrer"
									class="link-secondary"
								>
									{highlight.description}
								</a>
							{:else}
								{highlight.description}
							{/if}
						</P>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- Conference Themes -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-radial-glow opacity-50"></div>

	<div
		class="content-width-wide surface-panel surface-padding stack-xl relative"
	>
		<div
			class="stack-md text-center animate-section-reveal"
			use:reveal
		>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Workshop Purpose</Heading
			>
			<P class="text-lead max-w-4xl mx-auto mt-6">
				Although digital humanities and AI offer transformative potential
				for African studies, rapid adoption has outpaced critical
				reflection. Most AI tools remain optimised for Western languages,
				digitisation decisions often reinforce who controls historical
				materials, and African institutions frequently lack the
				infrastructure to participate on equal terms. This workshop
				brings together international experts to move beyond describing
				these challenges and develop concrete strategies that keep
				African perspectives at the forefront.
			</P>
		</div>

		<!-- Asymmetric card grid with varied sizing -->
		<div
			class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-section-reveal stagger-children"
			use:reveal
		>
			{#each workshopGoals as goal, index (goal.title)}
				<article
					class="theme-card card-surface surface-padding-sm glow-border {index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}"
				>
					<Heading tag="h3" class="heading-sub heading-sm"
						>{goal.title}</Heading
					>
					<P class="body-text">{goal.description}</P>
				</article>
			{/each}
		</div>

		<!-- Work Streams with decorative connector -->
		<div
			class="stack-md animate-section-reveal"
			use:reveal
		>
			<div class="relative">
				<Heading
					tag="h2"
					class="text-center heading-sub heading-lg heading-color-light accent-underline"
					>Three Work Streams</Heading
				>
				<!-- Decorative line below heading -->
				<div
					class="hidden md:block absolute left-1/2 top-full w-px h-8 bg-linear-to-b from-secondary-400 to-transparent transform -translate-x-1/2"
					aria-hidden="true"
				></div>
			</div>

			<div class="mt-6">
				<Timeline>
					{#each workStreams as stream}
						<TimelineItem
							title={`Work Stream ${stream.id}: ${stream.title}`}
							date=""
						>
							<P class="body-text">
								{stream.description}
							</P>
						</TimelineItem>
					{/each}
				</Timeline>
			</div>
		</div>
	</div>
</section>

<!-- Organizers Section -->
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh opacity-30"></div>

	<div
		class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal"
		use:reveal
	>
		<div class="text-center stack-sm">
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Workshop Organizers</Heading
			>
		</div>

		<div
			class="grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2 max-w-3xl mx-auto mt-6 stagger-children"
			use:reveal
		>
			{#each organizers as organizer (organizer.name)}
				<Card
					class="card-surface surface-padding-sm w-full flex flex-col items-center text-center gap-4 glow-border"
				>
					{#if organizer.photoUrl}
						<div class="relative">
							<img
								src={organizer.photoUrl}
								alt={organizer.name}
								class="w-28 h-28 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700 shadow-md"
							/>
							<!-- Subtle glow ring behind photo -->
							<div
								class="absolute inset-0 rounded-full glow-teal opacity-0 hover:opacity-100 transition-opacity duration-300"
								aria-hidden="true"
							></div>
						</div>
					{/if}
					<div class="stack-xs">
						<Heading
							tag="h3"
							class="heading-sub heading-color-light text-xl"
						>
							{#if organizer.website}
								<a
									href={organizer.website}
									target="_blank"
									rel="noopener noreferrer"
									class="link-secondary hover:underline"
								>
									{organizer.name}
								</a>
							{:else}
								{organizer.name}
							{/if}
						</Heading>
						<P
							class="text-body-sm text-secondary-600 dark:text-secondary-400 font-medium"
						>
							{organizer.affiliation}
						</P>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="bg-page padding-block-section-sm padding-inline-section">
	<div
		class="content-width-narrow surface-panel surface-padding-sm text-center"
	>
		<P class="body-text-muted text-sm">
			This scoping workshop is made possible by the generous support of
			the
			<a
				href="https://www.volkswagenstiftung.de/en"
				target="_blank"
				rel="noopener noreferrer"
				class="link-secondary font-semibold">Volkswagen Foundation</a
			>
		</P>
	</div>
</section>
