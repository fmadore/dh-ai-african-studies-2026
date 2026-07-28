<script lang="ts">
	interface Props {
		/** The scrollable element whose progress we track — usually the prose container. */
		target: HTMLElement | null;
	}

	let { target }: Props = $props();

	let progress = $state(0);

	function update() {
		if (!target || typeof window === 'undefined') return;
		const rect = target.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const elementTop = rect.top;
		const elementHeight = target.offsetHeight;
		const scrollable = Math.max(elementHeight - viewportHeight, 1);
		const scrolled = -elementTop;
		const raw = scrolled / scrollable;
		progress = Math.min(1, Math.max(0, raw));
	}

	$effect(() => {
		// Re-run when `target` changes
		void target;
		if (typeof window === 'undefined') return;
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div
	class="reader-progress-bar"
	role="progressbar"
	aria-label="Reading progress"
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={Math.round(progress * 100)}
>
	<div class="reader-progress-bar__fill" style:--progress="{progress * 100}%"></div>
</div>
