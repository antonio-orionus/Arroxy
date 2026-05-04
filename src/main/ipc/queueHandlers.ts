import { IPC_CHANNELS } from '@shared/ipc';
import { queueArraySchema } from '@shared/schemas';
import { ok } from '@shared/result';
import { unknownToMessage } from '@main/utils/errorFactory';
import type { QueueStore } from '@main/stores/QueueStore';
import type { LogService } from '@main/services/LogService';
import { handle, handleRaw, toUnknownFailure } from './utils';

interface QueueHandlerDeps {
  queueStore: QueueStore;
  logService: LogService;
}

export function registerQueueHandlers(deps: QueueHandlerDeps): void {
  const { queueStore, logService } = deps;

  handleRaw(IPC_CHANNELS.queueLoad, async () => {
    try {
      const result = await queueStore.load();
      if (!result.ok) {
        logService.log('ERROR', 'queue:load failed', { error: result.error.message });
      }
      return result;
    } catch (error) {
      return toUnknownFailure(error);
    }
  });

  handle(IPC_CHANNELS.queueSave, queueArraySchema, async (items) => {
    try {
      await queueStore.save(items);
      return ok({ saved: true });
    } catch (error) {
      logService.log('ERROR', 'queue:save failed', { error: unknownToMessage(error) });
      return toUnknownFailure(error);
    }
  });
}
