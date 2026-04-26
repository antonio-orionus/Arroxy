import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { nowIso } from '@main/utils/clock';
import { createAppError } from '@main/utils/errorFactory';
import { spawnYtDlp } from '@main/utils/process';
import { parsePercentFromLine } from '@main/utils/progress';
import { classifyStderr, extractLastError, friendlyMessage } from '@main/utils/ytdlpErrors';
import { fail, ok, type Result } from '@shared/result';
import type {
  CancelDownloadOutput,
  DownloadJob,
  PauseDownloadOutput,
  ProgressEvent,
  RecentJob,
  StartDownloadInput,
  StartDownloadOutput,
  StatusEvent
} from '@shared/types';
import type { BinaryManager } from './BinaryManager';
import type { LogService } from './LogService';
import type { RecentJobsStore } from '@main/stores/RecentJobsStore';
import type { TokenService } from './TokenService';

interface ActiveDownload {
  job: DownloadJob;
  cancelRequested: boolean;
  pauseRequested: boolean;
  process?: ChildProcessWithoutNullStreams;
  mockTimer?: NodeJS.Timeout;
}

export class DownloadService extends EventEmitter {
  private activeJobs = new Map<string, ActiveDownload>();
  private pausedJobs = new Map<string, DownloadJob>();

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
      this.emitStatus(job.id, 'setup', 'Preparing binaries...');
      const ytDlpPath = await this.binaryManager.ensureYtDlp((message) => {
        this.emitStatus(job.id, 'setup', message);
      });
      const ffmpegPath = await this.binaryManager.ensureFFmpeg((message) => {
        this.emitStatus(job.id, 'setup', message);
      });

      if (this.activeJobs.get(job.id)?.cancelRequested) {
        this.logger.log('INFO', 'Download cancelled before binary setup completed', { jobId: job.id });
        await this.finalize(job, 'cancelled');
        return fail(createAppError('download', 'Download cancelled before start'));
      }

      this.emitStatus(job.id, 'token', 'Minting YouTube token...');
      const { token, visitorData } = await this.tokenService.mintTokenForUrl(input.url);

      if (this.activeJobs.get(job.id)?.cancelRequested) {
        this.logger.log('INFO', 'Download cancelled before process spawn', { jobId: job.id });
        await this.finalize(job, 'cancelled');
        return fail(createAppError('download', 'Download cancelled before spawn'));
      }

      this.emitStatus(job.id, 'download', 'Starting yt-dlp process...');

      if (this.mockMode) {
        this.startMockDownload(job.id);
        return ok({ job });
      }

      let stderrBuf = '';
      let isRetrying = false;

      const spawnProcess = (spawnToken: string, spawnVisitorData: string): void => {
        stderrBuf = '';
        const extractorArgs = `youtube:po_token=web.gvs+${spawnToken}${spawnVisitorData ? `;visitor_data=${spawnVisitorData}` : ''}`;
        const args = [
          '--extractor-args',
          extractorArgs,
          '--progress',
          '--no-playlist'
        ];

        if (input.formatId) {
          args.push('-f', input.formatId);
        }

        args.push('-o', `${input.outputDir}/%(title)s.%(ext)s`, input.url);

        const proc = spawnYtDlp(ytDlpPath, args, ffmpegPath);
        const active = this.activeJobs.get(job.id)!;
        active.process = proc;

        proc.stdout.on('data', (chunk) => {
          try { this.consumeProgress(job.id, chunk.toString()); } catch { /* swallow */ }
        });

        proc.stderr.on('data', (chunk) => {
          try {
            const text = chunk.toString() as string;
            stderrBuf += text;
            this.consumeProgress(job.id, text);
          } catch { /* swallow */ }
        });

        proc.on('error', async (error) => {
          this.logger.log('ERROR', 'yt-dlp spawn error', { message: error.message, jobId: job.id });
          this.emitStatus(job.id, 'error', `yt-dlp process error: ${error.message}`);
          await this.finalize(job, 'failed', error.message);
        });

        proc.on('close', async (code) => {
          const activeEntry = this.activeJobs.get(job.id);

          if (activeEntry?.pauseRequested) {
            this.activeJobs.delete(job.id);
            this.pausedJobs.set(job.id, job);
            this.logger.log('INFO', 'Download paused — .part file preserved', { jobId: job.id, outputDir: job.outputDir });
            return;
          }

          if (activeEntry?.cancelRequested) {
            await this.cleanupPartFiles(job.outputDir);
            this.emitStatus(job.id, 'error', 'Download cancelled');
            await this.finalize(job, 'cancelled');
            return;
          }

          if (code === 0) {
            this.emitStatus(job.id, 'done', 'Download complete');
            await this.finalize(job, 'completed');
            return;
          }

          const signal = classifyStderr(stderrBuf);

          if (signal === 'bot_block' && !isRetrying) {
            isRetrying = true;
            this.emitStatus(job.id, 'token', 'Re-minting token...');
            this.tokenService.invalidateCache();
            try {
              const { token: newToken, visitorData: newVisitorData } = await this.tokenService.mintTokenForUrl(job.url);
              spawnProcess(newToken, newVisitorData);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Token re-mint failed';
              this.emitStatus(job.id, 'error', msg);
              await this.finalize(job, 'failed', msg);
            }
            return;
          }

          const message = signal
            ? friendlyMessage(signal)
            : (extractLastError(stderrBuf) ?? `yt-dlp exited with code ${code ?? -1}`);
          this.logger.log('ERROR', 'yt-dlp download failed', { jobId: job.id, code, signal });
          this.emitStatus(job.id, 'error', message);
          await this.finalize(job, 'failed', message);
        });
      };

      spawnProcess(token, visitorData);
      return ok({ job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download startup failure';
      this.emitStatus(job.id, 'error', message);
      await this.finalize(job, 'failed', message);
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
    active.process.kill('SIGTERM');
    this.logger.log('INFO', 'SIGTERM sent to yt-dlp process', { jobId: active.job.id });
    return ok({ paused: true });
  }

  private async cancelOne(active: ActiveDownload): Promise<Result<CancelDownloadOutput>> {
    active.cancelRequested = true;

    if (active.process) {
      this.logger.log('INFO', 'Sending SIGKILL to yt-dlp process', { jobId: active.job.id });
      active.process.kill('SIGKILL');
      return ok({ cancelled: true });
    }

    if (active.mockTimer) {
      const { job } = active;
      this.logger.log('INFO', 'Clearing mock download timer', { jobId: job.id });
      clearInterval(active.mockTimer);
      active.mockTimer = undefined;
      await this.cleanupPartFiles(job.outputDir);
      await this.finalize(job, 'cancelled');
      this.emitStatus(job.id, 'error', 'Download cancelled');
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
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      this.logger.log('INFO', line, { jobId, source: 'yt-dlp-progress' });
      const event: ProgressEvent = {
        jobId,
        line,
        at: nowIso(),
        percent: parsePercentFromLine(line)
      };
      this.emit('progress', event);
    }
  }

  private emitStatus(jobId: string, stage: StatusEvent['stage'], message: string): void {
    const event: StatusEvent = {
      jobId,
      stage,
      message,
      at: nowIso()
    };
    this.emit('status', event);
    this.logger.log(stage === 'error' ? 'ERROR' : 'INFO', message, { jobId, stage });
  }

  private async finalize(
    job: DownloadJob,
    status: RecentJob['status'],
    errorMessage?: string
  ): Promise<void> {
    this.logger.log('INFO', 'Job finalized', { jobId: job.id, status, ...(errorMessage && { errorMessage }) });
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
      errorMessage
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
        this.emitStatus(jobId, 'done', 'Download complete');
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
