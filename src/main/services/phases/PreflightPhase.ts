import { STATUS_KEY } from '@shared/schemas';
import { checkDiskSpace } from '@main/utils/diskSpace';
import type { LocalizedError } from '@shared/types';
import type { Phase, PhaseContext, PhaseOutcome } from './types';

function formatGB(bytes: number): string {
  return `${Math.round(bytes / 1e8) / 10} GB`;
}

export function PreflightPhase(expectedBytes: number | undefined): Phase {
  return {
    kind: 'preflight',
    async run(ctx: PhaseContext): Promise<PhaseOutcome> {
      const { job } = ctx.active;
      const check = await checkDiskSpace(job.outputDir, expectedBytes);
      if (!check.ok) {
        const rawMessage = `Need ${formatGB(check.requiredBytes!)} free, only ${formatGB(check.freeBytes!)} available`;
        const error: LocalizedError = { key: 'outOfDiskSpace', rawMessage };
        ctx.emitStatus('error', STATUS_KEY.unknownStartupFailure, undefined, error);
        return { kind: 'hard-failed', error };
      }
      return { kind: 'continue' };
    }
  };
}
