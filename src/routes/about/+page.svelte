<script lang="ts">
	import { Heading, P, Card, Badge } from "flowbite-svelte";
	import { UserCircleSolid } from "flowbite-svelte-icons";
	import {
		createSeoMeta,
		createEventJsonLd,
		serializeJsonLd,
	} from "$lib/utils/seo";
	import { participants } from "$lib/data/participants";
	import { workStreams } from "$lib/data/work-streams";
	import { workshopInfo } from "$lib/data/workshop-info";
	import { resolveAssetPath, resolveAppPath } from "$lib/utils/paths";
	import { reveal } from "$lib/utils/reveal";

	function decorateWithPhotoUrl(participant: (typeof participants)[number]) {
		return {
			...participant,
			photoUrl: resolveAssetPath(participant.photoUrl),
		};
	}

	const coOrganizers = participants
		.filter((participant) => participant.role === "Co-organizer")
		.map(decorateWithPhotoUrl);
	const studentAssistants = participants
		.filter((participant) => participant.role === "Student assistant")
		.map(decorateWithPhotoUrl);

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = "none";
		const placeholder = img.nextElementSibling as HTMLElement;
		if (placeholder) {
			placeholder.style.display = "flex";
		}
	}

	const seo = createSeoMeta({
		title: "About the Workshop",
		description:
			"This scoping workshop convenes international experts to map the intersection of digital humanities and AI within African studies, highlighting opportunities and challenges across equity, linguistics, and methodology.",
		path: "/about",
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
<section
	class="bg-page padding-block-section padding-inline-section relative overflow-hidden"
>
	<div class="bg-grid-mesh"></div>
	<div class="bg-radial-glow"></div>

	<div class="content-width surface-panel surface-padding stack-xl relative">
		<Heading
			tag="h1"
			class="text-center heading-display heading-xl text-gradient-teal tracking-tight drop-shadow-md pb-2 animate-hero-title"
			>About the Workshop</Heading
		>

		<div class="stack-md text-left animate-hero-subtitle" style="animation-delay: 250ms;">
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Background</Heading
			>
			<P class="body-text mt-4">
				Digital humanities has a long—and often overlooked—history in African studies, from
				early databases such as the <a
					href="https://www.slavevoyages.org/"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary"><em>Transatlantic Slave Trade Database</em></a>,
				to more recent projects like the <a
					href="https://open.bu.edu/handle/2144/1896"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary"><em>African Ajami Library</em></a>, <a
					href="https://openrestitution.africa/"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary"><em>Open Restitution Africa</em></a>, and <a
					href="https://archivi.ng/"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary"><em>Archivi.ng</em></a>. AI tools, particularly large
				language models, add new possibilities for textual analysis and
				cross-cultural research.
			</P>
			<P class="body-text">
				But implementation raises difficult questions. Decisions about
				what gets digitised, how it is catalogued and who controls
				access are not neutral; they often favour institutions that
				already have resources in place. Most AI systems still
				underperform on African languages. And the pace of adoption
				frequently outstrips attention to long-term preservation and
				local capacity.
			</P>
			<P class="body-text">
				Critics have described some digital initiatives as a form of
				"<a
					href="https://doi.org/10.1080/13696815.2018.1555749"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary">digital saviour complex</a>," where Northern-led projects reproduce
				colonial dynamics even while claiming to democratise access.
				This workshop takes these critiques seriously.
			</P>
		</div>

		<div class="stack-md animate-section-reveal" use:reveal>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Format</Heading
			>
			<P class="body-text mt-4">
				This is not a traditional conference. There are no paper
				presentations. Instead, participants work intensively across
				three days in structured sessions designed to produce tangible
				outputs. Daily synthesis sessions connect insights across the
				three work streams, feeding directly into the <a
					href={resolveAppPath('/position-paper')}
					class="link-secondary">position paper</a>.
			</P>

			<div
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 stagger-children"
				use:reveal
			>
				{#each workStreams as stream (stream.id)}
					<Card
						class="card-surface surface-padding-sm h-full stack-xs glow-border"
					>
						<Heading tag="h3" class="heading-sub text-lg"
							>{stream.title}</Heading
						>
						<P class="text-body-sm">
							{stream.description}
						</P>
					</Card>
				{/each}
			</div>
		</div>

		<div class="stack-md animate-section-reveal" use:reveal>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Key Outcome: The Position Paper</Heading
			>
			<P class="body-text mt-4">
				The primary goal of this workshop is to produce a jointly authored
				<a href={resolveAppPath('/position-paper')} class="link-secondary">position paper</a>.
			</P>
			<P class="body-text">
				Drawing on insights from the daily sessions, this document will
				provide a strategic reference point for the field, offering
				actionable recommendations for research funders, academic
				institutions, technology developers, and policymakers.
			</P>
			<P class="body-text">
				By addressing sustainable funding models, ethical protocols, and
				decolonised curricula, our aim is to support the consolidation
				of this emerging field and inform its future direction.
			</P>
		</div>

		<!-- Co-Organisers Section -->
		{#if coOrganizers.length > 0}
			<div class="stack-md animate-section-reveal" use:reveal>
				<Heading
					tag="h2"
					class="heading-section heading-lg heading-color-light accent-underline"
					>Co-Organisers</Heading
				>
				<div class="stack-md mt-4 stagger-children" use:reveal>
					{#each coOrganizers as organizer (organizer.name)}
						<div class="card-surface w-full glow-border">
							<div
								class="flex flex-col md:flex-row w-full items-center md:items-start gap-4 md:gap-8 p-6 md:p-8"
							>
								<!-- Photo -->
								<div class="w-28 h-28 md:w-36 md:h-36 shrink-0">
									<div class="relative w-full h-full">
										{#if organizer.photoUrl}
											<img
												src={organizer.photoUrl}
												alt={organizer.name}
												class="w-full h-full rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700 shadow-md"
												onerror={handleImageError}
											/>
											<!-- Placeholder for missing images -->
											<div
												class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 hidden items-center justify-center absolute top-0 left-0 shadow-md"
											>
												<UserCircleSolid
													class="w-14 h-14 md:w-16 md:h-16 text-gray-400 dark:text-gray-500"
												/>
											</div>
										{:else}
											<!-- Placeholder for organizers without photo -->
											<div
												class="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 flex items-center justify-center shadow-md"
											>
												<UserCircleSolid
													class="w-14 h-14 md:w-16 md:h-16 text-gray-400 dark:text-gray-500"
												/>
											</div>
										{/if}
									</div>
								</div>

								<!-- Content -->
								<div
									class="flex-1 text-center md:text-left stack-xs"
								>
									<Heading
										tag="h3"
										class="heading-sub heading-color-light heading-md"
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
										class="text-secondary-600 dark:text-secondary-400 font-medium"
									>
										{organizer.affiliation}
									</P>
									{#if organizer.bio}
										<P class="body-text mt-2">
											{organizer.bio}
										</P>
									{/if}

									{#if organizer.researchRegions.length > 0}
										<div class="pt-3">
											<P
												class="text-caption font-medium mb-2"
											>
												Research Regions
											</P>
											<div
												class="flex flex-wrap justify-center md:justify-start gap-2"
											>
												{#each organizer.researchRegions.toSorted() as region (region)}
													<Badge
														color="secondary"
														class="text-xs"
														>{region}</Badge
													>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Student Assistants Section -->
		{#if studentAssistants.length > 0}
			<div class="stack-md animate-section-reveal" use:reveal>
				<Heading
					tag="h2"
					class="heading-section heading-lg heading-color-light accent-underline"
					>Student Assistants</Heading
				>
				<div
					class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-4 stagger-children"
					use:reveal
				>
					{#each studentAssistants as assistant (assistant.name)}
						<Card class="card-surface surface-padding-sm h-full glow-border">
							<div
								class="flex flex-col items-center text-center stack-xs"
							>
								<!-- Photo -->
								<div class="relative w-20 h-20">
									{#if assistant.photoUrl}
										<img
											src={assistant.photoUrl}
											alt={assistant.name}
											class="w-20 h-20 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700 shadow-md"
											onerror={handleImageError}
										/>
										<!-- Placeholder for missing images -->
										<div
											class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 hidden items-center justify-center absolute top-0 left-0 shadow-md"
										>
											<UserCircleSolid
												class="w-12 h-12 text-gray-400 dark:text-gray-500"
											/>
										</div>
									{:else}
										<!-- Placeholder for assistants without photo -->
										<div
											class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-secondary-200 dark:border-secondary-700 flex items-center justify-center shadow-md"
										>
											<UserCircleSolid
												class="w-12 h-12 text-gray-400 dark:text-gray-500"
											/>
										</div>
									{/if}
								</div>

								<!-- Name -->
								<Heading
									tag="h3"
									class="heading-sub heading-color-light heading-sm"
								>
									{assistant.name}
								</Heading>

								<!-- Affiliation -->
								<P
									class="text-secondary-600 dark:text-secondary-400 text-body-sm font-medium"
								>
									{assistant.affiliation}
								</P>

								<!-- Bio -->
								{#if assistant.bio}
									<P class="text-body-sm">
										{assistant.bio}
									</P>
								{/if}

								<!-- Research Regions -->
								{#if assistant.researchRegions.length > 0}
									<div class="pt-2 w-full">
										<P
											class="text-caption font-medium mb-2 text-center"
										>
											Research Regions
										</P>
										<div
											class="flex flex-wrap justify-center gap-2"
										>
											{#each assistant.researchRegions.toSorted() as region (region)}
												<Badge
													color="secondary"
													class="text-xs"
													>{region}</Badge
												>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</Card>
					{/each}
				</div>
			</div>
		{/if}

		<div class="stack-sm animate-section-reveal" use:reveal>
			<Heading
				tag="h2"
				class="heading-section heading-lg heading-color-light accent-underline"
				>Funding</Heading
			>
			<P class="body-text mt-4">
				This scoping workshop is made possible by the generous support
				of the <a
					href="https://www.volkswagenstiftung.de/en"
					target="_blank"
					rel="noopener noreferrer"
					class="link-secondary font-semibold">Volkswagen Foundation</a
				>.
			</P>
		</div>
	</div>
</section>
