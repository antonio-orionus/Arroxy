import type { Result } from './result.js';
import type { SupportedLang } from './i18n/types.js';
import type { AppSettings, CancelDownloadInput, CancelDownloadOutput, CommonSettings, DependencyId, DownloadJob, PauseDownloadInput, PauseDownloadOutput, PlaylistPrefs, ProbeError, ProbeInput, ProbeResult, ProgressEvent, QueueItem, QueueLane, SinglePrefs, StartDownloadInput, StartDownloadOutput, StatusEvent, UpdateAvailablePayload, UpdateInstallResult, WarmUpOutput, WarmupProgressEvent, WizardStepSnapshot } from './types.js';
import type { PlaylistManifest } from './playlistManifest.js';

export interface SettingsPatch {
  common?: Partial<CommonSettings>;
  single?: Partial<SinglePrefs>;
  playlist?: Partial<PlaylistPrefs>;
}

export interface WindowApi {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  isMaximized(): Promise<boolean>;
  onMaximizedChange(listener: (isMaximized: boolean) => void): () => void;
}

export interface AppApi {
  app: {
    warmUp(input?: { force?: boolean }): Promise<Result<WarmUpOutput>>;
    cancelWarmup(): Promise<void>;
    setLanguage(language: SupportedLang): Promise<void>;
  };
  window: WindowApi;
  downloads: {
    probe(input: ProbeInput): Promise<Result<ProbeResult, ProbeError>>;
    probeCancel(): Promise<void>;
    start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>>;
    cancel(input?: CancelDownloadInput): Promise<Result<CancelDownloadOutput>>;
    pause(input?: PauseDownloadInput): Promise<Result<PauseDownloadOutput>>;
    resume(input: { jobId: string }): Promise<Result<{ resumed: boolean; job?: DownloadJob }>>;
  };
  settings: {
    get(): Promise<Result<AppSettings>>;
    update(input: SettingsPatch): Promise<Result<AppSettings>>;
  };
  shell: {
    openFolder(path?: string): Promise<Result<{ opened: boolean }>>;
    openExternal(url: string): Promise<Result<{ opened: boolean }>>;
    openBinariesDir(): Promise<Result<{ opened: boolean }>>;
  };
  logs: {
    openDir(): Promise<Result<{ opened: boolean }>>;
  };
  dialog: {
    chooseFolder(defaultPath?: string): Promise<Result<{ path: string | null }>>;
    chooseFile(): Promise<Result<{ path: string | null }>>;
    chooseExecutable(binary: DependencyId): Promise<Result<{ path: string | null }>>;
  };
  events: {
    onStatus(listener: (event: StatusEvent) => void): () => void;
    onProgress(listener: (event: ProgressEvent) => void): () => void;
    onClipboardUrl(listener: (url: string) => void): () => void;
    onWarmupProgress(listener: (event: WarmupProgressEvent) => void): () => void;
  };
  queue: {
    cmd: {
      add(items: QueueItem[]): Promise<Result<{ ids: string[] }>>;
      getSnapshot(): Promise<Result<QueueItem[]>>;
      start(input: { itemId: string }): Promise<Result<void>>;
      pause(input: { itemId: string }): Promise<Result<void>>;
      resume(input: { itemId: string }): Promise<Result<void>>;
      cancel(input: { itemId: string | null }): Promise<Result<void>>;
      retry(input: { itemId: string }): Promise<Result<void>>;
      clearCompleted(): Promise<Result<void>>;
      remove(input: { itemId: string }): Promise<Result<void>>;
      setLane(input: { itemId: string; lane: QueueLane }): Promise<Result<void>>;
      pauseAll(): Promise<Result<void>>;
      resumeAll(): Promise<Result<void>>;
    };
    events: {
      onSnapshot(listener: (items: QueueItem[]) => void): () => void;
      onAdded(listener: (event: { items: QueueItem[]; atIdx: number }) => void): () => void;
      onUpdated(listener: (event: { item: QueueItem }) => void): () => void;
      onRemoved(listener: (event: { itemId: string }) => void): () => void;
    };
  };
  updater: {
    onUpdateAvailable(listener: (info: UpdateAvailablePayload) => void): () => void;
    install(): Promise<UpdateInstallResult>;
  };
  analytics: {
    track(name: string, props?: Record<string, string | number | boolean>): void;
  };
  diagnostics: {
    logWizardStep(snapshot: WizardStepSnapshot): void;
  };
  playlist: {
    scanFolder(input: { outputDir: string; videoIds: string[] }): Promise<Result<{ matchedIds: string[] }>>;
    registerManifest(manifest: PlaylistManifest): Promise<Result<void>>;
  };
}
