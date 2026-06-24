<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanContainer.svelte — container node renderer for the View-mode greenfield.
  Matches Mockup 1 + 2: light dashed rectangle, no header bar, just a small
  uppercase mono label in the top-left. No collapse button (View mode is
  read-only). Children are positioned by Svelte Flow parentId mechanism.
-->
<script lang="ts">
	import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/svelte';
	let { id, data, selected }: NodeProps = $props();
	const label = $derived(((data as Record<string, unknown>).label as string) ?? ((data as Record<string, unknown>).calmId as string) ?? id);
</script>

<NodeResizer minWidth={200} minHeight={140} isVisible={selected} />
<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

<div class="clean-container" class:selected>
	<span class="container-label">{label}</span>
</div>

<style>
	.clean-container {
		position: relative;
		width: 100%;
		height: 100%;
		border: 1px dashed var(--color-border, #d4d4cf);
		border-radius: 10px;
		/* Slight tint over the canvas so the container reads as a region.
		   Light mode = subtle warm-gray; dark mode = subtle lift above the
		   near-black canvas. The hardcoded rgba(244,244,242,0.4) shipped before
		   was light-only and made dark-mode containers look washed-out. */
		background: rgba(244, 244, 242, 0.4);
		font-family: var(--font-sans, 'Geist', sans-serif);
		min-width: 200px;
		min-height: 140px;
		transition: border-color 150ms ease;
	}
	:global(.dark) .clean-container {
		background: rgba(255, 255, 255, 0.025);
	}
	.clean-container.selected {
		border-color: var(--color-accent, #4f46e5);
		border-style: solid;
		box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
	}
	.container-label {
		position: absolute;
		top: 8px;
		left: 14px;
		font: 600 9px/1 var(--font-mono, 'Geist Mono', monospace);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-tertiary, #a8a29e);
		background: var(--color-surface, #ffffff);
		padding: 2px 6px;
		border-radius: 4px;
	}
</style>
