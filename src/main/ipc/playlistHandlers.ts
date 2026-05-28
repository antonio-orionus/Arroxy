import { promises as fsPromises } from 'node:fs';
import { z } from 'zod';
import { IPC_CHANNELS } from '@shared/ipc.js';
import { playlistManifestSchema } from '@shared/schemas.js';
import { ok } from '@shared/result.js';
import type { PlaylistManifestStore } from '@main/stores/PlaylistManifestStore.js';
import { handle, toUnknownFailure } from './utils.js';

const scanInputSchema = z.object({ outputDir: z.string().min(1), videoIds: z.array(z.string()) });

// Match `[<id>]` as a delimited substring. Brackets make fixed-width ids
// collision-safe. Note: ids are matched raw — for YouTube (alnum/-/_) this
// equals yt-dlp's sanitized form; slug-id extractors may differ and fall
// through to a worst-case re-download (documented in the spec).
export async function scanFolderForVideoIds(outputDir: string, videoIds: string[]): Promise<string[]> {
  let names: string[];
  try {
    names = await fsPromises.readdir(outputDir);
  } catch {
    return [];
  }
  return videoIds.filter((id) => names.some((n) => n.includes(`[${id}]`)));
}

export function registerPlaylistHandlers(manifestStore: PlaylistManifestStore): void {
  handle(IPC_CHANNELS.playlistScanFolder, scanInputSchema, async ({ outputDir, videoIds }) => {
    try {
      return ok({ matchedIds: await scanFolderForVideoIds(outputDir, videoIds) });
    } catch (err) {
      return toUnknownFailure(err);
    }
  });

  handle(IPC_CHANNELS.playlistRegisterManifest, playlistManifestSchema, async (manifest) => {
    try {
      await manifestStore.save(manifest);
      return ok(undefined);
    } catch (err) {
      return toUnknownFailure(err);
    }
  });
}
