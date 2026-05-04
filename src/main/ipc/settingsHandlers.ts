import { IPC_CHANNELS } from '@shared/ipc';
import { updateSettingsSchema } from '@shared/schemas';
import { ok } from '@shared/result';
import type { SettingsStore } from '@main/stores/SettingsStore';
import type { ClipboardWatcher } from '@main/services/ClipboardWatcher';
import { setAnalyticsEnabled } from '@main/services/analytics';
import { buildCommonPaths, handle, handleRaw, toUnknownFailure } from './utils';

interface SettingsHandlerDeps {
  settingsStore: SettingsStore;
  clipboardWatcher: ClipboardWatcher;
}

export function registerSettingsHandlers(deps: SettingsHandlerDeps): void {
  const { settingsStore, clipboardWatcher } = deps;

  handleRaw(IPC_CHANNELS.settingsGet, async () => {
    try {
      const settings = await settingsStore.get();
      return ok({ ...settings, commonPaths: buildCommonPaths() });
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handle(IPC_CHANNELS.settingsUpdate, updateSettingsSchema, async (data) => {
    const updated = await settingsStore.update(data);
    clipboardWatcher.setEnabled(updated.clipboardWatchEnabled);
    if (data.analyticsEnabled !== undefined) {
      setAnalyticsEnabled(updated.analyticsEnabled ?? true);
    }
    return ok(updated);
  });
}
