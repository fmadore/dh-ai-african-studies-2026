import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { participants } from '#lib/data/participants';
import { paperPublicationDate, positionPaperMeta } from '#lib/data/position-paper-meta';
import { workshopInfo } from '#lib/data/workshop-info';
import { interviews } from '#lib/data/interviews';
import { interviewPosterPath, interviewPosters } from '#lib/server/interview-posters';
import { GET as sitemap } from '../../src/routes/sitemap.xml/+server';

/** Every prerendered page route, as a URL path ("" for the root). */
function pageRoutes(directory = 'src/routes'): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return pageRoutes(path);
		if (entry.name !== '+page.svelte') return [];
		const route = relative('src/routes', directory).split(sep).join('/');
		return [route ? `/${route}` : ''];
	});
}

describe('sitemap', () => {
	it('lists every canonical page route and nothing else', async () => {
		const response = await sitemap({} as Parameters<typeof sitemap>[0]);
		const xml = await response.text();
		const listed = [
			...xml.matchAll(/<loc>https:\/\/[^/]+\/dh-ai-african-studies-2026(.*?)<\/loc>/g)
		]
			.map(([, path]) => (path === '/' ? '' : path))
			.sort();
		// The embed view is noindex by design.
		const expected = pageRoutes()
			.filter((route) => route !== '/concepts/embed')
			.sort();

		expect(listed).toEqual(expected);
	});

	it('gives lastmod only to pages with a real content date', async () => {
		const response = await sitemap({} as Parameters<typeof sitemap>[0]);
		const xml = await response.text();
		const dated = [
			...xml.matchAll(/<loc>[^<]*\/dh-ai-african-studies-2026([^<]*)<\/loc>\s*<lastmod>([^<]*)</g)
		].map(([, path, lastmod]) => [path, lastmod]);

		expect(dated).toEqual([
			['/position-paper', paperPublicationDate],
			['/position-paper/read', paperPublicationDate]
		]);
		expect(xml.match(/<lastmod>/g)).toHaveLength(2);
	});
});

describe('routes', () => {
	// The 404.html fallback switches off adapter-static's `strict` check for
	// routes that are not prerendered, and GitHub Pages cannot serve them.
	it('never opt out of prerendering', () => {
		const sources = (directory: string): string[] =>
			readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
				const path = join(directory, entry.name);
				if (entry.isDirectory()) return sources(path);
				return /^\+(page|layout|server)(\.server)?\.ts$/.test(entry.name) ? [path] : [];
			});
		const optedOut = sources('src/routes').filter((path) =>
			/export const (prerender\s*=\s*(false|'auto')|ssr\s*=\s*false)/.test(
				readFileSync(path, 'utf8')
			)
		);

		expect(readFileSync('src/routes/+layout.ts', 'utf8')).toMatch(/export const prerender = true/);
		expect(optedOut).toEqual([]);
	});
});

describe('workshop info', () => {
	it('prints the date range with an en dash', () => {
		expect(workshopInfo.dates.full).toBe('18–20 February 2026');
	});
});

describe('participant records', () => {
	it('have unique names', () => {
		const names = participants.map((participant) => participant.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('point at portraits that exist in static/', () => {
		const missing = participants
			.filter((participant) => participant.photoUrl)
			.filter((participant) => !existsSync(join('static', participant.photoUrl!)))
			.map((participant) => participant.photoUrl);
		expect(missing).toEqual([]);
	});

	it('carry plausible coordinates and https websites', () => {
		for (const { name, affiliationCoordinates: at, website } of participants) {
			if (at) {
				expect(Math.abs(at.latitude), name).toBeLessThanOrEqual(90);
				expect(Math.abs(at.longitude), name).toBeLessThanOrEqual(180);
			}
			if (website) expect(website, name).toMatch(/^https:\/\//);
		}
	});

	it('include every position-paper author and interviewee', () => {
		const names = new Set(participants.map((participant) => participant.name));
		const people = [
			...positionPaperMeta.authors.map((author) => author.name),
			...interviews.map((interview) => interview.participantName)
		];
		expect(people.filter((name) => !names.has(name))).toEqual([]);
	});
});

describe('interview posters', () => {
	it('are served locally only when the file exists', () => {
		const posters = interviewPosters([...interviews.map((i) => i.youtubeId), 'not-a-video']);

		expect(posters['not-a-video']).toBeUndefined();
		for (const path of Object.values(posters)) expect(existsSync(join('static', path))).toBe(true);
	});

	it('include the homepage feature, so the front page never calls YouTube', () => {
		expect(interviewPosterPath(interviews[0].youtubeId)).toBeDefined();
	});
});
