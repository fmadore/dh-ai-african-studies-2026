import type { ReaderFontFamily, ReaderFontSize } from '$lib/reader/types';

const STORAGE_KEY = 'dh2026:reader-prefs';

const VALID_FAMILIES: ReadonlyArray<ReaderFontFamily> = ['sans', 'serif', 'accessible'];
const VALID_SIZES: ReadonlyArray<ReaderFontSize> = [90, 100, 115, 130];

const DEFAULTS = {
	fontFamily: 'sans' as ReaderFontFamily,
	fontSize: 100 as ReaderFontSize
};

/**
 * Module-level reactive preferences singleton for the position paper reader.
 *
 * Svelte 5 disallows top-level `let x = $state(...)` in `.svelte.ts` modules,
 * but class fields with runes are fine. Consumers import `readerPrefs` and
 * call `.hydrate()` once on mount, then mutate `.fontFamily` / `.fontSize`
 * directly — persistence is triggered by a `$effect` in the consuming
 * component.
 */
class ReaderPreferences {
	fontFamily = $state<ReaderFontFamily>(DEFAULTS.fontFamily);
	fontSize = $state<ReaderFontSize>(DEFAULTS.fontSize);
	#hydrated = false;

	hydrate(): void {
		if (this.#hydrated || typeof window === 'undefined') return;
		this.#hydrated = true;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as Partial<{
				fontFamily: unknown;
				fontSize: unknown;
			}>;
			if (VALID_FAMILIES.includes(parsed.fontFamily as ReaderFontFamily)) {
				this.fontFamily = parsed.fontFamily as ReaderFontFamily;
			}
			if (VALID_SIZES.includes(parsed.fontSize as ReaderFontSize)) {
				this.fontSize = parsed.fontSize as ReaderFontSize;
			}
		} catch {
			// Corrupt storage — silently ignore and keep defaults.
		}
	}

	persist(): void {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ fontFamily: this.fontFamily, fontSize: this.fontSize })
			);
		} catch {
			// Storage full / disabled — non-fatal.
		}
	}

	reset(): void {
		this.fontFamily = DEFAULTS.fontFamily;
		this.fontSize = DEFAULTS.fontSize;
	}
}

export const readerPrefs = new ReaderPreferences();
