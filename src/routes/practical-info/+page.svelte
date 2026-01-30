<script lang="ts">
	import { Heading, P, Card } from 'flowbite-svelte';
	import {
		MapPinAltOutline,
		HomeOutline,
		TicketOutline,
		PhoneOutline,
		EnvelopeOutline,
		GlobeOutline,
		ClockOutline,
		ArrowRightOutline,
		FilePdfOutline
	} from 'flowbite-svelte-icons';
	import { createSeoMeta, createEventJsonLd, createWebPageJsonLd, serializeJsonLd } from '$lib/utils/seo';
	import { workshopInfo } from '$lib/data/workshop-info';
	import { resolveAssetPath } from '$lib/utils/paths';
	import { reveal } from '$lib/utils/reveal';

	const seo = createSeoMeta({
		title: 'Practical Information',
		description:
			'Travel and accommodation information for the Digital Humanities and AI in African Studies workshop in Hanover, Germany. Details on venue, hotel, and public transport.',
		path: '/practical-info',
		keywords: [
			'Travel Information',
			'Accommodation',
			'Hanover',
			'Germany',
			'Herrenhausen Palace',
			'Venue',
			'Public Transport',
			'Workshop Logistics'
		]
	});

	const eventJsonLd = createEventJsonLd({
		name: 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: seo.description,
		startDate: workshopInfo.dates.startISO,
		endDate: workshopInfo.dates.endISO,
		locationName: workshopInfo.location.venue,
		locationAddress: `${workshopInfo.venue.address}, ${workshopInfo.venue.postalCode} ${workshopInfo.venue.city}`,
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
		url: seo.canonical,
	});

	const { venue, accommodation, transport } = workshopInfo;
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
			Practical Information
		</Heading>
		<P class="text-lead mx-auto max-w-3xl animate-hero-subtitle">
			Everything you need to know about getting to and staying in Hanover for the workshop.
		</P>
	</div>
</section>

<!-- Venue Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal" use:reveal>
		<div class="stack-md">
			<div class="flex items-center gap-3">
				<MapPinAltOutline class="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
				<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline">
					Workshop Venue
				</Heading>
			</div>
			<P class="body-text max-w-3xl mt-4">
				The workshop will take place at the <strong>{venue.name}</strong>, a modern conference
				facility at Herrenhausen Palace. The venue is easily accessible by public transport.
			</P>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children" use:reveal>
			<!-- Venue Details Card -->
			<Card size="xl" class="w-full max-w-none card-surface surface-padding h-full glow-border">
				<div class="stack-md">
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						{venue.name}
					</Heading>
					<div class="stack-sm">
						<div class="flex items-start gap-3">
							<MapPinAltOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 mt-0.5 shrink-0" />
							<div>
								<p class="body-text font-medium">{venue.address}</p>
								<p class="body-text-muted">{venue.postalCode} {venue.city}, {venue.country}</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<PhoneOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 shrink-0" />
							<p class="body-text">Tel: {venue.phone}</p>
						</div>
						<div class="flex items-center gap-3">
							<TicketOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 shrink-0" />
							<p class="body-text">
								Underground/Tram station: <strong>{venue.nearestStop}</strong>
							</p>
						</div>
					</div>
					<a
						href={workshopInfo.location.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:underline font-medium"
					>
						<GlobeOutline class="w-4 h-4" />
						Visit venue website
						<ArrowRightOutline class="w-4 h-4" />
					</a>
				</div>
			</Card>

			<!-- Embedded Map -->
			<div class="rounded-xl overflow-hidden shadow-lg h-80 lg:h-auto min-h-80">
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2434.8561254666142!2d9.695107312452064!3d52.39115844564371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b073fe60ea2ba3%3A0xc86581ecab5f5ae8!2sTagungszentrum%20Schloss%20Herrenhausen!5e0!3m2!1sfr!2sde!4v1767882909463!5m2!1sfr!2sde"
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title="Map showing Xplanatorium Herrenhausen location"
					class="w-full h-full"
				></iframe>
			</div>
		</div>

		<!-- Venue Access PDF -->
		<Card size="xl" class="w-full max-w-none card-surface surface-padding glow-border">
			<div class="stack-md">
				<div class="flex items-center gap-3">
					<FilePdfOutline class="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						Detailed Directions (PDF)
					</Heading>
				</div>
				<P class="body-text">
					You can view or download the detailed directions map provided by the venue below.
				</P>
				<div class="h-150 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
					<iframe
						src={resolveAssetPath('/documents/Schloss_Anfahrt.pdf')}
						width="100%"
						height="100%"
						title="Detailed directions to Herrenhausen Palace"
						class="w-full h-full"
					>
					</iframe>
				</div>
				<div class="flex justify-end">
					<a
						href={resolveAssetPath('/documents/Schloss_Anfahrt.pdf')}
						download
						class="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:underline font-medium"
					>
						<FilePdfOutline class="w-4 h-4" />
						Download Map PDF
					</a>
				</div>
			</div>
		</Card>
	</div>
</section>

<!-- Accommodation Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-radial-glow-bottom"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal" use:reveal>
		<div class="stack-md">
			<div class="flex items-center gap-3">
				<HomeOutline class="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
				<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline">
					Accommodation
				</Heading>
			</div>
			<P class="body-text max-w-3xl mt-4">
				{accommodation.note}
			</P>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children" use:reveal>
			<!-- Hotel Details Card -->
			<Card size="xl" class="w-full max-w-none card-surface surface-padding h-full glow-border">
				<div class="stack-md">
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						{accommodation.name}
					</Heading>
					<div class="stack-sm">
						<div class="flex items-start gap-3">
							<MapPinAltOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 mt-0.5 shrink-0" />
							<div>
								<p class="body-text font-medium">{accommodation.address}</p>
								<p class="body-text-muted">
									{accommodation.postalCode} {accommodation.city}, {accommodation.country}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<PhoneOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 shrink-0" />
							<p class="body-text">Tel: {accommodation.phone}</p>
						</div>
						<div class="flex items-center gap-3">
							<EnvelopeOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 shrink-0" />
							<a
								href="mailto:{accommodation.email}"
								class="body-text text-secondary-600 dark:text-secondary-400 hover:underline"
							>
								{accommodation.email}
							</a>
						</div>
						<div class="flex items-center gap-3">
							<TicketOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400 shrink-0" />
							<p class="body-text">
								Nearest tram/underground station: <strong>{accommodation.nearestStop}</strong>
							</p>
						</div>
					</div>
					<a
						href={accommodation.website}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:underline font-medium"
					>
						<GlobeOutline class="w-4 h-4" />
						Visit hotel website
						<ArrowRightOutline class="w-4 h-4" />
					</a>
				</div>
			</Card>

			<!-- Hotel Map -->
			<div class="rounded-xl overflow-hidden shadow-lg h-80 lg:h-auto min-h-80">
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9742.871191413702!2d9.722316946151665!3d52.375536866117464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b074b1d16f2749%3A0x9b6ccbfb1e72c4e0!2sGrand%20Hotel%20Mussmann!5e0!3m2!1sfr!2sde!4v1767883070061!5m2!1sfr!2sde"
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title="Map showing Grand Hotel Mussmann location"
					class="w-full h-full"
				></iframe>
				<a
					href={accommodation.mapUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="block text-center py-2 text-sm text-secondary-600 dark:text-secondary-400 hover:underline bg-white dark:bg-gray-800"
				>
					Open in Google Maps
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Transportation Section -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
	<div class="bg-grid-mesh opacity-30"></div>
	<div class="content-width-wide surface-panel surface-padding stack-lg relative animate-section-reveal" use:reveal>
		<div class="stack-md">
			<div class="flex items-center gap-3">
				<TicketOutline class="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
				<Heading tag="h2" class="heading-section heading-lg heading-color-light accent-underline">
					Public Transport
				</Heading>
			</div>
			<P class="body-text max-w-3xl mt-4">
				Hanover has an excellent public transport system. Below you'll find directions for
				traveling between key locations.
			</P>
		</div>

		<!-- Airport to Hotel (Details + Map) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children" use:reveal>
			<Card size="xl" class="w-full max-w-none card-surface surface-padding h-full glow-border">
				<div class="stack-md">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center glow-teal"
						>
							<svg
								class="w-5 h-5 text-secondary-600 dark:text-secondary-400"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
								></path>
							</svg>
						</div>
						<ArrowRightOutline class="w-5 h-5 text-gray-400" />
						<div
							class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center glow-teal"
						>
							<HomeOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
						</div>
					</div>
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						Airport → Hotel
					</Heading>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="min-w-0">
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Train</p>
							<p class="body-text wrap-break-word">{transport.airportToHotel.trainLine}</p>
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency</p>
							<p class="body-text">{transport.airportToHotel.frequency}</p>
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
							<p class="body-text">{transport.airportToHotel.duration}</p>
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets</p>
							<p class="body-text wrap-break-word font-semibold">{transport.airportToHotel.ticketPrice}</p>
						</div>
						<div class="min-w-0 sm:col-span-2">
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Station Location</p>
							<p class="body-text wrap-break-word">{transport.airportToHotel.stationLocation}</p>
						</div>
					</div>
				</div>
			</Card>

			<div class="rounded-xl overflow-hidden shadow-lg h-80 lg:h-auto min-h-80">
				<iframe
					src={transport.airportToHotel.mapEmbedUrl}
					width="100%"
					height="100%"
					style="border:0;"
					allowfullscreen
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title="Public transport route from Hannover Airport (HAJ) to Grand Hotel Mussmann"
					class="w-full h-full"
				></iframe>
			</div>
		</div>

		<!-- Hotel ↔ Venue -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children" use:reveal>
			<!-- Hotel to Venue Card -->
			<Card size="xl" class="w-full max-w-none card-surface surface-padding h-full glow-border">
				<div class="stack-md">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
						>
							<HomeOutline class="w-5 h-5 text-primary-600 dark:text-primary-400" />
						</div>
						<ArrowRightOutline class="w-5 h-5 text-gray-400" />
						<div
							class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center glow-teal"
						>
							<MapPinAltOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
						</div>
					</div>
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						Hotel → Venue
					</Heading>
					<div class="stack-sm">
						<p class="body-text">
							<strong>Walk:</strong>
							{transport.hotelToVenue.walkToStation}
						</p>
						<p class="body-text">
							<strong>Take:</strong>
							{#each transport.hotelToVenue.lines as line, i}
								Line {line.line} (to {line.direction}){i < transport.hotelToVenue.lines.length - 1
									? ' or '
									: ''}
							{/each}
						</p>
						<p class="body-text">
							<strong>Get off at:</strong>
							{transport.hotelToVenue.stopName}
						</p>
						<div class="flex items-center gap-2 text-sm">
							<ClockOutline class="w-4 h-4 text-gray-500" />
							<span class="body-text-muted">{transport.hotelToVenue.frequency}</span>
						</div>
					</div>
				</div>
			</Card>

			<!-- Venue to Hotel Card -->
			<Card size="xl" class="w-full max-w-none card-surface surface-padding h-full glow-border">
				<div class="stack-md">
					<div class="flex items-center gap-3">
						<div
							class="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center glow-teal"
						>
							<MapPinAltOutline class="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
						</div>
						<ArrowRightOutline class="w-5 h-5 text-gray-400" />
						<div
							class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
						>
							<HomeOutline class="w-5 h-5 text-primary-600 dark:text-primary-400" />
						</div>
					</div>
					<Heading tag="h3" class="heading-sub heading-md heading-color-light">
						Venue → Hotel
					</Heading>
					<div class="stack-sm">
						<p class="body-text">
							<strong>Take:</strong>
							{#each transport.hotelToVenue.returnLines as line, i}
								Line {line.line} (to {line.direction}){i <
								transport.hotelToVenue.returnLines.length - 1
									? ' or '
									: ''}
							{/each}
						</p>
						<p class="body-text">
							<strong>Get off at:</strong>
							{transport.hotelToVenue.returnStop}
						</p>
						<div class="flex items-center gap-2 text-sm">
							<ClockOutline class="w-4 h-4 text-gray-500" />
							<span class="body-text-muted">{transport.hotelToVenue.frequency}</span>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Hotel ↔ Venue itinerary map -->
		<div class="rounded-xl overflow-hidden shadow-lg h-80 lg:h-104 min-h-80">
			<iframe
				src={transport.hotelToVenue.mapEmbedUrl}
				width="100%"
				height="100%"
				style="border:0;"
				allowfullscreen
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				title="Public transport route from Grand Hotel Mussmann to Xplanatorium Herrenhausen"
				class="w-full h-full"
			></iframe>
		</div>

		<!-- Ticket Information -->
		<Card size="xl" class="w-full max-w-none card-surface surface-padding-sm bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800 glow-border">
			<div class="flex flex-col sm:flex-row items-center gap-4">
				<div class="flex items-center gap-3 shrink-0">
					<TicketOutline class="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
					<Heading tag="h3" class="heading-sub text-base heading-color-light whitespace-nowrap">
						Ticket Information
					</Heading>
				</div>
				<div class="hidden sm:block w-px h-6 bg-secondary-200 dark:bg-secondary-700"></div>
				<div class="flex-1 text-center sm:text-left">
					<p class="body-text font-semibold">
						Day-Ticket (AB Zone) — provided to all guests at check-in
					</p>
				</div>
				<a
					href={transport.publicTransportUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:underline font-medium whitespace-nowrap"
				>
					<GlobeOutline class="w-4 h-4" />
					ÜSTRA Public Transport
					<ArrowRightOutline class="w-4 h-4" />
				</a>
			</div>
		</Card>
	</div>
</section>
