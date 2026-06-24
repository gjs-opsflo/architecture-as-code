// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

/**
 * View vs Edit mode for the canvas. Two distinct surface contracts:
 *
 *   - **Edit**: components palette, tabbed right panel (Properties / Governance /
 *     Detail), status bar, code panel summonable via ⌘'. The full editor.
 *   - **View**: minimal chrome — canvas + floating toolbar + search + minimap +
 *     anchored InlinePopover on selection. Matches calm-hub-ui's read-only
 *     visual baseline.
 *
 * Mode persists per-user in localStorage so a user landing in View mode stays
 * there across reloads. Designed sprint 2026-06-24 — see
 * `sandbox/calm-studio-viz-spike/design-sprint/UX-REDESIGN.md`.
 */

export type ViewMode = 'edit' | 'view';

export interface ModeState {
	readonly mode: ViewMode;
	toggle: () => void;
	setMode: (m: ViewMode) => void;
}

const STORAGE_KEY = 'calm-studio:mode';

function readStored(): ViewMode | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		return v === 'edit' || v === 'view' ? v : null;
	} catch {
		return null;
	}
}

function writeStored(m: ViewMode): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, m);
	} catch {
		// Node 26 / quota / private mode — silently ignore; mode still works in-memory.
	}
}

export function createModeStore(initial: ViewMode = 'edit'): ModeState {
	let mode = $state<ViewMode>(readStored() ?? initial);

	const persist = (m: ViewMode): void => writeStored(m);

	return {
		get mode() {
			return mode;
		},
		toggle: () => {
			mode = mode === 'edit' ? 'view' : 'edit';
			persist(mode);
		},
		setMode: (m: ViewMode) => {
			mode = m;
			persist(mode);
		}
	};
}
