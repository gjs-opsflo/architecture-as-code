<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0
-->
<script lang="ts">
	import type { CalmNode, CalmArchitecture } from '@calmstudio/calm-core';
	import ControlsSection from './sections/ControlsSection.svelte';
	import ThreatsSection from './sections/ThreatsSection.svelte';
	import DecoratorsSection from './sections/DecoratorsSection.svelte';
	import ComposedOfSection from './sections/ComposedOfSection.svelte';

	let {
		arch,
		selectedNode,
		onclose
	}: { arch: CalmArchitecture; selectedNode: CalmNode | null; onclose: () => void } = $props();

	let collapsed = $state(false);

	// Auto-reset collapsed when selection changes (new node = fresh expanded state).
	let lastSelectedId = $state<string | null>(null);
	$effect(() => {
		const id = selectedNode?.['unique-id'] ?? null;
		if (id !== lastSelectedId) {
			collapsed = false;
			lastSelectedId = id;
		}
	});
</script>

{#if selectedNode}
	{#if collapsed}
		<button
			class="detail-drawer-tab"
			onclick={() => (collapsed = false)}
			aria-label="Expand details for {selectedNode.name ?? selectedNode['unique-id']}"
			title="Expand details"
		>
			<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M15 18l-6-6 6-6" />
			</svg>
			<span class="tab-label">{selectedNode.name ?? selectedNode['unique-id']}</span>
		</button>
	{:else}
		<aside class="detail-drawer" aria-label="Node details">
			<header class="dr-head">
				<div class="head-text">
					<h2 class="ttl">{selectedNode.name ?? selectedNode['unique-id']}</h2>
					<p class="typ">{selectedNode['node-type']}</p>
				</div>
				<div class="head-actions">
					<button
						class="icon-btn"
						onclick={() => (collapsed = true)}
						aria-label="Minimize detail drawer"
						title="Minimize"
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M9 6l6 6-6 6" />
						</svg>
					</button>
					<button
						class="icon-btn close"
						onclick={onclose}
						aria-label="Close detail drawer"
						title="Close"
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
				</div>
			</header>

			{#if selectedNode.description}
				<section class="dr-sec">
					<h3 class="dr-sec-h">Description</h3>
					<p class="dr-desc">{selectedNode.description}</p>
				</section>
			{/if}

			<ControlsSection node={selectedNode} />
			<ThreatsSection node={selectedNode} />
			<DecoratorsSection node={selectedNode} />
			<ComposedOfSection node={selectedNode} {arch} />
		</aside>
	{/if}
{/if}

<style>
	.detail-drawer {
		position: absolute;
		top: 12px;
		right: 12px;
		bottom: 12px;
		width: 320px;
		background: rgba(15, 17, 22, 0.94);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgb(31 36 46 / 1);
		border-radius: 10px;
		padding: 14px;
		z-index: 11;
		overflow-y: auto;
		color: rgb(209 213 219 / 1);
	}
	.dr-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid rgb(31 36 46 / 1);
		margin-bottom: 12px;
	}
	.head-text {
		min-width: 0;
		flex: 1;
	}
	.head-actions {
		display: inline-flex;
		gap: 4px;
		flex-shrink: 0;
	}
	.ttl {
		font: 600 13px/1.2 'Inter', sans-serif;
		color: rgb(243 244 246 / 1);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.typ {
		font: 500 9px/1 'Geist Mono', ui-monospace, monospace;
		color: rgb(107 114 128 / 1);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 3px 0 0;
	}
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		color: rgb(156 163 175 / 1);
		cursor: pointer;
		transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
	}
	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgb(31 36 46 / 1);
		color: rgb(243 244 246 / 1);
	}
	.detail-drawer-tab {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 11;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		max-width: 200px;
		padding: 7px 10px 7px 8px;
		background: rgba(15, 17, 22, 0.94);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid rgb(31 36 46 / 1);
		border-radius: 8px;
		color: rgb(209 213 219 / 1);
		font: 500 11px/1 'Inter', sans-serif;
		cursor: pointer;
		transition: background-color 150ms ease, border-color 150ms ease;
	}
	.detail-drawer-tab:hover {
		background: rgba(20, 23, 30, 0.98);
		border-color: rgba(99, 102, 241, 0.35);
	}
	.tab-label {
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.dr-sec {
		margin-bottom: 12px;
	}
	.dr-sec-h {
		font: 600 9px/1 'Geist Mono', monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgb(107 114 128 / 1);
		margin: 0 0 6px;
	}
	.dr-desc {
		font: 400 11px/1.4 'Inter', sans-serif;
		color: rgb(156 163 175 / 1);
		margin: 0;
	}
</style>
