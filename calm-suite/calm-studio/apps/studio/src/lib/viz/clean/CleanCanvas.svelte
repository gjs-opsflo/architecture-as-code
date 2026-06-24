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
	import { SvelteFlow, Background, BackgroundVariant, MiniMap, type Node, type Edge } from '@xyflow/svelte';
	import { cleanNodeTypes, cleanEdgeTypes } from './cleanTypes';
	import '@xyflow/svelte/dist/style.css';

	let {
		nodes = $bindable<Node[]>([]),
		edges = $bindable<Edge[]>([]),
		onselectionchange
	}: {
		nodes?: Node[];
		edges?: Edge[];
		onselectionchange?: (nodeId: string | null, edgeId: string | null) => void;
	} = $props();

	function handleSelectionChange(event: { nodes: Node[]; edges: Edge[] }) {
		onselectionchange?.(event.nodes[0]?.id ?? null, event.edges[0]?.id ?? null);
	}
</script>

<div class="clean-canvas">
	<SvelteFlow
		bind:nodes
		bind:edges
		nodeTypes={cleanNodeTypes}
		edgeTypes={cleanEdgeTypes}
		fitView
		minZoom={0.2}
		maxZoom={3}
		nodesDraggable={false}
		nodesConnectable={false}
		elementsSelectable
		panOnDrag
		zoomOnScroll
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
