import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BinaryManager } from '@main/services/BinaryManager';

async function makeMgr(): Promise<BinaryManager> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-retry-'));
  // Zero delays so tests run instantly
  return new BinaryManager(dir, [0, 0]);
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

  it('skips download when binary exists and version is current', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getYtDlpPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-binary');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    vi.spyOn(mgr as any, 'getLocalYtDlpVersion').mockResolvedValue('2025.01.15');
    vi.spyOn(mgr as any, 'getRemoteYtDlpVersion').mockResolvedValue('2025.01.15');

    const spy = vi.spyOn(mgr as any, 'attemptDownload');
    await mgr.ensureYtDlp();

    expect(spy).not.toHaveBeenCalled();
  });

  it('re-downloads yt-dlp when local version is outdated', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getYtDlpPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-binary');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    vi.spyOn(mgr as any, 'getLocalYtDlpVersion').mockResolvedValue('2024.11.01');
    vi.spyOn(mgr as any, 'getRemoteYtDlpVersion').mockResolvedValue('2025.01.15');

    const spy = vi.spyOn(mgr as any, 'attemptDownload').mockResolvedValue(undefined);
    await mgr.ensureYtDlp();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('re-downloads yt-dlp when local version cannot be determined', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getYtDlpPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-binary');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    vi.spyOn(mgr as any, 'getLocalYtDlpVersion').mockResolvedValue(null);
    vi.spyOn(mgr as any, 'getRemoteYtDlpVersion').mockResolvedValue('2025.01.15');

    const spy = vi.spyOn(mgr as any, 'attemptDownload').mockResolvedValue(undefined);
    await mgr.ensureYtDlp();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('skips download when remote version is unreachable', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getYtDlpPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-binary');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    vi.spyOn(mgr as any, 'getLocalYtDlpVersion').mockResolvedValue('2025.01.15');
    vi.spyOn(mgr as any, 'getRemoteYtDlpVersion').mockResolvedValue(null);

    const spy = vi.spyOn(mgr as any, 'attemptDownload');
    await mgr.ensureYtDlp();

    expect(spy).not.toHaveBeenCalled();
  });

  it('does not version-check ffmpeg (no isUpToDate configured)', async () => {
    const mgr = await makeMgr();
    const binaryPath = mgr.getFfmpegPath();
    await fs.mkdir(path.dirname(binaryPath), { recursive: true });
    await fs.writeFile(binaryPath, 'fake-ffmpeg');
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);

    const spy = vi.spyOn(mgr as any, 'attemptDownload');
    await mgr.ensureFFmpeg();

    expect(spy).not.toHaveBeenCalled();
  });
});
