<script lang="ts">
	import { Button, Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';

	const seo = createSeoMeta({ path: '/' });
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
<section class="bg-linear-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
	<div class="py-8 px-4 mx-auto max-w-7xl text-center lg:py-16 lg:px-12">
		<h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
			Charting New Territory
		</h1>
		<p class="mb-4 text-2xl font-light text-gray-600 dark:text-gray-300">
			Digital Humanities and AI in African Studies
		</p>
		<p class="mb-2 text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
			A Scoping Workshop
		</p>
		<p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
			This scoping workshop addresses the critical convergence of digital humanities and artificial intelligence within African studies. Through intensive exchange—prioritising discussion over presentations—participants will explore methodological integration, equitable collaboration and ethical frameworks in structured work streams.
		</p>
		<div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
			<Button href="/about" size="xl" color="primary">
				About
			</Button>
			<Button href="/participants" size="xl" outline color="secondary">
				Participants
			</Button>
			<Button href="/position-paper" size="xl" outline color="secondary">
				Position Paper
			</Button>
		</div>
	</div>
</section>

<!-- Key Information -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-7xl surface-panel surface-padding">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow space-y-3">
				<div class="flex justify-center">
					<CalendarMonthOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Date</Heading>
				<P class="text-gray-700 dark:text-gray-300">{workshopInfo.dates.full}</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow space-y-3">
				<div class="flex justify-center">
					<MapPinAltOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Location</Heading>
				<P class="text-gray-700 dark:text-gray-300">{workshopInfo.location.full}</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow space-y-3">
				<div class="flex justify-center">
					<UsersGroupOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Format</Heading>
				<P class="text-gray-700 dark:text-gray-300">{workshopInfo.format.type}</P>
			</Card>
		</div>
	</div>
</section>

<!-- Conference Themes -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-7xl surface-panel surface-padding space-y-12">
		<div class="space-y-6 text-center">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">Workshop Purpose</Heading>
			<P class="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
				The convergence of digital humanities and AI is transforming knowledge production in African studies, offering unprecedented opportunities for innovative analysis and cross-cultural research. However, this transformative potential is intertwined with pressing challenges regarding equitable access, linguistic representation, and methodological approaches. Our goal is to convene experts to assess this emerging interdisciplinary field and develop strategic pathways for its future.
			</P>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow space-y-3 text-left">
				<Heading tag="h3" class="heading-sub">Assessment to Action</Heading>
				<P class="text-base text-gray-700 dark:text-gray-300">
					Moving beyond describing current conditions to actively charting future pathways and collaborative strategies for ethical, equitable development of DH and AI in African studies.
				</P>
			</Card>
			
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow space-y-3 text-left">
				<Heading tag="h3" class="heading-sub">Structured Work Streams</Heading>
				<P class="text-base text-gray-700 dark:text-gray-300">
					Three thematic workstreams focusing on methodological integration, equitable collaboration, and ethical implementation through facilitated discussions and collaborative exercises.
				</P>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow space-y-3 text-left">
				<Heading tag="h3" class="heading-sub">Position Paper</Heading>
				<P class="text-base text-gray-700 dark:text-gray-300">
					Co-authored output outlining key findings and strategic recommendations to guide future research, policy, and funding, serving as a foundational reference for the field.
				</P>
			</Card>
		</div>

		<div class="space-y-6">
			<Heading tag="h3" class="text-center heading-section heading-lg heading-color-light">Three Work Streams</Heading>
			<Timeline>
				<TimelineItem title="Work Stream 1: Methodological Integration" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Enhancing methodological integration and digital preservation—documenting computational methods, developing technical standards, and establishing sustainable digital preservation models, with focus on adapting AI for African languages.
					</P>
				</TimelineItem>
				<TimelineItem title="Work Stream 2: Equitable Collaboration" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Fostering inclusive North-South and South-South dialogue—analyzing research relationships to design partnership models that address power imbalances, with African epistemologies at the centre of methodological developments.
					</P>
				</TimelineItem>
				<TimelineItem title="Work Stream 3: Ethical Implementation" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Establishing ethical dissemination and implementation practices—developing frameworks for ethical AI that protect digital sovereignty and promote equitable scholarly exchange, with standards for community co-creation.
					</P>
				</TimelineItem>
			</Timeline>
		</div>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-4xl surface-panel surface-padding text-center space-y-2">
		<P class="text-sm text-gray-700 dark:text-gray-300">
			This scoping workshop is made possible by the generous support of the
			<a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline">Volkswagen Foundation</a>
		</P>
	</div>
</section>
