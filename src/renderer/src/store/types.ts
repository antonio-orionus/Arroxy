import type { StoreApi } from 'zustand';
import type {
  AppError,
  AppSettings,
  FormatOption,
  Preset,
  QueueItem,
  SubtitleFormat,
  SubtitleMap,
  SubtitleMode,
  SupportedLang,
  UiTheme
} from '@shared/types';
export type WizardStep = 'url' | 'formats' | 'subtitles' | 'folder' | 'confirm' | 'error';

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
  selectedAudioFormatId: string | null;
  activePreset: Preset | null;
  wizardOutputDir: string;
  wizardError: AppError | null;
  wizardErrorOrigin: 'formats' | null;
  wizardSubtitles: SubtitleMap;
  wizardAutomaticCaptions: SubtitleMap;
  wizardSubtitleLanguages: string[];
  wizardSubtitleMode: SubtitleMode;
  wizardSubtitleFormat: SubtitleFormat;

  setWizardUrl: (url: string) => void;
  submitUrl: () => Promise<void>;
  goToStep: (step: WizardStep) => void;
  setWizardOutputDir: (dir: string, persist?: boolean) => Promise<void>;
  setSelectedVideoFormatId: (id: string) => void;
  setAudioFormatId: (id: string | null) => void;
  setPreset: (p: Preset) => void;
  confirmFormats: () => void;
  toggleSubtitleLanguage: (lang: string) => void;
  setSubtitleMode: (mode: SubtitleMode) => void;
  setSubtitleFormat: (format: SubtitleFormat) => void;
  confirmSubtitles: () => void;
  chooseWizardFolder: () => Promise<void>;
  confirmFolder: () => void;
  retryWizard: () => Promise<void>;
  resetWizard: () => void;
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
  // Unbind handles for IPC event listeners — populated during initialize() so
  // a future teardown (or re-init) can detach old listeners cleanly.
  _unbindStatus: (() => void) | null;
  _unbindProgress: (() => void) | null;

  initialize: () => Promise<void>;
  openLogs: () => Promise<void>;
  setLanguage: (lang: SupportedLang) => void;
}

export type AppState = WizardSlice & QueueSlice & UiSlice & SystemSlice;
