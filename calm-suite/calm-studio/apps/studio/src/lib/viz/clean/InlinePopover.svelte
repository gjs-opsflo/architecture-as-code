<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  InlinePopover.svelte — anchored detail popover for View mode. Replaces the
  floating DetailDrawer with the CalmHub pattern: a small white card with
  chevron arrow pointing UP at the clicked node, listing description +
  controls + threats + decorators + composed-of children. Auto-dismiss on
  click-outside or Esc; mounted ONLY when a node is selected in View mode.

  Positioning: uses Svelte Flow's useSvelteFlow().flowToScreenPosition to
  translate the node's flow-coord bottom-center into screen pixels, then
  positions the popover absolutely below it. Caller is responsible for
  mounting this inside a position:relative container (the canvas wrapper).
-->
<script lang="ts">
	import { useSvelteFlow, type Node } from '@xyflow/svelte';
	import type { CalmNode, CalmArchitecture } from '@calmstudio/calm-core';
	import ControlsSection from '$lib/viz/drawer/sections/ControlsSection.svelte';
	import ThreatsSection from '$lib/viz/drawer/sections/ThreatsSection.svelte';
	import DecoratorsSection from '$lib/viz/drawer/sections/DecoratorsSection.svelte';
	import ComposedOfSection from '$lib/viz/drawer/sections/ComposedOfSection.svelte';

	let {
		selectedFlowNode,
		selectedCalmNode,
		arch,
		onclose,
		onopeneditor
	}: {
		selectedFlowNode: Node | null;
		selectedCalmNode: CalmNode | null;
		arch: CalmArchitecture;
		onclose: () => void;
		onopeneditor?: () => void;
	} = $props();

	const { flowToScreenPosition } = useSvelteFlow();

	/**
	 * Anchor + smart placement. Computes screen position of the selected node's
	 * bottom-center, then chooses below-node OR above-node based on viewport room.
	 * Clamps left/right to keep the 320px popover fully on-screen. Avoids the
	 * "popover floats outside canvas" bug seen when pinch-zooming with selection.
	 */
	const placement = $derived.by(() => {
		if (!selectedFlowNode) return null;
		const w = selectedFlowNode.measured?.width ?? 140;
		const h = selectedFlowNode.measured?.height ?? 60;
		const cx = selectedFlowNode.position.x + w / 2;
		const bottom = selectedFlowNode.position.y + h;
		const top = selectedFlowNode.position.y;
		try {
			const screenBottom = flowToScreenPosition({ x: cx, y: bottom });
			const screenTop = flowToScreenPosition({ x: cx, y: top });
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const popW = 320;
			const popMaxH = Math.min(vh * 0.7, 520);
			const margin = 16;
			// Vertical: prefer below the node; flip above if no room there.
			const canBelow = screenBottom.y + popMaxH + margin <= vh;
			let placeBelow = canBelow;
			let y = placeBelow ? screenBottom.y + 14 : screenTop.y - 14 - popMaxH;
			// Hard clamp Y to viewport — keeps popover fully on-screen even when
			// the selected node is a root-sized container whose top + bottom
			// would both push the popover off-screen.
			const yClamped = Math.max(margin, Math.min(y, vh - popMaxH - margin));
			const yWasClamped = Math.abs(yClamped - y) > 4;
			y = yClamped;
			// Horizontal: clamp so the popover stays fully in-view.
			let x = screenBottom.x - popW / 2;
			x = Math.max(margin, Math.min(x, vw - popW - margin));
			// Arrow x within popover (relative to popover left edge).
			const arrowX = Math.max(20, Math.min(popW - 20, screenBottom.x - x));
			// Hide the chevron if we had to clamp Y heavily — the arrow would
			// no longer point at the node.
			const showArrow = !yWasClamped;
			return { x, y, arrowX, placeBelow, showArrow };
		} catch {
			return null;
		}
	});

	// Esc to close
	$effect(() => {
		if (!selectedCalmNode) return;
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') onclose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if selectedCalmNode && placement}
	<aside
		class="inline-popover"
		class:placed-above={!placement.placeBelow}
		class:no-arrow={!placement.showArrow}
		style:left="{placement.x}px"
		style:top="{placement.y}px"
		style:--arrow-x="{placement.arrowX}px"
		role="dialog"
		aria-label="Node details: {selectedCalmNode.name ?? selectedCalmNode['unique-id']}"
	>
		<header class="ip-head">
			<div class="ip-text">
				<h2 class="ip-name">{selectedCalmNode.name ?? selectedCalmNode['unique-id']}</h2>
				<p class="ip-typ">{selectedCalmNode['node-type']}</p>
			</div>
			<button class="ip-close" onclick={onclose} aria-label="Close detail">
				<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</header>
		<div class="ip-body">
			{#if selectedCalmNode.description}
				<section class="ip-sec">
					<h3 class="ip-sec-h">Description</h3>
					<p class="ip-desc">{selectedCalmNode.description}</p>
				</section>
			{/if}
			<ControlsSection node={selectedCalmNode} />
			<ThreatsSection node={selectedCalmNode} />
			<DecoratorsSection node={selectedCalmNode} />
			<ComposedOfSection node={selectedCalmNode} {arch} />
		</div>
		{#if onopeneditor}
			<footer class="ip-foot">
				<button class="ip-foot-btn" onclick={onclose}>Close</button>
				<button class="ip-foot-btn primary" onclick={onopeneditor}>
					Open in editor
				</button>
			</footer>
		{/if}
	</aside>
{/if}

<style>
	.inline-popover {
		position: fixed; /* viewport-anchored, ignores ancestor offsets */
		width: 320px;
		max-height: 70vh;
		background: var(--color-surface, #ffffff);
		border: 1px solid var(--color-border-subtle, #e7e5e0);
		border-radius: 10px;
		box-shadow:
			0 16px 32px rgb(10 10 9 / 0.08),
			0 4px 12px rgb(10 10 9 / 0.06);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		font-family: var(--font-sans, 'Geist', sans-serif);
		color: var(--color-text-primary, #0a0a09);
	}
	.inline-popover::before {
		content: '';
		position: absolute;
		top: -7px;
		left: var(--arrow-x, 152px);
		margin-left: -6px;
		width: 12px;
		height: 12px;
		background: var(--color-surface, #ffffff);
		border: 1px solid var(--color-border-subtle, #e7e5e0);
		border-right: 0;
		border-bottom: 0;
		transform: rotate(45deg);
	}
	.inline-popover.placed-above::before {
		top: auto;
		bottom: -7px;
		transform: rotate(225deg);
	}
	.inline-popover.no-arrow::before {
		display: none;
	}
	.ip-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 10px;
		padding: 14px 16px 10px;
		border-bottom: 1px solid var(--color-border-subtle, #e7e5e0);
	}
	.ip-text {
		min-width: 0;
		flex: 1;
	}
	.ip-name {
		font: 600 14px/1.2 var(--font-sans, 'Geist', sans-serif);
		color: var(--color-text-primary, #0a0a09);
		letter-spacing: -0.01em;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ip-typ {
		font: 500 10px/1 var(--font-mono, 'Geist Mono', monospace);
		color: var(--color-text-tertiary, #a8a29e);
		text-transform: lowercase;
		letter-spacing: 0.02em;
		margin: 4px 0 0;
	}
	.ip-close {
		width: 22px;
		height: 22px;
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 0;
		color: var(--color-text-tertiary, #a8a29e);
		border-radius: 4px;
		cursor: pointer;
	}
	.ip-close:hover {
		background: var(--color-surface-tertiary, #f4f4f2);
		color: var(--color-text-primary, #0a0a09);
	}
	.ip-body {
		padding: 12px 16px 14px;
		overflow-y: auto;
		flex: 1;
	}
	.ip-sec {
		margin-bottom: 12px;
	}
	.ip-sec-h {
		font: 600 9px/1 var(--font-mono, 'Geist Mono', monospace);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-tertiary, #a8a29e);
		margin: 0 0 6px;
	}
	.ip-desc {
		font: 400 12px/1.55 var(--font-sans, 'Geist', sans-serif);
		color: var(--color-text-secondary, #57534e);
		margin: 0;
	}
	.ip-foot {
		display: flex;
		gap: 6px;
		padding: 10px 16px;
		border-top: 1px solid var(--color-border-subtle, #e7e5e0);
	}
	.ip-foot-btn {
		flex: 1;
		padding: 6px 8px;
		background: var(--color-surface-tertiary, #f4f4f2);
		border: 1px solid var(--color-border-subtle, #e7e5e0);
		border-radius: 6px;
		font: 500 11px/1 var(--font-sans, 'Geist', sans-serif);
		color: var(--color-text-primary, #0a0a09);
		cursor: pointer;
		letter-spacing: -0.005em;
	}
	.ip-foot-btn:hover {
		background: var(--color-border-subtle, #e7e5e0);
	}
	.ip-foot-btn.primary {
		background: var(--color-accent, #4f46e5);
		border-color: var(--color-accent, #4f46e5);
		color: #ffffff;
	}
	.ip-foot-btn.primary:hover {
		background: var(--color-accent-hover, #4338ca);
		border-color: var(--color-accent-hover, #4338ca);
	}
</style>
