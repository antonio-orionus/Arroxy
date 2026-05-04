import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readdir, unlink, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { trackMain, downloadDurationBucket, sizeBucket } from '@main/services/analytics';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import log from 'electron-log/main';
import { phasesFor, PhaseExecutor } from './phases';
import type { PhaseContext } from './phases';
import { nowIso } from '@main/utils/clock';
import { createAppError } from '@main/utils/errorFactory';
import { splitStderrLines } from '@main/utils/process';
import { parsePercentFromLine } from '@main/utils/progress';
import { fail, ok, type Result } from '@shared/result';
import { isSubtitleFile } from '@shared/subtitlePath';
import { STATUS_KEY } from '@shared/schemas';
import type { CancelDownloadOutput, DownloadJob, LocalizedError, PauseDownloadOutput, ProgressEvent, RecentJob, StartDownloadInput, StartDownloadOutput, StatusEvent, StatusKey } from '@shared/types';
import type { RecentJobsStore } from '@main/stores/RecentJobsStore';
import { YtDlp, type YtDlpResult } from './YtDlp';
import type { ActiveDownload, PausedDownload } from './phases';

const logger = log.scope('downloads');

function categorizeDownloadError(msg: string): string {
  const m = msg.toLowerCase();
  if (/sign in to confirm|confirm you'?re not a bot|\bbot\b|http error 403|\b403\b/.test(m)) return 'bot_detected';
  if (/\benospc\b|no space left|disk (?:full|space)/.test(m)) return 'disk_full';
  if (/requested format (?:is )?(?:not available|unavailable)|no video formats|format not available/.test(m)) return 'format_unavailable';
  if (/ffmpeg (?:error|failed)|error (?:while )?(?:merging|muxing)|postprocessing/.test(m)) return 'merge_failed';
  if (/\b(?:timed? out|timeout|econn(?:reset|refused|aborted)|enotfound|getaddrinfo|network is unreachable)\b/.test(m)) return 'network';
  return 'unknown';
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
  try {
    process.kill(-proc.pid, signal);
  } catch {
    proc.kill(signal);
  }
}

function killActiveProcesses(active: ActiveDownload, signal: NodeJS.Signals): void {
  if (active.ytDlpProcess) killProcessTree(active.ytDlpProcess, signal);
  if (active.ffmpegProcess) active.ffmpegProcess.kill(signal);
}

export class DownloadService extends EventEmitter {
  private activeJobs = new Map<string, ActiveDownload>();
  private pausedJobs = new Map<string, PausedDownload>();

  constructor(
    private readonly ytDlp: YtDlp,
    private readonly recentJobsStore: RecentJobsStore,
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
    if (!input.outputDir) {
      return fail(createAppError('validation', 'outputDir is required'));
    }
    const now = nowIso();
    const job: DownloadJob = {
      id: randomUUID(),
      url: input.url,
      outputDir: input.outputDir,
      formatId: input.formatId,
      expectedBytes: input.expectedBytes,
      status: 'running',
      createdAt: now,
      updatedAt: now
    };
    const active: ActiveDownload = {
      job,
      input,
      cancelRequested: false,
      pauseRequested: false,
      subtitlePaths: []
    };
    this.activeJobs.set(job.id, active);
    logger.info('Download job created', {
      jobId: job.id,
      url: job.url,
      formatId: job.formatId,
      outputDir: job.outputDir
    });
    trackMain('download_started', {
      preset: input.preset ?? 'custom',
      has_subtitles: Boolean(input.subtitleLanguages?.length),
      has_sponsorblock: Boolean(input.sponsorBlockMode && input.sponsorBlockMode !== 'off'),
      cookies_enabled: Boolean(input.cookiesEnabled),
      embed_metadata: Boolean(input.embedMetadata),
      embed_thumbnail: Boolean(input.embedThumbnail)
    });
    return this.runJob(active);
  }

  async resume(jobId: string): Promise<Result<{ resumed: boolean; job?: DownloadJob }>> {
    const paused = this.pausedJobs.get(jobId);
    if (!paused) {
      logger.info('resume() called but no paused job found', { jobId });
      return ok({ resumed: false });
    }

    this.pausedJobs.delete(jobId);
    const { job, input } = paused;
    job.status = 'running';
    job.updatedAt = nowIso();
    const active: ActiveDownload = {
      job,
      input,
      cancelRequested: false,
      pauseRequested: false,
      subtitlePaths: []
    };
    this.activeJobs.set(job.id, active);
    logger.info('Resuming download', { jobId: job.id });

    const result = await this.runJob(active);
    if (!result.ok) {
      if (active.cancelRequested) return ok({ resumed: false });
      return fail(result.error);
    }
    return ok({ resumed: true, job: result.data.job });
  }

  private async runJob(active: ActiveDownload): Promise<Result<StartDownloadOutput>> {
    const { job } = active;
    try {
      this.emitStatus(job.id, 'setup', STATUS_KEY.preparingBinaries);
      await this.ytDlp.prepare((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });

      if (active.cancelRequested) {
        logger.info('Download cancelled before binary setup completed', {
          jobId: job.id
        });
        this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
        await this.finalize(job, 'cancelled');
        return fail(createAppError('download', 'Download cancelled before start'));
      }

      if (this.mockMode) {
        this.emitStatus(job.id, 'token', STATUS_KEY.mintingToken);
        this.emitStatus(job.id, 'download', STATUS_KEY.startingYtdlp);
        this.startMockDownload(job.id);
        return ok({ job });
      }

      void this.runPhases(active).catch(async (error) => {
        const message = error instanceof Error ? error.message : 'Unknown phase failure';
        logger.error('Download phase threw unexpectedly', { jobId: job.id, message });
        const payload: LocalizedError = { key: null, rawMessage: message };
        this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload);
        await this.finalize(job, 'failed', payload);
      });

      return ok({ job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download startup failure';
      const payload: LocalizedError = { key: null, rawMessage: message };
      this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload);
      await this.finalize(job, 'failed', payload);
      return fail(createAppError('download', message));
    }
  }

  private async runPhases(active: ActiveDownload): Promise<void> {
    const { job, input } = active;
    const ctx: PhaseContext = {
      active,
      ytDlp: this.ytDlp,
      emitStatus: (stage, statusKey, params?, error?) => this.emitStatus(job.id, stage, statusKey, params, error),
      emitYtdlpFailure: (result) => this.emitYtdlpFailure(job.id, result),
      attachYtDlpProcess: (proc, statusKey?) => this.attachYtDlpProcess(active, proc, statusKey),
      safeConsume: (text) => this.safeConsume(active, text),
      cleanupPartFiles: (dir) => this.cleanupPartFiles(dir),
      cleanupTempDir: () => this.cleanupTempDir(active),
      finalize: (status, err?) => this.finalize(job, status, err),
      moveToPaused: () => {
        this.activeJobs.delete(job.id);
        this.pausedJobs.set(job.id, { job, input, tempDir: active.tempDir });
        logger.info('Download paused — temp dir preserved', {
          jobId: job.id,
          tempDir: active.tempDir
        });
      }
    };
    await new PhaseExecutor().run(ctx, phasesFor(input));
  }

  private attachYtDlpProcess(active: ActiveDownload, proc: ChildProcessWithoutNullStreams, statusKey?: StatusKey): void {
    if (statusKey) this.emitStatus(active.job.id, 'download', statusKey);
    active.ytDlpProcess = proc;
    if (active.cancelRequested) proc.kill('SIGKILL');
  }

  private safeConsume(active: ActiveDownload, text: string): void {
    try {
      this.consumeProgress(active, text);
    } catch (err) {
      logger.warn('consumeProgress threw', {
        jobId: active.job.id,
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }

  private emitYtdlpFailure(jobId: string, result: Exclude<YtDlpResult, { kind: 'success' }>): LocalizedError {
    if (result.kind === 'spawn-error') {
      const payload: LocalizedError = { key: null, rawMessage: result.error.message };
      this.emitStatus(jobId, 'error', STATUS_KEY.ytdlpProcessError, { error: result.error.message }, payload);
      return payload;
    }
    const payload: LocalizedError = {
      key: result.signal,
      rawMessage: result.rawError ?? undefined
    };
    if (result.signal) {
      this.emitStatus(jobId, 'error', STATUS_KEY.ytdlpExitCode, { code: result.exitCode }, payload);
    } else if (result.rawError) {
      this.emitStatus(jobId, 'error', STATUS_KEY.ytdlpProcessError, { error: result.rawError }, payload);
    } else {
      this.emitStatus(jobId, 'error', STATUS_KEY.ytdlpExitCode, { code: result.exitCode }, payload);
    }
    return payload;
  }

  async cancel(jobId?: string): Promise<Result<CancelDownloadOutput>> {
    if (jobId) {
      const active = this.activeJobs.get(jobId);
      if (active) {
        logger.info('Cancelling active job', { jobId });
        return this.cancelOne(active);
      }

      const paused = this.pausedJobs.get(jobId);
      if (paused) {
        logger.info('Cancelling paused job — cleaning up temp dir and .part files', {
          jobId,
          outputDir: paused.job.outputDir
        });
        this.pausedJobs.delete(jobId);
        if (paused.tempDir) await this.cleanupTempDirByPath(paused.tempDir);
        await this.cleanupPartFiles(paused.job.outputDir);
        return ok({ cancelled: true });
      }

      logger.info('cancel() called but no job found', { jobId });
      return ok({ cancelled: false });
    }

    const hadJobs = this.activeJobs.size > 0 || this.pausedJobs.size > 0;
    logger.info('Cancelling all jobs', {
      activeCount: this.activeJobs.size,
      pausedCount: this.pausedJobs.size
    });
    await Promise.all([...this.activeJobs.values()].map((a) => this.cancelOne(a)));
    for (const paused of this.pausedJobs.values()) {
      if (paused.tempDir) await this.cleanupTempDirByPath(paused.tempDir);
      await this.cleanupPartFiles(paused.job.outputDir);
    }
    this.pausedJobs.clear();
    return ok({ cancelled: hadJobs });
  }

  async pause(jobId?: string): Promise<Result<PauseDownloadOutput>> {
    const active = jobId ? this.activeJobs.get(jobId) : [...this.activeJobs.values()][0];
    if (!active) {
      logger.info('pause() called but no active job found', { jobId });
      return ok({ paused: false });
    }

    logger.info('Pausing download', { jobId: active.job.id });

    if (active.mockTimer) {
      clearInterval(active.mockTimer);
      active.mockTimer = undefined;
      this.activeJobs.delete(active.job.id);
      this.pausedJobs.set(active.job.id, { job: active.job, input: active.input });
      logger.info('Mock download paused', { jobId: active.job.id });
      return ok({ paused: true });
    }

    if (!active.ytDlpProcess) {
      logger.info('pause() called but job has no process yet', {
        jobId: active.job.id
      });
      return ok({ paused: false });
    }

    active.pauseRequested = true;
    killProcessTree(active.ytDlpProcess, 'SIGTERM');
    logger.info('SIGTERM sent to yt-dlp process', { jobId: active.job.id });
    return ok({ paused: true });
  }

  private async cancelOne(active: ActiveDownload): Promise<Result<CancelDownloadOutput>> {
    active.cancelRequested = true;

    if (active.ytDlpProcess || active.ffmpegProcess) {
      logger.info('Sending SIGKILL to active processes', { jobId: active.job.id });
      killActiveProcesses(active, 'SIGKILL');
      return ok({ cancelled: true });
    }

    if (active.mockTimer) {
      const { job } = active;
      logger.info('Clearing mock download timer', { jobId: job.id });
      clearInterval(active.mockTimer);
      active.mockTimer = undefined;
      await this.cleanupPartFiles(job.outputDir);
      await this.finalize(job, 'cancelled');
      this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
      return ok({ cancelled: true });
    }

    logger.info('cancelOne() — job had no process or timer (pre-spawn cancel)', {
      jobId: active.job.id
    });
    return ok({ cancelled: true });
  }

  async cleanupPartFiles(outputDir: string): Promise<void> {
    try {
      const files = await readdir(outputDir);
      const toDelete = files.filter((f) => f.endsWith('.part') || f.endsWith('.ytdl'));
      if (toDelete.length === 0) {
        logger.info('cleanupPartFiles — no .part/.ytdl files found', { outputDir });
        return;
      }
      logger.info('cleanupPartFiles — deleting leftover files', {
        outputDir,
        files: toDelete
      });
      await Promise.all(toDelete.map((f) => unlink(join(outputDir, f)).catch(() => {})));
      logger.info('cleanupPartFiles — done', { outputDir, deleted: toDelete.length });
    } catch {
      logger.info('cleanupPartFiles — directory inaccessible, skipping', { outputDir });
    }
  }

  private async cleanupTempDir(active: ActiveDownload): Promise<void> {
    if (active.tempDir) await this.cleanupTempDirByPath(active.tempDir);
  }

  private async cleanupTempDirByPath(tempDir: string): Promise<void> {
    try {
      await rm(tempDir, { recursive: true, force: true });
      logger.info('cleanupTempDir — removed', { tempDir });
    } catch {
      logger.warn('cleanupTempDir — failed to remove', { tempDir });
    }
  }

  private consumeProgress(active: ActiveDownload, text: string): void {
    const jobId = active.job.id;
    for (const line of splitStderrLines(text)) {
      logger.info(line, { jobId, source: 'yt-dlp-progress' });

      const destMatch = line.match(/^\[download\] Destination:\s+(.+)$/);
      if (destMatch) {
        const path = destMatch[1];
        const kind = isSubtitleFile(path) ? 'subtitle' : 'media';
        active.currentFileKind = kind;
        if (kind === 'subtitle') {
          active.subtitlePaths.push(path);
        } else {
          active.mediaPath = path;
        }
        this.emitStatus(jobId, 'download', kind === 'subtitle' ? STATUS_KEY.fetchingSubtitles : STATUS_KEY.downloadingMedia);
        continue;
      }

      const mergerMatch = line.match(/^\[Merger\] Merging formats into "([^"]+)"|^\[Merger\] Merging formats into (.+)$/);
      if (mergerMatch) {
        active.mediaPath = mergerMatch[1] ?? mergerMatch[2];
      }

      // yt-dlp emits this when the merged file pre-exists from an earlier run
      // and skips the download entirely. No [download] Destination: or [Merger]
      // line will follow, so this is our only chance to record mediaPath.
      const alreadyMatch = line.match(/^\[download\]\s+(.+?)\s+has already been downloaded$/);
      if (alreadyMatch && !isSubtitleFile(alreadyMatch[1])) {
        active.mediaPath = alreadyMatch[1];
        continue;
      }

      // [MoveFiles] relocates files from .arroxy-temp/ to the final outputDir
      // after postprocessing. Update mediaPath only when src is the file we're
      // tracking — sidecar moves (.jpg, .description) don't touch mediaPath
      // because their src never matched.
      const moveMatch = line.match(/^\[MoveFiles\] Moving file "([^"]+)" to "([^"]+)"$/);
      if (moveMatch && active.mediaPath === moveMatch[1]) {
        active.mediaPath = moveMatch[2];
        continue;
      }

      // eslint-disable-next-line security/detect-unsafe-regex -- bounded: \d+ is constrained by yt-dlp output line length
      const sleepMatch = line.match(/Sleeping (\d+(?:\.\d+)?) seconds/);
      if (sleepMatch) {
        const seconds = Math.round(parseFloat(sleepMatch[1]));
        this.emitStatus(jobId, 'download', STATUS_KEY.sleepingBetweenRequests, { seconds });
        continue;
      }

      if (line.startsWith('[Merger]')) {
        this.emitStatus(jobId, 'download', STATUS_KEY.mergingFormats);
        continue;
      }

      const event: ProgressEvent = {
        jobId,
        line,
        at: nowIso(),
        percent: active.currentFileKind === 'subtitle' ? undefined : parsePercentFromLine(line)
      };
      this.emit('progress', event);
    }
  }

  private emitStatus(jobId: string, stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError): void {
    const event: StatusEvent = {
      jobId,
      stage,
      statusKey,
      params,
      error,
      at: nowIso()
    };
    this.emit('status', event);
    if (stage === 'error') logger.error(statusKey, { jobId, stage, params });
    else logger.info(statusKey, { jobId, stage, params });
  }

  private async finalize(job: DownloadJob, status: RecentJob['status'], error?: LocalizedError): Promise<void> {
    logger.info('Job finalized', { jobId: job.id, status, ...(error && { error }) });
    this.activeJobs.delete(job.id);

    job.status = status;
    job.updatedAt = nowIso();

    const durationMs = new Date(job.updatedAt).getTime() - new Date(job.createdAt).getTime();
    const outcome = status === 'completed' ? 'success' : status === 'cancelled' ? 'cancelled' : 'error';
    trackMain('download_finished', {
      outcome,
      duration_bucket: downloadDurationBucket(durationMs),
      ...(status !== 'cancelled' && job.expectedBytes != null ? { size_bucket: sizeBucket(job.expectedBytes) } : {}),
      ...(outcome === 'error' ? { error_category: categorizeDownloadError(error?.rawMessage ?? '') } : {})
    });

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
    const active = this.activeJobs.get(jobId);
    if (!active) return;
    let percent = 0;

    const timer = setInterval(async () => {
      percent += 10;

      const line = `[download] ${percent.toFixed(1)}% of ~10MiB at 1.2MiB/s ETA 00:0${Math.max(0, 10 - percent / 10)}`;
      this.consumeProgress(active, line);

      if (percent >= 100) {
        clearInterval(timer);
        this.emitStatus(jobId, 'done', STATUS_KEY.complete);
        await this.finalize(active.job, 'completed');
      }
    }, 250);

    active.mockTimer = timer;
  }
}
