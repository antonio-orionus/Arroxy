import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { nowIso } from '@main/utils/clock';
import { createAppError } from '@main/utils/errorFactory';
import { splitStderrLines } from '@main/utils/process';
import { parsePercentFromLine } from '@main/utils/progress';
import { fail, ok, type Result } from '@shared/result';
import type {
  CancelDownloadOutput,
  DownloadJob,
  LocalizedError,
  PauseDownloadOutput,
  ProgressEvent,
  RecentJob,
  StartDownloadInput,
  StartDownloadOutput,
  StatusEvent,
  StatusKey
} from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { LogService } from './LogService';
import type { RecentJobsStore } from '@main/stores/RecentJobsStore';
import type { TokenService } from './TokenService';
import { runYtDlp, type RunYtDlpResult } from './ytDlpRunner';

interface ActiveDownload {
  job: DownloadJob;
  cancelRequested: boolean;
  pauseRequested: boolean;
  process?: ChildProcessWithoutNullStreams;
  mockTimer?: NodeJS.Timeout;
}

function killProcessTree(proc: ChildProcessWithoutNullStreams, signal: NodeJS.Signals): void {
  if (proc.pid == null) {
    proc.kill(signal);
    return;
  }
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { windowsHide: true });
    return;
  }
  try { process.kill(-proc.pid, signal); } catch { proc.kill(signal); }
}

export class DownloadService extends EventEmitter {
  private activeJobs = new Map<string, ActiveDownload>();
  private pausedJobs = new Map<string, DownloadJob>();
  // Tracks which file yt-dlp is currently downloading per job. Updated from
  // [download] Destination: lines so progress can suppress per-sub percents
  // (which would otherwise peg the bar at 100% for tiny .vtt files) and emit
  // accurate fetchingSubtitles vs downloadingMedia status transitions.
  private currentFileKind = new Map<string, 'subtitle' | 'media'>();

  constructor(
    private readonly binaryManager: BinaryManager,
    private readonly tokenService: TokenService,
    private readonly recentJobsStore: RecentJobsStore,
    private readonly logger: LogService,
    private readonly mockMode = false
  ) {
    super();
  }

  get activeCount(): number {
    return this.activeJobs.size;
  }

  get pendingCancelCount(): number {
    let count = 0;
    for (const active of this.activeJobs.values()) {
      if (!active.cancelRequested && !active.pauseRequested) count++;
    }
    return count;
  }

  async start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>> {
    const now = nowIso();
    const job: DownloadJob = {
      id: randomUUID(),
      url: input.url,
      outputDir: input.outputDir ?? '',
      formatId: input.formatId,
      status: 'running',
      createdAt: now,
      updatedAt: now
    };

    this.activeJobs.set(job.id, { job, cancelRequested: false, pauseRequested: false });
    this.logger.log('INFO', 'Download job created', { jobId: job.id, url: job.url, formatId: job.formatId, outputDir: job.outputDir });

    try {
      this.emitStatus(job.id, 'setup', 'preparingBinaries');
      const ytDlpPath = await this.binaryManager.ensureYtDlp((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });
      const ffmpegPath = await this.binaryManager.ensureFFmpeg((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });

      if (this.activeJobs.get(job.id)?.cancelRequested) {
        this.logger.log('INFO', 'Download cancelled before binary setup completed', { jobId: job.id });
        this.emitStatus(job.id, 'error', 'cancelled');
        await this.finalize(job, 'cancelled');
        return fail(createAppError('download', 'Download cancelled before start'));
      }

      if (this.mockMode) {
        this.emitStatus(job.id, 'token', 'mintingToken');
        this.emitStatus(job.id, 'download', 'startingYtdlp');
        this.startMockDownload(job.id);
        return ok({ job });
      }

      const embedMode = input.subtitleMode === 'embed' && !!input.subtitleLanguages?.length;
      const subtitleOnly = !input.formatId && !!input.subtitleLanguages?.length;

      const safeConsume = (chunk: string): void => {
        try { this.consumeProgress(job.id, chunk); } catch { /* swallow */ }
      };

      const buildSubArgs = (): string[] => {
        const subFormat = input.subtitleFormat ?? 'srt';
        const subOutputDir = input.subtitleMode === 'subfolder'
          ? `${input.outputDir}/Subtitles`
          : input.outputDir;
        return [
          '--skip-download', '--no-playlist',
          '--write-subs', '--sub-langs', input.subtitleLanguages!.join(','),
          ...(input.writeAutoSubs ? ['--write-auto-subs'] : []),
          '--sleep-subtitles', '3',
          '--sub-format', `${subFormat}/best`,
          '--convert-subs', subFormat,
          '-o', `${subOutputDir}/%(title)s.%(ext)s`, input.url
        ];
      };

      const emitYtdlpFailure = (result: RunYtDlpResult): LocalizedError => {
        if (result.spawnError) {
          const payload: LocalizedError = { key: null, rawMessage: result.spawnError.message };
          this.emitStatus(job.id, 'error', 'ytdlpProcessError', { error: result.spawnError.message }, payload);
          return payload;
        }
        const payload: LocalizedError = { key: result.errorClass, rawMessage: result.rawError ?? undefined };
        if (result.errorClass) {
          this.emitStatus(job.id, 'error', 'ytdlpExitCode', { code: result.exitCode ?? -1 }, payload);
        } else if (result.rawError) {
          this.emitStatus(job.id, 'error', 'ytdlpProcessError', { error: result.rawError }, payload);
        } else {
          this.emitStatus(job.id, 'error', 'ytdlpExitCode', { code: result.exitCode ?? -1 }, payload);
        }
        return payload;
      };

      if (subtitleOnly) {
        // No media to download — only fetch subs. Failure here is HARD: nothing
        // ends up on disk, unlike phase 2 of a normal download where the video
        // is already saved before subs are attempted.
        void runYtDlp({
          url: input.url,
          ytDlpPath,
          ffmpegPath,
          args: buildSubArgs(),
          tokenService: this.tokenService,
          onAttempt: (attempt) => {
            this.emitStatus(job.id, 'token', attempt === 0 ? 'mintingToken' : 'remintingToken');
          },
          onSpawn: (proc) => {
            this.emitStatus(job.id, 'download', 'fetchingSubtitles');
            const active = this.activeJobs.get(job.id);
            if (!active) return;
            active.process = proc;
            if (active.cancelRequested) proc.kill('SIGKILL');
          },
          onStdout: safeConsume,
          onStderr: safeConsume
        }).then(async (result) => {
          const activeEntry = this.activeJobs.get(job.id);
          if (activeEntry?.cancelRequested) {
            await this.cleanupPartFiles(job.outputDir);
            this.emitStatus(job.id, 'error', 'cancelled');
            await this.finalize(job, 'cancelled');
            return;
          }
          if (result.spawnError || result.exitCode !== 0) {
            this.logger.log('ERROR', 'subtitle-only download failed', { jobId: job.id, code: result.exitCode, signal: result.errorClass });
            const payload = emitYtdlpFailure(result);
            await this.finalize(job, 'failed', payload);
            return;
          }
          this.emitStatus(job.id, 'done', 'complete');
          await this.finalize(job, 'completed');
        });
        return ok({ job });
      }

      // Phase 1: video + audio. When embed mode is active, subtitle flags are included
      // here so yt-dlp can embed during the mux. Otherwise subs are suppressed and
      // fetched in a separate phase so a 429 can't fail the video download.
      const videoArgs = ['--progress', '--no-playlist'];
      if (embedMode) {
        // mkv embeds vtt natively as a webvtt stream — no --convert-subs needed.
        // mp4+mov_text muxing is unreliable across YouTube's auto-caption variants
        // (see refs/GDownloader source comment, refs/omniget error-recovery path).
        // --compat-options no-keep-subs deletes the sidecar .vtt files after embed.
        videoArgs.push(
          '--write-subs', '--embed-subs',
          '--sub-langs', input.subtitleLanguages!.join(','),
          '--merge-output-format', 'mkv',
          '--compat-options', 'no-keep-subs',
          '--sleep-subtitles', '3'
        );
        if (input.writeAutoSubs) videoArgs.push('--write-auto-subs');
      } else {
        videoArgs.push('--no-write-subs', '--no-write-auto-subs');
      }
      if (input.formatId) videoArgs.push('-f', input.formatId);
      videoArgs.push('-o', `${input.outputDir}/%(title)s.%(ext)s`, input.url);

      void runYtDlp({
        url: input.url,
        ytDlpPath,
        ffmpegPath,
        args: videoArgs,
        tokenService: this.tokenService,
        onAttempt: (attempt) => {
          this.emitStatus(
            job.id,
            'token',
            attempt === 0 ? 'mintingToken' : 'remintingToken'
          );
        },
        onSpawn: (proc) => {
          this.emitStatus(job.id, 'download', 'downloadingMedia');
          const active = this.activeJobs.get(job.id);
          if (!active) return;
          active.process = proc;
          if (active.cancelRequested) proc.kill('SIGKILL');
        },
        onStdout: safeConsume,
        onStderr: safeConsume
      }).then(async (result) => {
        const activeEntry = this.activeJobs.get(job.id);

        if (activeEntry?.pauseRequested) {
          this.activeJobs.delete(job.id);
          this.pausedJobs.set(job.id, job);
          this.logger.log('INFO', 'Download paused — .part file preserved', { jobId: job.id, outputDir: job.outputDir });
          return;
        }

        if (activeEntry?.cancelRequested) {
          await this.cleanupPartFiles(job.outputDir);
          this.emitStatus(job.id, 'error', 'cancelled');
          await this.finalize(job, 'cancelled');
          return;
        }

        if (result.spawnError) {
          this.logger.log('ERROR', 'yt-dlp spawn error', { message: result.spawnError.message, jobId: job.id });
          this.emitStatus(job.id, 'error', 'ytdlpProcessError', { error: result.spawnError.message }, {
            key: null,
            rawMessage: result.spawnError.message
          });
          await this.finalize(job, 'failed', { key: null, rawMessage: result.spawnError.message });
          return;
        }

        if (result.exitCode !== 0) {
          this.logger.log('ERROR', 'yt-dlp download failed', { jobId: job.id, code: result.exitCode, signal: result.errorClass });

          const errorPayload: LocalizedError = {
            key: result.errorClass,
            rawMessage: result.rawError ?? undefined
          };

          if (result.errorClass) {
            this.emitStatus(job.id, 'error', 'ytdlpExitCode', { code: result.exitCode ?? -1 }, errorPayload);
          } else if (result.rawError) {
            this.emitStatus(job.id, 'error', 'ytdlpProcessError', { error: result.rawError }, errorPayload);
          } else {
            this.emitStatus(job.id, 'error', 'ytdlpExitCode', { code: result.exitCode ?? -1 }, errorPayload);
          }
          await this.finalize(job, 'failed', errorPayload);
          return;
        }

        // Video succeeded. Phase 2: subtitles, if requested. Skipped in embed mode
        // (subs were included in phase 1). Failures here are soft — the video is
        // already on disk, so we still finalize as 'completed'.
        if (!embedMode && input.subtitleLanguages?.length) {
          this.emitStatus(job.id, 'download', 'fetchingSubtitles');
          const subResult = await runYtDlp({
            url: input.url,
            ytDlpPath,
            ffmpegPath,
            args: buildSubArgs(),
            tokenService: this.tokenService,
            onSpawn: (proc) => {
              const active = this.activeJobs.get(job.id);
              if (!active) return;
              active.process = proc;
              if (active.cancelRequested) proc.kill('SIGKILL');
            },
            onStdout: safeConsume,
            onStderr: safeConsume
          });

          if (subResult.exitCode !== 0) {
            this.logger.log('WARN', 'Subtitle fetch failed — video already saved', {
              jobId: job.id,
              code: subResult.exitCode,
              signal: subResult.errorClass
            });
            // Final status — don't follow with `complete` or it overwrites the warning.
            this.emitStatus(job.id, 'done', 'subtitlesFailed');
            await this.finalize(job, 'completed');
            return;
          }
        }

        this.emitStatus(job.id, 'done', 'complete');
        await this.finalize(job, 'completed');
      });

      return ok({ job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download startup failure';
      const payload: LocalizedError = { key: null, rawMessage: message };
      this.emitStatus(job.id, 'error', 'unknownStartupFailure', undefined, payload);
      await this.finalize(job, 'failed', payload);
      return fail(createAppError('download', message));
    }
  }

  async cancel(jobId?: string): Promise<Result<CancelDownloadOutput>> {
    if (jobId) {
      const active = this.activeJobs.get(jobId);
      if (active) {
        this.logger.log('INFO', 'Cancelling active job', { jobId });
        return this.cancelOne(active);
      }

      const pausedJob = this.pausedJobs.get(jobId);
      if (pausedJob) {
        this.logger.log('INFO', 'Cancelling paused job — cleaning up .part files', { jobId, outputDir: pausedJob.outputDir });
        this.pausedJobs.delete(jobId);
        await this.cleanupPartFiles(pausedJob.outputDir);
        return ok({ cancelled: true });
      }

      this.logger.log('INFO', 'cancel() called but no job found', { jobId });
      return ok({ cancelled: false });
    }

    const hadJobs = this.activeJobs.size > 0 || this.pausedJobs.size > 0;
    this.logger.log('INFO', 'Cancelling all jobs', { activeCount: this.activeJobs.size, pausedCount: this.pausedJobs.size });
    await Promise.all([...this.activeJobs.values()].map((a) => this.cancelOne(a)));
    for (const job of this.pausedJobs.values()) {
      await this.cleanupPartFiles(job.outputDir);
    }
    this.pausedJobs.clear();
    return ok({ cancelled: hadJobs });
  }

  async pause(jobId?: string): Promise<Result<PauseDownloadOutput>> {
    const active = jobId ? this.activeJobs.get(jobId) : [...this.activeJobs.values()][0];
    if (!active) {
      this.logger.log('INFO', 'pause() called but no active job found', { jobId });
      return ok({ paused: false });
    }

    this.logger.log('INFO', 'Pausing download', { jobId: active.job.id });

    if (active.mockTimer) {
      clearInterval(active.mockTimer);
      active.mockTimer = undefined;
      this.activeJobs.delete(active.job.id);
      this.pausedJobs.set(active.job.id, active.job);
      this.logger.log('INFO', 'Mock download paused', { jobId: active.job.id });
      return ok({ paused: true });
    }

    if (!active.process) {
      this.logger.log('INFO', 'pause() called but job has no process yet', { jobId: active.job.id });
      return ok({ paused: false });
    }

    active.pauseRequested = true;
    killProcessTree(active.process, 'SIGTERM');
    this.logger.log('INFO', 'SIGTERM sent to yt-dlp process', { jobId: active.job.id });
    return ok({ paused: true });
  }

  private async cancelOne(active: ActiveDownload): Promise<Result<CancelDownloadOutput>> {
    active.cancelRequested = true;

    if (active.process) {
      this.logger.log('INFO', 'Sending SIGKILL to yt-dlp process', { jobId: active.job.id });
      killProcessTree(active.process, 'SIGKILL');
      return ok({ cancelled: true });
    }

    if (active.mockTimer) {
      const { job } = active;
      this.logger.log('INFO', 'Clearing mock download timer', { jobId: job.id });
      clearInterval(active.mockTimer);
      active.mockTimer = undefined;
      await this.cleanupPartFiles(job.outputDir);
      await this.finalize(job, 'cancelled');
      this.emitStatus(job.id, 'error', 'cancelled');
      return ok({ cancelled: true });
    }

    this.logger.log('INFO', 'cancelOne() — job had no process or timer (pre-spawn cancel)', { jobId: active.job.id });
    return ok({ cancelled: true });
  }

  async cleanupPartFiles(outputDir: string): Promise<void> {
    try {
      const files = await readdir(outputDir);
      const toDelete = files.filter((f) => f.endsWith('.part') || f.endsWith('.ytdl'));
      if (toDelete.length === 0) {
        this.logger.log('INFO', 'cleanupPartFiles — no .part/.ytdl files found', { outputDir });
        return;
      }
      this.logger.log('INFO', 'cleanupPartFiles — deleting leftover files', { outputDir, files: toDelete });
      await Promise.all(toDelete.map((f) => unlink(join(outputDir, f)).catch(() => {})));
      this.logger.log('INFO', 'cleanupPartFiles — done', { outputDir, deleted: toDelete.length });
    } catch {
      this.logger.log('INFO', 'cleanupPartFiles — directory inaccessible, skipping', { outputDir });
    }
  }

  private consumeProgress(jobId: string, text: string): void {
    for (const line of splitStderrLines(text)) {
      this.logger.log('INFO', line, { jobId, source: 'yt-dlp-progress' });

      const destMatch = line.match(/^\[download\] Destination:\s+(.+)$/);
      if (destMatch) {
        const kind = /\.(vtt|srt|ass)$/i.test(destMatch[1]) ? 'subtitle' : 'media';
        this.currentFileKind.set(jobId, kind);
        this.emitStatus(
          jobId,
          'download',
          kind === 'subtitle' ? 'fetchingSubtitles' : 'downloadingMedia'
        );
        continue;
      }

      const sleepMatch = line.match(/Sleeping (\d+(?:\.\d+)?) seconds/);
      if (sleepMatch) {
        const seconds = Math.round(parseFloat(sleepMatch[1]));
        this.emitStatus(jobId, 'download', 'sleepingBetweenRequests', { seconds });
        continue;
      }

      if (line.startsWith('[Merger]')) {
        this.emitStatus(jobId, 'download', 'mergingFormats');
        continue;
      }

      // Subtitle files are tiny (~80KB) and finish in <1s; per-file 100% would
      // otherwise peg the bar before the real video download even starts.
      const kind = this.currentFileKind.get(jobId);
      const event: ProgressEvent = {
        jobId,
        line,
        at: nowIso(),
        percent: kind === 'subtitle' ? undefined : parsePercentFromLine(line)
      };
      this.emit('progress', event);
    }
  }

  private emitStatus(
    jobId: string,
    stage: StatusEvent['stage'],
    statusKey: StatusKey,
    params?: Record<string, string | number>,
    error?: LocalizedError
  ): void {
    const event: StatusEvent = {
      jobId,
      stage,
      statusKey,
      params,
      error,
      at: nowIso()
    };
    this.emit('status', event);
    this.logger.log(stage === 'error' ? 'ERROR' : 'INFO', statusKey, { jobId, stage, params });
  }

  private async finalize(
    job: DownloadJob,
    status: RecentJob['status'],
    error?: LocalizedError
  ): Promise<void> {
    this.logger.log('INFO', 'Job finalized', { jobId: job.id, status, ...(error && { error }) });
    this.activeJobs.delete(job.id);
    this.currentFileKind.delete(job.id);

    job.status = status;
    job.updatedAt = nowIso();

    const recent: RecentJob = {
      id: job.id,
      url: job.url,
      outputDir: job.outputDir,
      formatId: job.formatId,
      status,
      finishedAt: job.updatedAt,
      error
    };

    await this.recentJobsStore.push(recent);
  }

  private startMockDownload(jobId: string): void {
    let percent = 0;

    const timer = setInterval(async () => {
      percent += 10;

      const line = `[download] ${percent.toFixed(1)}% of ~10MiB at 1.2MiB/s ETA 00:0${
        Math.max(0, 10 - percent / 10)
      }`;
      this.consumeProgress(jobId, line);

      if (percent >= 100) {
        clearInterval(timer);
        this.emitStatus(jobId, 'done', 'complete');
        const active = this.activeJobs.get(jobId);
        if (active) {
          await this.finalize(active.job, 'completed');
        }
      }
    }, 250);

    const active = this.activeJobs.get(jobId);
    if (active) {
      active.mockTimer = timer;
    }
  }
}
