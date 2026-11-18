/**
 * Fullscreen for the concept graph.
 *
 * iPhone Safari has no Fullscreen API for anything but video, so the button
 * used to do nothing there. Where the API is missing or refuses, the stage is
 * instead fixed over the viewport ("expanded") — same layout, no browser
 * chrome hidden. Construct during component initialisation: the two effects
 * belong to the component that creates this.
 */
export class GraphFullscreen {
	mode = $state<'native' | 'expanded' | null>(null);
	readonly active = $derived(this.mode !== null);
	readonly expanded = $derived(this.mode === 'expanded');

	#getElement: () => HTMLElement | undefined;

	constructor(getElement: () => HTMLElement | undefined) {
		this.#getElement = getElement;

		$effect(() => {
			const onFullscreenChange = () => {
				if (document.fullscreenElement === this.#getElement()) this.mode = 'native';
				else if (this.mode === 'native') this.mode = null;
			};
			document.addEventListener('fullscreenchange', onFullscreenChange);
			return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
		});

		// The page behind an expanded stage must not scroll, and <main>'s z-index
		// would otherwise keep the sticky header painted over it (see the styles
		// in ConceptGraph.svelte).
		$effect(() => {
			if (!this.expanded) return;
			const root = document.documentElement;
			root.classList.add('concept-graph-expanded');
			return () => root.classList.remove('concept-graph-expanded');
		});
	}

	toggle() {
		const element = this.#getElement();
		if (this.mode === 'native') {
			document.exitFullscreen().catch(() => {});
		} else if (this.mode === 'expanded') {
			this.mode = null;
		} else if (element?.requestFullscreen && document.fullscreenEnabled) {
			// `mode` itself is kept in sync by the fullscreenchange listener
			element.requestFullscreen().catch(() => (this.mode = 'expanded'));
		} else {
			this.mode = 'expanded';
		}
	}

	/** Leave the expanded stage; the browser exits native fullscreen itself. */
	exitExpanded(): boolean {
		if (this.mode !== 'expanded') return false;
		this.mode = null;
		return true;
	}
}
