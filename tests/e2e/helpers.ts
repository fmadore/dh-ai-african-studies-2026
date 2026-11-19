import { expect, type Locator } from '@playwright/test';

/** The same origin-relative URL in root previews and GitHub Pages builds. */
export function sitePath(path = '/'): string {
	const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Click a prerendered control until its hydrated handler has responded.
 *
 * The prerendered markup is visible and clickable before Svelte attaches its
 * handlers, and a click that lands first does nothing. The app exposes no
 * global hydration marker, so this retries against the state the click should
 * produce instead of guessing with `networkidle`. `isDone` is checked before
 * every click, so a click that took effect late is never undone by a second
 * one on a toggle.
 */
export async function clickUntil(
	target: Locator,
	isDone: () => Promise<boolean>,
	{ timeout = 15_000 } = {}
): Promise<void> {
	await expect(async () => {
		if (!(await isDone())) await target.click({ timeout: 2_000 });
		await expect.poll(isDone, { timeout: 2_000 }).toBe(true);
	}).toPass({ timeout });
}

/**
 * Resolve once the element's size (and `attribute`, if given) has held one
 * value for `frames` consecutive animation frames. ResizeObserver callbacks
 * and their zero-duration refits run inside the rendering step, so a value
 * that survives several frames has absorbed them. Counting frames rather than
 * milliseconds ties the wait to the rendering pipeline, not to machine speed.
 */
export async function waitForStableFrames(
	locator: Locator,
	attribute?: string,
	frames = 5
): Promise<void> {
	await locator.evaluate(
		(element, [name, needed]) =>
			new Promise<void>((resolve, reject) => {
				const read = () => {
					const { width, height } = element.getBoundingClientRect();
					return `${name ? element.getAttribute(name) : ''}|${width}x${height}`;
				};
				let last = read();
				let same = 0;
				let total = 0;
				const tick = () => {
					const now = read();
					same = now === last ? same + 1 : 0;
					last = now;
					if (same >= needed) return resolve();
					if (++total > 600) return reject(new Error(`still changing after 600 frames: ${now}`));
					requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			}),
		[attribute ?? null, frames] as const
	);
}
