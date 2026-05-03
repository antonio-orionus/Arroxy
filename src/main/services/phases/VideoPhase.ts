import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { STATUS_KEY } from '@shared/schemas';
import type { YtDlpRequest } from '../YtDlp';
import type { Phase, PhaseContext, PhaseOutcome } from './types';

async function setupTempDir(outputDir: string, jobId: string): Promise<string | undefined> {
  const tempDir = join(outputDir, '.arroxy-temp', jobId.slice(0, 8));
  try {
    await rm(tempDir, { recursive: true, force: true });
    await mkdir(tempDir, { recursive: true });
    return tempDir;
  } catch {
    return undefined;
  }
}

export function VideoPhase(embed: boolean): Phase {
  return {
    kind: embed ? 'video+embed' : 'video',
    async run(ctx: PhaseContext): Promise<PhaseOutcome> {
      const { active, ytDlp } = ctx;
      const { input, job } = active;

      const tempDir = await setupTempDir(job.outputDir, job.id);
      if (tempDir) active.tempDir = tempDir;

      const sbConfig = input.sponsorBlockMode && input.sponsorBlockMode !== 'off' && input.sponsorBlockCategories?.length
        ? { mode: input.sponsorBlockMode as Exclude<typeof input.sponsorBlockMode, 'off'>, categories: input.sponsorBlockCategories }
        : undefined;

      const req: YtDlpRequest = embed && (input.subtitleLanguages?.length ?? 0) > 0
        ? {
            kind: 'video+embed',
            url: input.url,
            outputDir: input.outputDir!,
            tempDir,
            formatId: input.formatId,
            subtitleLanguages: input.subtitleLanguages!,
            writeAutoSubs: input.writeAutoSubs,
            sponsorBlock: sbConfig,
            embedChapters: input.embedChapters,
            embedMetadata: input.embedMetadata,
            embedThumbnail: input.embedThumbnail,
            writeDescription: input.writeDescription,
            writeThumbnail: input.writeThumbnail,
          }
        : {
            kind: 'video',
            url: input.url,
            outputDir: input.outputDir!,
            tempDir,
            formatId: input.formatId,
            sponsorBlock: sbConfig,
            embedChapters: input.embedChapters,
            embedMetadata: input.embedMetadata,
            embedThumbnail: input.embedThumbnail,
            writeDescription: input.writeDescription,
            writeThumbnail: input.writeThumbnail,
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
