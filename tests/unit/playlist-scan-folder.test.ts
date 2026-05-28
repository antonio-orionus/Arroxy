// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanFolderForVideoIds } from '@main/ipc/playlistHandlers.js';

async function tmp(files: string[]): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'scan-'));
  for (const f of files) await fs.writeFile(path.join(dir, f), 'x');
  return dir;
}

describe('scanFolderForVideoIds', () => {
  it('matches ids wrapped in brackets', async () => {
    const dir = await tmp(['Rick Astley [dQw4w9WgXcQ].mp4', 'Other [abc123].webm']);
    expect(await scanFolderForVideoIds(dir, ['dQw4w9WgXcQ', 'zzz'])).toEqual(['dQw4w9WgXcQ']);
  });
  it('returns empty for a missing dir', async () => {
    expect(await scanFolderForVideoIds('/no/such/dir', ['x'])).toEqual([]);
  });
  it('does not partial-match across bracket boundaries', async () => {
    const dir = await tmp(['v [abcd].mp4']);
    expect(await scanFolderForVideoIds(dir, ['abc'])).toEqual([]);
  });
});
