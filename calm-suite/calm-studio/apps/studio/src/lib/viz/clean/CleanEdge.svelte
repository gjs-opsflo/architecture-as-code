<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanEdge.svelte — single uniform edge renderer for View mode. Dashed light
  gray with a tiny white-filled circle at the midpoint (CalmHub's pattern from
  Mockup 1). All relationship variants render the same way; identity is
  conveyed by the popover on click rather than per-variant arrow styling.
-->
<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/svelte';

	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		markerEnd
	}: EdgeProps = $props();

	const [edgePath, labelX, labelY] = $derived(
		getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
	);
</script>

<BaseEdge
	{id}
	path={edgePath}
	{markerEnd}
	style="stroke: #94a3b8; stroke-width: 1; stroke-dasharray: 4 3; fill: none;"
/>

<!-- Midpoint circle (CalmHub pattern, image 3). Tiny white-filled, light stroke. -->
<circle cx={labelX} cy={labelY} r="3.5" fill="var(--color-surface, #ffffff)" stroke="#94a3b8" stroke-width="1" />
