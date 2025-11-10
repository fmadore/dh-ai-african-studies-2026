<script lang="ts">
	import { Button, Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
</script>

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
			An international three-day working meeting addressing the critical convergence of digital humanities and artificial intelligence within African studies.
		</p>
		<div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
			<Button href="/register" size="xl" color="primary">
				Register Now
			</Button>
			<Button href="/about" size="xl" outline color="secondary">
				Learn More
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
				<P class="text-gray-700 dark:text-gray-300">18-20 February 2026</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow space-y-3">
				<div class="flex justify-center">
					<MapPinAltOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Location</Heading>
				<P class="text-gray-700 dark:text-gray-300">Xplanatorium Herrenhausen, Hanover, Germany</P>
			</Card>

			<Card class="card-surface surface-padding-sm text-center hover:shadow-lg transition-shadow space-y-3">
				<div class="flex justify-center">
					<UsersGroupOutline size="xl" class="text-primary-600 dark:text-primary-400" />
				</div>
				<Heading tag="h3" class="heading-sub">Format</Heading>
				<P class="text-gray-700 dark:text-gray-300">In-person</P>
			</Card>
		</div>
	</div>
</section>

<!-- Conference Themes -->
<section class="py-12 px-4">
	<div class="mx-auto max-w-7xl surface-panel surface-padding space-y-12">
		<div class="space-y-6 text-center">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">About the Workshop</Heading>
			<P class="text-lg text-gray-700 dark:text-gray-300">
				This scoping workshop addresses the critical convergence of digital humanities (DH) and artificial intelligence (AI) within African studies. While this intersection offers transformative potential, it also poses pressing challenges in terms of equity, linguistic diversity and methodology.
			</P>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow space-y-3 text-left">
				<Heading tag="h3" class="heading-sub">Workshop Format</Heading>
				<P class="text-base text-gray-700 dark:text-gray-300">
					Three-day working meeting with international experts from Africa, Europe, and other regions. Prioritising intensive discussion over presentations through structured work streams.
				</P>
			</Card>
			
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow space-y-3 text-left">
				<Heading tag="h3" class="heading-sub">Key Outcomes</Heading>
				<P class="text-base text-gray-700 dark:text-gray-300">
					Co-authored position paper outlining findings and strategic recommendations to guide future research, policy and funding in this emerging field.
				</P>
			</Card>
		</div>

		<div class="space-y-6">
			<Heading tag="h3" class="text-center heading-section heading-lg heading-color-light">Core Focus Areas</Heading>
			<Timeline>
				<TimelineItem title="Methodological Integration" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Exploring how digital humanities methodologies can be effectively integrated with AI approaches in African studies research.
					</P>
				</TimelineItem>
				<TimelineItem title="Equitable Collaboration" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Fostering equitable North-South and South-South partnerships that center African voices and priorities in DH/AI development.
					</P>
				</TimelineItem>
				<TimelineItem title="Linguistic Diversity" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Addressing challenges and opportunities in natural language processing, computational linguistics, and AI for African languages.
					</P>
				</TimelineItem>
				<TimelineItem title="Ethical Frameworks" date="">
					<P class="text-base text-gray-700 dark:text-gray-300">
						Developing ethical guidelines for data collection, ownership, algorithmic justice, and sustainable advancement of DH/AI in African contexts.
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
			<span class="font-semibold text-primary-600 dark:text-primary-400">Volkswagen Foundation</span>
		</P>
	</div>
</section>
