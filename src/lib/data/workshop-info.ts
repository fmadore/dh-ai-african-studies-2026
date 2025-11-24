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
	}
} as const;

export type WorkshopInfo = typeof workshopInfo;
