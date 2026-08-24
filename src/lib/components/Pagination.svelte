<script lang="ts">
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { buildPageItems } from '$lib/utils/references';

	interface Props {
		currentPage: number;
		totalPages: number;
		label?: string;
		onnavigate: (_page: number) => void;
	}

	let { currentPage, totalPages, label = 'Pagination', onnavigate }: Props = $props();

	let pageItems = $derived(buildPageItems(currentPage, totalPages));
</script>

<nav class="pagination" aria-label={label}>
	<button
		type="button"
		class="pagination__nav"
		disabled={currentPage === 1}
		aria-label="Previous page"
		onclick={() => onnavigate(currentPage - 1)}
	>
		<ChevronLeftOutline class="size-icon-sm" />
		<span class="pagination__nav-label">Previous</span>
	</button>

	<ul class="pagination__pages" role="list">
		{#each pageItems as item, i (i)}
			{#if item === 'ellipsis'}
				<li class="pagination__ellipsis" aria-hidden="true">…</li>
			{:else}
				<li>
					<button
						type="button"
						class="pagination__page"
						class:is-active={item === currentPage}
						aria-current={item === currentPage ? 'page' : undefined}
						aria-label="Page {item}"
						onclick={() => onnavigate(item)}
					>
						{item}
					</button>
				</li>
			{/if}
		{/each}
	</ul>

	<button
		type="button"
		class="pagination__nav"
		disabled={currentPage === totalPages}
		aria-label="Next page"
		onclick={() => onnavigate(currentPage + 1)}
	>
		<span class="pagination__nav-label">Next</span>
		<ChevronRightOutline class="size-icon-sm" />
	</button>
</nav>

<style>
	.pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--border-subtle);
	}

	/* Height matched to `.pagination__page` (2.25rem): the two control shapes
	   share one row, and a 41px Previous beside a 36px "3" made the row read as
	   two bands rather than one. */
	.pagination__nav {
		display: inline-flex;
		align-items: center;
		height: 2.25rem;
		gap: var(--space-2xs);
		padding: 0 var(--space-sm);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-default);
		background: var(--bg-raised);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.pagination__nav:hover:not(:disabled) {
		background: var(--bg-sunken);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.pagination__nav:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	@media (max-width: 480px) {
		.pagination__nav-label {
			display: none;
		}
	}

	.pagination__pages {
		display: flex;
		align-items: center;
		gap: var(--space-3xs);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.pagination__page {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 var(--space-xs);
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro),
			border-color var(--transition-micro);
	}

	.pagination__page:hover:not(.is-active) {
		background: var(--bg-sunken);
		color: var(--text-primary);
	}

	.pagination__page.is-active {
		/* Secondary-700 keeps white page numbers above the AA contrast floor in
		   both themes; the brighter dark-mode accent does not. The state is the
		   solid fill — a 36px control does not need a 28px halo to say it. */
		background: var(--color-secondary-700);
		color: var(--text-on-accent);
		border-color: var(--color-secondary-700);
		box-shadow: var(--shadow-xs);
	}

	.pagination__ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		color: var(--text-subtle);
		font-size: var(--text-sm);
	}

	/* 36px is a comfortable mouse target and an uncomfortable thumb one; on a
	   coarse pointer both shapes grow to the 2.75rem floor the rest of the site
	   uses, and the row still reads as one band because they grow together. */
	@media (pointer: coarse) {
		.pagination__nav,
		.pagination__page {
			height: 2.75rem;
		}

		.pagination__page {
			min-width: 2.75rem;
		}
	}
</style>
