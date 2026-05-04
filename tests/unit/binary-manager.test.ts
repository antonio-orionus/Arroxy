import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { binaryInternals } from '@main/services/BinaryManager';

describe('binaryInternals', () => {
  it('parses SHA lines', () => {
    const sha = binaryInternals.parseShaLine('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  yt-dlp.exe', 'yt-dlp.exe');

    expect(sha).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  });

  it('computes file sha256', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sha-test-'));
    const filePath = path.join(tempDir, 'test.bin');
    await fs.writeFile(filePath, 'hello world', 'utf-8');

    const digest = await binaryInternals.sha256ForFile(filePath);
    expect(digest).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });
});
