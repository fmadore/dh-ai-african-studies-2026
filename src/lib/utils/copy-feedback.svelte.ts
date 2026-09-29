import { copyToClipboard } from '$lib/utils/clipboard';

/**
 * Copy text and show "copied" for a moment. `copied` holds the id of what was
 * last copied, so one instance can serve a list of copy buttons. A reset that
 * fires after its component has gone only writes to this object, so there is
 * nothing to tear down.
 */
export class CopyFeedback {
	copied = $state<string | null>(null);
	#timer: ReturnType<typeof setTimeout> | undefined;
	#duration: number;

	constructor(duration = 2000) {
		this.#duration = duration;
	}

	async copy(text: string, id = 'default'): Promise<boolean> {
		const ok = await copyToClipboard(text);
		clearTimeout(this.#timer);
		this.copied = ok ? id : null;
		if (ok) this.#timer = setTimeout(() => (this.copied = null), this.#duration);
		return ok;
	}
}
