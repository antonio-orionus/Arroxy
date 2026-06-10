import type {PlaylistScope, ProbePlaylistMode, ProbeResult, QueueLane} from '@shared/types.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import type {GetState, SetState} from '../types.js'
import {maybeShowQueueTip} from '../queueTip.js'
import {formatProbeError} from '../helpers.js'
import {WizardCommands} from './commands.js'
import {isMixedYouTubeUrl, rewriteYouTubeChannelRoot} from './urlIntake.js'
import {projectPlaylistProbeResult} from './probeResultProjection.js'
import {prepareActiveProfileQueueSubmission} from './queueSubmission.js'
import {submitPreparedQueueSubmission} from './queueSubmissionAdapter.js'
import {failedQuickDownloadFeedback, preparingQuickDownloadFeedback, queuedQuickDownloadFeedback, quickDownloadProgressPatch, resetQuickDownloadFeedback} from './quickDownloadFeedback.js'

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
	set({wizardUrl: url, wizardStep: 'url', formatsLoading: false, playlistProbeLoading: false, wizardError: null, wizardErrorOrigin: null, cookiesConfigDialogIssue: issue})
	return true
}

function probeInputFor(url: string, scope: PlaylistScope): {url: string; playlistMode: ProbePlaylistMode; playlistScope?: PlaylistScope} {
	const playlistMode: ProbePlaylistMode = isMixedYouTubeUrl(url) ? 'video' : 'auto'
	return {url, playlistMode, ...(playlistMode === 'video' ? {} : {playlistScope: scope})}
}

function applyPlaylistProbeResult(probe: Extract<ProbeResult, {kind: 'playlist'}>, set: SetState, get: GetState): void {
	set(projectPlaylistProbeResult(probe, get(), true))
}

async function enqueueActiveProfileProbeResult(probe: ProbeResult, set: SetState, get: GetState): Promise<string[] | null> {
	let probeForQueue = probe
	if (probe.kind === 'playlist') {
		applyPlaylistProbeResult(probe, set, get)
		if (get().playlistLikelyCapped) {
			set({...resetQuickDownloadFeedback(), quickPlaylistCapDialogOpen: true})
			return null
		}
		if (get().playlistItems.length === 0) {
			set(failedQuickDownloadFeedback('wizard.url.quickPrepareFailed'))
			return null
		}
		probeForQueue = {...probe, entries: get().playlistItems}
	}

	const prepared = prepareActiveProfileQueueSubmission(probeForQueue, get(), 'normal')
	if (!prepared) {
		set(failedQuickDownloadFeedback('wizard.url.quickPrepareFailed'))
		return null
	}
	const result = await submitPreparedQueueSubmission(prepared)
	if (!result.ok) {
		set(failedQuickDownloadFeedback(result.error))
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

export async function quickDownload(set: SetState, get: GetState): Promise<void> {
	if (get().quickDownloadStatus === 'preparing') return
	const cleaned = rewriteYouTubeChannelRoot(cleanUrl(get().wizardUrl.trim()))
	if (!cleaned) return
	if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return

	const runId = nextRunId()
	void window.appApi.downloads.probeCancel()
	set({wizardUrl: cleaned, ...preparingQuickDownloadFeedback({current: cleaned, runId, total: 1}), wizardError: null, cookiesConfigDialogIssue: null})

	try {
		const result = await window.appApi.downloads.probe(probeInputFor(cleaned, get().playlistScope))
		if (!isRunActive(runId)) return
		if (!result.ok) {
			set(failedQuickDownloadFeedback(formatProbeError(result.error) || 'wizard.url.quickProbeFailed'))
			return
		}
		set(quickDownloadProgressPatch({quickDownloadProgressPhase: 'queueing', quickDownloadProgressTotal: quickProbeItemCount(result.data), quickDownloadProgressCurrent: result.data.webpageUrl || cleaned, quickDownloadProgressTitle: quickProbeTitle(result.data)}))

		ensureOutputFallback(set, get)
		const queuedIds = await enqueueActiveProfileProbeResult(result.data, set, get)
		if (!isRunActive(runId)) return
		if (!queuedIds) return

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(queuedIds))
	} catch (err) {
		if (!isRunActive(runId)) return
		set(failedQuickDownloadFeedback(err instanceof Error ? err.message : String(err)))
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

	void window.appApi.downloads.probeCancel()
	const runId = nextRunId()
	ensureOutputFallback(set, get)
	set({...preparingQuickDownloadFeedback({current: cleanedUrls[0] ?? null, runId, total: cleanedUrls.length}), wizardError: null, cookiesConfigDialogIssue: null})

	try {
		const queuedIds: string[] = []
		let failedCount = 0
		for (const [index, url] of cleanedUrls.entries()) {
			if (!isRunActive(runId)) return
			set({wizardUrl: url, ...quickDownloadProgressPatch({quickDownloadProgressPhase: 'probing', quickDownloadProgressCurrent: url, quickDownloadProgressTitle: null})})
			const result = await window.appApi.downloads.probe(probeInputFor(url, get().playlistScope))
			if (!isRunActive(runId)) return
			if (!result.ok) {
				failedCount += 1
				set(quickDownloadProgressPatch({quickDownloadProgressCompleted: Math.min(index + 1, cleanedUrls.length), quickDownloadProgressFailed: failedCount}))
				continue
			}
			set(quickDownloadProgressPatch({quickDownloadProgressPhase: 'queueing', quickDownloadProgressCurrent: result.data.webpageUrl || url, quickDownloadProgressTitle: quickProbeTitle(result.data)}))
			const ids = await enqueueActiveProfileProbeResult(result.data, set, get)
			if (!isRunActive(runId)) return
			if (!ids) return
			queuedIds.push(...ids)
			set(quickDownloadProgressPatch({quickDownloadProgressCompleted: Math.min(index + 1, cleanedUrls.length)}))
		}
		if (queuedIds.length === 0) {
			set(failedQuickDownloadFeedback('wizard.url.quickBulkAllFailed'))
			return
		}

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(queuedIds, failedCount))
	} catch (err) {
		if (!isRunActive(runId)) return
		set(failedQuickDownloadFeedback(err instanceof Error ? err.message : String(err)))
	}
}

export function cancelQuickDownload(set: SetState, get: GetState): void {
	if (get().quickDownloadStatus !== 'preparing') return
	cancelRun()
	void window.appApi.downloads.probeCancel()
	set(resetQuickDownloadFeedback())
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
			set({...failedQuickDownloadFeedback('wizard.url.quickPrepareFailed'), quickPlaylistCapDialogOpen: false})
			return
		}
		const result = await submitPreparedQueueSubmission(prepared)
		if (!result.ok) {
			set({...failedQuickDownloadFeedback(result.error), quickPlaylistCapDialogOpen: false})
			return
		}

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set(queuedQuickDownloadFeedback(result.ids))
	} finally {
		set({isSubmittingToQueue: false})
	}
}
