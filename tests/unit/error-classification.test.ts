import { describe, expect, it, vi } from 'vitest';
import type { YtDlpErrorKind } from '@shared/types.js';
import { classifyYtDlpFailure } from '@main/services/download/errorClassification.js';
import type { DiskProbe } from '@main/services/download/errorClassification.js';
import type { DiskSpaceResult } from '@main/utils/diskSpace.js';
import { STATUS_KEY } from '@shared/schemas.js';
import type { YtDlpResult } from '@main/services/YtDlp.js';

const OUTPUT_DIR = '/output';
const JOB_ID = 'job-1';

function spawnError(): Exclude<YtDlpResult, { kind: 'success' }> {
  return { kind: 'spawn-error', error: new Error('ENOENT: no such file'), stdout: '', stderr: '' };
}

function exitError(errorKind: YtDlpErrorKind, rawError: string | null = null): Exclude<YtDlpResult, { kind: 'success' }> {
  return { kind: 'exit-error', exitCode: 1, errorKind, rawError, stdout: '', stderr: rawError ?? '' };
}

function diskOk(freeBytes = 10_000_000_000): DiskSpaceResult {
  return { ok: true, freeBytes, requiredBytes: 200_000_000 };
}

function diskFull(freeBytes = 100_000): DiskSpaceResult {
  return { ok: false, freeBytes, requiredBytes: 200_000_000 };
}

function diskError(error: string): DiskSpaceResult {
  return { ok: false, freeBytes: undefined, requiredBytes: undefined, error };
}

function diskProbe(result: DiskSpaceResult): DiskProbe {
  return vi.fn<DiskProbe>().mockResolvedValue(result);
}

describe('classifyYtDlpFailure', () => {
  describe('spawn-error path', () => {
    it('returns ytdlpProcessError status key', async () => {
      const result = await classifyYtDlpFailure(spawnError(), OUTPUT_DIR, JOB_ID);
      expect(result.statusKey).toBe(STATUS_KEY.ytdlpProcessError);
    });

    it('returns kind=unknown payload', async () => {
      const result = await classifyYtDlpFailure(spawnError(), OUTPUT_DIR, JOB_ID);
      expect(result.payload.kind).toBe('unknown');
    });

    it('carries error message in payload.raw and params.error', async () => {
      const result = await classifyYtDlpFailure(spawnError(), OUTPUT_DIR, JOB_ID);
      expect(result.payload.raw).toContain('ENOENT');
      expect(result.params?.error).toContain('ENOENT');
    });
  });

  describe('exit-error with known kind', () => {
    it('returns ytdlpExitCode status key for known kinds', async () => {
      const result = await classifyYtDlpFailure(exitError('botBlock'), OUTPUT_DIR, JOB_ID);
      expect(result.statusKey).toBe(STATUS_KEY.ytdlpExitCode);
    });

    it('passes through the error kind unchanged', async () => {
      const result = await classifyYtDlpFailure(exitError('ipBlock'), OUTPUT_DIR, JOB_ID);
      expect(result.payload.kind).toBe('ipBlock');
    });

    it('includes exit code in params', async () => {
      const result = await classifyYtDlpFailure(exitError('rateLimit'), OUTPUT_DIR, JOB_ID);
      expect(result.params?.code).toBe(1);
    });
  });

  describe('exit-error with kind=unknown', () => {
    it('returns ytdlpProcessError when rawError is non-empty', async () => {
      const result = await classifyYtDlpFailure(exitError('unknown', 'some raw message'), OUTPUT_DIR, JOB_ID);
      expect(result.statusKey).toBe(STATUS_KEY.ytdlpProcessError);
    });

    it('carries rawError in params.error', async () => {
      const result = await classifyYtDlpFailure(exitError('unknown', 'Conversion failed!'), OUTPUT_DIR, JOB_ID);
      expect(result.params?.error).toBe('Conversion failed!');
    });

    it('unknown with null rawError falls through to ytdlpExitCode', async () => {
      // rawError=null → `if (kind === 'unknown' && result.rawError)` guard is falsy
      const result = await classifyYtDlpFailure(exitError('unknown', null), OUTPUT_DIR, JOB_ID);
      expect(result.statusKey).toBe(STATUS_KEY.ytdlpExitCode);
    });
  });

  describe('postprocessFailure → disk space upgrade', () => {
    it('reclassifies to outOfDiskSpace when disk probe finds low space', async () => {
      const probe = diskProbe(diskFull());
      const result = await classifyYtDlpFailure(exitError('postprocessFailure', 'ERROR: Postprocessing: Conversion failed!'), OUTPUT_DIR, JOB_ID, probe);
      expect(result.payload.kind).toBe('outOfDiskSpace');
      expect(probe).toHaveBeenCalledWith(OUTPUT_DIR);
      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('keeps postprocessFailure when disk probe confirms OK', async () => {
      const result = await classifyYtDlpFailure(exitError('postprocessFailure', 'ERROR: Postprocessing: Conversion failed!'), OUTPUT_DIR, JOB_ID, diskProbe(diskOk()));
      expect(result.payload.kind).toBe('postprocessFailure');
    });

    it('keeps postprocessFailure when disk probe itself errors (inconclusive)', async () => {
      const result = await classifyYtDlpFailure(exitError('postprocessFailure', 'ERROR: Postprocessing: Conversion failed!'), OUTPUT_DIR, JOB_ID, diskProbe(diskError('ENOENT: statfs failed')));
      expect(result.payload.kind).toBe('postprocessFailure');
    });

    it('does not probe disk for non-postprocess errors', async () => {
      const probe = vi.fn<DiskProbe>();
      await classifyYtDlpFailure(exitError('botBlock'), OUTPUT_DIR, JOB_ID, probe);
      expect(probe).not.toHaveBeenCalled();
    });

    it('does not probe when rawError does not match postprocess pattern', async () => {
      // errorKind=postprocessFailure but rawError lacks the ERROR: prefix — isPostprocessFailure returns false
      const probe = vi.fn<DiskProbe>();
      await classifyYtDlpFailure(exitError('postprocessFailure', 'Conversion failed!'), OUTPUT_DIR, JOB_ID, probe);
      expect(probe).not.toHaveBeenCalled();
    });
  });
});
