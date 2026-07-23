/**
 * Svelte action: moves the node to document.body so it escapes
 * overflow:hidden ancestors and stacking contexts (modals, lightboxes).
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
