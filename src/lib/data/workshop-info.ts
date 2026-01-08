/**
 * Workshop Information
 * 
 * Centralized data for workshop dates, location, and format.
 * Used across multiple pages (home, schedule, etc.)
 */

export const workshopInfo = {
	dates: {
		start: '18 February 2026',
		end: '20 February 2026',
		full: '18-20 February 2026',
		/** ISO 8601 format for structured data */
		startISO: '2026-02-18',
		/** ISO 8601 format for structured data */
		endISO: '2026-02-20',
		startDate: new Date('2026-02-18'),
		endDate: new Date('2026-02-20')
	},
	location: {
		venue: 'Xplanatorium Herrenhausen',
		city: 'Hanover',
		country: 'Germany',
		full: 'Xplanatorium Herrenhausen, Hanover, Germany',
		url: 'https://www.volkswagenstiftung.de/en/herrenhausen-palace'
	},
	/** Detailed venue information for practical logistics */
	venue: {
		name: 'Xplanatorium Herrenhausen',
		address: 'Herrenhäuser Straße 5',
		postalCode: '30419',
		city: 'Hanover',
		country: 'Germany',
		phone: '+49 (0) 511 763744-0',
		coordinates: {
			latitude: 52.3906,
			longitude: 9.6983
		},
		nearestStop: 'Herrenhäuser Gärten',
		mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2434.8!2d9.6961!3d52.3906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b074a5c5555555%3A0x1234567890abcdef!2sXplanatorium%20Herrenhausen!5e0!3m2!1sen!2sde!4v1234567890'
	},
	/** Accommodation for all participants */
	accommodation: {
		name: 'Grand Hotel Mussmann',
		address: 'Ernst August Platz 7',
		postalCode: '30159',
		city: 'Hannover',
		country: 'Germany',
		phone: '+49 (0) 511 36560',
		email: 'Grandhotel@Hannover.de',
		website: 'https://grandhotel.de/en/',
		nearestStop: 'Kröpcke',
		coordinates: {
			latitude: 52.3759,
			longitude: 9.7387
		},
		mapUrl: 'https://maps.app.goo.gl/Roa779ZbtmiKDJZW7',
		note: 'All participants will be accommodated at the Grand Hotel Mussmann. The hotel is located in the center of Hanover opposite the main train station. When you leave the station, turn half left.'
	},
	/** Public transport information */
	transport: {
		publicTransportUrl: 'https://www.uestra.de/en/',
		hotelToVenue: {
			walkToStation: '5 minutes walk from hotel to Kröpcke underground station',
			frequency: 'Trams run every 3 minutes',
			mapEmbedUrl:
				'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d19482.600950708205!2d9.69862456129812!3d52.38265629722143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x47b074b1d16f2749%3A0x9b6ccbfb1e72c4e0!2sGrand%20Hotel%20Mussmann%2C%20Ernst-August-Platz%207%2C%2030159%20Hannover!3m2!1d52.3755252!2d9.7407493!4m5!1s0x47b073fe60ea2ba3%3A0xc86581ecab5f5ae8!2sTagungszentrum%20Schloss%20Herrenhausen%2C%20Herrenh%C3%A4user%20Stra%C3%9Fe%2C%20Hanovre-Herrenhausen-St%C3%B6cken!3m2!1d52.3911552!2d9.6976876!5e0!3m2!1sfr!2sde!4v1767883987368!5m2!1sfr!2sde',
			lines: [
				{ line: '4', direction: 'Garbsen' },
				{ line: '5', direction: 'Stöcken' }
			],
			stopName: 'Herrenhäuser Gärten',
			returnLines: [
				{ line: '4', direction: 'Roderbruch' },
				{ line: '5', direction: 'Anderten' }
			],
			returnStop: 'Kröpcke',
			ticketRecommendation: 'Day-Ticket (AB Zone, 7.20 €) — provided to all guests'
		},
		airportToHotel: {
			trainLine: 'S5 S-Bahn (Hannover Airport Line)',
			frequency: 'Every 30 minutes',
			duration: 'Approximately 18 minutes',
			stationLocation: 'Terminal C (escalators and lifts to departures area)',
			mapEmbedUrl:
				'https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d38932.66159975979!2d9.671828608387502!3d52.41951845770472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e3!4m5!1s0x47b07217509056b1%3A0xe4434b844c73d0e5!2sHannover%20Airport%20(HAJ)%2C%20Flughafenstra%C3%9Fe%2C%20Langenhagen!3m2!1d52.4627115!2d9.6842376!4m5!1s0x47b074b1d16f2749%3A0x9b6ccbfb1e72c4e0!2sGrand%20Hotel%20Mussmann%2C%20Ernst-August-Platz%207%2C%2030159%20Hannover!3m2!1d52.3755252!2d9.7407493!5e0!3m2!1sfr!2sde!4v1767883288149!5m2!1sfr!2sde',
			ticketPrice: 'Single AB-Ticket (4.50 €) — to be reimbursed'
		}
	},
	duration: {
		days: 3,
		description: 'Three-day intensive workshop'
	},
	organizers: {
		names: ['Frédérick Madore', 'Vincent Hiribarren'],
		full: 'Frédérick Madore and Vincent Hiribarren'
	},
	funder: {
		name: 'Volkswagen Foundation',
		url: 'https://www.volkswagenstiftung.de/en'
	}
} as const;

export type WorkshopInfo = typeof workshopInfo;
