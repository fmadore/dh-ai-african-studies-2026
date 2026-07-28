/**
 * Write text to the clipboard, reporting whether it worked so callers can
 * decide what feedback to show.
 *
 * The old `document.execCommand('copy')` fallback is deliberately absent: the
 * async Clipboard API is available in every browser this site supports, and
 * the site is served over HTTPS (and localhost in development), which is the
 * only precondition it has.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error('Clipboard write failed', error);
		return false;
	}
}
