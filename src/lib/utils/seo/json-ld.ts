import { workshopInfo } from '$lib/data/workshop-info';

import { DEFAULT_AUTHORS, SITE_BASE_URL, SITE_DESCRIPTION, SITE_NAME } from './constants';
import type {
	Author,
	CreateEventJsonLdOptions,
	CreateWebPageJsonLdOptions,
	JsonLdEvent,
	JsonLdPlace,
	JsonLdSchema,
	JsonLdWebPage,
	JsonLdWebSite
} from './types';
import { resolveAssetUrl } from './url';

/** Creates JSON-LD structured data for an Event. */
export function createEventJsonLd(options: CreateEventJsonLdOptions = {}): JsonLdEvent {
	const jsonLd: JsonLdEvent = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: options.name ?? 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: options.description ?? SITE_DESCRIPTION,
		url: options.url ?? SITE_BASE_URL,
		eventStatus: options.eventStatus ?? 'EventScheduled',
		eventAttendanceMode: options.eventAttendanceMode ?? 'OfflineEventAttendanceMode'
	};

	if (options.startDate) {
		jsonLd.startDate = options.startDate.includes('T')
			? options.startDate
			: `${options.startDate}T09:00:00+01:00`;
	}

	if (options.endDate) {
		jsonLd.endDate = options.endDate.includes('T')
			? options.endDate
			: `${options.endDate}T17:00:00+01:00`;
	}

	if (options.locationName) {
		const location: JsonLdPlace = {
			'@type': 'Place',
			name: options.locationName
		};

		if (options.locationCity || options.locationCountry) {
			location.address = {
				'@type': 'PostalAddress',
				streetAddress: options.locationAddress,
				addressLocality: options.locationCity,
				addressCountry: options.locationCountry,
				postalCode: options.locationPostalCode
			};
		} else if (options.locationAddress) {
			location.address = options.locationAddress;
		}

		jsonLd.location = location;
	}

	if (options.organizerName) {
		jsonLd.organizer = {
			'@type': 'Organization',
			name: options.organizerName,
			url: options.organizerUrl
		};
	}

	if (options.funderName) {
		jsonLd.funder = {
			'@type': 'Organization',
			name: options.funderName,
			url: options.funderUrl
		};
	}

	if (options.image) {
		jsonLd.image = resolveAssetUrl(options.image);
	}

	return jsonLd;
}

/** Creates the shared Event JSON-LD used only by event-specific pages. */
export function createWorkshopEventJsonLd(options: {
	description: string;
	url: string;
}): JsonLdEvent {
	return createEventJsonLd({
		name: 'Charting New Territory: Digital Humanities and AI in African Studies',
		description: options.description,
		startDate: workshopInfo.dates.startISO,
		endDate: workshopInfo.dates.endISO,
		locationName: workshopInfo.location.venue,
		locationAddress: workshopInfo.location.venue,
		locationCity: workshopInfo.location.city,
		locationCountry: workshopInfo.location.country,
		organizerName: workshopInfo.organizers.full,
		funderName: workshopInfo.funder.name,
		funderUrl: workshopInfo.funder.url,
		url: options.url
	});
}

/** Creates JSON-LD structured data for the site root. */
export function createWebSiteJsonLd(
	options: {
		name?: string;
		description?: string;
		publisherName?: string;
		publisherUrl?: string;
	} = {}
): JsonLdWebSite {
	const jsonLd: JsonLdWebSite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: options.name ?? SITE_NAME,
		url: SITE_BASE_URL,
		description: options.description ?? SITE_DESCRIPTION
	};

	if (options.publisherName) {
		jsonLd.publisher = {
			'@type': 'Organization',
			name: options.publisherName,
			url: options.publisherUrl
		};
	}

	return jsonLd;
}

/** Creates JSON-LD structured data for an authored webpage. */
export function createWebPageJsonLd(options: CreateWebPageJsonLdOptions): JsonLdWebPage {
	const authors = options.authors ?? DEFAULT_AUTHORS;

	const jsonLd: JsonLdWebPage = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: options.name,
		url: options.url,
		description: options.description ?? SITE_DESCRIPTION,
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: SITE_BASE_URL
		}
	};

	if (authors.length === 1) {
		jsonLd.author = {
			'@type': 'Person',
			name: authors[0].name,
			url: authors[0].url
		};
	} else if (authors.length > 1) {
		jsonLd.author = authors.map((author: Author) => ({
			'@type': 'Person' as const,
			name: author.name,
			url: author.url
		}));
	}

	if (options.dateModified) {
		jsonLd.dateModified = options.dateModified;
	}

	return jsonLd;
}

/** Returns a JSON-LD script that is safe to render with Svelte {@html}. */
export function jsonLdScript(data: JsonLdSchema): string {
	const json = JSON.stringify(data, null, 0).replace(/</g, '\\u003C');
	return '<script type="application/ld+json">' + json + '</script>';
}
