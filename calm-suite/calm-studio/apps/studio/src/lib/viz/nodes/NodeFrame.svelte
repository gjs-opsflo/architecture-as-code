<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Badge, Severity } from '@calmstudio/calm-core';

	/**
	 * Visual frame wrapping a node's existing body. Two affordances:
	 *  - A small unobtrusive badge in the top-right (controls count by default).
	 *    Matches CalmHub's `O n` style — single chip, not a cluster.
	 *  - An optional gradient severity-tint border, opt-in via `tintBorder`.
	 *    Off by default so the baseline canvas stays clean. Threat-overlay mode
	 *    flips this on by passing `tintBorder` true from the page.
	 */
	let {
		badges = [],
		severity = 'unknown',
		tintBorder = false,
		children
	}: { badges?: Badge[]; severity?: Severity; tintBorder?: boolean; children: Snippet } = $props();

	const borderColor = $derived(
		!tintBorder
			? 'transparent'
			: (
					{
						low: 'rgba(6, 182, 212, 0.55)',
						medium: 'rgba(245, 158, 11, 0.6)',
						high: 'rgba(249, 115, 22, 0.65)',
						critical: 'rgba(244, 63, 94, 0.75)',
						unknown: 'transparent'
					} as const
				)[severity]
	);

	/**
	 * Pick the single most informative badge to show (CalmHub-style minimal).
	 * Priority order: controls count > first decorator. Others are surfaced via
	 * hover/popover, not crammed onto the card.
	 */
	const primaryBadge = $derived<Badge | null>(
		badges.find((b) => b.source === 'controls') ?? badges[0] ?? null
	);
</script>

<div class="node-frame" style:--sev-border={borderColor} data-severity={severity}>
	{@render children()}
	{#if primaryBadge}
		<span
			class="primary-badge"
			class:has-data={true}
			title={primaryBadge.label ?? primaryBadge.id}
			data-source={primaryBadge.source}
		>
			<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="9" />
			</svg>
			<span class="badge-text">{primaryBadge.data?.count ?? badges.length}</span>
		</span>
	{/if}
</div>

<style>
	.node-frame {
		position: relative;
		border-radius: inherit;
	}
	.node-frame::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(135deg, var(--sev-border) 0%, transparent 65%);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}
	.primary-badge {
		position: absolute;
		top: -6px;
		right: -6px;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 2px 6px;
		border-radius: 8px;
		font: 500 9px/1 var(--font-mono, 'Geist Mono', ui-monospace, monospace);
		color: var(--node-badge-fg, var(--color-accent, #4f46e5));
		background: var(--node-badge-bg, var(--color-accent-subtle, #eef2ff));
		border: 1px solid var(--node-badge-border, rgba(79, 70, 229, 0.18));
		box-shadow: 0 1px 2px rgb(10 10 9 / 0.04);
	}
	.primary-badge .badge-text {
		font-weight: 500;
		letter-spacing: -0.005em;
	}
</style>
