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
import { DEFAULTS, SUBTITLE_EXT_REGEX } from '@shared/constants';
import { STATUS_KEY } from '@shared/schemas';
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
import { buildSubtitleArgs, buildVideoArgs } from './ytDlpArgs';

interface ActiveDownload {
  job: DownloadJob;
  input: StartDownloadInput;
  cancelRequested: boolean;
  pauseRequested: boolean;
  process?: ChildProcessWithoutNullStreams;
  mockTimer?: NodeJS.Timeout;
}

interface PausedDownload {
  job: DownloadJob;
  input: StartDownloadInput;
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
  private pausedJobs = new Map<string, PausedDownload>();
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

    this.activeJobs.set(job.id, { job, input, cancelRequested: false, pauseRequested: false });
    this.logger.log('INFO', 'Download job created', { jobId: job.id, url: job.url, formatId: job.formatId, outputDir: job.outputDir });

    try {
      this.emitStatus(job.id, 'setup', STATUS_KEY.preparingBinaries);
      const ytDlpPath = await this.binaryManager.ensureYtDlp((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });
      const ffmpegPath = await this.binaryManager.ensureFFmpeg((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });

      if (this.activeJobs.get(job.id)?.cancelRequested) {
        this.logger.log('INFO', 'Download cancelled before binary setup completed', { jobId: job.id });
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

      const wantsSubs = !!input.subtitleLanguages?.length;
      const embedMode = input.subtitleMode === 'embed' && wantsSubs;
      const subtitleOnly = !input.formatId && wantsSubs;

      // Phases run after start() returns ok(). UI consumes status events for
      // progress/done/error. Result is awaited only for clarity inside this
      // async block — caller doesn't wait on it.
      void this.runDownloadPhases(job, input, ytDlpPath, ffmpegPath, { embedMode, subtitleOnly })
        .catch(async (error) => {
          const message = error instanceof Error ? error.message : 'Unknown phase failure';
          this.logger.log('ERROR', 'Download phase threw unexpectedly', { jobId: job.id, message });
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

  private async runDownloadPhases(
    job: DownloadJob,
    input: StartDownloadInput,
    ytDlpPath: string,
    ffmpegPath: string | null,
    flags: { embedMode: boolean; subtitleOnly: boolean }
  ): Promise<void> {
    if (flags.subtitleOnly) {
      await this.runSubtitleOnlyPhase(job, input, ytDlpPath, ffmpegPath);
      return;
    }
    const videoOk = await this.runVideoPhase(job, input, ytDlpPath, ffmpegPath, flags.embedMode);
    if (!videoOk) return;

    if (!flags.embedMode && input.subtitleLanguages?.length) {
      await this.runSidecarSubtitlePhase(job, input, ytDlpPath, ffmpegPath);
      return;
    }

    this.emitStatus(job.id, 'done', STATUS_KEY.complete);
    await this.finalize(job, 'completed');
  }

  // No media will be saved — failure here is hard; nothing ends up on disk.
  private async runSubtitleOnlyPhase(
    job: DownloadJob,
    input: StartDownloadInput,
    ytDlpPath: string,
    ffmpegPath: string | null
  ): Promise<void> {
    const subtitleFormat = input.subtitleFormat ?? DEFAULTS.subtitleFormat;
    const args = buildSubtitleArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      subtitleLanguages: input.subtitleLanguages ?? [],
      subtitleMode: input.subtitleMode,
      subtitleFormat,
      writeAutoSubs: input.writeAutoSubs
    });

    const result = await runYtDlp({
      url: input.url,
      ytDlpPath,
      ffmpegPath,
      args,
      tokenService: this.tokenService,
      onAttempt: (attempt) => {
        this.emitStatus(job.id, 'token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken);
      },
      onSpawn: (proc) => this.attachProcess(job.id, proc, STATUS_KEY.fetchingSubtitles),
      onStdout: (text) => this.safeConsume(job.id, text),
      onStderr: (text) => this.safeConsume(job.id, text)
    });

    if (this.activeJobs.get(job.id)?.cancelRequested) {
      await this.cleanupPartFiles(job.outputDir);
      this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
      await this.finalize(job, 'cancelled');
      return;
    }

    if (result.kind !== 'success') {
      this.logger.log('ERROR', 'subtitle-only download failed', { jobId: job.id, kind: result.kind });
      const payload = this.emitYtdlpFailure(job.id, result);
      await this.finalize(job, 'failed', payload);
      return;
    }

    this.emitStatus(job.id, 'done', STATUS_KEY.complete);
    await this.finalize(job, 'completed');
  }

  // Phase 1: video + audio. When embedMode is active, subs are muxed into mkv
  // here. Otherwise subs are fetched in a separate phase so a 429 can't fail
  // the video download. Returns true if video succeeded; false if we already
  // finalized (cancel/pause/fail).
  private async runVideoPhase(
    job: DownloadJob,
    input: StartDownloadInput,
    ytDlpPath: string,
    ffmpegPath: string | null,
    embedMode: boolean
  ): Promise<boolean> {
    const args = buildVideoArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      formatId: input.formatId,
      embedSubs: embedMode,
      subtitleLanguages: input.subtitleLanguages,
      writeAutoSubs: input.writeAutoSubs
    });

    const result = await runYtDlp({
      url: input.url,
      ytDlpPath,
      ffmpegPath,
      args,
      tokenService: this.tokenService,
      onAttempt: (attempt) => {
        this.emitStatus(job.id, 'token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken);
      },
      onSpawn: (proc) => this.attachProcess(job.id, proc, STATUS_KEY.downloadingMedia),
      onStdout: (text) => this.safeConsume(job.id, text),
      onStderr: (text) => this.safeConsume(job.id, text)
    });

    const active = this.activeJobs.get(job.id);

    if (active?.pauseRequested) {
      this.activeJobs.delete(job.id);
      this.pausedJobs.set(job.id, { job, input });
      this.currentFileKind.delete(job.id);
      this.logger.log('INFO', 'Download paused — .part file preserved', { jobId: job.id, outputDir: job.outputDir });
      return false;
    }

    if (active?.cancelRequested) {
      await this.cleanupPartFiles(job.outputDir);
      this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
      await this.finalize(job, 'cancelled');
      return false;
    }

    if (result.kind !== 'success') {
      this.logger.log(
        'ERROR',
        result.kind === 'spawn-error' ? 'yt-dlp spawn error' : 'yt-dlp download failed',
        result.kind === 'spawn-error'
          ? { jobId: job.id, message: result.error.message }
          : { jobId: job.id, code: result.exitCode, signal: result.signal }
      );
      const payload = this.emitYtdlpFailure(job.id, result);
      await this.finalize(job, 'failed', payload);
      return false;
    }

    return true;
  }

  // Phase 2: sidecar subs. Failures here are soft — the video is already on
  // disk, so we still finalize as 'completed' but with a subtitlesFailed warning.
  private async runSidecarSubtitlePhase(
    job: DownloadJob,
    input: StartDownloadInput,
    ytDlpPath: string,
    ffmpegPath: string | null
  ): Promise<void> {
    this.emitStatus(job.id, 'download', STATUS_KEY.fetchingSubtitles);

    const subtitleFormat = input.subtitleFormat ?? DEFAULTS.subtitleFormat;
    const args = buildSubtitleArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      subtitleLanguages: input.subtitleLanguages ?? [],
      subtitleMode: input.subtitleMode,
      subtitleFormat,
      writeAutoSubs: input.writeAutoSubs
    });

    const subResult = await runYtDlp({
      url: input.url,
      ytDlpPath,
      ffmpegPath,
      args,
      tokenService: this.tokenService,
      onSpawn: (proc) => this.attachProcessSilent(job.id, proc),
      onStdout: (text) => this.safeConsume(job.id, text),
      onStderr: (text) => this.safeConsume(job.id, text)
    });

    if (subResult.kind !== 'success') {
      this.logger.log('WARN', 'Subtitle fetch failed — video already saved', {
        jobId: job.id,
        kind: subResult.kind,
        ...(subResult.kind === 'exit-error' ? { code: subResult.exitCode, signal: subResult.signal } : {})
      });
      // Final status — don't follow with `complete` or it overwrites the warning.
      this.emitStatus(job.id, 'done', STATUS_KEY.subtitlesFailed);
      await this.finalize(job, 'completed');
      return;
    }

    this.emitStatus(job.id, 'done', STATUS_KEY.complete);
    await this.finalize(job, 'completed');
  }

  private attachProcess(jobId: string, proc: ChildProcessWithoutNullStreams, statusOnSpawn: StatusKey): void {
    this.emitStatus(jobId, 'download', statusOnSpawn);
    const active = this.activeJobs.get(jobId);
    if (!active) return;
    active.process = proc;
    if (active.cancelRequested) proc.kill('SIGKILL');
  }

  private attachProcessSilent(jobId: string, proc: ChildProcessWithoutNullStreams): void {
    const active = this.activeJobs.get(jobId);
    if (!active) return;
    active.process = proc;
    if (active.cancelRequested) proc.kill('SIGKILL');
  }

  private safeConsume(jobId: string, text: string): void {
    try {
      this.consumeProgress(jobId, text);
    } catch (err) {
      this.logger.log('WARN', 'consumeProgress threw', {
        jobId,
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }

  private emitYtdlpFailure(jobId: string, result: Exclude<RunYtDlpResult, { kind: 'success' }>): LocalizedError {
    if (result.kind === 'spawn-error') {
      const payload: LocalizedError = { key: null, rawMessage: result.error.message };
      this.emitStatus(jobId, 'error', STATUS_KEY.ytdlpProcessError, { error: result.error.message }, payload);
      return payload;
    }
    const payload: LocalizedError = { key: result.signal, rawMessage: result.rawError ?? undefined };
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
        this.logger.log('INFO', 'Cancelling active job', { jobId });
        return this.cancelOne(active);
      }

      const paused = this.pausedJobs.get(jobId);
      if (paused) {
        this.logger.log('INFO', 'Cancelling paused job — cleaning up .part files', { jobId, outputDir: paused.job.outputDir });
        this.pausedJobs.delete(jobId);
        await this.cleanupPartFiles(paused.job.outputDir);
        return ok({ cancelled: true });
      }

      this.logger.log('INFO', 'cancel() called but no job found', { jobId });
      return ok({ cancelled: false });
    }

    const hadJobs = this.activeJobs.size > 0 || this.pausedJobs.size > 0;
    this.logger.log('INFO', 'Cancelling all jobs', { activeCount: this.activeJobs.size, pausedCount: this.pausedJobs.size });
    await Promise.all([...this.activeJobs.values()].map((a) => this.cancelOne(a)));
    for (const paused of this.pausedJobs.values()) {
      await this.cleanupPartFiles(paused.job.outputDir);
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
      this.pausedJobs.set(active.job.id, { job: active.job, input: active.input });
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

  // Resume a previously paused job. Re-runs the same job (same id) with the
  // input captured at pause time. yt-dlp's default --continue behavior picks
  // up the .part file on disk. Returns { resumed: false } if the jobId is
  // unknown (e.g. process restarted between pause and resume) so the renderer
  // can fall back to a fresh start().
  async resume(jobId: string): Promise<Result<{ resumed: boolean; job?: DownloadJob }>> {
    const paused = this.pausedJobs.get(jobId);
    if (!paused) {
      this.logger.log('INFO', 'resume() called but no paused job found', { jobId });
      return ok({ resumed: false });
    }

    this.pausedJobs.delete(jobId);
    const { job, input } = paused;
    job.status = 'running';
    job.updatedAt = nowIso();

    this.activeJobs.set(job.id, { job, input, cancelRequested: false, pauseRequested: false });
    this.logger.log('INFO', 'Resuming download', { jobId: job.id });

    try {
      this.emitStatus(job.id, 'setup', STATUS_KEY.preparingBinaries);
      const ytDlpPath = await this.binaryManager.ensureYtDlp((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });
      const ffmpegPath = await this.binaryManager.ensureFFmpeg((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });

      if (this.activeJobs.get(job.id)?.cancelRequested) {
        this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
        await this.finalize(job, 'cancelled');
        return ok({ resumed: false });
      }

      if (this.mockMode) {
        this.emitStatus(job.id, 'token', STATUS_KEY.mintingToken);
        this.emitStatus(job.id, 'download', STATUS_KEY.startingYtdlp);
        this.startMockDownload(job.id);
        return ok({ resumed: true, job });
      }

      const wantsSubs = !!input.subtitleLanguages?.length;
      const embedMode = input.subtitleMode === 'embed' && wantsSubs;
      const subtitleOnly = !input.formatId && wantsSubs;

      void this.runDownloadPhases(job, input, ytDlpPath, ffmpegPath, { embedMode, subtitleOnly })
        .catch(async (error) => {
          const message = error instanceof Error ? error.message : 'Unknown phase failure';
          this.logger.log('ERROR', 'Resumed download phase threw unexpectedly', { jobId: job.id, message });
          const payload: LocalizedError = { key: null, rawMessage: message };
          this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload);
          await this.finalize(job, 'failed', payload);
        });

      return ok({ resumed: true, job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown resume failure';
      const payload: LocalizedError = { key: null, rawMessage: message };
      this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload);
      await this.finalize(job, 'failed', payload);
      return fail(createAppError('download', message));
    }
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
      this.emitStatus(job.id, 'error', STATUS_KEY.cancelled);
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
        const kind = SUBTITLE_EXT_REGEX.test(destMatch[1]) ? 'subtitle' : 'media';
        this.currentFileKind.set(jobId, kind);
        this.emitStatus(
          jobId,
          'download',
          kind === 'subtitle' ? STATUS_KEY.fetchingSubtitles : STATUS_KEY.downloadingMedia
        );
        continue;
      }

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
        this.emitStatus(jobId, 'done', STATUS_KEY.complete);
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
