import { resolveAppPath } from '$lib/utils/paths';

export interface NavLink {
	href: string;
	label: string;
	children?: { href: string; label: string }[];
}

export const homeHref = resolveAppPath('/');

/**
 * Six top-level items, not nine. Archive routes live under Outcomes so the
 * inline navigation remains usable on ordinary laptop widths.
 */
export const primaryNavigation: NavLink[] = [
	{ href: homeHref, label: 'Home' },
	{ href: resolveAppPath('/about'), label: 'About' },
	{ href: resolveAppPath('/participants'), label: 'Participants' },
	{ href: resolveAppPath('/schedule'), label: 'Schedule' },
	{ href: resolveAppPath('/position-paper'), label: 'Position Paper' },
	{
		href: resolveAppPath('/photos'),
		label: 'Outcomes',
		children: [
			{ href: resolveAppPath('/photos'), label: 'Photos' },
			{ href: resolveAppPath('/interviews'), label: 'Interviews' },
			{ href: resolveAppPath('/concepts'), label: 'Concept Map' },
			{ href: resolveAppPath('/references'), label: 'References' }
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
