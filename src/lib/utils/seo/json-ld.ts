import { workshopInfo } from '#lib/data/workshop-info';

import {
	DEFAULT_AUTHORS,
	DEFAULT_OG_IMAGE,
	SITE_BASE_URL,
	SITE_DESCRIPTION,
	SITE_NAME
} from './constants';
import type {
	Author,
	CreateEventJsonLdOptions,
	CreateVideoObjectJsonLdOptions,
	CreateWebPageJsonLdOptions,
	JsonLdEvent,
	JsonLdPerson,
	JsonLdPlace,
	JsonLdSchema,
	JsonLdVideoObject,
	JsonLdWebPage,
	JsonLdWebSite
} from './types';
import { resolveAssetUrl, resolveCanonicalUrl } from './url';

/** The whole site is written in English. */
const SITE_LANGUAGE = 'en';

function personNode(author: Author): JsonLdPerson {
	return { '@type': 'Person', name: author.name, url: author.url };
}

/** One Person stays a single node; several become an array. */
function personNodes(authors: Author[]): JsonLdPerson | JsonLdPerson[] | undefined {
	if (authors.length === 0) return undefined;
	return authors.length === 1 ? personNode(authors[0]) : authors.map(personNode);
}

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

	const organizer = personNodes(options.organizers ?? []);
	if (organizer) jsonLd.organizer = organizer;

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
		// No street address: the venue's name is not one, and a postal address
		// we cannot vouch for is worse than locality and country alone.
		locationName: workshopInfo.location.venue,
		locationCity: workshopInfo.location.city,
		locationCountry: workshopInfo.location.country,
		// Two people, not one Organization named "A and B". Profile URLs come
		// from DEFAULT_AUTHORS where the names match.
		organizers: workshopInfo.organizers.names.map(
			(name) => DEFAULT_AUTHORS.find((author) => author.name === name) ?? { name }
		),
		funderName: workshopInfo.funder.name,
		funderUrl: workshopInfo.funder.url,
		image: DEFAULT_OG_IMAGE,
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
		// The home page's own canonical (with the trailing slash), so the
		// WebSite node and the page that carries it name the same URL.
		url: resolveCanonicalUrl('/'),
		description: options.description ?? SITE_DESCRIPTION,
		inLanguage: SITE_LANGUAGE
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
	const jsonLd: JsonLdWebPage = {
		'@context': 'https://schema.org',
		'@type': options.type ?? 'WebPage',
		name: options.name,
		url: options.url,
		description: options.description ?? SITE_DESCRIPTION,
		inLanguage: SITE_LANGUAGE,
		isPartOf: {
			'@type': 'WebSite',
			name: SITE_NAME,
			url: resolveCanonicalUrl('/')
		}
	};

	const author = personNodes(options.authors ?? DEFAULT_AUTHORS);
	if (author) jsonLd.author = author;

	if (options.dateModified) {
		jsonLd.dateModified = options.dateModified;
	}

	return jsonLd;
}

/** An ImageGallery (a CollectionPage subtype) for the photo archive. */
export function createImageGalleryJsonLd(
	options: Omit<CreateWebPageJsonLdOptions, 'type'>
): JsonLdWebPage {
	return createWebPageJsonLd({ ...options, type: 'ImageGallery' });
}

/**
 * VideoObject for a YouTube-hosted video. `uploadDate` is emitted only when
 * the caller knows it: Google requires it for video rich results, but an
 * invented date is worse than a missing one.
 */
export function createVideoObjectJsonLd(
	options: CreateVideoObjectJsonLdOptions
): JsonLdVideoObject {
	const jsonLd: JsonLdVideoObject = {
		'@context': 'https://schema.org',
		'@type': 'VideoObject',
		name: options.name,
		description: options.description,
		thumbnailUrl: resolveAssetUrl(
			options.thumbnail ?? `https://i.ytimg.com/vi/${options.youtubeId}/hqdefault.jpg`
		),
		// The same privacy-enhanced host the page's player loads.
		embedUrl: `https://www.youtube-nocookie.com/embed/${options.youtubeId}`,
		url: `https://www.youtube.com/watch?v=${options.youtubeId}`,
		inLanguage: SITE_LANGUAGE
	};

	if (options.uploadDate) jsonLd.uploadDate = options.uploadDate;

	return jsonLd;
}

/** Returns a JSON-LD script that is safe to render with Svelte {@html}. */
export function jsonLdScript(data: JsonLdSchema): string {
	const json = JSON.stringify(data, null, 0).replace(/</g, '\\u003C');
	return '<script type="application/ld+json">' + json + '</script>';
}
