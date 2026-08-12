// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import {
  getConnectsEndpoints,
  getActorAndNodes,
  getContainerAndNodes,
  type CalmArchitecture,
  type CalmRelationship,
} from '@calmstudio/calm-core';
import { getNodeStyle } from './nodeRenderer.js';
import { isFlatRelationship } from './relationshipEdges.js';

export interface FlowSequenceOptions {
  theme?: 'light' | 'dark';
}

const COL_WIDTH = 180;
const COL_GAP = 70;
const BOX_HEIGHT = 56;
const ROW_HEIGHT = 64;
const TOP_PAD = 24;
const SIDE_PAD = 32;

interface Endpoints {
  source: string;
  target: string;
}

/** Resolve a relationship to its primary source/target node ids. */
function relationshipEndpoints(rel: CalmRelationship): Endpoints | undefined {
  if (isFlatRelationship(rel)) {
    return { source: rel.source, target: rel.destination };
  }
  const connects = getConnectsEndpoints(rel);
  if (connects) return { source: connects.source, target: connects.destination };
  const actorNodes = getActorAndNodes(rel);
  if (actorNodes && actorNodes.nodes[0] !== undefined) {
    return { source: actorNodes.actor, target: actorNodes.nodes[0] };
  }
  const containerNodes = getContainerAndNodes(rel);
  if (containerNodes && containerNodes.nodes[0] !== undefined) {
    return { source: containerNodes.container, target: containerNodes.nodes[0] };
  }
  return undefined;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render a CALM flow as a sequence diagram: one lifeline column per
 * participating node (first-appearance order), one horizontal arrow per
 * transition ordered by sequence-number. Reverse (destination-to-source)
 * transitions point right-to-left — direction is visible in the geometry,
 * no styling convention needed.
 */
export function renderFlowSequence(
  arch: CalmArchitecture,
  flowId: string,
  options: FlowSequenceOptions = {}
): string {
  const { theme = 'light' } = options;
  const flow = (arch.flows ?? []).find((f) => f['unique-id'] === flowId);
  if (flow === undefined) {
    throw new Error(`renderFlowSequence: flow "${flowId}" not found in architecture`);
  }

  const relById = new Map((arch.relationships ?? []).map((r) => [r['unique-id'], r] as const));
  const nodeById = new Map((arch.nodes ?? []).map((n) => [n['unique-id'], n] as const));

  const transitions = [...flow.transitions].sort(
    (a, b) => a['sequence-number'] - b['sequence-number']
  );

  // Participants in first-appearance order
  const participants: string[] = [];
  const seen = new Set<string>();
  const resolved: Array<{ seq: number; label: string; from: string; to: string }> = [];
  for (const t of transitions) {
    const rel = relById.get(t['relationship-unique-id']);
    if (rel === undefined) {
      throw new Error(
        `renderFlowSequence: transition ${t['sequence-number']} references unknown relationship "${t['relationship-unique-id']}"`
      );
    }
    const ends = relationshipEndpoints(rel);
    if (ends === undefined) continue;
    const reverse = t.direction === 'destination-to-source';
    const from = reverse ? ends.target : ends.source;
    const to = reverse ? ends.source : ends.target;
    for (const id of [from, to]) {
      if (!seen.has(id)) {
        seen.add(id);
        participants.push(id);
      }
    }
    const label =
      t.description ?? (t as { summary?: string }).summary ?? '';
    resolved.push({ seq: t['sequence-number'], label, from, to });
  }

  const colX = new Map<string, number>();
  participants.forEach((id, i) => {
    colX.set(id, SIDE_PAD + i * (COL_WIDTH + COL_GAP) + COL_WIDTH / 2);
  });

  const width = SIDE_PAD * 2 + participants.length * COL_WIDTH + (participants.length - 1) * COL_GAP;
  const bodyTop = TOP_PAD + BOX_HEIGHT + 16;
  const height = bodyTop + resolved.length * ROW_HEIGHT + 32;

  const bg = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const lifeline = theme === 'dark' ? '#555' : '#c0c7d0';
  const arrowColor = theme === 'dark' ? '#e5e5e5' : '#334155';
  const labelColor = theme === 'dark' ? '#e5e5e5' : '#1f2937';
  const seqFill = '#3b82f6';

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:${bg}" font-family="sans-serif">`
  );
  parts.push(
    `<defs><marker id="seq-arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 z" fill="${arrowColor}"/></marker></defs>`
  );

  // Lifelines behind everything
  for (const id of participants) {
    const x = colX.get(id) ?? 0;
    parts.push(
      `<line x1="${x}" y1="${TOP_PAD + BOX_HEIGHT}" x2="${x}" y2="${height - 16}" stroke="${lifeline}" stroke-width="1.5" stroke-dasharray="4,4"/>`
    );
  }

  // Participant boxes (reuse node-type colors)
  for (const id of participants) {
    const node = nodeById.get(id);
    const style = getNodeStyle(node?.['node-type'] ?? 'system');
    const x = (colX.get(id) ?? 0) - COL_WIDTH / 2;
    const name = node?.name ?? id;
    parts.push(
      `<g data-participant="${escapeXml(id)}">`,
      `<rect data-participant="${escapeXml(id)}" x="${x}" y="${TOP_PAD}" width="${COL_WIDTH}" height="${BOX_HEIGHT}" rx="8" fill="${style.fill}" stroke="${style.stroke}" stroke-width="1.5"/>`,
      `<text x="${x + COL_WIDTH / 2}" y="${TOP_PAD + BOX_HEIGHT / 2}" fill="${style.textColor}" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="central">${escapeXml(name)}</text>`,
      `</g>`
    );
  }

  // Transition arrows
  resolved.forEach((r, i) => {
    const y = bodyTop + i * ROW_HEIGHT + ROW_HEIGHT / 2;
    const x1 = colX.get(r.from) ?? 0;
    const x2 = colX.get(r.to) ?? 0;
    const labelX = (x1 + x2) / 2;
    parts.push(
      `<g class="seq-row">`,
      `<text x="${labelX}" y="${y - 10}" fill="${labelColor}" font-size="12" text-anchor="middle">${escapeXml(r.label)}</text>`,
      `<line class="seq-arrow" data-seq="${r.seq}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${arrowColor}" stroke-width="1.5" marker-end="url(#seq-arrowhead)"/>`,
      `<circle cx="${x1}" cy="${y}" r="9" fill="${seqFill}"/>`,
      `<text x="${x1}" y="${y}" fill="white" font-size="9" font-weight="bold" text-anchor="middle" dominant-baseline="central">${r.seq}</text>`,
      `</g>`
    );
  });

  parts.push('</svg>');
  return parts.join('\n');
}
