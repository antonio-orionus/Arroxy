import { playlistBaseDir } from '@shared/subfolder.js';
import type { AppState } from '../types.js';

// Single source of truth for where a playlist's files land — used by the queue
// builder (download target), the folder scan, and the sync alert (display).
// Derived from the output base + explicit/auto (playlist-title) subfolder; the
// sync "Change folder" action keeps this in sync by writing back base+subfolder
// (see setPlaylistFolder), so there is exactly one representation.
export function resolvePlaylistDir(s: Pick<AppState, 'wizardOutputDir' | 'wizardSubfolderEnabled' | 'wizardSubfolderName' | 'playlistTitle'>): string {
  return playlistBaseDir(s.wizardOutputDir, s.wizardSubfolderEnabled, s.wizardSubfolderName, s.playlistTitle);
}
