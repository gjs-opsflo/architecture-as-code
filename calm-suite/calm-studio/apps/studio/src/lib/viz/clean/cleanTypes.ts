// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Svelte Flow nodeTypes / edgeTypes maps for the View-mode greenfield canvas.
 * All CALM node types route through a single CleanNode; containers go to
 * CleanContainer. All edges go through one CleanEdge. This is the deliberate
 * inverse of Studio's per-type bespoke components — uniform clean treatment
 * matches CalmHub's visual approach.
 */

import type { Component } from 'svelte';
import CleanNode from './CleanNode.svelte';
import CleanContainer from './CleanContainer.svelte';
import CleanEdge from './CleanEdge.svelte';

const NODE_TYPES = [
	'actor',
	'system',
	'service',
	'database',
	'network',
	'webclient',
	'ldap',
	'ecosystem',
	'data-asset',
	'generic',
	'extension'
] as const;

export const cleanNodeTypes: Record<string, Component> = {
	container: CleanContainer as Component,
	...Object.fromEntries(NODE_TYPES.map((t) => [t, CleanNode as Component]))
};

export const cleanEdgeTypes: Record<string, Component> = {
	connects: CleanEdge as Component,
	interacts: CleanEdge as Component,
	'composed-of': CleanEdge as Component,
	'deployed-in': CleanEdge as Component,
	options: CleanEdge as Component
};
