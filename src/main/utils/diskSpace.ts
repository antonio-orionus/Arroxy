import { statfs } from 'node:fs/promises';

export interface DiskSpaceResult {
  ok: boolean;
  freeBytes: number | undefined;
  requiredBytes: number | undefined;
}

export async function checkDiskSpace(dir: string, expectedBytes: number | undefined, marginFactor = 1.5): Promise<DiskSpaceResult> {
  if (expectedBytes === undefined) {
    return { ok: true, freeBytes: undefined, requiredBytes: undefined };
  }

  const requiredBytes = expectedBytes * marginFactor;

  try {
    const stats = await statfs(dir);
    const freeBytes = stats.bavail * stats.bsize;
    return { ok: freeBytes >= requiredBytes, freeBytes, requiredBytes };
  } catch {
    return { ok: true, freeBytes: undefined, requiredBytes };
  }
}
