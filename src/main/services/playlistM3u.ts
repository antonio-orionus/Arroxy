import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { findPlayableFileName, sanitizeM3uTitle } from '@shared/playlistMedia.js';
import { safeFolderName } from '@shared/subfolder.js';
import type { PlaylistManifest } from '@shared/playlistManifest.js';

// Pure: given the manifest and the dir listing, produce extended-M3U text.
// Entries are emitted in playlist order; an item is included only when it has
// a videoId AND a playable media file whose name ends with `[<videoId>].<ext>`.
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
