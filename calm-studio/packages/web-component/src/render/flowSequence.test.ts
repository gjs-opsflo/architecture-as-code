// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { renderFlowSequence } from './flowSequence.js';
import type { CalmArchitecture } from '@calmstudio/calm-core';

const arch: CalmArchitecture = {
  nodes: [
    { 'unique-id': 'admin', 'node-type': 'actor', name: 'Admin', description: 'a' },
    { 'unique-id': 'gateway', 'node-type': 'service', name: 'API Gateway', description: 'g' },
    { 'unique-id': 'inventory', 'node-type': 'service', name: 'Inventory Service', description: 'i' },
    { 'unique-id': 'db', 'node-type': 'database', name: 'Inventory Database', description: 'd' },
  ],
  relationships: [
    { 'unique-id': 'admin-gw', 'relationship-type': { interacts: { actor: 'admin', nodes: ['gateway'] } } },
    { 'unique-id': 'gw-inv', 'relationship-type': { connects: { source: { node: 'gateway' }, destination: { node: 'inventory' } } } },
    { 'unique-id': 'inv-db', 'relationship-type': { connects: { source: { node: 'inventory' }, destination: { node: 'db' } } } },
  ],
  flows: [
    {
      'unique-id': 'stock-check',
      name: 'Inventory Stock Check',
      description: 'Admin checks stock',
      transitions: [
        { 'relationship-unique-id': 'admin-gw', 'sequence-number': 1, description: 'Admin requests inventory status', direction: 'source-to-destination' },
        { 'relationship-unique-id': 'gw-inv', 'sequence-number': 2, description: 'Route to inventory service', direction: 'source-to-destination' },
        { 'relationship-unique-id': 'inv-db', 'sequence-number': 3, description: 'Query current stock levels', direction: 'source-to-destination' },
        { 'relationship-unique-id': 'inv-db', 'sequence-number': 4, description: 'Return stock data', direction: 'destination-to-source' },
        { 'relationship-unique-id': 'gw-inv', 'sequence-number': 5, description: 'Return inventory report', direction: 'destination-to-source' },
      ],
    },
  ],
};

describe('renderFlowSequence', () => {
  it('renders one lifeline column per participating node, in first-appearance order', () => {
    const svg = renderFlowSequence(arch, 'stock-check', { theme: 'light' });
    expect(svg).toContain('<svg');
    for (const name of ['Admin', 'API Gateway', 'Inventory Service', 'Inventory Database']) {
      expect(svg).toContain(name);
    }
    // Non-participants excluded
    expect(svg).not.toContain('Order Service');
    // First-appearance order: Admin left of Gateway left of Inventory left of DB
    const xs = ['participant-admin', 'participant-gateway', 'participant-inventory', 'participant-db'].map(
      (id) => {
        const m = new RegExp(`data-participant="${id.replace('participant-', '')}"[^>]*x="([\\d.]+)"`).exec(svg);
        expect(m).not.toBeNull();
        return Number((m as RegExpExecArray)[1]);
      }
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });

  it('renders one labelled arrow row per transition, ordered by sequence-number', () => {
    const svg = renderFlowSequence(arch, 'stock-check', { theme: 'light' });
    const rows = [...svg.matchAll(/class="seq-arrow" data-seq="(\d+)"/g)].map((m) => Number(m[1]));
    expect(rows).toEqual([1, 2, 3, 4, 5]);
    for (const label of ['Admin requests inventory status', 'Return stock data', 'Return inventory report']) {
      expect(svg).toContain(label);
    }
  });

  it('points reverse transitions right-to-left', () => {
    const svg = renderFlowSequence(arch, 'stock-check', { theme: 'light' });
    // Transition 3 (forward inv->db) and 4 (reverse db->inv) share columns; their
    // arrow x-coordinates must be mirrored.
    const seq3 = /data-seq="3" x1="([\d.]+)" y1="[\d.]+" x2="([\d.]+)"/.exec(svg);
    const seq4 = /data-seq="4" x1="([\d.]+)" y1="[\d.]+" x2="([\d.]+)"/.exec(svg);
    expect(seq3).not.toBeNull();
    expect(seq4).not.toBeNull();
    const f = seq3 as RegExpExecArray;
    const r = seq4 as RegExpExecArray;
    expect(Number(f[1])).toBeLessThan(Number(f[2]));   // forward: left -> right
    expect(Number(r[1])).toBeGreaterThan(Number(r[2])); // reverse: right -> left
  });

  it('throws a loud error for an unknown flow id', () => {
    expect(() => renderFlowSequence(arch, 'nope', { theme: 'light' })).toThrow(/nope/);
  });

  it('is theme aware', () => {
    const light = renderFlowSequence(arch, 'stock-check', { theme: 'light' });
    const dark = renderFlowSequence(arch, 'stock-check', { theme: 'dark' });
    expect(light).not.toEqual(dark);
  });
});
