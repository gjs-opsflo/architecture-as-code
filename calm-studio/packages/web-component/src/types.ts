// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

export interface CalmDiagramProps {
  src?: string;
  data?: string;
  theme?: 'light' | 'dark';
  flow?: string;
  /** How a flow renders: 'sequence' (default) or the legacy 'overlay' animation. */
  flowView?: 'sequence' | 'overlay';
  containers?: 'nested' | 'edges';
}
