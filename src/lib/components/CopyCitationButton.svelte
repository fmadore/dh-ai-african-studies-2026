<script lang="ts">
	import { CopyFeedback } from '#lib/utils/copy-feedback.svelte';

	/**
	 * A text-style "Copy citation" button that also tells assistive tech
	 * whether the copy worked. Call sites keep their own class names (and any
	 * layout tweaks) through `class`; the shared look lives here.
	 */
	interface Props {
		/** The citation to put on the clipboard. */
		text: string;
		class?: string;
	}

	let { text, class: className = '' }: Props = $props();

	const feedback = new CopyFeedback();
</script>

<button
	type="button"
	class="copy-citation {className}"
	onclick={() =>
		feedback.copy(text, 'default', {
			copied: 'Citation copied to clipboard',
			failed: 'Could not copy the citation'
		})}
>
	{feedback.copied ? 'Citation copied' : 'Copy citation'}
</button>
<span class="sr-only" role="status" aria-live="polite">{feedback.announcement}</span>

<style>
	.copy-citation {
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--text-link);
		background: transparent;
		border: none;
		cursor: pointer;
		padding-inline: 0;
		transition: color var(--transition-micro);
	}

	.copy-citation:hover {
		color: var(--text-link-hover);
	}
</style>
