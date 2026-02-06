/**
 * Shared image error handler for participant photos.
 * Hides the broken <img> and shows the next sibling (placeholder).
 */
export function handleImageError(event: Event) {
	const img = event.target as HTMLImageElement;
	img.style.display = 'none';
	const placeholder = img.nextElementSibling as HTMLElement;
	if (placeholder) {
		placeholder.style.display = 'flex';
	}
}
