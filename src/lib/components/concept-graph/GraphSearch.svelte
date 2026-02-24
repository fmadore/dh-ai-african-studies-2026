<script lang="ts">
	import type { ConceptNode, ConceptGroup } from '$lib/types/concept-graph';
	import { SearchOutline } from 'flowbite-svelte-icons';

	interface Props {
		nodes: ConceptNode[];
		getNodeColor: (group: ConceptGroup) => string;
		onselect: (node: ConceptNode) => void;
	}

	let { nodes, getNodeColor, onselect }: Props = $props();

	let searchQuery = $state('');
	let searchOpen = $state(false);
	let searchHighlightIndex = $state(0);
	let searchInputEl: HTMLInputElement | undefined;

	let searchResults = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return [];
		return nodes
			.filter((n) => n.label.toLowerCase().includes(q))
			.sort((a, b) => {
				const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
				const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
				if (aStarts !== bStarts) return aStarts - bStarts;
				return b.degree - a.degree;
			})
			.slice(0, 8);
	});

	function onSearchInput(event: Event) {
		const input = event.target as HTMLInputElement;
		searchQuery = input.value;
		searchOpen = searchQuery.trim().length > 0;
		searchHighlightIndex = 0;
	}

	function onSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			searchHighlightIndex = Math.min(searchHighlightIndex + 1, searchResults.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			searchHighlightIndex = Math.max(searchHighlightIndex - 1, 0);
		} else if (event.key === 'Enter' && searchResults.length > 0) {
			event.preventDefault();
			selectResult(searchResults[searchHighlightIndex]);
		} else if (event.key === 'Escape') {
			searchQuery = '';
			searchOpen = false;
			searchInputEl?.blur();
		}
	}

	function selectResult(node: ConceptNode) {
		onselect(node);
		searchQuery = '';
		searchOpen = false;
	}
</script>

<div class="search-bar">
	<div class="search-input-wrapper">
		<SearchOutline class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
		<input
			bind:this={searchInputEl}
			type="text"
			class="search-input"
			placeholder="Search concepts..."
			value={searchQuery}
			oninput={onSearchInput}
			onkeydown={onSearchKeydown}
			onfocus={() => { if (searchQuery.trim()) searchOpen = true; }}
			onblur={() => { setTimeout(() => { searchOpen = false; }, 200); }}
			aria-label="Search concepts"
			aria-expanded={searchOpen && searchResults.length > 0}
			aria-controls="search-results"
			role="combobox"
			aria-autocomplete="list"
		/>
		{#if searchQuery}
			<button
				class="search-clear"
				onclick={() => { searchQuery = ''; searchOpen = false; }}
				aria-label="Clear search"
			>
				&times;
			</button>
		{/if}
	</div>
	{#if searchOpen && searchResults.length > 0}
		<ul class="search-dropdown" id="search-results" role="listbox">
			{#each searchResults as result, i (result.id)}
				<li
					role="option"
					aria-selected={i === searchHighlightIndex}
					class="search-result"
					class:highlighted={i === searchHighlightIndex}
				>
					<button
						class="search-result-btn"
						onmousedown={(e) => { e.preventDefault(); selectResult(result); }}
						onpointerenter={() => { searchHighlightIndex = i; }}
					>
						<span class="search-result-dot" style="background-color: {getNodeColor(result.group)}"></span>
						<span class="search-result-label">{result.label}</span>
						<span class="search-result-degree">{result.degree}</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else if searchOpen && searchQuery.trim().length > 0}
		<div class="search-dropdown search-no-results">No matching concepts</div>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		max-width: var(--container-xs);
	}

	.search-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		padding: var(--space-xs) var(--space-sm) var(--space-xs) 2rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--color-surface-300);
		background: var(--color-surface-0);
		color: var(--color-gray-900);
		font-size: var(--text-sm);
		transition: all var(--transition-fast);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-gray-400);
	}

	.search-input:focus {
		border-color: var(--color-secondary-400);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-secondary-400) 20%, transparent);
	}

	:global(.dark) .search-input {
		background: var(--color-surface-dark-elevated);
		color: var(--color-gray-100);
		border-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .search-input:focus {
		border-color: var(--color-secondary-400);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-secondary-400) 15%, transparent);
	}

	.search-clear {
		position: absolute;
		right: 0.375rem;
		display: grid;
		place-items: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--radius-full);
		border: none;
		background: var(--color-surface-200);
		color: var(--color-gray-500);
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
	}

	.search-clear:hover {
		background: var(--color-surface-300);
		color: var(--color-gray-700);
	}

	:global(.dark) .search-clear {
		background: var(--color-surface-dark-overlay);
		color: var(--color-gray-400);
	}

	:global(.dark) .search-clear:hover {
		background: rgba(255, 255, 255, 0.15);
		color: var(--color-gray-200);
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: 0.25rem;
		background: var(--color-surface-0);
		border: 1px solid var(--color-surface-300);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		z-index: var(--z-dropdown);
		list-style: none;
		padding: 0.25rem;
	}

	:global(.dark) .search-dropdown {
		background: var(--color-surface-dark-elevated);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow: var(--shadow-dark-lg);
	}

	.search-no-results {
		padding: var(--space-sm);
		font-size: var(--text-xs);
		color: var(--color-gray-400);
		text-align: center;
	}

	.search-result-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		font-size: var(--text-sm);
		color: var(--color-gray-700);
		transition: background var(--transition-fast);
	}

	.search-result.highlighted .search-result-btn {
		background: var(--color-surface-100);
	}

	.search-result-btn:hover {
		background: var(--color-surface-100);
	}

	:global(.dark) .search-result-btn {
		color: var(--color-gray-200);
	}

	:global(.dark) .search-result.highlighted .search-result-btn,
	:global(.dark) .search-result-btn:hover {
		background: var(--color-surface-dark-overlay);
	}

	.search-result-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.search-result-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.search-result-degree {
		flex-shrink: 0;
		font-size: var(--text-xs);
		color: var(--color-gray-400);
	}
</style>
