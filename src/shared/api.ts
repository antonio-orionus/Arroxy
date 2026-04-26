import type { Result } from './result';
import type {
  AppSettings,
  CancelDownloadInput,
  CancelDownloadOutput,
  GetFormatsInput,
  GetFormatsOutput,
  PauseDownloadInput,
  PauseDownloadOutput,
  ProgressEvent,
  QueueItem,
  StartDownloadInput,
  StartDownloadOutput,
  StatusEvent,
  UpdateAvailablePayload,
  WarmUpOutput
} from './types';

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
  };
  window: WindowApi;
  downloads: {
    getFormats(input: GetFormatsInput): Promise<Result<GetFormatsOutput>>;
    start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>>;
    cancel(input?: CancelDownloadInput): Promise<Result<CancelDownloadOutput>>;
    pause(input?: PauseDownloadInput): Promise<Result<PauseDownloadOutput>>;
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
  };
  events: {
    onStatus(listener: (event: StatusEvent) => void): () => void;
    onProgress(listener: (event: ProgressEvent) => void): () => void;
  };
  queue: {
    save(items: QueueItem[]): Promise<void>;
    load(): Promise<QueueItem[]>;
  };
  updater: {
    onUpdateAvailable(listener: (info: UpdateAvailablePayload) => void): () => void;
    install(): Promise<void>;
  };
}
