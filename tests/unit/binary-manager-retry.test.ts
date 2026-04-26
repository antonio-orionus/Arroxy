import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BinaryManager } from '@main/services/BinaryManager';
import type { LogService } from '@main/services/LogService';

function makeLogger(): LogService {
  return { log: vi.fn() } as unknown as LogService;
}

async function makeMgr(): Promise<BinaryManager> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-retry-'));
  // Zero delays so tests run instantly
  return new BinaryManager(dir, makeLogger(), [0, 0]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BinaryManager download retry', () => {
  it('retries once on network error and succeeds on second attempt', async () => {
    const mgr = await makeMgr();

    let calls = 0;
    vi.spyOn(mgr as any, 'attemptDownload').mockImplementation(async () => {
      calls++;
      if (calls === 1) throw new Error('connect ECONNREFUSED');
    });

    await mgr.ensureYtDlp();
    expect(calls).toBe(2);
  });

  it('throws after exhausting all 3 attempts', async () => {
    const mgr = await makeMgr();

    let calls = 0;
    vi.spyOn(mgr as any, 'attemptDownload').mockImplementation(async () => {
      calls++;
      throw new Error('HTTP 503');
    });

    await expect(mgr.ensureYtDlp()).rejects.toThrow('HTTP 503');
    expect(calls).toBe(3);
  });

  it('does not retry on checksum mismatch — fails immediately', async () => {
    const mgr = await makeMgr();

    let calls = 0;
    vi.spyOn(mgr as any, 'attemptDownload').mockImplementation(async () => {
      calls++;
      throw new Error('yt-dlp checksum mismatch. Expected abcd1234..., got deadbeef...');
    });

    await expect(mgr.ensureYtDlp()).rejects.toThrow('checksum mismatch');
    expect(calls).toBe(1);
  });

  it('skips download entirely if binary already exists', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getYtDlpPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-binary');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    const spy = vi.spyOn(mgr as any, 'attemptDownload');
    await mgr.ensureYtDlp();

    expect(spy).not.toHaveBeenCalled();
  });
});
