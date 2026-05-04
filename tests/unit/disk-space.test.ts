import { describe, expect, it, vi, beforeEach } from 'vitest';
import { checkDiskSpace } from '@main/utils/diskSpace';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return { ...actual, statfs: vi.fn() };
});

import { statfs } from 'node:fs/promises';

beforeEach(() => {
  vi.clearAllMocks();
});

function mockStatfs(freeBytes: number) {
  // bsize=4096, bavail computed from freeBytes
  const bsize = 4096;
  const bavail = Math.floor(freeBytes / bsize);
  vi.mocked(statfs).mockResolvedValue({ bsize, bavail } as never);
}

describe('checkDiskSpace', () => {
  it('returns ok=true when free space exceeds required×margin', async () => {
    mockStatfs(10_000_000_000); // 10 GB free
    const result = await checkDiskSpace('/some/dir', 4_000_000_000); // 4 GB expected → needs 6 GB with 1.5×
    expect(result.ok).toBe(true);
    expect(result.freeBytes).toBeGreaterThan(0);
  });

  it('returns ok=false when free space is below required×margin', async () => {
    mockStatfs(500_000_000); // 500 MB free
    const result = await checkDiskSpace('/some/dir', 400_000_000); // 400 MB → needs 600 MB with 1.5×
    expect(result.ok).toBe(false);
    expect(result.freeBytes).toBeDefined();
    expect(result.requiredBytes).toBeGreaterThan(result.freeBytes!);
  });

  it('returns ok=true when expectedBytes is undefined (live stream skip)', async () => {
    // statfs should not even be called
    const result = await checkDiskSpace('/some/dir', undefined);
    expect(result.ok).toBe(true);
    expect(statfs).not.toHaveBeenCalled();
  });

  it('requiredBytes = expectedBytes × marginFactor', async () => {
    mockStatfs(0);
    const result = await checkDiskSpace('/some/dir', 1_000_000_000, 2.0);
    expect(result.requiredBytes).toBe(2_000_000_000);
  });

  it('uses default margin of 1.5', async () => {
    mockStatfs(0);
    const result = await checkDiskSpace('/some/dir', 1_000_000_000);
    expect(result.requiredBytes).toBe(1_500_000_000);
  });

  it('returns ok=true and does not throw when statfs throws ENOENT', async () => {
    vi.mocked(statfs).mockRejectedValue(Object.assign(new Error('no such file'), { code: 'ENOENT' }));
    const result = await checkDiskSpace('/nonexistent/dir', 1_000_000_000);
    expect(result.ok).toBe(true);
  });

  it('returns ok=true and does not throw when statfs throws EACCES', async () => {
    vi.mocked(statfs).mockRejectedValue(Object.assign(new Error('permission denied'), { code: 'EACCES' }));
    const result = await checkDiskSpace('/protected/dir', 1_000_000_000);
    expect(result.ok).toBe(true);
  });

  it('returns freeBytes from statfs (bsize × bavail)', async () => {
    vi.mocked(statfs).mockResolvedValue({ bsize: 512, bavail: 1000 } as never);
    await checkDiskSpace('/dir', undefined);
    // skip = true so freeBytes isn't computed from statfs, but with expectedBytes:
    vi.clearAllMocks();
    vi.mocked(statfs).mockResolvedValue({ bsize: 512, bavail: 1000 } as never);
    const r2 = await checkDiskSpace('/dir', 9999);
    expect(r2.freeBytes).toBe(512 * 1000); // 512_000
  });
});
