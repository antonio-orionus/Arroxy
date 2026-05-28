import { promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { safeFolderName } from '@shared/subfolder.js';
import type { PlaylistManifest } from '@shared/playlistManifest.js';

// Pure: given the manifest and the dir listing, produce extended-M3U text.
// Entries are emitted in playlist order; an item is included only when it has
// a videoId AND a file in `files` contains `[<videoId>]`.
export function buildM3u(manifest: PlaylistManifest, files: string[]): string {
  const lines = ['#EXTM3U'];
  for (const item of manifest.items) {
    if (!item.videoId) continue;
    const match = files.find((n) => n.includes(`[${item.videoId}]`));
    if (!match) continue;
    lines.push(`#EXTINF:${item.duration ?? -1},${item.title}`);
    lines.push(match);
  }
  return lines.join('\n') + '\n';
}

// I/O: read the dir, build, overwrite `<sanitized title>.m3u`. Best-effort —
// failures are swallowed (M3U is a convenience artifact, never blocks a job).
export async function writePlaylistM3u(manifest: PlaylistManifest): Promise<void> {
  let files: string[];
  try {
    files = await fsPromises.readdir(manifest.outputDir);
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
