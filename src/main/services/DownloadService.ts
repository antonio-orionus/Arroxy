import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { dedupeSubtitleFiles, muxSubtitlesIntoVideo } from './subtitlePostProcess';
import { phaseStrategyFor, type PhaseStrategy } from './phaseStrategy';
import { nowIso } from '@main/utils/clock';
import { createAppError } from '@main/utils/errorFactory';
import { splitStderrLines } from '@main/utils/process';
import { parsePercentFromLine } from '@main/utils/progress';
import { fail, ok, type Result } from '@shared/result';
import { isSubtitleFile } from '@shared/subtitlePath';
import { DEFAULTS } from '@shared/constants';
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
  ytDlpProcess?: ChildProcessWithoutNullStreams;
  ffmpegProcess?: ChildProcessWithoutNullStreams;
  mockTimer?: NodeJS.Timeout;
  // Per-job state captured from yt-dlp stderr. Was previously in three
  // service-level Maps; lifecycle is now obvious because it's tied to the
  // ActiveDownload that finalize() removes from `activeJobs`.
  currentFileKind?: 'subtitle' | 'media';
  subtitlePaths: string[];
  mediaPath?: string;
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

// Cancel any process attached to an active download. yt-dlp is spawned
// detached (Unix) so we kill its process group; ffmpeg is not detached, so
// we send the signal directly to it.
function killActiveProcesses(active: ActiveDownload, signal: NodeJS.Signals): void {
  if (active.ytDlpProcess) killProcessTree(active.ytDlpProcess, signal);
  if (active.ffmpegProcess) active.ffmpegProcess.kill(signal);
}

export class DownloadService extends EventEmitter {
  private activeJobs = new Map<string, ActiveDownload>();
  private pausedJobs = new Map<string, PausedDownload>();

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
    const active: ActiveDownload = {
      job, input,
      cancelRequested: false, pauseRequested: false,
      subtitlePaths: []
    };
    this.activeJobs.set(job.id, active);
    this.logger.log('INFO', 'Download job created', { jobId: job.id, url: job.url, formatId: job.formatId, outputDir: job.outputDir });
    return this.runJob(active);
  }

  // Resume a previously paused job. Reuses the same job id with the input
  // captured at pause time. yt-dlp's default --continue picks up the .part
  // file on disk. Returns { resumed: false } if the jobId is unknown — the
  // renderer falls back to a fresh start().
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
    const active: ActiveDownload = {
      job, input,
      cancelRequested: false, pauseRequested: false,
      subtitlePaths: []
    };
    this.activeJobs.set(job.id, active);
    this.logger.log('INFO', 'Resuming download', { jobId: job.id });

    const result = await this.runJob(active);
    if (!result.ok) {
      // Cancellation arriving during binary setup is a "did not resume"
      // outcome, not a resume failure — the renderer treats false as
      // "no-op, keep current UI state."
      if (active.cancelRequested) return ok({ resumed: false });
      return fail(result.error);
    }
    return ok({ resumed: true, job: result.data.job });
  }

  // Shared start/resume body. Sets up binaries, dispatches to a phase
  // strategy, and returns once the job is registered (phases run in the
  // background; UI consumes status events).
  private async runJob(active: ActiveDownload): Promise<Result<StartDownloadOutput>> {
    const { job, input } = active;
    try {
      this.emitStatus(job.id, 'setup', STATUS_KEY.preparingBinaries);
      const ytDlpPath = await this.binaryManager.ensureYtDlp((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });
      const ffmpegPath = await this.binaryManager.ensureFFmpeg((statusKey, params) => {
        this.emitStatus(job.id, 'setup', statusKey, params);
      });

      if (active.cancelRequested) {
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

      const strategy = phaseStrategyFor(input);
      void this.runStrategy(active, strategy, ytDlpPath, ffmpegPath)
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

  private async runStrategy(
    active: ActiveDownload,
    strategy: PhaseStrategy,
    ytDlpPath: string,
    ffmpegPath: string | null
  ): Promise<void> {
    switch (strategy.kind) {
      case 'subtitle-only':
        await this.runSubtitleOnlyPhase(active, ytDlpPath, ffmpegPath);
        return;
      case 'video': {
        const ok = await this.runVideoPhase(active, ytDlpPath, ffmpegPath, false);
        if (ok) await this.completeJob(active);
        return;
      }
      case 'video+embed': {
        // yt-dlp embeds manual subs natively into mkv during phase 1.
        const ok = await this.runVideoPhase(active, ytDlpPath, ffmpegPath, true);
        if (ok) await this.completeJob(active);
        return;
      }
      case 'video+sidecar': {
        const ok = await this.runVideoPhase(active, ytDlpPath, ffmpegPath, false);
        if (ok) await this.runSidecarSubtitlePhase(active, ytDlpPath, ffmpegPath, false);
        return;
      }
      case 'video+embed+auto': {
        // Embed + auto-captions can't go through yt-dlp's --embed-subs path —
        // it would mux raw rolling cues before any post-process hook can
        // clean them. Instead: download as sidecar, dedupe, mux ourselves.
        const ok = await this.runVideoPhase(active, ytDlpPath, ffmpegPath, false);
        if (ok) await this.runSidecarSubtitlePhase(active, ytDlpPath, ffmpegPath, true);
        return;
      }
    }
  }

  // No media will be saved — failure here is hard; nothing ends up on disk.
  private async runSubtitleOnlyPhase(
    active: ActiveDownload,
    ytDlpPath: string,
    ffmpegPath: string | null
  ): Promise<void> {
    const { job, input } = active;
    const args = buildSubtitleArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      subtitleLanguages: input.subtitleLanguages ?? [],
      subtitleMode: input.subtitleMode,
      subtitleFormat: input.subtitleFormat ?? DEFAULTS.subtitleFormat,
      writeAutoSubs: input.writeAutoSubs,
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
      onSpawn: (proc) => this.attachYtDlpProcess(active, proc, STATUS_KEY.fetchingSubtitles),
      onStdout: (text) => this.safeConsume(active, text),
      onStderr: (text) => this.safeConsume(active, text)
    });

    if (active.cancelRequested) {
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

    if (input.writeAutoSubs) {
      await dedupeSubtitleFiles(active.subtitlePaths, this.logger, job.id, () => active.cancelRequested);
    }

    this.emitStatus(job.id, 'done', STATUS_KEY.complete);
    await this.finalize(job, 'completed');
  }

  // Phase 1: video + audio. When embedMode is active, subs are muxed into
  // mkv here. Otherwise subs are fetched in a separate phase so a 429 can't
  // fail the video. Returns true if video succeeded; false if we already
  // finalized (cancel/pause/fail).
  private async runVideoPhase(
    active: ActiveDownload,
    ytDlpPath: string,
    ffmpegPath: string | null,
    embedMode: boolean
  ): Promise<boolean> {
    const { job, input } = active;
    const args = buildVideoArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      formatId: input.formatId,
      embedSubs: embedMode,
      subtitleLanguages: input.subtitleLanguages,
      writeAutoSubs: input.writeAutoSubs,
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
      onSpawn: (proc) => this.attachYtDlpProcess(active, proc, STATUS_KEY.downloadingMedia),
      onStdout: (text) => this.safeConsume(active, text),
      onStderr: (text) => this.safeConsume(active, text)
    });

    if (active.pauseRequested) {
      this.activeJobs.delete(job.id);
      this.pausedJobs.set(job.id, { job, input });
      this.logger.log('INFO', 'Download paused — .part file preserved', { jobId: job.id, outputDir: job.outputDir });
      return false;
    }

    if (active.cancelRequested) {
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
  // disk, so we still finalize as 'completed' but with a subtitlesFailed
  // warning. When embedAfter is true, deduped subs are then muxed into the
  // video via ffmpeg (the embed+auto path).
  private async runSidecarSubtitlePhase(
    active: ActiveDownload,
    ytDlpPath: string,
    ffmpegPath: string | null,
    embedAfter: boolean
  ): Promise<void> {
    const { job, input } = active;
    this.emitStatus(job.id, 'download', STATUS_KEY.fetchingSubtitles);

    const args = buildSubtitleArgs({
      url: input.url,
      outputDir: input.outputDir ?? '',
      subtitleLanguages: input.subtitleLanguages ?? [],
      subtitleMode: input.subtitleMode,
      subtitleFormat: input.subtitleFormat ?? DEFAULTS.subtitleFormat,
      writeAutoSubs: input.writeAutoSubs,
    });

    const subResult = await runYtDlp({
      url: input.url,
      ytDlpPath,
      ffmpegPath,
      args,
      tokenService: this.tokenService,
      onSpawn: (proc) => this.attachYtDlpProcess(active, proc),
      onStdout: (text) => this.safeConsume(active, text),
      onStderr: (text) => this.safeConsume(active, text)
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

    if (input.writeAutoSubs) {
      await dedupeSubtitleFiles(active.subtitlePaths, this.logger, job.id, () => active.cancelRequested);
    }

    if (embedAfter) await this.runEmbedMuxPhase(active, ffmpegPath);

    this.emitStatus(job.id, 'done', STATUS_KEY.complete);
    await this.finalize(job, 'completed');
  }

  // After phase 2 (sidecar fetch) + dedupe, in embed+auto mode mux the
  // cleaned subs into the video ourselves. Soft failure: we keep the
  // sidecar subs on disk and emit a status the UI can surface.
  private async runEmbedMuxPhase(active: ActiveDownload, ffmpegPath: string | null): Promise<void> {
    const { job, input } = active;
    if (!ffmpegPath) {
      this.logger.log('WARN', 'embed-mux skipped — ffmpeg not available', { jobId: job.id });
      this.emitStatus(job.id, 'download', STATUS_KEY.subtitlesFailed);
      return;
    }
    if (!active.mediaPath || active.subtitlePaths.length === 0) {
      this.logger.log('WARN', 'embed-mux: missing video or sub paths', {
        jobId: job.id, videoPath: active.mediaPath, subCount: active.subtitlePaths.length
      });
      return;
    }

    this.emitStatus(job.id, 'download', STATUS_KEY.mergingFormats);

    const result = await muxSubtitlesIntoVideo({
      ffmpegPath,
      videoPath: active.mediaPath,
      subtitlePaths: active.subtitlePaths,
      requestedLangs: input.subtitleLanguages ?? [],
      onSpawn: (proc) => {
        active.ffmpegProcess = proc;
        if (active.cancelRequested) proc.kill('SIGKILL');
      },
      logger: this.logger,
      jobId: job.id
    });
    active.ffmpegProcess = undefined;

    if (result.ok && result.outputPath) active.mediaPath = result.outputPath;
  }

  private attachYtDlpProcess(active: ActiveDownload, proc: ChildProcessWithoutNullStreams, statusOnSpawn?: StatusKey): void {
    if (statusOnSpawn) this.emitStatus(active.job.id, 'download', statusOnSpawn);
    active.ytDlpProcess = proc;
    if (active.cancelRequested) proc.kill('SIGKILL');
  }

  private safeConsume(active: ActiveDownload, text: string): void {
    try {
      this.consumeProgress(active, text);
    } catch (err) {
      this.logger.log('WARN', 'consumeProgress threw', {
        jobId: active.job.id,
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

    if (!active.ytDlpProcess) {
      this.logger.log('INFO', 'pause() called but job has no process yet', { jobId: active.job.id });
      return ok({ paused: false });
    }

    active.pauseRequested = true;
    killProcessTree(active.ytDlpProcess, 'SIGTERM');
    this.logger.log('INFO', 'SIGTERM sent to yt-dlp process', { jobId: active.job.id });
    return ok({ paused: true });
  }

  private async cancelOne(active: ActiveDownload): Promise<Result<CancelDownloadOutput>> {
    active.cancelRequested = true;

    if (active.ytDlpProcess || active.ffmpegProcess) {
      this.logger.log('INFO', 'Sending SIGKILL to active processes', { jobId: active.job.id });
      killActiveProcesses(active, 'SIGKILL');
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

  private async completeJob(active: ActiveDownload): Promise<void> {
    this.emitStatus(active.job.id, 'done', STATUS_KEY.complete);
    await this.finalize(active.job, 'completed');
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

  private consumeProgress(active: ActiveDownload, text: string): void {
    const jobId = active.job.id;
    for (const line of splitStderrLines(text)) {
      this.logger.log('INFO', line, { jobId, source: 'yt-dlp-progress' });

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
        this.emitStatus(
          jobId,
          'download',
          kind === 'subtitle' ? STATUS_KEY.fetchingSubtitles : STATUS_KEY.downloadingMedia
        );
        continue;
      }

      // yt-dlp's Merger replaces the per-stream files with a merged container
      // (mkv when --merge-output-format mkv is set, or matched by codec
      // compatibility otherwise). The merged path is the final video.
      // Path may be quoted (with spaces) or unquoted (without) depending on
      // yt-dlp version — accept both forms.
      const mergerMatch = line.match(/^\[Merger\] Merging formats into "([^"]+)"|^\[Merger\] Merging formats into (.+)$/);
      if (mergerMatch) {
        active.mediaPath = mergerMatch[1] ?? mergerMatch[2];
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
      const event: ProgressEvent = {
        jobId,
        line,
        at: nowIso(),
        percent: active.currentFileKind === 'subtitle' ? undefined : parsePercentFromLine(line)
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
    const active = this.activeJobs.get(jobId);
    if (!active) return;
    let percent = 0;

    const timer = setInterval(async () => {
      percent += 10;

      const line = `[download] ${percent.toFixed(1)}% of ~10MiB at 1.2MiB/s ETA 00:0${
        Math.max(0, 10 - percent / 10)
      }`;
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
