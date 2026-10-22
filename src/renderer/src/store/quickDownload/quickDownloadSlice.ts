// QuickDownload slice — the in-app ends of the background quick download:
// the URL tab's and Explore's intake, and the Downloads tab's resolution of a
// placeholder row (Retry, the needs-choice answers). Intake itself runs in
// main (IntakeService), reached through quickDownloadPipeline; the hotkey's
// intake runs entirely in main (HotkeyIntake).

import {cleanUrl} from '@shared/cleanUrl.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {ProbePlaylistMode, QueueItem} from '@shared/types.js'
import type {ExploreRetryTarget, GetState, QuickDownloadSlice, SetState} from '../types.js'
import {mixedUrlPromptPatch} from '../wizard/mixedUrlPrompt.js'
import {canSwitchToExplore, configuredCookiesRetryMode} from '../wizard/probeErrorExperience.js'
import {rewriteYouTubeChannelRoot} from '@shared/intake/urlIntake.js'
import {policyForUrlIntent} from '@shared/intake/urlIntentPolicy.js'
import {choosePlaceholder, keptChoiceProbe, placeListOffer, placeQuickDownload, retryPlaceholder} from './quickDownloadPipeline.js'
import {quickDownloadToasts} from './quickDownloadToasts.js'
import {withRetryTarget} from './exploreSignInRetry.js'

function cleanQuickDownloadUrl(url: string): string {
	return rewriteYouTubeChannelRoot(cleanUrl(url.trim()))
}

// A placeholder row carries the probe mode it was submitted with (the
// schema requires it on every unresolved row); its Retry and choices reuse it.
type PlaceholderRow = QueueItem & {probeMode: ProbePlaylistMode}

function findPlaceholder(itemId: string, get: GetState): PlaceholderRow | undefined {
	const row = get().queue.find(item => item.id === itemId)
	if (row?.job.kind !== 'unresolved' || row.probeMode === undefined) return undefined
	return {...row, probeMode: row.probeMode}
}

// A retry from where the user is: a failed preparation probes again in the
// background, a failed download downloads again, the wizard probes in place.
async function retryTargetNow(target: ExploreRetryTarget, get: GetState): Promise<void> {
	switch (target.kind) {
		case 'row':
			return get().retryQuickDownloadRow(target.itemId)
		case 'download':
			return get().retryQueueItem(target.itemId)
		case 'wizard':
			return get().retry()
		case 'home':
			return get().retryQuickDownloadFailure()
	}
}

export function createQuickDownloadSlice(set: SetState, get: GetState): QuickDownloadSlice {
	return {
		exploreRetryTargets: [],

		signInWithExploreThenRetry: async (target, site) => {
			// Only a stored `off` with the Explore tab on is switched. Under the
			// explore mode the wait needs no write; any other mode (a stale
			// button) is never overridden, so the click is a plain retry.
			const common = get().settings?.common
			const switching = canSwitchToExplore(common)
			if (!switching && !(common?.cookiesMode === 'explore' && common.exploreEnabled !== false)) {
				await retryTargetNow(target, get)
				return
			}
			// Explore opens at once; the wait is armed only once the switch is
			// saved. A settings write still in flight answers with the mode main
			// held before the switch, and that echo would cancel a wait armed on
			// the optimistic one. Signing in takes far longer than the write.
			const switched = switching ? get().switchToExploreCookiesMode() : Promise.resolve(true)
			get().openExploreSignIn(site)
			// Explore reports YouTube's sign-in only; on another site a cookie
			// comes with the first visit, so no signal says the user signed in
			// there (ADR 0011). That retry stays the user's: the failure keeps its Retry.
			if (!(await switched) || site.kind !== 'youtube') return
			set(state => ({exploreRetryTargets: withRetryTarget(state.exploreRetryTargets, target)}))
		},

		retryWithExploreSignIn: async target => {
			if (canSwitchToExplore(get().settings?.common) && !(await get().switchToExploreCookiesMode())) return
			await retryTargetNow(target, get)
		},

		quickDownload: async ({url, entry, title, playlistMode, take}) => {
			const cleaned = cleanQuickDownloadUrl(url)
			if (!cleaned) return
			// Decisions that need no probe stay upfront, as a dialog.
			const issue = getIncompleteCookiesConfigIssue(get().settings?.common)
			if (issue) {
				set({cookiesConfigDialogIssue: issue})
				return
			}
			let mode: ProbePlaylistMode | undefined = playlistMode
			if (!mode) {
				const action = policyForUrlIntent(classifyUrlIntent(cleaned), 'quick-download')
				if (action.kind === 'show-mixed-prompt') {
					set(mixedUrlPromptPatch(cleaned, entry))
					return
				}
				if (!('playlistMode' in action)) return
				mode = action.playlistMode
			}
			const toasts = quickDownloadToasts(entry, get)
			let placed = false
			// The profile this window shows as active, which main may not have saved yet.
			const profiles = get().settings?.profiles
			const profile = profiles ? resolveActiveDownloadProfile(profiles).ref : undefined
			await placeQuickDownload({url: cleaned, playlistMode: mode, ...(title ? {title} : {}), ...(profile ? {profile} : {}), ...(take ? {take} : {})}, event => {
				if (event.kind === 'added' || event.kind === 'already-queued') placed = true
				toasts(event)
			})
			// The link is in Downloads now: clear the field for the next one,
			// unless the user already typed something else.
			if (placed && entry === 'url-tab' && cleanQuickDownloadUrl(get().wizardUrl) === cleaned) get().setWizardUrl('')
		},

		retryQuickDownloadRow: async itemId => {
			const row = findPlaceholder(itemId, get)
			if (row?.status !== QUEUE_STATUS.error) return
			await retryPlaceholder(itemId, quickDownloadToasts('downloads', get))
		},

		retryQuickDownloadRowWithCookies: async itemId => {
			const targetMode = configuredCookiesRetryMode(get().settings?.common)
			if (!targetMode) return
			await get().setCookiesMode(targetMode)
			await get().retryQuickDownloadRow(itemId)
		},

		chooseQuickDownloadRow: async (itemId, answer) => {
			const row = findPlaceholder(itemId, get)
			if (row?.status !== QUEUE_STATUS.needsChoice || !row.choice) return
			if (answer === 'review') {
				// The row stays until the review queues (P2-R40): the wizard's
				// submission replaces it, and an abandoned review leaves it waiting.
				await get().openPlaylistReview(row.url, row.probeMode, itemId, await keptChoiceProbe(itemId))
				return
			}
			if (answer === 'first' && !row.choice.capped) return
			await choosePlaceholder(itemId, answer, quickDownloadToasts('downloads', get))
		},

		takeListOffer: async itemId => {
			await placeListOffer(itemId, quickDownloadToasts('downloads', get))
		},

		dismissListOffer: async itemId => {
			await window.appApi.intake.dismissListOffer({itemId}).catch((error: unknown) => console.error('[quick-download] dismissing the list offer failed', error))
		}
	}
}
