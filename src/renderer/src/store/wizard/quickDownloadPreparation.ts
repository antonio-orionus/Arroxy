import type {PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, QueueLane} from '@shared/types.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {classifyUrlIntent, type UrlIntent} from '@shared/urlIntent.js'
import {notify} from '@renderer/lib/notify.js'
import type {GetState, SetState} from '../types.js'
import {WizardCommands} from './commands.js'
import {configuredCookiesRetryMode, selectProbeErrorForGuidance} from './probeErrorExperience.js'
import {rewriteYouTubeChannelRoot} from '@shared/intake/urlIntake.js'
import {projectPlaylistProbeResult} from './probeResultProjection.js'
import {prepareActiveProfileQueueSubmission} from './queueSubmission.js'
import {submitPreparedQueueSubmission} from './queueSubmissionAdapter.js'
import {settlePlaceholder} from '../quickDownload/quickDownloadPipeline.js'
import {failedQuickDownloadFeedback, preparingQuickDownloadFeedback, queuedQuickDownloadFeedback, quickDownloadProgressPatch, resetQuickDownloadFeedback} from './quickDownloadFeedback.js'
import {policyForUrlIntent, shouldReviewPlaylistProbeResult} from '@shared/intake/urlIntentPolicy.js'
import {DownloadProfileOutputMissingError} from '@shared/downloadProfiles.js'

// Bulk URLs' quick download: several links probed in one modal run, then
// queued together. A single link's quick download runs in the background as
// a placeholder row instead (quickDownload/quickDownloadPipeline).

let quickDownloadRunSeq = 0

function nextRunId(): number {
	quickDownloadRunSeq += 1
	return quickDownloadRunSeq
}

function cancelRun(): void {
	nextRunId()
}

function isRunActive(runId: number): boolean {
	return quickDownloadRunSeq === runId
}

function maybeBlockIncompleteCookiesConfig(url: string, set: SetState, get: GetState): boolean {
	const issue = getIncompleteCookiesConfigIssue(get().settings?.common)
	if (!issue) return false
	set({wizardUrl: url, wizardStep: 'url', formatsLoading: false, playlistProbeLoading: false, playlistProbeProgress: null, wizardError: null, wizardErrorOrigin: null, cookiesConfigDialogIssue: issue})
	return true
}

function probeInputFor(url: string, scope: PlaylistScope, mode: ProbePlaylistMode = 'auto'): {url: string; playlistMode: ProbePlaylistMode; playlistScope?: PlaylistScope} {
	const playlistMode: ProbePlaylistMode = mode
	return {url, playlistMode, ...(playlistMode === 'video' ? {} : {playlistScope: scope})}
}

function applyPlaylistProbeResult(probe: Extract<ProbeResult, {kind: 'playlist'}>, set: SetState, get: GetState): void {
	set(projectPlaylistProbeResult(probe, get(), true))
}

function applyQuickPlaylistProbeData(probe: Extract<ProbeResult, {kind: 'playlist'}>, set: SetState, get: GetState): void {
	const state = get()
	set({...projectPlaylistProbeResult(probe, state, true), wizardStep: state.wizardStep})
}

function openPlaylistReviewFromQuickProbe(probe: Extract<ProbeResult, {kind: 'playlist'}>, set: SetState, get: GetState): void {
	// Bulk's own review: it replaces no Downloads row.
	set({reviewSourceRowId: null})
	applyPlaylistProbeResult(probe, set, get)
	void get().scanDownloadedInFolder()
	set({...resetQuickDownloadFeedback(), quickPlaylistCapDialogOpen: false})
}

/** `ids` is empty when every video was already in the queue: nothing failed, nothing was added. */
interface EnqueuedProbeResult {
	ids: string[]
	skippedAlreadyQueued: number
}

async function enqueueActiveProfileProbeResult(probe: ProbeResult, urls: string[], set: SetState, get: GetState): Promise<EnqueuedProbeResult | null> {
	let probeForQueue = probe
	if (probe.kind === 'playlist') {
		applyQuickPlaylistProbeData(probe, set, get)
		if (get().playlistLikelyCapped) {
			set({...resetQuickDownloadFeedback(), quickPlaylistCapDialogOpen: true})
			return null
		}
		if (get().playlistItems.length === 0) {
			set(failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed', urls}))
			return null
		}
		probeForQueue = {...probe, entries: get().playlistItems}
	}

	const prepared = prepareActiveProfileQueueSubmission(probeForQueue, get(), 'normal', {url: get().wizardUrl, playlistTitle: get().playlistTitle})
	if (!prepared) {
		set(failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed', urls}))
		return null
	}
	if (prepared.items.length === 0) return {ids: [], skippedAlreadyQueued: prepared.skippedAlreadyQueued}
	const result = await submitPreparedQueueSubmission(prepared)
	if (!result.ok) {
		set(failedQuickDownloadFeedback({kind: 'queue', message: result.error, urls}))
		return null
	}
	return {ids: result.ids, skippedAlreadyQueued: prepared.skippedAlreadyQueued + result.skippedAlreadyQueued}
}

function quickProbeTitle(probe: ProbeResult): string | null {
	return probe.kind === 'playlist' ? probe.playlistTitle || null : probe.title || null
}

function ensureOutputFallback(set: SetState, get: GetState): void {
	const currentOutputDir = get().wizardOutputDir
	const fallbackOutputDir = get().settings?.common?.defaultOutputDir ?? ''
	set({wizardOutputDir: currentOutputDir.trim() ? currentOutputDir : fallbackOutputDir})
}

export async function quickDownloadUrls(urls: string[], set: SetState, get: GetState): Promise<void> {
	if (get().quickDownloadStatus === 'preparing') return
	const cleanedUrls = urls.flatMap(url => {
		const cleaned = rewriteYouTubeChannelRoot(cleanUrl(url.trim()))
		return cleaned.length > 0 ? [cleaned] : []
	})
	if (cleanedUrls.length === 0) return
	// Bulk URLs is a URL-tab flow, and a new run: the review of no row.
	set({wizardOrigin: 'download', reviewSourceRowId: null})

	for (const url of cleanedUrls) {
		if (maybeBlockIncompleteCookiesConfig(url, set, get)) return
	}
	const intents = cleanedUrls.map(url => classifyUrlIntent(url))
	if (intents.some(intent => policyForUrlIntent(intent, 'bulk-quick-download').kind === 'open-bulk-review')) {
		get().startBulkUrls(cleanedUrls)
		set(resetQuickDownloadFeedback())
		return
	}

	void window.appApi.downloads.probeCancel()
	const runId = nextRunId()
	ensureOutputFallback(set, get)
	set({...preparingQuickDownloadFeedback({current: cleanedUrls[0] ?? null, runId, total: cleanedUrls.length}), playlistProbeProgress: null, wizardError: null, cookiesConfigDialogIssue: null})

	try {
		const probeResults: Array<{url: string; intent: UrlIntent; probe: ProbeResult}> = []
		const failedProbes: Array<{url: string; error: ProbeError}> = []
		let failedCount = 0
		for (const [index, url] of cleanedUrls.entries()) {
			if (!isRunActive(runId)) return
			const intent = intents[index]
			if (!intent) continue
			const action = policyForUrlIntent(intent, 'bulk-quick-download')
			if (action.kind === 'open-bulk-review') {
				get().startBulkUrls(cleanedUrls)
				set(resetQuickDownloadFeedback())
				return
			}
			if (action.kind === 'show-mixed-prompt' || action.kind === 'show-label') continue
			set({wizardUrl: url, playlistProbeProgress: null, ...quickDownloadProgressPatch({quickDownloadProgressPhase: 'probing', quickDownloadProgressCurrent: url, quickDownloadProgressTitle: null})})
			const result = await window.appApi.downloads.probe(probeInputFor(url, get().playlistScope, action.playlistMode))
			if (!isRunActive(runId)) return
			if (!result.ok) {
				failedProbes.push({url, error: result.error})
				failedCount += 1
				set(quickDownloadProgressPatch({quickDownloadProgressCompleted: Math.min(index + 1, cleanedUrls.length), quickDownloadProgressFailed: failedCount}))
				continue
			}
			if (result.data.kind === 'playlist' && shouldReviewPlaylistProbeResult(intent)) {
				if (cleanedUrls.length > 1) {
					get().startBulkUrls(cleanedUrls)
					set(resetQuickDownloadFeedback())
					return
				}
				openPlaylistReviewFromQuickProbe(result.data, set, get)
				return
			}
			probeResults.push({url, intent, probe: result.data})
			set(quickDownloadProgressPatch({quickDownloadProgressCompleted: Math.min(index + 1, cleanedUrls.length)}))
		}

		const queuedIds: string[] = []
		let skippedAlreadyQueued = 0
		for (const {url, probe} of probeResults) {
			if (!isRunActive(runId)) return
			set(quickDownloadProgressPatch({quickDownloadProgressPhase: 'queueing', quickDownloadProgressCurrent: probe.webpageUrl || url, quickDownloadProgressTitle: quickProbeTitle(probe)}))
			const enqueued = await enqueueActiveProfileProbeResult(probe, cleanedUrls, set, get)
			if (!isRunActive(runId)) return
			if (!enqueued) return
			queuedIds.push(...enqueued.ids)
			skippedAlreadyQueued += enqueued.skippedAlreadyQueued
		}
		if (queuedIds.length === 0 && skippedAlreadyQueued > 0) {
			// Every probed video was already in the queue; failed probes, if any, do
			// not turn that into an error.
			WizardCommands.resetAll(set)
			notify.queueSkippedAlreadyQueued(skippedAlreadyQueued)
			return
		}
		if (queuedIds.length === 0) {
			const representativeError = selectProbeErrorForGuidance(
				failedProbes.map(failed => failed.error),
				get().settings?.common,
				get().exploreView?.signedIn ?? null
			)
			const representative = failedProbes.find(failed => failed.error === representativeError)
			set(failedQuickDownloadFeedback(representative ? {kind: 'bulk-probe', error: representative.error, errorUrl: representative.url, urls: [...cleanedUrls], failedCount} : {kind: 'prepare', messageKey: 'wizard.url.quickBulkAllFailed', urls: [...cleanedUrls]}))
			return
		}

		WizardCommands.resetAll(set)
		if (skippedAlreadyQueued > 0) notify.queueSkippedAlreadyQueued(skippedAlreadyQueued)
		set(queuedQuickDownloadFeedback(queuedIds, failedCount))
	} catch (err) {
		if (!isRunActive(runId)) return
		set(failedQuickDownloadFeedback(err instanceof DownloadProfileOutputMissingError ? {kind: 'prepare', messageKey: 'wizard.url.profile.outputMissing', urls: cleanedUrls} : {kind: 'exception', message: err instanceof Error ? err.message : String(err), urls: cleanedUrls}))
	}
}

export async function retryQuickDownloadFailure(set: SetState, get: GetState): Promise<void> {
	const failure = get().quickDownloadFailure
	if (failure) await quickDownloadUrls(failure.urls, set, get)
}

// The cap dialog's "change the limit and scan again" for the capped link.
export async function retryQuickPlaylistCap(set: SetState, get: GetState): Promise<void> {
	const url = get().wizardUrl
	if (!url) return
	set({quickPlaylistCapDialogOpen: false})
	await quickDownloadUrls([url], set, get)
}

export async function retryQuickDownloadWithCookies(set: SetState, get: GetState): Promise<void> {
	const targetMode = configuredCookiesRetryMode(get().settings?.common)
	if (!targetMode) return
	await get().setCookiesMode(targetMode)
	await retryQuickDownloadFailure(set, get)
}

export function cancelQuickDownload(set: SetState, get: GetState): void {
	if (get().quickDownloadStatus !== 'preparing') return
	cancelRun()
	void window.appApi.downloads.probeCancel()
	set({...resetQuickDownloadFeedback(), playlistProbeProgress: null})
}

export async function queueLoadedPlaylistWithActiveProfile(set: SetState, get: GetState, lane: QueueLane): Promise<void> {
	if (get().isSubmittingToQueue) return
	const state = get()
	if (state.playlistItems.length === 0) return

	set({isSubmittingToQueue: true})
	try {
		const probe: Extract<ProbeResult, {kind: 'playlist'}> = {
			kind: 'playlist',
			extractor: state.wizardExtractor,
			extractorKey: state.wizardExtractorKey,
			webpageUrl: state.wizardWebpageUrl || state.wizardUrl,
			isAudioOnlySource: false,
			playlistTitle: state.playlistTitle || 'Playlist',
			playlistId: state.playlistId,
			isMultiVideo: state.playlistIsMultiVideo,
			entries: state.playlistItems
		}
		// A review of a quick download's row queues with the profile that row
		// was placed with, like its other answers.
		const {reviewSourceRowId} = state
		const pinned = reviewSourceRowId !== null ? state.queue.find(row => row.id === reviewSourceRowId)?.pinnedProfile : undefined
		const prepared = prepareActiveProfileQueueSubmission(probe, get(), lane, {url: state.wizardUrl, playlistTitle: state.playlistTitle}, pinned)
		if (!prepared) {
			set({...failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed', urls: [state.wizardUrl]}), quickPlaylistCapDialogOpen: false})
			return
		}
		if (prepared.items.length === 0) {
			// Everything loaded is already queued: not a failure, so no error UI.
			if (reviewSourceRowId !== null) await settlePlaceholder(reviewSourceRowId)
			WizardCommands.resetAll(set)
			notify.queueSkippedAlreadyQueued(prepared.skippedAlreadyQueued)
			return
		}
		const result = await submitPreparedQueueSubmission(prepared, reviewSourceRowId)
		if (!result.ok) {
			set({...failedQuickDownloadFeedback({kind: 'queue', message: result.error, urls: [state.wizardUrl]}), quickPlaylistCapDialogOpen: false})
			return
		}

		WizardCommands.resetAll(set)
		const skippedAlreadyQueued = prepared.skippedAlreadyQueued + result.skippedAlreadyQueued
		if (skippedAlreadyQueued > 0) notify.queueSkippedAlreadyQueued(skippedAlreadyQueued)
		set(queuedQuickDownloadFeedback(result.ids))
	} finally {
		set({isSubmittingToQueue: false})
	}
}
