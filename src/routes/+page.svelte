<script lang="ts">
	import { Button, Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';
	import { participants } from '$lib/data/participants';

	const seo = createSeoMeta({ path: '/' });
	const aboutHref = resolveAppPath('/about');
	const participantsHref = resolveAppPath('/participants');
	const positionPaperHref = resolveAppPath('/position-paper');

	const organizers = participants
		.filter((p) => p.role === 'Co-organizer')
		.map((p) => ({
			...p,
			photoUrl: resolveAssetPath(p.photoUrl)
		}));
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

<!-- Hero Section -->
<section class="relative overflow-hidden bg-linear-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 bg-linear-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-600/10 dark:via-transparent dark:to-secondary-600/10"></div>
	<div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 dark:bg-primary-500/5 rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-500/5 rounded-full blur-3xl"></div>
	
	<div class="relative content-width-wide py-16 text-center stack-lg">
		<div class="stack-sm">
			<h1 class="heading-display heading-xl heading-color-light tracking-tight drop-shadow-sm">
				Charting New Territory
			</h1>
			<p class="heading-display-compact heading-color-light text-2xl font-light drop-shadow-sm">
				Digital Humanities and AI in African Studies
			</p>
			<p class="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
				A Scoping Workshop
			</p>
		</div>
		<p class="body-text text-lg lg:text-xl leading-relaxed sm:px-16 xl:px-48 drop-shadow-sm">
			This scoping workshop addresses the critical convergence of digital humanities and artificial intelligence within African studies. Through intensive exchange—prioritising discussion over presentations—participants will explore methodological integration, equitable collaboration and ethical frameworks in structured work streams.
		</p>
		<div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
			<Button href={aboutHref} size="xl" color="primary" class="shadow-lg hover:shadow-primary">
				About
			</Button>
			<Button href={participantsHref} size="xl" outline color="secondary" class="backdrop-blur-sm">
				Participants
			</Button>
			<Button href={positionPaperHref} size="xl" outline color="secondary" class="backdrop-blur-sm">
				Position Paper
			</Button>
		</div>
	</div>
</section>

<!-- Key Information -->
<section class="bg-page py-12">
	<div class="content-width-wide surface-panel surface-padding">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow stack-sm">
				<div class="flex justify-center">
					<CalendarMonthOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Date</Heading>
				<P class="body-text">{workshopInfo.dates.full}</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow stack-sm">
				<div class="flex justify-center">
					<MapPinAltOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Location</Heading>
				<P class="body-text">{workshopInfo.location.full}</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow stack-sm">
				<div class="flex justify-center">
					<UsersGroupOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Format</Heading>
				<P class="body-text">{workshopInfo.format.type}</P>
			</Card>
		</div>
	</div>
</section>

<!-- Conference Themes -->
<section class="bg-page py-16">
	<div class="content-width-wide surface-panel surface-padding stack-xl">
		<div class="stack-md text-center">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Purpose</Heading>
			<P class="body-text text-lg leading-relaxed max-w-4xl mx-auto">
				The convergence of digital humanities and AI is transforming knowledge production in African studies, offering unprecedented opportunities for innovative analysis and cross-cultural research. However, this transformative potential is intertwined with pressing challenges regarding equitable access, linguistic representation, and methodological approaches. Our goal is to convene experts to assess this emerging interdisciplinary field and develop strategic pathways for its future.
			</P>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm text-left">
				<Heading tag="h3" class="heading-sub">Assessment to Action</Heading>
				<P class="body-text text-base leading-relaxed">
					Moving beyond describing current conditions to actively charting future pathways and collaborative strategies for ethical, equitable development of DH and AI in African studies.
				</P>
			</Card>
			
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm text-left">
				<Heading tag="h3" class="heading-sub">Structured Work Streams</Heading>
				<P class="body-text text-base leading-relaxed">
					Three thematic workstreams focusing on methodological integration, equitable collaboration, and ethical implementation through facilitated discussions and collaborative exercises.
				</P>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm text-left">
				<Heading tag="h3" class="heading-sub">Position Paper</Heading>
				<P class="body-text text-base leading-relaxed">
					Co-authored output outlining key findings and strategic recommendations to guide future research, policy, and funding, serving as a foundational reference for the field.
				</P>
			</Card>
		</div>

		<div class="stack-md">
			<Heading tag="h3" class="text-center heading-section heading-lg heading-color-light">Three Work Streams</Heading>
			<Timeline>
				<TimelineItem title="Work Stream 1: Methodological Integration" date="">
					<P class="body-text text-base leading-relaxed">
						Enhancing methodological integration and digital preservation—documenting computational methods, developing technical standards, and establishing sustainable digital preservation models, with focus on adapting AI for African languages.
					</P>
				</TimelineItem>
				<TimelineItem title="Work Stream 2: Equitable Collaboration" date="">
					<P class="body-text text-base leading-relaxed">
						Fostering inclusive North-South and South-South dialogue—analyzing research relationships to design partnership models that address power imbalances, with African epistemologies at the centre of methodological developments.
					</P>
				</TimelineItem>
				<TimelineItem title="Work Stream 3: Ethical Implementation" date="">
					<P class="body-text text-base leading-relaxed">
						Establishing ethical dissemination and implementation practices—developing frameworks for ethical AI that protect digital sovereignty and promote equitable scholarly exchange, with standards for community co-creation.
					</P>
				</TimelineItem>
			</Timeline>
		</div>
	</div>
</section>

<!-- Organizers Section -->
<section class="bg-page py-16">
	<div class="content-width-wide surface-panel surface-padding stack-lg">
		<div class="text-center stack-sm">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Organizers</Heading>
		</div>

		<div class="grid grid-cols-1 gap-6 justify-items-center md:grid-cols-2">
			{#each organizers as organizer (organizer.name)}
				<Card class="card-surface surface-padding-sm flex flex-col items-center text-center gap-4 md:h-full md:justify-between">
					{#if organizer.photoUrl}
						<img
							src={organizer.photoUrl}
							alt={organizer.name}
							class="w-28 h-28 rounded-full object-cover border-4 border-primary-100 dark:border-primary-700"
						/>
					{/if}
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub heading-color-light text-xl">
							{organizer.name}
						</Heading>
						<P class="text-primary-600 dark:text-primary-400 font-semibold">
							{organizer.affiliation}
						</P>
					</div>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="bg-page py-16">
	<div class="content-width-narrow surface-panel surface-padding text-center stack-sm">
		<P class="body-text-muted text-sm">
			This scoping workshop is made possible by the generous support of the
			<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline">Volkswagen Foundation</a>
		</P>
	</div>
</section>
