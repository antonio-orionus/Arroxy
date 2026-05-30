// Adapter for non-fatal renderer-side failures. Today logs to console;
// future toast UI integration plugs in here without touching call sites.
export const notify = {
  settingsSaveFailed(field: string, error: unknown): void {
    console.error(`[settings] ${field} save failed`, error);
  },
  warmupFailed(reason: string, error: unknown): void {
    console.error(`[warmup] ${reason}`, error);
  },
  shellActionFailed(action: string, error: unknown): void {
    console.error(`[shell] ${action} failed`, error);
  },
  folderSelectFailed(error: unknown): void {
    console.error('[dialog] folder selection failed', error);
  },
  playlistFolderRejected(dir: string): void {
    console.warn('[playlist] picked folder is not usable as base + subfolder', dir);
  }
};
