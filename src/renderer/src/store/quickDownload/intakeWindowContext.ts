// Intake runs in main but needs what only the window knows: the folder its
// wizard points at (a profile without a fixed folder downloads there), whether
// its screen shows HDR (which settles the Auto HDR setting), and the profile it
// shows as active (a pick is saved through a queue of settings writes, so main
// may not hold it yet). They are reported as soon as settings load (the hotkey
// answers from then, before warmup ends) and again whenever one changes, so a
// link taken in by the hotkey prepares exactly as one taken in here.

import type {StoreApi} from 'zustand'
import {displayShowsHdr} from '@renderer/lib/displayHdr.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {IntakeWindowContext} from '@shared/intake/intakeSchemas.js'
import type {AppSettings, DownloadProfileRef} from '@shared/types.js'
import {detach} from './detachedTask.js'
import type {AppState} from '../types.js'

function report(context: IntakeWindowContext): void {
	detach(window.appApi.intake.setWindowContext(context), 'intake window context')
}

function sameContext(a: IntakeWindowContext, b: IntakeWindowContext): boolean {
	return a.currentOutputDir === b.currentOutputDir && a.displayShowsHdr === b.displayShowsHdr && a.activeProfile?.kind === b.activeProfile?.kind && a.activeProfile?.id === b.activeProfile?.id
}

export function watchIntakeWindowContext(store: Pick<StoreApi<AppState>, 'getState' | 'subscribe'>): () => void {
	let reported: IntakeWindowContext | null = null
	// The store changes often (progress); resolve the active profile only when
	// the profiles themselves change.
	let profiles: AppSettings['profiles'] | null = null
	let activeProfile: DownloadProfileRef | undefined
	const activeRef = (next: AppSettings['profiles']): DownloadProfileRef | undefined => {
		if (next !== profiles) {
			profiles = next
			activeProfile = resolveActiveDownloadProfile(next).ref
		}
		return activeProfile
	}
	const sync = (): void => {
		const state = store.getState()
		// Before settings load, the wizard has no folder yet. Settings set the
		// folder before warmup ends, and the hotkey answers through it, so
		// waiting for `initialized` would leave main on a stale folder.
		if (state.settings === null) return
		const next: IntakeWindowContext = {currentOutputDir: state.wizardOutputDir, displayShowsHdr: displayShowsHdr(), activeProfile: activeRef(state.settings.profiles)}
		if (reported !== null && sameContext(reported, next)) return
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
