import type { ReaderFontFamily, ReaderFontSize } from '$lib/reader/types';

const STORAGE_KEY = 'dh2026:reader-prefs';

const VALID_FAMILIES: ReadonlyArray<ReaderFontFamily> = ['sans', 'serif', 'accessible'];
const VALID_SIZES: ReadonlyArray<ReaderFontSize> = [90, 100, 115, 130];

/**
 * Applies the stored preferences to <html> before the first paint.
 *
 * Without this the reader renders at the default sans/100%, then reflows to
 * the saved preference once the component mounts — a visible jump on a
 * long document. Rendered inline in the reader's <svelte:head>, so it costs
 * the rest of the site nothing.
 *
 * Kept in sync with the selectors in reader.css and the `$effect` in
 * ReaderShell. The valid-value lists are serialised from the constants above
 * so the script cannot drift from them.
 */
export const readerPrefsBootScript = `<script>(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
	STORAGE_KEY
)})||"{}"),e=document.documentElement;if(${JSON.stringify(
	VALID_FAMILIES
)}.indexOf(p.fontFamily)>-1)e.setAttribute("data-reader-font",p.fontFamily);if(${JSON.stringify(
	VALID_SIZES
)}.indexOf(p.fontSize)>-1)e.setAttribute("data-reader-size",p.fontSize);}catch(_){}})()</script>`;

const DEFAULTS = {
	fontFamily: 'sans' as ReaderFontFamily,
	fontSize: 100 as ReaderFontSize
};

/**
 * Module-level reactive preferences singleton for the position paper reader.
 *
 * Consumers import `readerPrefs`, call `.hydrate()` once on mount, then
 * assign `.fontFamily` / `.fontSize` directly; the setters persist, so no
 * caller has to remember to. Reads stay plain property access, so they work
 * as `$derived` dependencies in components.
 */
class ReaderPreferences {
	#fontFamily = $state<ReaderFontFamily>(DEFAULTS.fontFamily);
	#fontSize = $state<ReaderFontSize>(DEFAULTS.fontSize);
	#hydrated = false;

	get fontFamily(): ReaderFontFamily {
		return this.#fontFamily;
	}

	set fontFamily(value: ReaderFontFamily) {
		this.#fontFamily = value;
		this.persist();
	}

	get fontSize(): ReaderFontSize {
		return this.#fontSize;
	}

	set fontSize(value: ReaderFontSize) {
		this.#fontSize = value;
		this.persist();
	}

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
				this.#fontFamily = parsed.fontFamily as ReaderFontFamily;
			}
			if (VALID_SIZES.includes(parsed.fontSize as ReaderFontSize)) {
				this.#fontSize = parsed.fontSize as ReaderFontSize;
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
