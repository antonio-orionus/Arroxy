import type {PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, QueueLane} from '@shared/types.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {classifyUrlIntent, type UrlIntent} from '@shared/urlIntent.js'
import type {GetState, SetState} from '../types.js'
import {maybeShowQueueTip} from '../queueTip.js'
import {WizardCommands} from './commands.js'
import {configuredCookiesRetryMode, selectProbeErrorForGuidance} from './probeErrorExperience.js'
import {rewriteYouTubeChannelRoot} from './urlIntake.js'
import {projectPlaylistProbeResult} from './probeResultProjection.js'
import {prepareActiveProfileQueueSubmission} from './queueSubmission.js'
import {submitPreparedQueueSubmission} from './queueSubmissionAdapter.js'
import {failedQuickDownloadFeedback, preparingQuickDownloadFeedback, queuedQuickDownloadFeedback, quickDownloadProgressPatch, resetQuickDownloadFeedback, type QuickDownloadRetryPlaylistMode} from './quickDownloadFeedback.js'
import {mixedUrlPromptPatch} from './mixedUrlPrompt.js'
import {policyForUrlIntent, shouldReviewPlaylistProbeResult} from './urlIntentPolicy.js'

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

function retryContextFor(mode: QuickDownloadRetryPlaylistMode | undefined): {retryPlaylistMode?: QuickDownloadRetryPlaylistMode} {
	return mode ? {retryPlaylistMode: mode} : {}
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
	applyPlaylistProbeResult(probe, set, get)
	void get().scanDownloadedInFolder()
	set({...resetQuickDownloadFeedback(), quickPlaylistCapDialogOpen: false})
}

async function enqueueActiveProfileProbeResult(probe: ProbeResult, set: SetState, get: GetState, retryContext: {retryPlaylistMode?: QuickDownloadRetryPlaylistMode} = {}): Promise<string[] | null> {
	let probeForQueue = probe
	if (probe.kind === 'playlist') {
		applyQuickPlaylistProbeData(probe, set, get)
		if (get().playlistLikelyCapped) {
			set({...resetQuickDownloadFeedback(), quickPlaylistCapDialogOpen: true})
			return null
		}
		if (get().playlistItems.length === 0) {
			set(failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed', ...retryContext}))
			return null
		}
		probeForQueue = {...probe, entries: get().playlistItems}
	}

	const prepared = prepareActiveProfileQueueSubmission(probeForQueue, get(), 'normal')
	if (!prepared) {
		set(failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed', ...retryContext}))
		return null
	}
	const result = await submitPreparedQueueSubmission(prepared)
	if (!result.ok) {
		set(failedQuickDownloadFeedback({kind: 'queue', message: result.error, ...retryContext}))
		return null
	}
	return result.ids
}

function quickProbeTitle(probe: ProbeResult): string | null {
	return probe.kind === 'playlist' ? probe.playlistTitle || null : probe.title || null
}

function quickProbeItemCount(probe: ProbeResult): number {
	return probe.kind === 'playlist' ? Math.max(probe.entries.length, 1) : 1
}

function ensureOutputFallback(set: SetState, get: GetState): void {
	const currentOutputDir = get().wizardOutputDir
	const fallbackOutputDir = get().settings?.common?.defaultOutputDir ?? ''
	set({wizardOutputDir: currentOutputDir.trim() ? currentOutputDir : fallbackOutputDir})
}

export async function quickDownload(set: SetState, get: GetState, mixedUrlMode?: QuickDownloadRetryPlaylistMode): Promise<void> {
	if (get().quickDownloadStatus === 'preparing') return
	const cleaned = rewriteYouTubeChannelRoot(cleanUrl(get().wizardUrl.trim()))
	if (!cleaned) return
	if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return
	const intent = classifyUrlIntent(cleaned)
	const action = mixedUrlMode ? ({kind: mixedUrlMode === 'video' ? 'probe-video' : 'probe-playlist', playlistMode: mixedUrlMode} as const) : policyForUrlIntent(intent, 'quick-download')
	const retryContext = retryContextFor(mixedUrlMode)
	if (action.kind === 'show-mixed-prompt') {
		set({...mixedUrlPromptPatch(cleaned, 'quick-download'), ...resetQuickDownloadFeedback()})
		return
	}
	if (action.kind === 'open-bulk-review' || action.kind === 'show-label') return

	const runId = nextRunId()
	void window.appApi.downloads.probeCancel()
	set({wizardUrl: cleaned, ...preparingQuickDownloadFeedback({current: cleaned, runId, total: 1}), playlistProbeProgress: null, wizardError: null, cookiesConfigDialogIssue: null})

	try {
		const result = await window.appApi.downloads.probe(probeInputFor(cleaned, get().playlistScope, action.playlistMode))
		if (!isRunActive(runId)) return
		if (!result.ok) {
			set(failedQuickDownloadFeedback({kind: 'probe', error: result.error, ...retryContext}))
			return
		}
		set(quickDownloadProgressPatch({quickDownloadProgressPhase: 'queueing', quickDownloadProgressTotal: quickProbeItemCount(result.data), quickDownloadProgressCurrent: result.data.webpageUrl || cleaned, quickDownloadProgressTitle: quickProbeTitle(result.data)}))

		ensureOutputFallback(set, get)
		if (result.data.kind === 'playlist' && !mixedUrlMode && shouldReviewPlaylistProbeResult(intent)) {
			openPlaylistReviewFromQuickProbe(result.data, set, get)
			return
		}

		const queuedIds = await enqueueActiveProfileProbeResult(result.data, set, get, retryContext)
		if (!isRunActive(runId)) return
		if (!queuedIds) return

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(queuedIds))
	} catch (err) {
		if (!isRunActive(runId)) return
		set(failedQuickDownloadFeedback({kind: 'exception', message: err instanceof Error ? err.message : String(err), ...retryContext}))
	}
}

export async function quickDownloadUrls(urls: string[], set: SetState, get: GetState): Promise<void> {
	if (get().quickDownloadStatus === 'preparing') return
	const cleanedUrls = urls.flatMap(url => {
		const cleaned = rewriteYouTubeChannelRoot(cleanUrl(url.trim()))
		return cleaned.length > 0 ? [cleaned] : []
	})
	if (cleanedUrls.length === 0) return

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
		const failedProbeErrors: ProbeError[] = []
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
				failedProbeErrors.push(result.error)
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
		for (const {url, probe} of probeResults) {
			if (!isRunActive(runId)) return
			set(quickDownloadProgressPatch({quickDownloadProgressPhase: 'queueing', quickDownloadProgressCurrent: probe.webpageUrl || url, quickDownloadProgressTitle: quickProbeTitle(probe)}))
			const ids = await enqueueActiveProfileProbeResult(probe, set, get)
			if (!isRunActive(runId)) return
			if (!ids) return
			queuedIds.push(...ids)
		}
		if (queuedIds.length === 0) {
			const representativeError = selectProbeErrorForGuidance(failedProbeErrors, get().settings?.common)
			set(failedQuickDownloadFeedback(representativeError ? {kind: 'bulk-probe', error: representativeError, urls: [...cleanedUrls], failedCount} : {kind: 'prepare', messageKey: 'wizard.url.quickBulkAllFailed'}))
			return
		}

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(queuedIds, failedCount))
	} catch (err) {
		if (!isRunActive(runId)) return
		set(failedQuickDownloadFeedback({kind: 'exception', message: err instanceof Error ? err.message : String(err)}))
	}
}

export async function retryQuickDownloadFailure(set: SetState, get: GetState): Promise<void> {
	const failure = get().quickDownloadFailure
	if (failure?.kind === 'bulk-probe') {
		await quickDownloadUrls(failure.urls, set, get)
		return
	}
	await quickDownload(set, get, failure?.retryPlaylistMode)
}

export async function retryQuickPlaylistCap(set: SetState, get: GetState): Promise<void> {
	if (!get().wizardUrl) return
	set({quickPlaylistCapDialogOpen: false})
	await quickDownload(set, get, 'playlist')
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
		const prepared = prepareActiveProfileQueueSubmission(probe, get(), lane)
		if (!prepared) {
			set({...failedQuickDownloadFeedback({kind: 'prepare', messageKey: 'wizard.url.quickPrepareFailed'}), quickPlaylistCapDialogOpen: false})
			return
		}
		const result = await submitPreparedQueueSubmission(prepared)
		if (!result.ok) {
			set({...failedQuickDownloadFeedback({kind: 'queue', message: result.error}), quickPlaylistCapDialogOpen: false})
			return
		}

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(result.ids))
	} finally {
		set({isSubmittingToQueue: false})
	}
}
