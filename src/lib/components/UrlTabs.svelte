<script lang="ts" module>
	import type { Component } from "svelte";

	export interface Tab {
		id: string;
		label: string;
		icon?: Component<{ class?: string }>;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	import { Tabs, TabItem } from "flowbite-svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";

	interface Props {
		tabs: Tab[];
		paramName?: string;
		defaultTab?: string;
		tabStyle?: "underline" | "pill" | "full";
		class?: string;
		contentClass?: string;
		children: Snippet<[string, Tab]>;
		tabTitle?: Snippet<[Tab]>;
	}

	let {
		tabs,
		paramName = "view",
		defaultTab = tabs[0]?.id ?? "",
		tabStyle = "underline",
		class: className = "",
		contentClass = "",
		children,
		tabTitle,
	}: Props = $props();

	// Get current tab from URL or use default
	// During SSR/prerendering, always use defaultTab since URL params aren't available
	let activeTab = $derived.by(() => {
		if (!browser) return defaultTab;
		const urlParam = page.url.searchParams.get(paramName);
		const validIds = tabs.map((t) => t.id);
		return urlParam && validIds.includes(urlParam) ? urlParam : defaultTab;
	});

	// Update URL when tab changes (only runs in browser)
	function setActiveTab(tabId: string) {
		if (!browser) return;
		// page.url already contains the full path including base, so use it directly
		const url = new URL(page.url);
		if (tabId === defaultTab) {
			url.searchParams.delete(paramName);
		} else {
			url.searchParams.set(paramName, tabId);
		}
		// Use pathname + search directly since it already includes the base path
		goto(url.pathname + url.search, {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
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
							<Icon class="size-icon-md" />
						{/if}
						<span>{tab.label}</span>
					</div>
				{/if}
			{/snippet}
			{@render children(tab.id, tab)}
		</TabItem>
	{/each}
</Tabs>
