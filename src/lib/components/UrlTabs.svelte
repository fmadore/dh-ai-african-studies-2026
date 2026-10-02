<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface Tab {
		id: string;
		label: string;
		icon?: Component<{ class?: string }>;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface Props {
		tabs: Tab[];
		paramName?: string;
		defaultTab?: string;
		label?: string;
		tabStyle?: 'underline' | 'pill' | 'full';
		activeClass?: string;
		class?: string;
		contentClass?: string;
		children: Snippet<[string, Tab]>;
		tabTitle?: Snippet<[Tab]>;
	}

	let {
		tabs,
		paramName = 'view',
		defaultTab = tabs[0]?.id ?? '',
		label = 'Views',
		tabStyle = 'underline',
		activeClass = '',
		class: className = '',
		contentClass = '',
		children,
		tabTitle
	}: Props = $props();

	const id = $props.id();
	let enhanced = $state(false);
	let tabLinks: HTMLAnchorElement[] = [];
	onMount(() => {
		enhanced = true;
	});

	// The server and first client render expose every panel. Only after
	// hydration do these section links become an accessible tab interface.
	const fallback = $derived(tabs.some((tab) => tab.id === defaultTab) ? defaultTab : tabs[0]?.id);
	let activeTab = $derived.by(() => {
		if (!enhanced) return fallback;
		const value = page.url.searchParams.get(paramName);
		return tabs.some((tab) => tab.id === value) ? value : fallback;
	});

	function tabUrl(tabId: string) {
		const url = new URL(page.url.href);
		if (tabId === fallback) url.searchParams.delete(paramName);
		else url.searchParams.set(paramName, tabId);
		return url.pathname + url.search + url.hash;
	}

	function activate(tabId: string) {
		void goto(tabUrl(tabId), {
			replace: true,
			reset: false,
			state: page.state
		});
	}

	function onKeydown(event: KeyboardEvent, index: number) {
		if (!enhanced) return;
		let next: number;
		switch (event.key) {
			case 'ArrowRight':
				next = (index + 1) % tabs.length;
				break;
			case 'ArrowLeft':
				next = (index - 1 + tabs.length) % tabs.length;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = tabs.length - 1;
				break;
			case ' ':
				next = index;
				break;
			default:
				return;
		}
		event.preventDefault();
		tabLinks[next]?.focus();
		activate(tabs[next].id);
	}
</script>

<div class="url-tabs {className}" data-enhanced={enhanced}>
	<div
		class="url-tabs__list url-tabs__list--{tabStyle}"
		role={enhanced ? 'tablist' : 'navigation'}
		aria-label={label}
	>
		{#each tabs as tab, index (tab.id)}
			{@const Icon = tab.icon}
			<a
				bind:this={tabLinks[index]}
				id="{id}-{tab.id}-tab"
				href={enhanced ? tabUrl(tab.id) : `#${id}-${tab.id}-panel`}
				role={enhanced ? 'tab' : undefined}
				aria-selected={enhanced ? activeTab === tab.id : undefined}
				aria-controls={enhanced ? `${id}-${tab.id}-panel` : undefined}
				tabindex={enhanced && activeTab !== tab.id ? -1 : 0}
				class="url-tabs__tab {enhanced && activeTab === tab.id ? activeClass : ''}"
				onclick={(event) => {
					if (!enhanced || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
					event.preventDefault();
					activate(tab.id);
				}}
				onkeydown={(event) => onKeydown(event, index)}
			>
				{#if tabTitle}
					{@render tabTitle(tab)}
				{:else}
					<span class="flex items-center gap-2">
						{#if Icon}<Icon class="size-icon-md" />{/if}
						<span>{tab.label}</span>
					</span>
				{/if}
			</a>
		{/each}
	</div>
	{#each tabs as tab (tab.id)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (The enhanced role is a focusable tabpanel.) -->
		<section
			id="{id}-{tab.id}-panel"
			class="url-tabs__panel {contentClass}"
			role={enhanced ? 'tabpanel' : undefined}
			aria-labelledby="{id}-{tab.id}-tab"
			tabindex={enhanced ? 0 : undefined}
			class:is-inactive={enhanced && activeTab !== tab.id}
		>
			{@render children(tab.id, tab)}
		</section>
	{/each}
</div>

<style>
	.url-tabs__list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		margin-bottom: var(--space-lg);
		border-bottom: 1px solid var(--border-subtle);
	}
	.url-tabs__tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.75rem;
		padding: var(--space-sm) var(--space-md);
		border-bottom: 2px solid transparent;
		color: var(--text-muted);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
	}
	.url-tabs__tab:hover {
		color: var(--text-link);
		background: var(--bg-sunken);
	}
	.url-tabs__tab[aria-selected='true'] {
		color: var(--text-accent);
		border-color: var(--accent);
	}
	.url-tabs__list--pill,
	.url-tabs__list--full {
		border-bottom: 0;
	}
	.url-tabs__list--pill .url-tabs__tab,
	.url-tabs__list--full .url-tabs__tab {
		border-radius: var(--radius-card);
	}
	.url-tabs__list--pill .url-tabs__tab[aria-selected='true'],
	.url-tabs__list--full .url-tabs__tab[aria-selected='true'] {
		background: var(--color-secondary-700);
		color: var(--text-on-accent);
		border-color: transparent;
	}
	.url-tabs__list--full .url-tabs__tab {
		flex: 1;
	}
	.url-tabs[data-enhanced='false'] .url-tabs__panel + .url-tabs__panel {
		margin-top: var(--space-2xl);
	}
	.url-tabs__panel.is-inactive {
		display: none;
	}
	@media print {
		.url-tabs__list {
			display: none;
		}
		.url-tabs__panel.is-inactive {
			display: block;
		}
		.url-tabs__panel :global(.animate-section-reveal) {
			opacity: 1 !important;
			transform: none !important;
			transition: none !important;
		}
		.url-tabs__panel + .url-tabs__panel {
			margin-top: var(--space-2xl);
		}
	}
</style>
