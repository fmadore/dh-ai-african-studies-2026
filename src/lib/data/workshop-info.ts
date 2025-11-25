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
