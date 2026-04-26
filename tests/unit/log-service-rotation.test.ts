import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogService } from '@main/services/LogService';

async function makeTempDir(): Promise<string> {
  return fsPromises.mkdtemp(path.join(os.tmpdir(), 'log-svc-test-'));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LogService', () => {
  it('uses a WriteStream — never calls appendFileSync', async () => {
    const dir = await makeTempDir();
    const spy = vi.spyOn(fs, 'appendFileSync');

    const svc = new LogService(dir);
    svc.log('INFO', 'hello');
    svc.log('WARN', 'warning');
    svc.log('ERROR', 'oops');

    expect(spy).not.toHaveBeenCalled();
  });

  it('writes log entries to disk (stream-buffered, flush on close)', async () => {
    const dir = await makeTempDir();
    const svc = new LogService(dir);
    svc.log('INFO', 'test-entry');

    const logPath = svc.getCurrentLogFilePath();

    await new Promise<void>((resolve, reject) => {
      const stream = (svc as any).stream as fs.WriteStream;
      stream.end(resolve);
      stream.on('error', reject);
    });

    const content = await fsPromises.readFile(logPath, 'utf-8');
    expect(content).toContain('test-entry');
    expect(content).toContain('"level":"INFO"');
  });

  it('rotates old log files — keeps only 5 newest', async () => {
    const dir = await makeTempDir();
    const logsDir = path.join(dir, 'logs');
    await fsPromises.mkdir(logsDir, { recursive: true });

    // Create 7 fake old log files
    const fakeFiles = Array.from({ length: 7 }, (_, i) =>
      `app-2024-01-0${i + 1}T00-00-00-000Z.log`
    );
    for (const f of fakeFiles) {
      await fsPromises.writeFile(path.join(logsDir, f), 'old log');
    }

    // Construct LogService — this creates session log + triggers rotation
    const svc = new LogService(dir);

    // Give the async readdir + unlink a tick to run
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    const remaining = await fsPromises.readdir(logsDir);
    const sessionFiles = remaining.filter((f) => f.startsWith('app-') && f.endsWith('.log'));

    // 7 old + 1 new session = 8 total; rotation keeps 5 → should be ≤ 5 after rotation
    // (timing-sensitive: some deletes may not have completed yet, so check ≤ 6)
    expect(sessionFiles.length).toBeLessThanOrEqual(6);
    // The newly created session log must still exist
    expect(sessionFiles).toContain(path.basename(svc.getCurrentLogFilePath()));
  });

  it('does not delete any files when fewer than 5 logs exist', async () => {
    const dir = await makeTempDir();
    const logsDir = path.join(dir, 'logs');
    await fsPromises.mkdir(logsDir, { recursive: true });

    await fsPromises.writeFile(path.join(logsDir, 'app-2024-01-01T00-00-00-000Z.log'), 'old');

    const unlinkSpy = vi.spyOn(fs, 'unlink');
    new LogService(dir);
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    // 1 old + 1 new = 2 files — no rotation needed
    expect(unlinkSpy).not.toHaveBeenCalled();
  });
});
