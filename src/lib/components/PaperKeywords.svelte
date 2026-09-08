<script lang="ts">
	let { keywords }: { keywords: readonly string[] } = $props();
</script>

<dl class="paper-keywords">
	<dt>Keywords</dt>
	<dd>{keywords.join(', ')}</dd>
</dl>

<style>
	.paper-keywords {
		margin: var(--space-lg) 0 0;
		padding-block-start: var(--space-md);
		border-block-start: 1px solid var(--border-subtle);
		font-family: var(--font-family-body);
	}
	.paper-keywords dt {
		margin-block-end: var(--space-xs);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--tracking-wider);
		text-transform: uppercase;
		color: var(--text-primary);
	}
	.paper-keywords dd {
		margin: 0;
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--text-secondary);
		text-wrap: pretty;
	}
</style>
