import {ZOOM_MIN, ZOOM_MAX, ZOOM_STEP} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {resolveEffectiveStyle, type BackdropAvailability} from '../styles/registry.js'
import type {UiStyle} from '@shared/schemas.js'
import type {AppState, GetState, SetState, UiSlice} from './types.js'

export function createUiSlice(set: SetState, get: GetState): UiSlice {
	return {
		uiZoom: DEFAULTS.uiZoom,
		uiTheme: DEFAULTS.uiTheme,
		uiStyle: DEFAULTS.uiStyle,
		backdropFailed: false,
		aboutDialogOpen: false,
		donateDialogOpen: false,
		exploreAddressHint: null,
		exploreBrowsing: false,
		explorePendingAddress: null,

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

		setUiStyle: style => {
			set({uiStyle: style})
			void window.appApi.settings.update({common: {uiStyle: style}}).then(result => {
				if (!result.ok) console.error('[settings] uiStyle save failed', result.error)
			})
		},

		setBackdropFailed: failed => set({backdropFailed: failed}),

		setAboutDialogOpen: open => set({aboutDialogOpen: open}),
		setDonateDialogOpen: open => set({donateDialogOpen: open}),

		setExploreAddressHint: hint => set({exploreAddressHint: hint}),

		setExploreBrowsing: browsing => set({exploreBrowsing: browsing}),

		takeExplorePendingAddress: () => {
			const address = get().explorePendingAddress
			if (address !== null) set({explorePendingAddress: null})
			return address
		}
	}
}

// The app chrome goes compact only while the Explore browser is on screen, so
// the other tabs always keep their full tab bar and footer.
export function selectCompactChrome(state: AppState): boolean {
	return state.exploreBrowsing && state.settings?.common?.exploreCompactChrome === true
}

export function selectBackdropAvailability(state: AppState): BackdropAvailability {
	if (!state.graphicsPolicy) return 'unknown'
	return state.graphicsPolicy.backdrop.webglBlocked || state.backdropFailed ? 'blocked' : 'available'
}

// The style actually painted: the chosen one, or the base style when the chosen
// one needs a hardware backdrop this machine cannot draw.
export function selectEffectiveStyle(state: AppState): UiStyle {
	return resolveEffectiveStyle(state.uiStyle, selectBackdropAvailability(state))
}
