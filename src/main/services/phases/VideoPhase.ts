import { STATUS_KEY } from '@shared/schemas';
import type { YtDlpRequest } from '../YtDlp';
import type { Phase, PhaseContext, PhaseOutcome } from './types';

export function VideoPhase(embed: boolean): Phase {
  return {
    kind: embed ? 'video+embed' : 'video',
    async run(ctx: PhaseContext): Promise<PhaseOutcome> {
      const { active, ytDlp } = ctx;
      const { input } = active;

      const req: YtDlpRequest = embed && (input.subtitleLanguages?.length ?? 0) > 0
        ? {
            kind: 'video+embed',
            url: input.url,
            outputDir: input.outputDir!,
            formatId: input.formatId,
            subtitleLanguages: input.subtitleLanguages!,
            writeAutoSubs: input.writeAutoSubs,
          }
        : {
            kind: 'video',
            url: input.url,
            outputDir: input.outputDir!,
            formatId: input.formatId,
          };

      const result = await ytDlp.run(req, {
        onAttempt: (attempt) => {
          if (attempt === 2) return;
          ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken);
        },
        onSpawn: (proc) => ctx.attachYtDlpProcess(proc, STATUS_KEY.downloadingMedia),
        onStdout: (text) => ctx.safeConsume(text),
        onStderr: (text) => ctx.safeConsume(text),
      });

      if (active.pauseRequested) return { kind: 'paused' };
      if (active.cancelRequested) return { kind: 'cancelled' };

      if (result.kind !== 'success') {
        return { kind: 'hard-failed', error: ctx.emitYtdlpFailure(result) };
      }

      if (result.usedExtractorFallback) active.usedExtractorFallback = true;
      return { kind: 'continue' };
    }
  };
}
