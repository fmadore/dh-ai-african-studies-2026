import { afterEach, describe, expect, it, vi } from 'vitest';
import { CopyFeedback } from '$lib/utils/copy-feedback.svelte';

function stubClipboard(writeText: () => Promise<void>) {
	vi.stubGlobal('navigator', { clipboard: { writeText } });
}

describe('copy feedback', () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('marks what was copied, then clears it', async () => {
		vi.useFakeTimers();
		stubClipboard(() => Promise.resolve());
		const feedback = new CopyFeedback(1000);

		expect(await feedback.copy('text', 'bibtex')).toBe(true);
		expect(feedback.copied).toBe('bibtex');
		vi.advanceTimersByTime(999);
		expect(feedback.copied).toBe('bibtex');
		vi.advanceTimersByTime(1);
		expect(feedback.copied).toBeNull();
	});

	it('restarts the pause when another item is copied', async () => {
		vi.useFakeTimers();
		stubClipboard(() => Promise.resolve());
		const feedback = new CopyFeedback(1000);

		await feedback.copy('a', 'apa');
		vi.advanceTimersByTime(800);
		await feedback.copy('b', 'ris');
		vi.advanceTimersByTime(800);
		expect(feedback.copied).toBe('ris');
	});

	it('shows nothing when the clipboard refuses', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		stubClipboard(() => Promise.reject(new Error('denied')));
		const feedback = new CopyFeedback();

		expect(await feedback.copy('text')).toBe(false);
		expect(feedback.copied).toBeNull();
	});
});
