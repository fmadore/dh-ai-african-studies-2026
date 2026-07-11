<script lang="ts">
	import { mediaCredit } from '$lib/data/photos';

	interface Props {
		/** e.g. "Filmed by" or "Photography by" */
		prefix: string;
	}

	let { prefix }: Props = $props();
</script>

<p class="text-label animate-hero-subtitle">
	{prefix}
	<a href={mediaCredit.url} target="_blank" rel="noopener noreferrer" class="link-secondary">
		{mediaCredit.name}
	</a>
</p>
