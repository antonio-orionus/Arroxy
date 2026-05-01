import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { DownloadJob, LocalizedError, RecentJob, StartDownloadInput, StatusEvent, StatusKey } from '@shared/types';
import type { YtDlp, YtDlpResult } from '../YtDlp';
import type { LogService } from '../LogService';

export interface ActiveDownload {
  job: DownloadJob;
  input: StartDownloadInput;
  cancelRequested: boolean;
  pauseRequested: boolean;
  ytDlpProcess?: ChildProcessWithoutNullStreams;
  ffmpegProcess?: ChildProcessWithoutNullStreams;
  mockTimer?: NodeJS.Timeout;
  currentFileKind?: 'subtitle' | 'media';
  subtitlePaths: string[];
  mediaPath?: string;
  usedExtractorFallback?: boolean;
}

export interface PausedDownload {
  job: DownloadJob;
  input: StartDownloadInput;
}

export type PhaseOutcome =
  | { kind: 'continue' }
  | { kind: 'completed' }
  | { kind: 'soft-failed'; status: StatusKey }
  | { kind: 'hard-failed'; error: LocalizedError }
  | { kind: 'cancelled' }
  | { kind: 'paused' };

export interface Phase {
  readonly kind: string;
  run(ctx: PhaseContext): Promise<PhaseOutcome>;
}

export interface PhaseContext {
  active: ActiveDownload;
  ytDlp: YtDlp;
  logger: LogService;
  emitStatus(stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError): void;
  emitYtdlpFailure(result: Exclude<YtDlpResult, { kind: 'success' }>): LocalizedError;
  attachYtDlpProcess(proc: ChildProcessWithoutNullStreams, statusKey?: StatusKey): void;
  safeConsume(text: string): void;
  cleanupPartFiles(dir: string): Promise<void>;
  finalize(status: RecentJob['status'], error?: LocalizedError): Promise<void>;
  moveToPaused(): void;
}
