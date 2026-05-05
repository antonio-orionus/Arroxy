import type { StoreApi } from 'zustand';
import type { AppError, AppSettings, AudioBitrate, AudioConvertTarget, FormatOption, Preset, QueueItem, SubtitleFormat, SubtitleMap, SubtitleMode, SponsorBlockMode, SponsorBlockCategory, SupportedLang, UiTheme } from '@shared/types';
export type WizardStep = 'url' | 'formats' | 'subtitles' | 'sponsorblock' | 'output' | 'folder' | 'confirm' | 'error';

// Discriminated union for the renderer's audio-column selection. Three modes:
//   none    — no audio (video-only download)
//   native  — pick a YouTube audio stream as-is (existing behavior)
//   convert — let yt-dlp re-encode/remux to a target codec; main process
//             translates this to -x --audio-format X (--audio-quality NK).
// The IPC payload is derived at queue-build time: convert sends `audioConvert`
// + `formatId=undefined`; native sends `formatId` composed with the video pick.
export type AudioSelection = { kind: 'none' } | { kind: 'native'; formatId: string } | { kind: 'convert'; target: 'wav' } | { kind: 'convert'; target: Exclude<AudioConvertTarget, 'wav'>; bitrateKbps: AudioBitrate };

export type SetState = StoreApi<AppState>['setState'];
export type GetState = StoreApi<AppState>['getState'];

export interface WizardSlice {
  wizardStep: WizardStep;
  formatsLoading: boolean;
  wizardUrl: string;
  wizardTitle: string;
  wizardThumbnail: string;
  wizardDuration?: number;
  wizardFormats: FormatOption[];
  selectedVideoFormatId: string;
  audioSelection: AudioSelection;
  // Preserves the user's bitrate choice when toggling between mp3/m4a/opus
  // rows or away to wav and back. Default 192 (industry standard MP3).
  lastConvertBitrate: AudioBitrate;
  // May be set IMPLICITLY when video='' (see setSelectedVideoFormatId).
  // Don't treat it as "the preset the user explicitly clicked."
  activePreset: Preset | null;
  wizardOutputDir: string;
  wizardError: AppError | null;
  wizardErrorOrigin: 'formats' | null;
  wizardSubtitles: SubtitleMap;
  wizardAutomaticCaptions: SubtitleMap;
  wizardSubtitleLanguages: string[];
  wizardSubtitleSkipped: boolean;
  wizardSubtitleMode: SubtitleMode;
  wizardSubtitleFormat: SubtitleFormat;
  wizardSubfolderEnabled: boolean;
  wizardSubfolderName: string;
  wizardSponsorBlockMode: SponsorBlockMode;
  wizardSponsorBlockCategories: SponsorBlockCategory[];
  wizardEmbedChapters: boolean;
  wizardEmbedMetadata: boolean;
  wizardEmbedThumbnail: boolean;
  wizardWriteDescription: boolean;
  wizardWriteThumbnail: boolean;

  setWizardUrl: (url: string) => void;
  submitUrl: () => Promise<void>;
  advance: () => void;
  back: () => void;
  reset: () => void;
  retry: () => Promise<void>;
  setWizardOutputDir: (dir: string, persist?: boolean) => Promise<void>;
  setSelectedVideoFormatId: (id: string) => void;
  setAudioSelection: (sel: AudioSelection) => void;
  setPreset: (p: Preset) => void;
  toggleSubtitleLanguage: (lang: string) => void;
  setSubtitleMode: (mode: SubtitleMode) => void;
  setSubtitleFormat: (format: SubtitleFormat) => void;
  chooseWizardFolder: () => Promise<void>;
  setWizardSubfolderEnabled: (enabled: boolean) => void;
  setWizardSubfolderName: (name: string) => void;
  skipSubtitles: () => void;
  setSponsorBlockMode: (mode: SponsorBlockMode) => void;
  toggleSponsorBlockCategory: (cat: SponsorBlockCategory) => void;
  setEmbedChapters: (v: boolean) => void;
  setEmbedMetadata: (v: boolean) => void;
  setEmbedThumbnail: (v: boolean) => void;
  setWriteDescription: (v: boolean) => void;
  setWriteThumbnail: (v: boolean) => void;
}

export interface QueueSlice {
  queue: QueueItem[];

  addToQueue: () => Promise<void>;
  addAndDownloadImmediately: () => Promise<void>;
  startItemDownload: (itemId: string) => Promise<void>;
  cancelItemDownload: (itemId: string) => Promise<void>;
  pauseItemDownload: (itemId: string) => Promise<void>;
  resumeItemDownload: (itemId: string) => Promise<void>;
  removeQueueItem: (itemId: string) => void;
  retryQueueItem: (itemId: string) => Promise<void>;
  clearCompleted: () => void;
  openItemFolder: (itemId: string) => Promise<void>;
  openItemUrl: (itemId: string) => void;
}

export interface UiSlice {
  uiZoom: number;
  uiTheme: UiTheme;
  drawerOpen: boolean;
  showQueueTip: boolean;

  setDrawerOpen: (open: boolean) => void;
  dismissQueueTip: () => void;
  setUiZoom: (zoom: number) => void;
  setUiTheme: (theme: UiTheme) => void;
}

export interface SystemSlice {
  initialized: boolean;
  initializing: boolean;
  warmupFailures: string[];
  settings: AppSettings | null;
  language: SupportedLang;
  commonPaths: AppSettings['commonPaths'];
  initialize: () => Promise<void>;
  openLogs: () => Promise<void>;
  setLanguage: (lang: SupportedLang) => void;
  setCookiesPath: (path: string) => Promise<void>;
  setCookiesEnabled: (enabled: boolean) => Promise<void>;
  setProxyUrl: (url: string) => Promise<void>;
  setClipboardWatchEnabled: (enabled: boolean) => Promise<void>;
  setCloseBehavior: (value: 'tray' | 'quit') => Promise<void>;
  setAnalyticsEnabled: (enabled: boolean) => Promise<void>;
}

export type AppState = WizardSlice & QueueSlice & UiSlice & SystemSlice;
