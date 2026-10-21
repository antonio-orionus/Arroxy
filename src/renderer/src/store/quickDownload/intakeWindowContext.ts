// Intake runs in main but needs two things only the window knows: the folder
// its wizard points at (a profile without a fixed folder downloads there) and
// whether its screen shows HDR (which settles the Auto HDR setting). They are
// reported once the app is up and again whenever either changes, so a link
// taken in by the hotkey prepares exactly as one taken in here.

import type {StoreApi} from 'zustand'
import {displayShowsHdr} from '@renderer/lib/displayHdr.js'
import type {IntakeWindowContext} from '@shared/intake/intakeSchemas.js'
import {detach} from './detachedTask.js'
import type {AppState} from '../types.js'

function report(context: IntakeWindowContext): void {
	detach(window.appApi.intake.setWindowContext(context), 'intake window context')
}

export function watchIntakeWindowContext(store: Pick<StoreApi<AppState>, 'getState' | 'subscribe'>): () => void {
	let reported: IntakeWindowContext | null = null
	const sync = (): void => {
		const state = store.getState()
		// Before settings load, the wizard has no folder yet.
		if (!state.initialized) return
		const next = {currentOutputDir: state.wizardOutputDir, displayShowsHdr: displayShowsHdr()}
		if (reported !== null && reported.currentOutputDir === next.currentOutputDir && reported.displayShowsHdr === next.displayShowsHdr) return
		reported = next
		report(next)
	}
	const unsubscribe = store.subscribe(sync)
	// The window moving to a screen with another dynamic range.
	let unwatchScreen = (): void => undefined
	try {
		const query = window.matchMedia('(dynamic-range: high)')
		query.addEventListener('change', sync)
		unwatchScreen = () => query.removeEventListener('change', sync)
	} catch {
		// No media queries (tests): the screen reads as SDR, as displayShowsHdr does.
	}
	return () => {
		unsubscribe()
		unwatchScreen()
	}
}
