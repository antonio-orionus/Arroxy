import log from 'electron-log/main';
import { IPC_CHANNELS } from '@shared/ipc';
import { supportedLangSchema } from '@shared/schemas';
import type { SupportedLang } from '@shared/i18n/types';
import type { WarmupService } from '@main/services/WarmupService';
import { handleRaw } from './utils';

interface AppHandlerDeps {
  warmupService: WarmupService;
  languageRef: { current: SupportedLang };
}

export function registerAppHandlers(deps: AppHandlerDeps): void {
  const { warmupService, languageRef } = deps;

  handleRaw(IPC_CHANNELS.appWarmUp, () => warmupService.run());

  handleRaw(IPC_CHANNELS.appSetLanguage, (_, payload: unknown) => {
    const parsed = supportedLangSchema.safeParse(payload);
    if (parsed.success) {
      languageRef.current = parsed.data;
    } else {
      log.warn('app:setLanguage rejected — invalid language', { payload });
    }
  });
}
