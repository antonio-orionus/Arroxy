import { ipcMain } from 'electron';
import log from 'electron-log/main';
import { IPC_CHANNELS } from '@shared/ipc';
import type { WizardStepSnapshot } from '@shared/types';

const logger = log.scope('wizard');

function isWizardStepSnapshot(value: unknown): value is WizardStepSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.transition === 'string' && typeof v.fromStep === 'string' && typeof v.toStep === 'string' && typeof v.snapshot === 'object' && v.snapshot !== null;
}

export function registerDiagnosticsHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.diagnosticsLogWizardStep);
  ipcMain.on(IPC_CHANNELS.diagnosticsLogWizardStep, (_, payload: unknown) => {
    if (!isWizardStepSnapshot(payload)) return;
    logger.info('step', {
      transition: payload.transition,
      from: payload.fromStep,
      to: payload.toStep,
      snapshot: payload.snapshot
    });
  });
}
