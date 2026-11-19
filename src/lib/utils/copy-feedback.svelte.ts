import { copyToClipboard } from '#lib/utils/clipboard';

/** What a polite live region should say after a copy succeeds or fails. */
export interface CopyAnnouncements {
	copied: string;
	failed: string;
}

/**
 * Copy text and show "copied" for a moment. `copied` holds the id of what was
 * last copied, so one instance can serve a list of copy buttons. A reset that
 * fires after its component has gone only writes to this object, so there is
 * nothing to tear down.
 *
 * The label swap is visual only. Pass `announcements` and render
 * `announcement` in a `role="status"` region so screen readers hear the
 * outcome too; it stays put after the label resets.
 */
export class CopyFeedback {
	copied = $state<string | null>(null);
	announcement = $state('');
	#timer: ReturnType<typeof setTimeout> | undefined;
	#duration: number;

	constructor(duration = 2000) {
		this.#duration = duration;
	}

	async copy(text: string, id = 'default', announcements?: CopyAnnouncements): Promise<boolean> {
		const ok = await copyToClipboard(text);
		clearTimeout(this.#timer);
		this.copied = ok ? id : null;
		if (announcements) this.announcement = ok ? announcements.copied : announcements.failed;
		if (ok) this.#timer = setTimeout(() => (this.copied = null), this.#duration);
		return ok;
	}
}
