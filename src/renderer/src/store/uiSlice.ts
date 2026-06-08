import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {GetState, SetState, UiSlice} from './types.js'

export function createUiSlice(set: SetState, _get: GetState): UiSlice {
	return {
		uiZoom: DEFAULTS.uiZoom,
		uiTheme: DEFAULTS.uiTheme,
		drawerOpen: false,
		showQueueTip: false,
		aboutDialogOpen: false,

		setDrawerOpen: open => {
			set({drawerOpen: open})
			void window.appApi.settings.update({common: {drawerOpen: open}}).then(result => {
				if (!result.ok) console.error('[settings] drawerOpen save failed', result.error)
			})
		},
		dismissQueueTip: () => set({showQueueTip: false}),

		setUiZoom: zoom => {
			const stepInverse = 1 / ZOOM_STEP
			const clamped = Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) * stepInverse) / stepInverse
			set({uiZoom: clamped})
			void window.appApi.settings.update({common: {uiZoom: clamped}}).then(result => {
				if (!result.ok) console.error('[settings] uiZoom save failed', result.error)
			})
		},

		setUiTheme: theme => {
			set({uiTheme: theme})
			void window.appApi.settings.update({common: {uiTheme: theme}}).then(result => {
				if (!result.ok) console.error('[settings] uiTheme save failed', result.error)
			})
		},

		setAboutDialogOpen: open => set({aboutDialogOpen: open})
	}
}
