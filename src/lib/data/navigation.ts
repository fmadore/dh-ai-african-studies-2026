import { resolveAppPath } from '#lib/utils/paths';

export interface NavLink {
	href: string;
	label: string;
	children?: { href: string; label: string }[];
}

export interface FooterLink {
	href: string;
	label: string;
	external?: boolean;
}

export interface FooterColumn {
	title: string;
	links: FooterLink[];
}

export const homeHref = resolveAppPath('/');

/**
 * Every internal route the header or footer links to, declared once. Labels
 * are the header's; the footer overrides a label only where it already used
 * sentence case (see `footerNavigation`).
 */
export const siteRoutes = {
	home: { href: homeHref, label: 'Home' },
	about: { href: resolveAppPath('/about'), label: 'About' },
	participants: { href: resolveAppPath('/participants'), label: 'Participants' },
	schedule: { href: resolveAppPath('/schedule'), label: 'Schedule' },
	positionPaper: { href: resolveAppPath('/position-paper'), label: 'Position Paper' },
	publications: { href: resolveAppPath('/publications'), label: 'Publications & reports' },
	photos: { href: resolveAppPath('/photos'), label: 'Photos' },
	interviews: { href: resolveAppPath('/interviews'), label: 'Interviews' },
	concepts: { href: resolveAppPath('/concepts'), label: 'Concept Map' },
	references: { href: resolveAppPath('/references'), label: 'References' }
} as const satisfies Record<string, { href: string; label: string }>;

const route = siteRoutes;

/**
 * Six top-level items, not nine. Archive routes live under Outcomes so the
 * inline navigation remains usable on ordinary laptop widths.
 */
export const primaryNavigation: NavLink[] = [
	route.home,
	route.about,
	route.participants,
	route.schedule,
	route.positionPaper,
	{
		href: route.photos.href,
		label: 'Outcomes',
		children: [route.publications, route.photos, route.interviews, route.concepts, route.references]
	}
];

/**
 * For a research archive the footer is prime real estate, not a colophon. It
 * groups the same routes differently from the header and keeps its own
 * sentence-case labels for two of them.
 */
export const footerNavigation: FooterColumn[] = [
	{
		title: 'Workshop',
		links: [route.about, route.schedule, route.participants]
	},
	{
		title: 'Outcomes',
		links: [
			{ ...route.positionPaper, label: 'Position paper' },
			route.publications,
			route.photos,
			route.interviews
		]
	},
	{
		title: 'Resources',
		links: [
			route.references,
			{ ...route.concepts, label: 'Concept map' },
			{
				href: 'https://github.com/fmadore/dh-ai-african-studies-2026',
				label: 'Source code',
				external: true
			}
		]
	}
];

function stripTrailingSlash(path: string): string {
	return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/** Match nested routes and tolerate GitHub Pages' trailing slashes. */
export function isNavigationLinkActive(href: string, current: string): boolean {
	const target = stripTrailingSlash(href);
	const path = stripTrailingSlash(current);
	if (target === stripTrailingSlash(homeHref)) return path === target;
	return path === target || path.startsWith(`${target}/`);
}

export function isNavigationGroupActive(link: NavLink, current: string): boolean {
	return link.children
		? link.children.some((child) => isNavigationLinkActive(child.href, current))
		: isNavigationLinkActive(link.href, current);
}
