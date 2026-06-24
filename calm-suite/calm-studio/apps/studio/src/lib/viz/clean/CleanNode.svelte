<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanNode.svelte — single parameterised node renderer for the CalmHub-clone
  View mode. Replaces Studio's per-type bespoke node components. Matches
  Mockup 1 + 2: white card, 1px subtle border, icon top-left, label, type
  label below, single outside-corner ⊙ⁿ badge driven by data.badges /
  data.severity. No ValidationBadge clutter, no protocol pills inline. Detail
  surfaces via the InlinePopover on click (handled at canvas level).
-->
<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { Badge, Severity } from '@calmstudio/calm-core';
	import CleanIcon from './CleanIcon.svelte';

	let { id, data, selected }: NodeProps = $props();

	const calmType = $derived(((data as Record<string, unknown>).calmType as string) ?? 'generic');
	const calmId = $derived(((data as Record<string, unknown>).calmId as string) ?? id);
	const label = $derived(((data as Record<string, unknown>).label as string) ?? calmId);
	const badges = $derived(((data as Record<string, unknown>).badges as Badge[]) ?? []);
	const severity = $derived(((data as Record<string, unknown>).severity as Severity) ?? 'unknown');
	const tintBorder = $derived(((data as Record<string, unknown>).tintBorder as boolean) ?? false);

	const primaryBadge = $derived<Badge | null>(
		badges.find((b) => b.source === 'controls') ?? badges[0] ?? null
	);

	const sevBorder = $derived(
		!tintBorder
			? 'transparent'
			: (
					{
						low: '#06b6d4',
						medium: '#f59e0b',
						high: '#f97316',
						critical: '#f43f5e',
						unknown: 'transparent'
					} as const
				)[severity]
	);
</script>

<Handle type="target" position={Position.Top} />
<Handle type="source" position={Position.Bottom} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Right} />

<div
	class="clean-node"
	class:selected
	class:tinted={tintBorder && sevBorder !== 'transparent'}
	style:--sev-border={sevBorder}
	data-calm-type={calmType}
>
	<div class="row">
		<span class="ico"><CleanIcon type={calmType} /></span>
		<span class="lbl" title={label}>{label}</span>
	</div>
	{#if calmType && calmType !== 'generic'}
		<div class="typ">{calmType}</div>
	{/if}
	{#if primaryBadge}
		<span
			class="badge"
			title={primaryBadge.label ?? primaryBadge.id}
			data-source={primaryBadge.source}
		>
			<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="9" />
			</svg>
			<span class="num">{primaryBadge.data?.count ?? badges.length}</span>
		</span>
	{/if}
</div>

<style>
	.clean-node {
		position: relative;
		background: var(--color-surface, #ffffff);
		border: 1px solid var(--color-border, #d4d4cf);
		border-radius: 8px;
		padding: 10px 12px;
		min-width: 130px;
		font-family: var(--font-sans, 'Geist', sans-serif);
		box-shadow: 0 1px 2px rgb(10 10 9 / 0.04), 0 1px 1px rgb(10 10 9 / 0.06);
		transition: box-shadow 150ms ease, border-color 150ms ease;
		cursor: default;
		user-select: none;
	}
	.clean-node:hover {
		box-shadow: 0 2px 6px rgb(10 10 9 / 0.06), 0 1px 2px rgb(10 10 9 / 0.06);
	}
	.clean-node.selected {
		border-color: var(--color-accent, #4f46e5);
		box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.16), 0 2px 6px rgb(10 10 9 / 0.06);
	}
	.clean-node.tinted {
		border-color: var(--sev-border);
		border-width: 1.5px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}
	.ico {
		width: 18px;
		height: 18px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary, #57534e);
		flex-shrink: 0;
	}
	.lbl {
		font: 500 12px/1.1 var(--font-sans, 'Geist', sans-serif);
		color: var(--color-text-primary, #0a0a09);
		letter-spacing: -0.005em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}
	.typ {
		font: 500 9px/1 var(--font-mono, 'Geist Mono', ui-monospace, monospace);
		color: var(--color-text-tertiary, #a8a29e);
		margin-top: 4px;
		text-transform: lowercase;
		letter-spacing: 0.02em;
	}
	.badge {
		position: absolute;
		top: -6px;
		right: -6px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 6px;
		border-radius: 8px;
		background: var(--color-accent-subtle, #eef2ff);
		border: 1px solid rgba(79, 70, 229, 0.18);
		color: var(--color-accent, #4f46e5);
		font: 500 9px/1 var(--font-mono, 'Geist Mono', monospace);
		box-shadow: 0 1px 2px rgb(10 10 9 / 0.04);
	}
	.badge .num {
		letter-spacing: -0.005em;
	}
</style>
