<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';

	/**
	 * The modal shell shared by the footnote and citation popovers: it listens
	 * for clicks on the prose, lets the wrapper claim one, then opens a native
	 * <dialog>. Without JavaScript none of this runs and the links underneath
	 * stay ordinary fragment links. Styles live in reader.css, which only the
	 * reader route imports.
	 */
	interface Props {
		/** The prose container to delegate click events from. */
		container: HTMLElement | null;
		/**
		 * Called for unmodified primary clicks inside the prose. Return true
		 * after loading the content to show; false leaves the click alone so
		 * the link's default behaviour runs.
		 */
		claim: (_target: HTMLElement) => boolean;
		/** Whether there is content to render. */
		active: boolean;
		/** Drop the wrapper's content once the dialog has closed. */
		onclear: () => void;
		body: Snippet;
		footer: Snippet<[close: () => void]>;
	}

	let { container, claim, active, onclear, body, footer }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);

	function close() {
		dialogEl?.close();
		// Cleared here as well as in `onclose`: Escape dismisses the dialog
		// without routing through this function, so both paths need covering.
		onclear();
	}

	async function onProseClick(event: MouseEvent) {
		// Let modified clicks and middle-clicks behave like ordinary link clicks.
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const target = event.target as HTMLElement | null;
		if (!target || !claim(target)) return;

		event.preventDefault();

		// Render the contents before opening, so the UA has something focusable
		// to move to and the dialog never paints an empty frame.
		await tick();

		// showModal() handles what a hand-rolled dialog has to reimplement:
		// moves focus inside, traps it, makes the rest of the page inert,
		// closes on Escape, and restores focus to the trigger on close.
		dialogEl?.showModal();
	}

	/** Close when the click lands on the backdrop rather than the panel. */
	function onDialogClick(event: MouseEvent) {
		if (event.target === dialogEl) close();
	}

	$effect(() => {
		if (!container) return;
		container.addEventListener('click', onProseClick);
		return () => {
			container.removeEventListener('click', onProseClick);
		};
	});
</script>

<dialog
	bind:this={dialogEl}
	class="footnote-popover-panel"
	aria-label="Reference"
	onclick={onDialogClick}
	onclose={onclear}
>
	{#if active}
		<div class="footnote-popover-panel__header">
			<p class="footnote-popover-panel__title">Reference</p>
			<button
				type="button"
				class="footnote-popover-panel__close"
				aria-label="Close reference"
				onclick={close}
			>
				<CloseOutline class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>
		{@render body()}
		{@render footer(close)}
	{/if}
</dialog>
