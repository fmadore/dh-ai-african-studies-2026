/**
 * Scroll-spy for in-page navigation: reports which of `targets` (in document
 * order) is the current section.
 *
 * An IntersectionObserver callback only reports targets whose state *changed*,
 * so a batch on its own cannot say what is on screen. The latest state of every
 * target is kept, and the topmost one inside the band wins. When none is inside
 * — a short heading has left the band and the next has not reached it — the
 * current section is the last target that starts above the band. Without that
 * fallback, scrolling up out of section B into the tail of A left B marked.
 */
export function observeActiveSection(
	targets: HTMLElement[],
	onChange: (id: string) => void,
	band: { top: number; bottom: number } = { top: 0.2, bottom: 0.7 }
): () => void {
	if (targets.length === 0) return () => {};
	const intersecting = new Set<Element>();

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) intersecting.add(entry.target);
				else intersecting.delete(entry.target);
			}
			const topmost = targets.find((target) => intersecting.has(target));
			if (topmost) {
				onChange(topmost.id);
				return;
			}
			const bandTop = window.innerHeight * band.top;
			let above: HTMLElement | undefined;
			for (const target of targets) {
				if (target.getBoundingClientRect().top < bandTop) above = target;
				else break;
			}
			if (above) onChange(above.id);
		},
		{
			rootMargin: `-${Math.round(band.top * 100)}% 0px -${Math.round(band.bottom * 100)}% 0px`,
			threshold: 0
		}
	);

	targets.forEach((target) => observer.observe(target));
	return () => observer.disconnect();
}
