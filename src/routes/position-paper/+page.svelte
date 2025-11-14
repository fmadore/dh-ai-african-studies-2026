<script lang="ts">
	import { Card, Heading, P, Timeline, TimelineItem, Hr } from 'flowbite-svelte';
	import { FileDocOutline, UsersGroupOutline, LightbulbOutline, BookOpenOutline } from 'flowbite-svelte-icons';
	import { createSeoMeta } from '$lib/utils/seo';

	const seo = createSeoMeta({
		path: '/position-paper',
		title: 'Position Paper Blueprint for DH & AI in African Studies',
		description:
			'The position paper synthesises workshop insights into a strategic roadmap for Digital Humanities and AI in African studies, foregrounding equitable collaboration, decolonial ethics, and actionable recommendations for stakeholders.',
		type: 'article'
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
</svelte:head>

<!-- Hero Section -->
<section class="bg-page py-16 px-4">
	<div class="content-width surface-panel surface-padding text-center stack-md">
		<div class="flex justify-center">
			<FileDocOutline size="xl" class="text-primary-600 dark:text-primary-400 w-16 h-16" />
		</div>
		<div class="stack-sm">
			<Heading tag="h1" class="heading-display heading-xl heading-color-light">
				Position Paper
			</Heading>
			<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto">
				A foundational blueprint for Digital Humanities and AI in African Studies, aligning ethical and equitable practices with a transformative agenda shaped by the workshop community.
			</P>
		</div>
	</div>
</section>

<!-- Overview -->
<section class="bg-page-soft py-16 px-4">
	<div class="content-width surface-panel surface-padding stack-lg">
		<div class="stack-md">
			<Heading tag="h2" class="heading-section heading-lg heading-color-light">A Strategic Blueprint</Heading>
			<P class="body-text text-lg leading-relaxed">
				The position paper will serve as a foundational blueprint for the emerging field of DH and AI in African studies, providing a strategic roadmap based on ethical and equitable practices. Synthesising the concrete outcomes of our workshop, this document will translate collective insights into an actionable vision through daily synthesis sessions and the efforts of a diverse drafting committee.
			</P>
		</div>

		<Hr />

		<div class="stack-md">
			<Heading tag="h3" class="heading-section heading-color-light">Collaborative Development Process</Heading>
			<P class="body-text text-base leading-relaxed">
				In the three months following the workshop, the drafting committee will transform the discussions into a polished document that captures prioritised methodologies, frameworks for equitable collaboration and ethical principles. This process will include:
			</P>
			<ul class="body-text list-disc list-inside stack-sm ml-4">
				<li>Collaborative drafting by a diverse committee</li>
				<li>Expert review by all workshop participants</li>
				<li>Professional editing to ensure accessibility</li>
				<li>Targeted communication for science policy and research funding decision-makers</li>
			</ul>
		</div>

		<div class="stack-md">
			<Heading tag="h3" class="heading-section heading-color-light">Transformative Vision</Heading>
			<P class="body-text text-base leading-relaxed">
				The paper will articulate a transformative vision informed by decolonial thinking and African knowledge systems, mapping critical intersections of methodological innovation, equitable partnerships and culturally responsive ethics. It will outline strategies for effective dissemination and vulgarisation of DH across Africa, addressing barriers to access and proposing frameworks for knowledge translation that respect local contexts.
			</P>
		</div>
	</div>
</section>

<!-- Core Themes -->
<section class="bg-page-strong py-16 px-4">
	<div class="content-width surface-panel surface-padding stack-lg">
		<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">Core Themes</Heading>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm">
				<div class="flex items-start gap-3">
					<LightbulbOutline size="lg" class="text-primary-600 dark:text-primary-400 shrink-0 mt-1" />
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub">Decolonial Thinking</Heading>
						<P class="body-text text-base">
							Articulating a vision informed by decolonial thinking and African knowledge systems, mapping critical intersections of methodological innovation and culturally responsive ethics.
						</P>
					</div>
				</div>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm">
				<div class="flex items-start gap-3">
					<BookOpenOutline size="lg" class="text-primary-600 dark:text-primary-400 shrink-0 mt-1" />
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub">Knowledge Dissemination</Heading>
						<P class="body-text text-base">
							Outlining strategies for effective dissemination and vulgarisation of DH across Africa, addressing barriers to access and proposing frameworks for knowledge translation that respect local contexts.
						</P>
					</div>
				</div>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm">
				<div class="flex items-start gap-3">
					<UsersGroupOutline size="lg" class="text-primary-600 dark:text-primary-400 shrink-0 mt-1" />
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub">Equitable Partnerships</Heading>
						<P class="body-text text-base">
							Capturing prioritised methodologies and frameworks for equitable collaboration that center African voices and priorities in DH/AI development.
						</P>
					</div>
				</div>
			</Card>

			<Card class="card-surface surface-padding-sm hover:shadow-lg transition-shadow stack-sm">
				<div class="flex items-start gap-3">
					<FileDocOutline size="lg" class="text-primary-600 dark:text-primary-400 shrink-0 mt-1" />
					<div class="stack-sm">
						<Heading tag="h3" class="heading-sub">Ethical Principles</Heading>
						<P class="body-text text-base">
							Establishing ethical principles for data collection, ownership, algorithmic justice, and sustainable advancement of DH/AI in African contexts.
						</P>
					</div>
				</div>
			</Card>
		</div>
	</div>
</section>

<!-- Target Audiences & Recommendations -->
<section class="bg-page-soft py-16 px-4">
	<div class="content-width surface-panel surface-padding stack-lg">
		<div class="stack-md">
			<Heading tag="h2" class="text-center heading-section heading-lg heading-color-light">Actionable Recommendations for Stakeholders</Heading>
			<P class="body-text text-center text-lg max-w-3xl mx-auto">
				The document will provide actionable recommendations addressing critical needs for key stakeholders across the DH and AI ecosystem in African studies.
			</P>
		</div>

		<Timeline>
			<TimelineItem title="Research Funders" date="">
				<P class="body-text text-base">
					Sustainable funding models that support long-term DH/AI infrastructure development, capacity building, and equitable partnerships between African and international institutions.
				</P>
			</TimelineItem>

			<TimelineItem title="Academic Institutions" date="">
				<P class="body-text text-base">
					Decolonised curricula and innovative approaches to digital literacy that bridge academic and community divides, with institutional frameworks for ethical DH/AI research.
				</P>
			</TimelineItem>

			<TimelineItem title="Technology Developers" date="">
				<P class="body-text text-base">
					Ethical implementation of AI technologies, culturally responsive design principles, and collaborative development practices that center African perspectives and needs.
				</P>
			</TimelineItem>

			<TimelineItem title="Cultural Heritage Organisations" date="">
				<P class="body-text text-base">
					Best practices for digital preservation, data sovereignty, community engagement in digitisation projects, and ethical stewardship of cultural materials.
				</P>
			</TimelineItem>

			<TimelineItem title="Policy Makers" date="">
				<P class="body-text text-base">
					Policy frameworks supporting digital infrastructure development, data protection, intellectual property rights, and equitable access to DH/AI resources across Africa.
				</P>
			</TimelineItem>
		</Timeline>
	</div>
</section>

<!-- Impact & Purpose -->

<section class="py-16 px-4 bg-linear-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900">
	<div class="content-width surface-panel surface-padding text-center stack-md">
		<Heading tag="h2" class="heading-section heading-lg heading-color-light">A Catalyst for Change</Heading>
		<P class="body-text text-lg leading-relaxed max-w-3xl mx-auto">
			As both a workshop record and a catalyst for change, this position paper aims to shape new research directions while promoting a more accessible, equitable and ethical DH & AI landscape in African studies. It will serve as a foundational reference guiding research, policy and funding decisions to consolidate this emerging field.
		</P>
		<div class="pt-4">
			<P class="body-text-muted text-sm italic">
				The position paper will be published in the months following the workshop and made freely available to the global research community.
			</P>
		</div>
	</div>
</section>
