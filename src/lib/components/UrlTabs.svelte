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
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolveAppPath } from '$lib/utils/paths';
	import type { Snippet } from 'svelte';

	interface Props {
		tabs: Tab[];
		paramName?: string;
		defaultTab?: string;
		tabStyle?: 'underline' | 'pill' | 'full';
		class?: string;
		contentClass?: string;
		children: Snippet<[string, Tab]>;
		tabTitle?: Snippet<[Tab]>;
	}

	let { 
		tabs, 
		paramName = 'view', 
		defaultTab = tabs[0]?.id ?? '',
		tabStyle = 'underline',
		class: className = '',
		contentClass = '',
		children,
		tabTitle
	}: Props = $props();

	// Get current tab from URL or use default
	let activeTab = $derived.by(() => {
		const urlParam = page.url.searchParams.get(paramName);
		const validIds = tabs.map(t => t.id);
		return urlParam && validIds.includes(urlParam) ? urlParam : defaultTab;
	});

	// Update URL when tab changes
	function setActiveTab(tabId: string) {
		const url = new URL(page.url);
		if (tabId === defaultTab) {
			url.searchParams.delete(paramName);
		} else {
			url.searchParams.set(paramName, tabId);
		}
		goto(resolveAppPath(url.pathname + url.search), { 
			replaceState: true, 
			noScroll: true,
			keepFocus: true
		});
	}
</script>

<Tabs {tabStyle} class={className} {contentClass}>
	{#each tabs as tab (tab.id)}
		{@const Icon = tab.icon}
		<TabItem 
			open={activeTab === tab.id} 
			onclick={() => setActiveTab(tab.id)}
		>
			{#snippet titleSlot()}
				{#if tabTitle}
					{@render tabTitle(tab)}
				{:else}
					<div class="flex items-center gap-2">
						{#if Icon}
							<Icon class="w-5 h-5" />
						{/if}
						<span>{tab.label}</span>
					</div>
				{/if}
			{/snippet}
			{@render children(tab.id, tab)}
		</TabItem>
	{/each}
</Tabs>
