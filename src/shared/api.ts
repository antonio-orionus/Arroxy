import type { Result } from './result';
import type { SupportedLang } from './i18n/types';
import type { AppSettings, CancelDownloadInput, CancelDownloadOutput, DownloadJob, GetFormatsInput, GetFormatsOutput, PauseDownloadInput, PauseDownloadOutput, ProgressEvent, QueueItem, StartDownloadInput, StartDownloadOutput, StatusEvent, UpdateAvailablePayload, UpdateInstallResult, WarmUpOutput, WizardStepSnapshot } from './types';

export interface WindowApi {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  isMaximized(): Promise<boolean>;
  onMaximizedChange(listener: (isMaximized: boolean) => void): () => void;
}

export interface AppApi {
  app: {
    warmUp(): Promise<Result<WarmUpOutput>>;
    setLanguage(language: SupportedLang): Promise<void>;
  };
  window: WindowApi;
  downloads: {
    getFormats(input: GetFormatsInput): Promise<Result<GetFormatsOutput>>;
    start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>>;
    cancel(input?: CancelDownloadInput): Promise<Result<CancelDownloadOutput>>;
    pause(input?: PauseDownloadInput): Promise<Result<PauseDownloadOutput>>;
    resume(input: { jobId: string }): Promise<Result<{ resumed: boolean; job?: DownloadJob }>>;
  };
  settings: {
    get(): Promise<Result<AppSettings>>;
    update(input: Partial<AppSettings>): Promise<Result<AppSettings>>;
  };
  shell: {
    openFolder(path?: string): Promise<Result<{ opened: boolean }>>;
    openExternal(url: string): Promise<Result<{ opened: boolean }>>;
  };
  logs: {
    openDir(): Promise<Result<{ opened: boolean }>>;
  };
  dialog: {
    chooseFolder(): Promise<Result<{ path: string | null }>>;
    chooseFile(): Promise<Result<{ path: string | null }>>;
  };
  events: {
    onStatus(listener: (event: StatusEvent) => void): () => void;
    onProgress(listener: (event: ProgressEvent) => void): () => void;
    onClipboardUrl(listener: (url: string) => void): () => void;
  };
  queue: {
    save(items: QueueItem[]): Promise<Result<{ saved: true }>>;
    load(): Promise<Result<QueueItem[]>>;
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
}
