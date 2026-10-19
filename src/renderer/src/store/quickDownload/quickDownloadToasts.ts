// The in-app feedback channel of the background quick download: toasts with
// actions. The hotkey reports its outcomes to main instead (hotkeyTrigger).

import {notify, type QuickDownloadFailureAction} from '@renderer/lib/notify.js'
import type {CommonSettings, JobAuth, LocalizedError, ProbeError} from '@shared/types.js'
import type {GetState, InAppQuickDownloadEntry} from '../types.js'
import {exploreSignInSiteFor} from '../exploreSignInSite.js'
import {buildProbeErrorExperience, type ExploreSignedIn, type ProbeErrorExperience} from '../wizard/probeErrorExperience.js'
import {detach} from './detachedTask.js'
import type {QuickDownloadFeedback} from './quickDownloadPipeline.js'

// The guidance a probe-error row offers, from the same inputs as the probe
// error alert: the error and its link, the cookies settings, the Explore sign-in state.
export function placeholderErrorExperience(error: ProbeError | null, url: string, commonSettings: Partial<CommonSettings> | null | undefined, exploreSignedIn: ExploreSignedIn): ProbeErrorExperience {
	return buildProbeErrorExperience({error, url, commonSettings, exploreSignedIn})
}

// A row keeps only the localized error; for the guidance it reads as the
// yt-dlp error it was (any other failure was stored as `unknown`), run as the
// row's `auth`: a probe-error row's last probe, a download's job (sticky once escalated).
export function rowProbeError(error: LocalizedError | null, auth?: JobAuth): ProbeError | null {
	if (!error) return null
	return auth === 'exploreSession' ? {kind: 'ytdlp', error, auth} : {kind: 'ytdlp', error}
}

// The toast's main action. Using the Explore sign-in already held never leaves
// the page; the two that open Explore are offered only at home (P2-R41).
function failureActionKind(experience: ProbeErrorExperience, atHome: boolean): QuickDownloadFailureAction['kind'] {
	if (experience.actions.retryWithExploreSignIn) return 'explore-reuse'
	if (atHome && experience.actions.signInWithExploreThenRetry) return 'explore-offer'
	if (atHome && experience.actions.signInWithExplore) return 'sign-in'
	return 'retry'
}

// The label is chosen when the toast is raised; what the click does is chosen
// again from the state at click time. A wizard run may have started since, or
// the cookie mode changed: then the toast falls back to a plain Retry rather
// than leave the run or override a mode the user picked.
function failureAction(probeError: ProbeError | null, itemId: string, atHome: boolean, get: GetState): QuickDownloadFailureAction {
	// The failed row's own link: which site's sign-in the action is about.
	const url = get().queue.find(item => item.id === itemId)?.url ?? ''
	const experienceNow = (): ProbeErrorExperience => placeholderErrorExperience(probeError, url, get().settings?.common, get().exploreView?.signedIn ?? null)
	const run = (): void => {
		const target = {kind: 'row', itemId} as const
		const site = exploreSignInSiteFor(url)
		switch (failureActionKind(experienceNow(), get().wizardStep === 'url')) {
			case 'explore-reuse':
				return detach(get().retryWithExploreSignIn(target), 'toast action')
			case 'explore-offer':
				return detach(get().signInWithExploreThenRetry(target, site), 'toast action')
			case 'sign-in':
				return get().openExploreSignIn(site)
			case 'retry':
				return detach(get().retryQuickDownloadRow(itemId), 'toast action')
		}
	}
	return {kind: failureActionKind(experienceNow(), atHome), run}
}

export function quickDownloadToasts(entry: InAppQuickDownloadEntry, get: GetState): QuickDownloadFeedback {
	return event => {
		// Read at emit time: while a wizard run is open, View would have to
		// abandon it, so the toast offers none (P2-R41).
		const atHome = get().wizardStep === 'url'
		const view = (itemId: string | null): (() => void) | undefined => (atHome ? () => get().showQueueItem(itemId) : undefined)
		switch (event.kind) {
			case 'added':
				if (entry !== 'downloads') notify.quickDownloadAdded(event.title, view(event.itemId))
				return
			case 'already-queued':
				notify.quickDownloadAlreadyQueued(view(event.itemId))
				return
			case 'not-added':
				notify.quickDownloadNotAdded()
				return
			case 'queued':
				if (event.skippedAlreadyQueued > 0) notify.queueSkippedAlreadyQueued(event.skippedAlreadyQueued)
				return
			case 'nothing-new':
				notify.queueSkippedAlreadyQueued(event.skippedAlreadyQueued)
				return
			case 'failed': {
				notify.quickDownloadFailed(event.itemId, event.title, failureAction(event.probeError, event.itemId, atHome, get), view(event.itemId))
				return
			}
			case 'needs-choice': {
				const count = event.choice.kind === 'playlist-cap' ? event.choice.loaded : event.choice.count
				notify.quickDownloadNeedsChoice(event.itemId, {kind: event.choice.kind, count, capped: event.capped}, view(event.itemId))
				return
			}
		}
	}
}
