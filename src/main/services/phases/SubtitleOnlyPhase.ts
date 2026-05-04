import { STATUS_KEY } from '@shared/schemas';
import { DEFAULTS } from '@shared/constants';
import { dedupeSubtitleFiles, logger } from '../subtitlePostProcess';
import type { Phase, PhaseContext, PhaseOutcome } from './types';

export const SubtitleOnlyPhase: Phase = {
  kind: 'subtitle-only',
  async run(ctx: PhaseContext): Promise<PhaseOutcome> {
    const { active, ytDlp } = ctx;
    const { job, input } = active;

    const result = await ytDlp.run(
      {
        kind: 'subtitle',
        url: input.url,
        outputDir: input.outputDir!,
        subtitleLanguages: input.subtitleLanguages ?? [],
        subtitleMode: input.subtitleMode,
        subtitleFormat: input.subtitleFormat ?? DEFAULTS.subtitleFormat,
        writeAutoSubs: input.writeAutoSubs
      },
      {
        onAttempt: (attempt) => {
          if (attempt === 2) return;
          ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken);
        },
        onSpawn: (proc) => ctx.attachYtDlpProcess(proc, STATUS_KEY.fetchingSubtitles),
        onStdout: (text) => ctx.safeConsume(text),
        onStderr: (text) => ctx.safeConsume(text)
      }
    );

    if (active.cancelRequested) return { kind: 'cancelled' };

    if (result.kind !== 'success') {
      logger.warn('subtitle-only fetch failed', { jobId: job.id, kind: result.kind });
      return { kind: 'hard-failed', error: ctx.emitYtdlpFailure(result) };
    }

    if (result.usedExtractorFallback) active.usedExtractorFallback = true;

    if (input.writeAutoSubs) {
      await dedupeSubtitleFiles(active.subtitlePaths, job.id, () => active.cancelRequested);
    }

    return { kind: 'completed' };
  }
};
