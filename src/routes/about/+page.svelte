<script lang="ts">
	import { Heading, P, Card } from 'flowbite-svelte';
</script>

<section class="py-12 px-4 mx-auto max-w-7xl">
	<div class="max-w-4xl mx-auto">
		<Heading tag="h1" class="mb-8 text-center heading-display heading-xl heading-color-light">About the Workshop</Heading>
		
		<P class="mb-6 text-lg text-gray-600 dark:text-gray-400">
			This scoping workshop addresses the critical convergence of digital humanities (DH) and artificial intelligence (AI) within African studies. While this intersection offers transformative potential, it also poses pressing challenges in terms of equity, linguistic diversity and methodology.
		</P>

		<P class="mb-8 text-lg text-gray-600 dark:text-gray-400">
			This three-day working meeting will provide a dedicated space for international experts from Africa, Europe, and other regions to assess the current state of the field and collaboratively shape its future.
		</P>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
			<Card class="hover:shadow-lg transition-shadow border-primary-100 dark:border-primary-900">
				<Heading tag="h3" class="mb-3 text-xl text-primary-700 dark:text-primary-400">Objectives</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 [&>li::marker]:text-primary-500">
					<li>Assess the current state of DH/AI in African studies</li>
					<li>Explore methodological integration</li>
					<li>Foster equitable collaboration</li>
					<li>Develop ethical frameworks</li>
				</ul>
			</Card>

			<Card class="hover:shadow-lg transition-shadow border-secondary-100 dark:border-secondary-900">
				<Heading tag="h3" class="mb-3 text-xl text-secondary-700 dark:text-secondary-400">Expected Outcomes</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 [&>li::marker]:text-secondary-500">
					<li>Co-authored position paper</li>
					<li>Strategic recommendations</li>
					<li>Research network formation</li>
					<li>Future collaboration pathways</li>
				</ul>
			</Card>
		</div>

		<Heading tag="h2" class="mb-6 heading-section heading-lg heading-color-light">Funding</Heading>
		<P class="mb-4 text-gray-600 dark:text-gray-400">
			This scoping workshop is made possible by the generous support of the <strong class="text-primary-700 dark:text-primary-400">Volkswagen Foundation</strong>.
		</P>
	</div>
</section>
