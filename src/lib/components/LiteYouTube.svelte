<script lang="ts">
	/**
	 * Lightweight YouTube facade: renders only a thumbnail + play button until
	 * clicked, so pages with several videos don't eagerly load full embeds
	 * (better performance and no third-party requests before consent).
	 */
	interface Props {
		videoId: string;
		title: string;
	}

	let { videoId, title }: Props = $props();

	let activated = $state(false);

	let thumbnailUrl = $derived(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
</script>

<div class="aspect-video-embed overflow-hidden rounded-md">
	{#if activated}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1"
			{title}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		></iframe>
	{:else}
		<button
			type="button"
			class="lite-yt-poster"
			onclick={() => (activated = true)}
			aria-label="Play video: {title}"
		>
			<img src={thumbnailUrl} alt="" loading="lazy" />
			<span class="lite-yt-play" aria-hidden="true">
				<svg viewBox="0 0 68 48" width="68" height="48">
					<path
						d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
						fill="currentColor"
					/>
					<path d="M45 24 27 14v20" fill="#fff" />
				</svg>
			</span>
		</button>
	{/if}
</div>

<style>
	.lite-yt-poster {
		display: block;
		padding: 0;
		border: none;
		background: #000;
		cursor: pointer;
	}

	.lite-yt-poster img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.85;
		transition: opacity var(--transition-base);
	}

	.lite-yt-poster:hover img,
	.lite-yt-poster:focus-visible img {
		opacity: 1;
	}

	.lite-yt-play {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: rgba(23, 23, 23, 0.82);
		transition: color var(--transition-micro);
		pointer-events: none;
	}

	.lite-yt-poster:hover .lite-yt-play,
	.lite-yt-poster:focus-visible .lite-yt-play {
		color: #f03;
	}
</style>
