<script lang="ts">
	interface Props {
		/** The scrollable element whose progress we track — usually the prose container. */
		target: HTMLElement | null;
	}

	let { target }: Props = $props();

	let progress = $state(0);

	function measure() {
		if (!target) return;
		const { top } = target.getBoundingClientRect();
		const scrollable = Math.max(target.offsetHeight - window.innerHeight, 1);
		progress = Math.min(1, Math.max(0, -top / scrollable));
	}

	$effect(() => {
		// Re-run when `target` changes
		void target;
		if (typeof window === 'undefined') return;

		// Reading layout on every scroll event forces a synchronous reflow each
		// tick. Coalesce into one measurement per frame instead.
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				measure();
			});
		};

		measure();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule, { passive: true });
		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
		};
	});
</script>

<!--
	Decorative. It was previously a role="progressbar" whose aria-valuenow
	changed on every scroll tick, which some screen readers announce
	continuously; the position is already conveyed by the document itself.
-->
<div class="reader-progress-bar" aria-hidden="true">
	<div class="reader-progress-bar__fill" style:--progress="{progress * 100}%"></div>
</div>
