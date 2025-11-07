<script lang="ts">
	import { Button, Card, Heading, P, Timeline, TimelineItem } from 'flowbite-svelte';
	import { CalendarMonthOutline, MapPinAltOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
</script>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
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
<section class="py-12 px-4 mx-auto max-w-screen-xl">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<Card class="text-center hover:shadow-lg transition-shadow">
			<div class="flex justify-center mb-4">
				<CalendarMonthOutline size="xl" class="text-primary-600 dark:text-primary-400" />
			</div>
			<Heading tag="h3" class="mb-2">Date</Heading>
			<P>June 15-17, 2026</P>
		</Card>

		<Card class="text-center hover:shadow-lg transition-shadow">
			<div class="flex justify-center mb-4">
				<MapPinAltOutline size="xl" class="text-primary-600 dark:text-primary-400" />
			</div>
			<Heading tag="h3" class="mb-2">Location</Heading>
			<P>To be announced</P>
		</Card>

		<Card class="text-center hover:shadow-lg transition-shadow">
			<div class="flex justify-center mb-4">
				<UsersGroupOutline size="xl" class="text-primary-600 dark:text-primary-400" />
			</div>
			<Heading tag="h3" class="mb-2">Format</Heading>
			<P>Hybrid (In-person & Virtual)</P>
		</Card>
	</div>
</section>

<!-- Conference Themes -->
<section class="py-12 px-4 mx-auto max-w-screen-xl bg-gray-50 dark:bg-gray-900">
	<div class="max-w-4xl mx-auto">
		<Heading tag="h2" class="mb-4 text-center">About the Workshop</Heading>
		<P class="mb-8 text-lg text-center text-gray-600 dark:text-gray-400">
			This scoping workshop addresses the critical convergence of digital humanities (DH) and artificial intelligence (AI) within African studies. While this intersection offers transformative potential, it also poses pressing challenges in terms of equity, linguistic diversity and methodology.
		</P>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
			<Card class="hover:shadow-lg transition-shadow">
				<Heading tag="h3" class="mb-3 text-xl">Workshop Format</Heading>
				<P class="text-base">
					Three-day working meeting with international experts from Africa, Europe, and other regions. Prioritising intensive discussion over presentations through structured work streams.
				</P>
			</Card>
			
			<Card class="hover:shadow-lg transition-shadow">
				<Heading tag="h3" class="mb-3 text-xl">Key Outcomes</Heading>
				<P class="text-base">
					Co-authored position paper outlining findings and strategic recommendations to guide future research, policy and funding in this emerging field.
				</P>
			</Card>
		</div>

		<Heading tag="h3" class="mb-6 text-center">Core Focus Areas</Heading>
		<Timeline>
			<TimelineItem title="Methodological Integration" date="">
				<P class="text-base">
					Exploring how digital humanities methodologies can be effectively integrated with AI approaches in African studies research.
				</P>
			</TimelineItem>
			<TimelineItem title="Equitable Collaboration" date="">
				<P class="text-base">
					Fostering equitable North-South and South-South partnerships that center African voices and priorities in DH/AI development.
				</P>
			</TimelineItem>
			<TimelineItem title="Linguistic Diversity" date="">
				<P class="text-base">
					Addressing challenges and opportunities in natural language processing, computational linguistics, and AI for African languages.
				</P>
			</TimelineItem>
			<TimelineItem title="Ethical Frameworks" date="">
				<P class="text-base">
					Developing ethical guidelines for data collection, ownership, algorithmic justice, and sustainable advancement of DH/AI in African contexts.
				</P>
			</TimelineItem>
		</Timeline>
	</div>
</section>

<!-- Call to Action -->
<section class="py-12 px-4 mx-auto max-w-screen-xl text-center">
	<Heading tag="h2" class="mb-4">Join the Conversation</Heading>
	<P class="mb-8 text-lg max-w-3xl mx-auto">
		This working meeting brings together international experts to collaboratively shape the future of digital humanities and AI in African studies. Register to participate in this important dialogue.
	</P>
	<div class="flex flex-col sm:flex-row justify-center gap-4">
		<Button href="/register" color="primary" size="lg">Register for the Workshop</Button>
		<Button href="/about" color="secondary" outline size="lg">More Information</Button>
		<Button href="/contact" color="secondary" outline size="lg">Contact Organizers</Button>
	</div>
</section>

<!-- Funding Acknowledgment -->
<section class="py-8 px-4 mx-auto max-w-screen-xl text-center bg-gray-100 dark:bg-gray-800">
	<P class="text-sm text-gray-600 dark:text-gray-400">
		This scoping workshop is made possible by the generous support of the
		<span class="font-semibold">Volkswagen Foundation</span>
	</P>
</section>
