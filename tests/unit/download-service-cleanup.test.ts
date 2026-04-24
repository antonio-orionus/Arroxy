import { describe, expect, it, afterEach } from 'vitest';
import { mkdtemp, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { DownloadService } from '@main/services/DownloadService';

function makeService() {
  return new DownloadService(
    {} as never,
    {} as never,
    { push: async () => {} } as never,
    { log: () => {} } as never,
    true
  );
}

describe('cleanupPartFiles', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    dirs.length = 0;
  });

  it('deletes .part and .ytdl files, leaves other files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cleanup-test-'));
    dirs.push(dir);

    await writeFile(join(dir, 'video.mp4.part'), 'partial data');
    await writeFile(join(dir, 'video.mp4.ytdl'), 'ytdl metadata');
    await writeFile(join(dir, 'video.mp4'), 'completed file');
    await writeFile(join(dir, 'other.txt'), 'unrelated');

    const service = makeService();
    await service.cleanupPartFiles(dir);

    const remaining = await readdir(dir);
    expect(remaining).not.toContain('video.mp4.part');
    expect(remaining).not.toContain('video.mp4.ytdl');
    expect(remaining).toContain('video.mp4');
    expect(remaining).toContain('other.txt');
  });

  it('does nothing when directory is empty', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cleanup-empty-'));
    dirs.push(dir);

    const service = makeService();
    await expect(service.cleanupPartFiles(dir)).resolves.toBeUndefined();
  });

  it('does nothing when directory does not exist', async () => {
    const service = makeService();
    await expect(service.cleanupPartFiles('/nonexistent/path/xyz')).resolves.toBeUndefined();
  });

  it('deletes multiple .part files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cleanup-multi-'));
    dirs.push(dir);

    await writeFile(join(dir, 'video.f137.mp4.part'), 'video stream');
    await writeFile(join(dir, 'video.f251.webm.part'), 'audio stream');
    await writeFile(join(dir, 'video.mp4'), 'completed');

    const service = makeService();
    await service.cleanupPartFiles(dir);

    const remaining = await readdir(dir);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toBe('video.mp4');
  });
});
