<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanEdge.svelte — single uniform edge renderer for View mode. Dashed light
  gray with a tiny white-filled circle at the midpoint (CalmHub's pattern from
  Mockup 1). All relationship variants render the same way; identity is
  conveyed by the popover on click rather than per-variant arrow styling.
-->
<script lang="ts">
	import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/svelte';

	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		markerEnd,
		data
	}: EdgeProps = $props();

	// Orthogonal (right-angle) routing avoids edges passing through unrelated nodes.
	// borderRadius rounds the corners — purely visual, matches CalmHub.
	const [edgePath, labelX, labelY] = $derived(
		getSmoothStepPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition,
			borderRadius: 6
		})
	);

	const dimmed = $derived((data as Record<string, unknown> | undefined)?.dimmed === true);
</script>

<g style={dimmed ? 'opacity: 0.06' : ''}>
	<BaseEdge
		{id}
		path={edgePath}
		{markerEnd}
		style="stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 4 3; fill: none;"
	/>
	{#if !dimmed}
		<circle cx={labelX} cy={labelY} r="3.5" fill="var(--color-surface, #ffffff)" stroke="#94a3b8" stroke-width="1" />
	{/if}
</g>
