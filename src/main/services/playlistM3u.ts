import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { findPlayableFileName, sanitizeM3uTitle } from '@shared/playlistMedia.js';
import { safeFolderName } from '@shared/subfolder.js';
import type { PlaylistManifest } from '@shared/playlistManifest.js';

/**
 * Pure: given the manifest and the dir listing, produce extended-M3U text.
 * Entries are emitted in playlist order; an item is included only when it has
 * a videoId AND a playable media file whose name ends with `[<videoId>].<ext>`.
 *
 * The manifest holds the *entire* probed playlist (every entry), not just the
 * items the user queued this run — see `submitWizardToQueue`, which registers
 * `playlistItems` while queueing only the selected subset. Combined with the
 * disk scan here, that makes the M3U self-healing across partial downloads:
 *
 * - Sync-with-folder: re-adding an already-downloaded playlist queues only the
 *   newly-added videos, yet when one finishes the M3U is rebuilt from the full
 *   manifest and lists every file on disk (old + new) — the new entries are
 *   effectively appended, in playlist order, overwriting the prior `.m3u`.
 * - A skipped/failed item simply isn't on disk, so it's omitted until a later
 *   run downloads it, at which point the next rebuild includes it.
 */
export function buildM3u(manifest: PlaylistManifest, files: string[]): string {
  const lines = ['#EXTM3U'];
  for (const item of manifest.items) {
    if (!item.videoId) continue;
    const match = findPlayableFileName(files, item.videoId);
    if (!match) continue;
    const title = sanitizeM3uTitle(item.title);
    lines.push(`#EXTINF:${item.duration ?? -1},${title}`);
    lines.push(match);
  }
  return lines.join('\n') + '\n';
}

// I/O: read the dir, build, overwrite `<sanitized title>.m3u`. Best-effort —
// failures are swallowed (M3U is a convenience artifact, never blocks a job).
export async function writePlaylistM3u(manifest: PlaylistManifest): Promise<void> {
  let files: string[];
  try {
    const entries = await fsPromises.readdir(manifest.outputDir, { withFileTypes: true });
    files = entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return;
  }
  const body = buildM3u(manifest, files);
  const fileName = `${safeFolderName(manifest.playlistTitle || 'Playlist')}.m3u`;
  try {
    await fsPromises.writeFile(path.join(manifest.outputDir, fileName), body, 'utf8');
  } catch {
    /* best-effort */
  }
}
