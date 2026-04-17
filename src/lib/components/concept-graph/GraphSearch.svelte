<script lang="ts">
	import type { ConceptNode, ConceptGroup } from '$lib/types/concept-graph';
	import { SearchOutline } from 'flowbite-svelte-icons';

	interface Props {
		nodes: ConceptNode[];
		getNodeColor: (_group: ConceptGroup) => string;
		onselect: (_node: ConceptNode) => void;
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
		<SearchOutline
			class="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400"
			aria-hidden="true"
		/>
		<input
			bind:this={searchInputEl}
			type="text"
			class="search-input"
			placeholder="Search concepts..."
			value={searchQuery}
			oninput={onSearchInput}
			onkeydown={onSearchKeydown}
			onfocus={() => {
				if (searchQuery.trim()) searchOpen = true;
			}}
			onblur={() => {
				setTimeout(() => {
					searchOpen = false;
				}, 200);
			}}
			aria-label="Search concepts"
			aria-expanded={searchOpen && searchResults.length > 0}
			aria-controls="search-results"
			role="combobox"
			aria-autocomplete="list"
		/>
		{#if searchQuery}
			<button
				class="search-clear"
				onclick={() => {
					searchQuery = '';
					searchOpen = false;
				}}
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
						onmousedown={(e) => {
							e.preventDefault();
							selectResult(result);
						}}
						onpointerenter={() => {
							searchHighlightIndex = i;
						}}
					>
						<span class="search-result-dot" style="background-color: {getNodeColor(result.group)}"
						></span>
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
		border: 1px solid var(--border-default);
		background: var(--bg-raised);
		color: var(--text-primary);
		font-size: var(--text-sm);
		transition:
			border-color var(--transition-micro),
			box-shadow var(--transition-micro);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--text-subtle);
	}

	.search-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
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
		background: var(--bg-overlay);
		color: var(--text-subtle);
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
		transition:
			background var(--transition-micro),
			color var(--transition-micro);
	}

	.search-clear:hover {
		background: var(--border-strong);
		color: var(--text-secondary);
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin-top: var(--space-3xs);
		background: var(--bg-raised);
		border: 1px solid var(--border-default);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		z-index: var(--z-dropdown);
		list-style: none;
		padding: var(--space-3xs);
	}

	.search-no-results {
		padding: var(--space-sm);
		font-size: var(--text-xs);
		color: var(--text-subtle);
		text-align: center;
	}

	.search-result-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		width: 100%;
		padding: var(--space-2xs) var(--space-xs);
		border: none;
		background: transparent;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		transition: background var(--transition-micro);
	}

	.search-result.highlighted .search-result-btn,
	.search-result-btn:hover {
		background: var(--bg-sunken);
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
