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
		type Node,
		type Edge,
		type Viewport
	} from '@xyflow/svelte';
	import { cleanNodeTypes, cleanEdgeTypes } from './cleanTypes';
	import '@xyflow/svelte/dist/style.css';

	let {
		nodes = $bindable<Node[]>([]),
		edges = $bindable<Edge[]>([]),
		viewport = { x: 0, y: 0, zoom: 1 } as Viewport,
		onviewportchange,
		onselectionchange
	}: {
		nodes?: Node[];
		edges?: Edge[];
		viewport?: Viewport;
		onviewportchange?: (vp: Viewport) => void;
		onselectionchange?: (nodeId: string | null, edgeId: string | null) => void;
	} = $props();

	let internalViewport = $state<Viewport>(viewport);

	$effect(() => {
		onviewportchange?.(internalViewport);
	});

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
		bind:viewport={internalViewport}
		nodeTypes={cleanNodeTypes}
		edgeTypes={cleanEdgeTypes}
		minZoom={0.2}
		maxZoom={3}
		nodesDraggable={false}
		nodesConnectable={false}
		elementsSelectable
		panOnDrag
		panOnScroll
		zoomOnScroll={false}
		zoomOnPinch
		zoomOnDoubleClick={false}
		selectionOnDrag={false}
		onselectionchange={handleSelectionChange}
	>
		<Background variant={BackgroundVariant.Dots} gap={22} size={0.8} />
		<MiniMap
			pannable
			zoomable
			maskColor="rgba(250, 250, 249, 0.6)"
			position="bottom-right"
			style="background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(10px); border: 1px solid var(--color-border-subtle); border-radius: 8px;"
		/>
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
		box-shadow: 0 1px 2px rgb(10 10 9 / 0.04);
	}
</style>
