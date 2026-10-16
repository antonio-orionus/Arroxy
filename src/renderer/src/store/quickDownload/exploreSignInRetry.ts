// The retry "Sign in with Explore" promises (P2-R51). The failed items wait
// in memory until Explore reports the sign-in, then probe again once. Moving
// the cookie mode off `explore` (or turning the Explore tab off) cancels the
// wait, a removed row drops out of it, and a restart forgets it: the row's own
// guidance under the explore mode covers it from there.

import type {StoreApi} from 'zustand'
import {notify} from '@renderer/lib/notify.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import type {AppState, ExploreRetryTarget, GetState, SetState} from '../types.js'
import {detach} from './detachedTask.js'

function sameRetryTarget(a: ExploreRetryTarget, b: ExploreRetryTarget): boolean {
	switch (a.kind) {
		case 'row':
		case 'download':
			return b.kind === a.kind && b.itemId === a.itemId
		case 'wizard':
			return b.kind === 'wizard' && a.url === b.url
		case 'home':
			return b.kind === 'home'
	}
}

export function withRetryTarget(targets: readonly ExploreRetryTarget[], target: ExploreRetryTarget): readonly ExploreRetryTarget[] {
	return targets.some(candidate => sameRetryTarget(candidate, target)) ? targets : [...targets, target]
}

function waitsForExplore(state: AppState): boolean {
	const common = state.settings?.common
	return common?.cookiesMode === 'explore' && common.exploreEnabled !== false
}

function rowExists(state: AppState, target: ExploreRetryTarget): boolean {
	return (target.kind !== 'row' && target.kind !== 'download') || state.queue.some(item => item.id === target.itemId)
}

// Still worth retrying: the row still failed, the URL tab still holds the
// wizard's link with no run open, the URL tab's quick download still failed.
function stillFailed(state: AppState, target: ExploreRetryTarget): boolean {
	switch (target.kind) {
		case 'row':
		case 'download':
			return state.queue.some(item => item.id === target.itemId && item.status === QUEUE_STATUS.error)
		case 'wizard':
			return state.wizardStep === 'url' && state.wizardUrl.trim() === target.url
		case 'home':
			return state.quickDownloadStatus === 'error'
	}
}

// From a page the user is not on: the wizard probes in the Download tab's
// place without moving the user there.
async function retryTargetLater(target: ExploreRetryTarget, get: GetState): Promise<void> {
	switch (target.kind) {
		case 'row':
			return get().retryQuickDownloadRow(target.itemId)
		case 'download':
			return get().retryQueueItem(target.itemId)
		case 'wizard':
			return get().submitUrl('download')
		case 'home':
			return get().retryQuickDownloadFailure()
	}
}

// Runs on every store change; does nothing while nothing waits.
function settleExploreRetryTargets(get: GetState, set: SetState): void {
	const state = get()
	const targets = state.exploreRetryTargets
	if (targets.length === 0) return
	if (!waitsForExplore(state)) {
		set({exploreRetryTargets: []})
		return
	}
	const live = targets.filter(target => rowExists(state, target))
	if (state.exploreView?.signedIn !== true) {
		if (live.length !== targets.length) set({exploreRetryTargets: live})
		return
	}
	// Cleared before anything runs, so a later state change cannot retry twice.
	set({exploreRetryTargets: []})
	const due = live.filter(target => stillFailed(state, target))
	if (due.length === 0) return
	notify.exploreSignInRetrying(due.length)
	for (const target of due) detach(retryTargetLater(target, get), 'retry after the Explore sign-in')
}

export function watchExploreRetryTargets(store: Pick<StoreApi<AppState>, 'getState' | 'setState' | 'subscribe'>): () => void {
	return store.subscribe(() => settleExploreRetryTargets(store.getState, store.setState))
}
