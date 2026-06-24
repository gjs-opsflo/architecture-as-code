<!--
  SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
  SPDX-License-Identifier: Apache-2.0

  CleanIcon.svelte — single icon resolver for CleanNode. Maps calmType to a
  Lucide SVG path. Lightweight: inline SVGs (no extra dependency).
-->
<script lang="ts">
	let { type }: { type: string } = $props();

	const baseType = $derived(type.startsWith('ai:') ? type : type.toLowerCase());
</script>

{#if baseType === 'actor'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<circle cx="12" cy="8" r="4" />
		<path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
	</svg>
{:else if baseType === 'system'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<rect x="7" y="7" width="10" height="10" rx="1" stroke-width="1.2" />
	</svg>
{:else if baseType === 'service'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.51.22.85.71.85 1.27 0 .56-.34 1.05-.85 1.27" />
	</svg>
{:else if baseType === 'database'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<ellipse cx="12" cy="5" rx="9" ry="3" />
		<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
		<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
	</svg>
{:else if baseType === 'network'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<rect x="2" y="13" width="20" height="8" rx="1" />
		<path d="M7 17h.01M12 17h.01M17 17h.01" stroke-width="2" />
		<path d="M9 13V7M15 13V7" />
		<rect x="6" y="3" width="12" height="4" rx="1" />
	</svg>
{:else if baseType === 'webclient'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<line x1="2" y1="20" x2="22" y2="20" />
		<line x1="8" y1="17" x2="8" y2="20" />
		<line x1="16" y1="17" x2="16" y2="20" />
	</svg>
{:else if baseType === 'ldap'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M12 2 L22 7 V17 L12 22 L2 17 V7 Z" />
		<path d="M2 7l10 5 10-5M12 12v10" />
	</svg>
{:else if baseType === 'ecosystem'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<circle cx="12" cy="12" r="10" />
		<path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
	</svg>
{:else if baseType === 'data-asset'}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<line x1="9" y1="13" x2="15" y2="13" />
		<line x1="9" y1="17" x2="15" y2="17" />
	</svg>
{:else if baseType.startsWith('ai:')}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<polygon points="12 2 2 7 12 12 22 7 12 2" />
		<polyline points="2 17 12 22 22 17" />
		<polyline points="2 12 12 17 22 12" />
	</svg>
{:else}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<rect x="3" y="3" width="18" height="18" rx="2" />
	</svg>
{/if}
