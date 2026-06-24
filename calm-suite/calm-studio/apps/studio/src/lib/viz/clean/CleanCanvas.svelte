<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanCanvas.svelte — View-mode greenfield canvas. Wraps Svelte Flow with
  CleanNode / CleanContainer / CleanEdge so the rendering is uniform-clean
  (matches CalmHub's image 3 + Mockup 1 visual baseline). Mounted INSTEAD of
  Studio's CalmCanvas when mode === 'view'.

  Receives the same nodes / edges projection as the editor canvas; the only
  difference is the renderer set. Selection emits an event up for the parent
  to position an InlinePopover near the clicked node.
-->
<script lang="ts">
	import {
		SvelteFlow,
		Background,
		BackgroundVariant,
		MiniMap,
		PanOnScrollMode,
		type Node,
		type Edge,
		type Viewport
	} from '@xyflow/svelte';
	import { cleanNodeTypes, cleanEdgeTypes } from './cleanTypes';
	import '@xyflow/svelte/dist/style.css';

	let {
		nodes = $bindable<Node[]>([]),
		edges = $bindable<Edge[]>([]),
		onviewportchange,
		onselectionchange
	}: {
		nodes?: Node[];
		edges?: Edge[];
		onviewportchange?: (vp: Viewport) => void;
		onselectionchange?: (nodeId: string | null, edgeId: string | null) => void;
	} = $props();

	// Viewport bound directly to Svelte Flow. Emit changes upward via callback;
	// parent owns persistence but does NOT push a viewport back down (avoids the
	// remount/feedback loop that was breaking trackpad gestures).
	let viewport = $state<Viewport>({ x: 0, y: 0, zoom: 1 });
	$effect(() => onviewportchange?.(viewport));

	/**
	 * Track the currently selected node so we can dim cross-container edges
	 * that don't involve it. Reduces edge-spaghetti density per user feedback.
	 */
	let selectedNodeId = $state<string | null>(null);

	/**
	 * Dim edges that cross container boundaries AND don't involve the selected
	 * node. Same-container edges always stay visible. Click a node → all its
	 * edges pop back into view; click empty canvas → only same-container edges
	 * are bright. CleanEdge reads `data.dimmed` to fade.
	 */
	const visibleEdges = $derived.by(() => {
		const parentMap = new Map<string, string | undefined>();
		for (const n of nodes) parentMap.set(n.id, n.parentId);
		return edges.map((e) => {
			const sameContainer = parentMap.get(e.source) === parentMap.get(e.target);
			const touchesSelection =
				selectedNodeId !== null && (e.source === selectedNodeId || e.target === selectedNodeId);
			const dimmed = !sameContainer && !touchesSelection;
			return {
				...e,
				data: { ...(e.data ?? {}), dimmed }
			};
		});
	});

	function handleSelectionChange(event: { nodes: Node[]; edges: Edge[] }) {
		selectedNodeId = event.nodes[0]?.id ?? null;
		onselectionchange?.(event.nodes[0]?.id ?? null, event.edges[0]?.id ?? null);
	}
</script>

<div class="clean-canvas">
	<SvelteFlow
		bind:nodes
		edges={visibleEdges}
		bind:viewport
		nodeTypes={cleanNodeTypes}
		edgeTypes={cleanEdgeTypes}
		minZoom={0.4}
		maxZoom={2.5}
		nodesDraggable={false}
		nodesConnectable={false}
		elementsSelectable
		panOnDrag
		panOnScroll
		panOnScrollMode={PanOnScrollMode.Free}
		zoomOnPinch
		zoomOnDoubleClick={false}
		selectionOnDrag={false}
		onselectionchange={handleSelectionChange}
	>
		<Background variant={BackgroundVariant.Dots} gap={22} size={0.8} />
		<MiniMap pannable zoomable position="bottom-right" />
		<!--
			MiniMap colours come from CSS — the `.clean-canvas` rules below pick up
			--color-surface / --color-border / --color-canvas-bg in light AND dark
			mode. Avoid inline style attrs so the dark token cascade actually wins
			(inline styles otherwise lock the minimap to a white background on a
			dark canvas).
		-->
	</SvelteFlow>
</div>

<style>
	.clean-canvas {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--color-canvas-bg, #fafaf9);
	}
	.clean-canvas :global(.svelte-flow__attribution) {
		display: none;
	}
	.clean-canvas :global(.svelte-flow__minimap) {
		background: var(--color-surface, #ffffff);
		border: 1px solid var(--color-border-subtle, #e7e5e0);
		border-radius: 8px;
		box-shadow: 0 1px 2px rgb(10 10 9 / 0.04);
	}
	:global(.dark) .clean-canvas :global(.svelte-flow__minimap) {
		background: var(--color-surface-secondary, #131312);
		border-color: var(--color-border, #3f3f46);
	}
	/* Minimap mask (the dimming overlay around the viewport rectangle) needs
	   a theme-aware fill — Svelte Flow's default mask defaults to a near-white
	   rgba which leaves a bright square on a dark canvas. */
	.clean-canvas :global(.svelte-flow__minimap-mask) {
		fill: rgba(250, 250, 249, 0.55);
	}
	:global(.dark) .clean-canvas :global(.svelte-flow__minimap-mask) {
		fill: rgba(10, 10, 9, 0.55);
	}
	.clean-canvas :global(.svelte-flow__minimap-node) {
		fill: var(--color-border, #d4d4cf);
	}
	:global(.dark) .clean-canvas :global(.svelte-flow__minimap-node) {
		fill: var(--color-border, #3f3f46);
	}
</style>
