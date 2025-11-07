<script lang="ts">
	import { Heading, P, Card } from 'flowbite-svelte';
</script>

<section class="py-12 px-4 mx-auto max-w-screen-xl">
	<div class="max-w-4xl mx-auto">
		<Heading tag="h1" class="mb-8 text-center">About the Workshop</Heading>
		
		<P class="mb-6 text-lg text-gray-600 dark:text-gray-400">
			This scoping workshop addresses the critical convergence of digital humanities (DH) and artificial intelligence (AI) within African studies. While this intersection offers transformative potential, it also poses pressing challenges in terms of equity, linguistic diversity and methodology.
		</P>

		<P class="mb-8 text-lg text-gray-600 dark:text-gray-400">
			This three-day working meeting will provide a dedicated space for international experts from Africa, Europe, and other regions to assess the current state of the field and collaboratively shape its future.
		</P>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
			<Card>
				<Heading tag="h3" class="mb-3 text-xl">Objectives</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
					<li>Assess the current state of DH/AI in African studies</li>
					<li>Explore methodological integration</li>
					<li>Foster equitable collaboration</li>
					<li>Develop ethical frameworks</li>
				</ul>
			</Card>

			<Card>
				<Heading tag="h3" class="mb-3 text-xl">Expected Outcomes</Heading>
				<ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
					<li>Co-authored position paper</li>
					<li>Strategic recommendations</li>
					<li>Research network formation</li>
					<li>Future collaboration pathways</li>
				</ul>
			</Card>
		</div>

		<Heading tag="h2" class="mb-6">Funding</Heading>
		<P class="mb-4 text-gray-600 dark:text-gray-400">
			This scoping workshop is made possible by the generous support of the <strong>Volkswagen Foundation</strong>.
		</P>
	</div>
</section>
