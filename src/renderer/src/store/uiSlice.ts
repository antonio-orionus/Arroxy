import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {AppState, GetState, SetState, UiSlice} from './types.js'

export function createUiSlice(set: SetState, _get: GetState): UiSlice {
	return {
		uiZoom: DEFAULTS.uiZoom,
		uiTheme: DEFAULTS.uiTheme,
		aboutDialogOpen: false,
		exploreAddressHint: null,
		exploreBrowsing: false,

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

		setAboutDialogOpen: open => set({aboutDialogOpen: open}),

		setExploreAddressHint: hint => set({exploreAddressHint: hint}),

		setExploreBrowsing: browsing => set({exploreBrowsing: browsing})
	}
}

// The app chrome goes compact only while the Explore browser is on screen, so
// the other tabs always keep their full tab bar and footer.
export function selectCompactChrome(state: AppState): boolean {
	return state.exploreBrowsing && state.settings?.common?.exploreCompactChrome === true
}
