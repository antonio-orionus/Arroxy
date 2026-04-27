import type { StatusKey, SupportedLang, LocalizedError } from './i18n/types';

export type { StatusKey, SupportedLang, LocalizedError, YtdlpErrorKey } from './i18n/types';

export type AppErrorCode = 'validation' | 'token' | 'binary' | 'download' | 'ipc' | 'unknown';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: string;
  recoverable?: boolean;
}

export type Preset = 'best-quality' | 'balanced' | 'audio-only' | 'small-file';

export interface AppSettings {
  defaultOutputDir: string;
  rememberLastOutputDir: boolean;
  lastVideoResolution?: string;
  lastPreset?: Preset | null;
  uiZoom?: number;
  uiTheme?: 'light' | 'dark' | 'system';
  language?: SupportedLang;
  commonPaths?: { downloads: string; videos: string; desktop: string };
}

export interface FormatOption {
  formatId: string;
  label: string;
  ext: string;
  resolution: string;
  fps?: number;
  abr?: number;
  filesize?: number;
  isVideoOnly: boolean;
  isAudioOnly: boolean;
  dynamicRange?: string;
}

export type DownloadJobStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface DownloadJob {
  id: string;
  url: string;
  outputDir: string;
  formatId?: string;
  status: DownloadJobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RecentJob {
  id: string;
  url: string;
  outputDir: string;
  formatId?: string;
  status: Extract<DownloadJobStatus, 'completed' | 'failed' | 'cancelled'>;
  finishedAt: string;
  error?: LocalizedError;
}

export type QueueItemStatus = 'pending' | 'downloading' | 'paused' | 'done' | 'error' | 'cancelled';

export interface StatusSnapshot {
  key: StatusKey;
  params?: Record<string, string | number>;
}

export interface QueueItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  outputDir: string;
  formatId: string | undefined;
  formatLabel: string;
  status: QueueItemStatus;
  progressPercent: number;
  progressDetail: string | null;
  lastStatus: StatusSnapshot | null;
  error: LocalizedError | null;
  finishedAt: string | null;
  downloadJobId: string | null;
}

export type DownloadStage = 'setup' | 'token' | 'download' | 'done' | 'error';

export interface StatusEvent {
  jobId: string;
  stage: DownloadStage;
  statusKey: StatusKey;
  params?: Record<string, string | number>;
  error?: LocalizedError;
  at: string;
}

export interface ProgressEvent {
  jobId: string;
  line: string;
  at: string;
  percent?: number;
}

export interface WarmUpOutput {
  completed: boolean;
  failures: string[];
}

export interface StartDownloadInput {
  url: string;
  outputDir?: string;
  formatId?: string;
}

export interface StartDownloadOutput {
  job: DownloadJob;
}

export interface GetFormatsInput {
  url: string;
}

export interface GetFormatsOutput {
  formats: FormatOption[];
  title: string;
  thumbnail: string;
  duration?: number;
}

export interface CancelDownloadInput {
  jobId?: string;
}

export interface CancelDownloadOutput {
  cancelled: boolean;
}

export interface PauseDownloadInput {
  jobId?: string;
}

export interface PauseDownloadOutput {
  paused: boolean;
}

export type InstallChannel = 'direct' | 'winget' | 'scoop' | 'homebrew';

export interface UpdateAvailablePayload {
  version: string;
  currentVersion: string;
  installChannel: InstallChannel;
}
