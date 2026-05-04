import type { LocalizedError } from './i18n/types';

// Re-export the enum types whose canonical definition lives in `schemas.ts`
// (where they're z.enum schemas). Importing from `@shared/types` continues to
// work for callers that don't care about the schema vs type distinction.
export type { Preset, SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, SupportedLang, UiTheme, QueueItemStatus } from './schemas';

export type { StatusKey } from './schemas';
export type { LocalizedError, YtdlpErrorKey } from './i18n/types';

import type { Preset, SubtitleMode, SubtitleFormat, SponsorBlockMode, SponsorBlockCategory, SupportedLang, UiTheme, StatusKey } from './schemas';

export type AppErrorCode = 'validation' | 'token' | 'binary' | 'download' | 'ipc' | 'unknown';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: string;
  recoverable?: boolean;
}

export interface AppSettings {
  defaultOutputDir: string;
  rememberLastOutputDir: boolean;
  lastVideoResolution?: string;
  lastPreset?: Preset | null;
  uiZoom?: number;
  uiTheme?: UiTheme;
  language?: SupportedLang;
  commonPaths?: {
    downloads: string | null;
    videos: string | null;
    desktop: string | null;
    music: string | null;
    documents: string | null;
    pictures: string | null;
    home: string | null;
  };
  lastSubtitleLanguages?: string[];
  lastSubtitleMode?: SubtitleMode;
  lastSubtitleFormat?: SubtitleFormat;
  lastSponsorBlockMode?: SponsorBlockMode;
  lastSponsorBlockCategories?: SponsorBlockCategory[];
  lastSubfolderEnabled?: boolean;
  lastSubfolder?: string;
  cookiesPath?: string;
  cookiesEnabled?: boolean;
  clipboardWatchEnabled: boolean;
  closeBehavior?: 'ask' | 'tray' | 'quit';
  embedChapters?: boolean;
  embedMetadata?: boolean;
  embedThumbnail?: boolean;
  writeDescription?: boolean;
  writeThumbnail?: boolean;
  analyticsEnabled?: boolean;
  firstRunCompleted?: boolean;
}

export interface SubtitleTrack {
  ext: string;
  name?: string;
}

export type SubtitleMap = Record<string, SubtitleTrack[]>;

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
  expectedBytes?: number;
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
  formatId?: string;
  formatLabel: string;
  preset?: string;
  status: import('./schemas').QueueItemStatus;
  progressPercent: number;
  progressDetail: string | null;
  lastStatus: StatusSnapshot | null;
  error: LocalizedError | null;
  finishedAt: string | null;
  downloadJobId: string | null;
  subtitleLanguages: string[];
  writeAutoSubs: boolean;
  subtitleMode: SubtitleMode;
  subtitleFormat: SubtitleFormat;
  sponsorBlockMode: SponsorBlockMode;
  sponsorBlockCategories: SponsorBlockCategory[];
  embedChapters: boolean;
  embedMetadata: boolean;
  embedThumbnail: boolean;
  writeDescription: boolean;
  writeThumbnail: boolean;
  expectedBytes?: number;
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
  preset?: string;
  cookiesEnabled?: boolean;
  subtitleLanguages?: string[];
  writeAutoSubs?: boolean;
  subtitleMode?: SubtitleMode;
  subtitleFormat?: SubtitleFormat;
  sponsorBlockMode?: SponsorBlockMode;
  sponsorBlockCategories?: SponsorBlockCategory[];
  embedChapters?: boolean;
  embedMetadata?: boolean;
  embedThumbnail?: boolean;
  writeDescription?: boolean;
  writeThumbnail?: boolean;
  expectedBytes?: number;
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
  subtitles: SubtitleMap;
  automaticCaptions: SubtitleMap;
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

export type InstallChannel = 'direct' | 'winget' | 'scoop' | 'homebrew' | 'flatpak' | 'portable';

export const INSTALL_CHANNELS: readonly InstallChannel[] = ['direct', 'winget', 'scoop', 'homebrew', 'flatpak', 'portable'] as const;

export interface UpdateAvailablePayload {
  version: string;
  currentVersion: string;
  installChannel: InstallChannel;
}

export type UpdateInstallResult = { ok: true } | { ok: false; error: string };
