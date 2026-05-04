import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';
import { analyticsTrackSchema } from '@shared/schemas';
import { trackMain } from '@main/services/analytics';

export function registerAnalyticsHandlers(): void {
  // Fire-and-forget: allowlist enforcement happens inside trackMain,
  // and the enabled flag is owned by the main process (no renderer-side bypass).
  ipcMain.removeAllListeners(IPC_CHANNELS.analyticsTrack);
  ipcMain.on(IPC_CHANNELS.analyticsTrack, (_, payload: unknown) => {
    const parsed = analyticsTrackSchema.safeParse(payload);
    if (!parsed.success) return;
    trackMain(parsed.data.name, parsed.data.props);
  });
}
