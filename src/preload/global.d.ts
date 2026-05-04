import type { AppApi } from '@shared/api';

declare global {
  interface Window {
    appApi: AppApi;
    platform: NodeJS.Platform;
    appVersion: string;
  }
}

export {};
