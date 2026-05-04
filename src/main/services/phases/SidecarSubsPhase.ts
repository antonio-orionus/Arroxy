import { STATUS_KEY } from '@shared/schemas';
import { DEFAULTS } from '@shared/constants';
import { dedupeSubtitleFiles, muxSubtitlesIntoVideo } from '../subtitlePostProcess';
import type { Phase, PhaseContext, PhaseOutcome } from './types';

async function runEmbedMux(ctx: PhaseContext): Promise<void> {
  const { active, ytDlp, logger } = ctx;
  const { job, input } = active;

  const ffmpegPath = ytDlp.ffmpegPath;
  if (!ffmpegPath) {
    logger.log('WARN', 'embed-mux skipped — ffmpeg not available', { jobId: job.id });
    ctx.emitStatus('download', STATUS_KEY.subtitlesFailed);
    return;
  }
  if (!active.mediaPath || active.subtitlePaths.length === 0) {
    logger.log('WARN', 'embed-mux: missing video or sub paths', {
      jobId: job.id,
      videoPath: active.mediaPath,
      subCount: active.subtitlePaths.length
    });
    ctx.emitStatus('download', STATUS_KEY.subtitlesFailed);
    return;
  }

  ctx.emitStatus('download', STATUS_KEY.mergingFormats);

  const result = await muxSubtitlesIntoVideo({
    ffmpegPath,
    videoPath: active.mediaPath,
    subtitlePaths: active.subtitlePaths,
    requestedLangs: input.subtitleLanguages ?? [],
    onSpawn: (proc) => {
      active.ffmpegProcess = proc;
      if (active.cancelRequested) proc.kill('SIGKILL');
    },
    logger,
    jobId: job.id
  });
  active.ffmpegProcess = undefined;

  if (result.ok && result.outputPath) active.mediaPath = result.outputPath;
}

export function SidecarSubsPhase(embedAfter: boolean): Phase {
  return {
    kind: 'sidecar-subs',
    async run(ctx: PhaseContext): Promise<PhaseOutcome> {
      const { active, ytDlp } = ctx;
      const { job, input } = active;

      ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles);

      const subResult = await ytDlp.run(
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
          onSpawn: (proc) => ctx.attachYtDlpProcess(proc),
          onStdout: (text) => ctx.safeConsume(text),
          onStderr: (text) => ctx.safeConsume(text)
        }
      );

      if (subResult.kind !== 'success') {
        ctx.logger.log('WARN', 'Subtitle fetch failed — video already saved', {
          jobId: job.id,
          kind: subResult.kind,
          ...(subResult.kind === 'exit-error' ? { code: subResult.exitCode, signal: subResult.signal } : {})
        });
        return { kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed };
      }

      if (subResult.usedExtractorFallback) active.usedExtractorFallback = true;

      if (input.writeAutoSubs) {
        await dedupeSubtitleFiles(active.subtitlePaths, ctx.logger, job.id, () => active.cancelRequested);
      }

      if (embedAfter) await runEmbedMux(ctx);

      return { kind: 'completed' };
    }
  };
}
