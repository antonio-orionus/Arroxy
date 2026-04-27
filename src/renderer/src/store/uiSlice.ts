import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '@shared/schemas';
import { DEFAULTS } from '@shared/constants';
import type { GetState, SetState, UiSlice } from './types';

export function createUiSlice(set: SetState, _get: GetState): UiSlice {
  return {
    uiZoom: DEFAULTS.uiZoom,
    uiTheme: DEFAULTS.uiTheme,
    drawerOpen: false,
    showQueueTip: false,

    setDrawerOpen: (open) => set({ drawerOpen: open }),
    dismissQueueTip: () => set({ showQueueTip: false }),

    setUiZoom: (zoom) => {
      const stepInverse = 1 / ZOOM_STEP;
      const clamped = Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) * stepInverse) / stepInverse;
      set({ uiZoom: clamped });
      void window.appApi.settings.update({ uiZoom: clamped }).then((result) => {
        if (!result.ok) console.error('[settings] uiZoom save failed', result.error);
      });
    },

    setUiTheme: (theme) => {
      set({ uiTheme: theme });
      void window.appApi.settings.update({ uiTheme: theme }).then((result) => {
        if (!result.ok) console.error('[settings] uiTheme save failed', result.error);
      });
    }
  };
}
