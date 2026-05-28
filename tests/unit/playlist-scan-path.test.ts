// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isPathInsideRoot, resolveAllowedOutputDir } from '@main/services/playlistScanPath.js';

describe('isPathInsideRoot', () => {
  it('accepts the root itself and children', () => {
    expect(isPathInsideRoot('/a/b', '/a')).toBe(true);
    expect(isPathInsideRoot('/a', '/a')).toBe(true);
    expect(isPathInsideRoot('/a/../outside', '/a')).toBe(false);
  });
});

describe('resolveAllowedOutputDir', () => {
  it('rejects paths outside allowed roots', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pl-root-'));
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'pl-out-'));
    const result = await resolveAllowedOutputDir(outside, [root]);
    expect(result.ok).toBe(false);
  });

  it('returns canonical path for a subdirectory of an allowed root', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'pl-root-'));
    const child = path.join(root, 'playlist-out');
    await fs.mkdir(child);
    const result = await resolveAllowedOutputDir(child, [root]);
    expect(result).toEqual({ ok: true, path: await fs.realpath(child) });
  });
});
