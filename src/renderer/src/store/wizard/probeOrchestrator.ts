// ProbeOrchestrator slice — owns the URL → probe → format-step pipeline,
// the wizard step graph, and playlist enumeration. Reads format / subtitle /
// output / dialog fields owned by other slices but is the entry point for
// every probe-driven mutation. `reset` lives here too — wizardStep is the
// canonical "where the wizard is" field.
//
// Cross-slice writes through `set()` are intentional: the probe pipeline
// updates format pools, subtitle pools, output prefs, and dialog flags in
// one transition so the UI never sees a half-updated wizard.

import type {PlaylistScope, ProbePlaylistMode, ProbeResult, WizardTransition} from '@shared/types.js'
import {getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import {cleanUrl} from '@shared/cleanUrl.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import {resolvePlaylistDir} from './playlistDir.js'
import {WizardCommands, RESET_WIZARD_STATE} from './commands.js'
import type {AppState, GetState, SetState, ProbeOrchestratorSlice, WizardStep} from '../types.js'
import {buildWizardStepGraph, nextWizardStep} from './wizardStepGraph.js'
import {BULK_METADATA_CONCURRENCY, cancelBulkMetadataProbes, hydrateBulkMetadata, nextBulkMetadataRunId} from './bulkMetadataHydration.js'
import {playlistScopeReloadErrorMessage, unknownPlaylistScopeReloadErrorMessage} from './playlistScopeReload.js'
import {isMixedYouTubeUrl, rewriteYouTubeChannelRoot} from './urlIntake.js'
import {quickDownload, quickDownloadUrls, cancelQuickDownload} from './quickDownloadPreparation.js'
import {resetQuickDownloadFeedback} from './quickDownloadFeedback.js'
import {projectBulkStart, projectPlaylistProbeResult, projectProbeFailure, projectProbeStart, projectVideoProbeResult} from './probeResultProjection.js'

function pickWizardSnapshot(state: AppState): Record<string, unknown> {
	return {
		url: state.wizardUrl,
		extractor: state.wizardExtractor,
		title: state.wizardTitle,
		duration: state.wizardDuration,
		formatsCount: state.wizardFormats.length,
		selectedVideoFormatId: state.selectedVideoFormatId,
		audioSelection: state.audioSelection,
		activePreset: state.activePreset,
		subtitleLanguages: state.wizardSubtitleLanguages,
		subtitleMode: state.wizardSubtitleMode,
		subtitleFormat: state.wizardSubtitleFormat,
		subtitleSkipped: state.wizardSubtitleSkipped,
		sponsorBlockMode: state.wizardSponsorBlockMode,
		sponsorBlockCategories: state.wizardSponsorBlockCategories,
		embedChapters: state.wizardEmbedChapters,
		embedMetadata: state.wizardEmbedMetadata,
		embedThumbnail: state.wizardEmbedThumbnail,
		writeDescription: state.wizardWriteDescription,
		writeThumbnail: state.wizardWriteThumbnail,
		writeM3u: state.wizardWriteM3u,
		outputDir: state.wizardOutputDir,
		subfolderEnabled: state.wizardSubfolderEnabled,
		subfolderName: state.wizardSubfolderName,
		playlistScope: state.playlistScope,
		playlistItemsCount: state.playlistItems.length,
		selectedPlaylistItemsCount: state.selectedPlaylistItemIds.length,
		playlistLikelyCapped: state.playlistLikelyCapped,
		playlistScopeReloading: state.playlistScopeReloading,
		playlistScopeError: state.playlistScopeError
	}
}

function logStep(transition: WizardTransition, fromStep: WizardStep, toStep: WizardStep, snapshot: Record<string, unknown>): void {
	window.appApi.diagnostics.logWizardStep({transition, fromStep, toStep, snapshot})
}

function maybeBlockIncompleteCookiesConfig(url: string, set: SetState, get: GetState): boolean {
	const issue = getIncompleteCookiesConfigIssue(get().settings?.common)
	if (!issue) return false
	set({wizardUrl: url, wizardStep: 'url', formatsLoading: false, playlistProbeLoading: false, wizardError: null, wizardErrorOrigin: null, cookiesConfigDialogIssue: issue})
	return true
}

function applyVideoProbeResult(probe: Extract<ProbeResult, {kind: 'video'}>, set: SetState, get: GetState, firstProbe: boolean): void {
	set(projectVideoProbeResult(probe, get(), firstProbe))
}

function applyPlaylistProbeResult(probe: Extract<ProbeResult, {kind: 'playlist'}>, set: SetState, get: GetState, firstProbe: boolean): void {
	set(projectPlaylistProbeResult(probe, get(), firstProbe))
}

async function runProbe(url: string, playlistMode: ProbePlaylistMode, set: SetState, get: GetState, firstProbe = true): Promise<void> {
	void window.appApi.downloads.probeCancel()
	const startProjection = projectProbeStart(get(), url, playlistMode)
	set(startProjection.patch)
	logStep('submitUrl', startProjection.fromStep, startProjection.initialStep, pickWizardSnapshot(get()))

	const playlistScope = get().playlistScope
	const result = await window.appApi.downloads.probe({url, playlistMode, ...(playlistMode === 'video' ? {} : {playlistScope})})
	if (!result.ok) {
		set(projectProbeFailure(result.error))
		return
	}

	if (result.data.kind === 'playlist') {
		applyPlaylistProbeResult(result.data, set, get, firstProbe)
		// Background-scan the destination folder so the sync alert is ready by the
		// time the user looks at the list — no manual "Sync with folder" click.
		void get().scanDownloadedInFolder()
	} else {
		applyVideoProbeResult(result.data, set, get, firstProbe)
	}
}

async function reloadPlaylistWithScope(scope: PlaylistScope, set: SetState, get: GetState): Promise<void> {
	const state = get()
	const url = state.wizardUrl
	if (!url || state.playlistScopeReloading) {
		logStep('playlistScopeReloadIgnored', state.wizardStep, state.wizardStep, {...pickWizardSnapshot(state), requestedScope: scope, reason: !url ? 'missing-url' : 'already-reloading'})
		return
	}
	const previousScope = state.playlistScope
	const previousItemsCount = state.playlistItems.length

	void window.appApi.downloads.probeCancel()
	logStep('playlistScopeReloadStart', state.wizardStep, state.wizardStep, {...pickWizardSnapshot(state), requestedScope: scope, previousScope, previousItemsCount})
	set({playlistScope: scope, playlistScopeReloading: true, playlistScopeError: null, playlistLikelyCapped: false})

	let result: Awaited<ReturnType<typeof window.appApi.downloads.probe>>
	try {
		result = await window.appApi.downloads.probe({url, playlistMode: 'playlist', playlistScope: scope})
	} catch (error) {
		const message = `Could not reload that playlist scope: ${unknownPlaylistScopeReloadErrorMessage(error)}. Your previous list is still shown.`
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, errorKind: 'exception', message})
		return
	}

	if (!result.ok) {
		const message = playlistScopeReloadErrorMessage(result.error)
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, errorKind: result.error.kind, message})
		return
	}

	if (result.data.kind !== 'playlist') {
		const message = 'No videos matched that playlist scope. Your previous list is still shown.'
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, resultKind: result.data.kind, message})
		return
	}

	const returnedEntryCount = result.data.entries.length
	applyPlaylistProbeResult(result.data, set, get, false)
	set({playlistScopeReloading: false, playlistScopeError: null})
	logStep('playlistScopeReloadSuccess', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, previousScope, previousItemsCount, returnedEntryCount, visibleItemsCount: get().playlistItems.length})
	void get().scanDownloadedInFolder()
}

export function createProbeOrchestratorSlice(set: SetState, get: GetState): ProbeOrchestratorSlice {
	return {
		wizardStep: RESET_WIZARD_STATE.wizardStep,
		wizardMode: RESET_WIZARD_STATE.wizardMode,
		wizardUrl: RESET_WIZARD_STATE.wizardUrl,
		wizardTitle: RESET_WIZARD_STATE.wizardTitle,
		wizardThumbnail: RESET_WIZARD_STATE.wizardThumbnail,
		wizardDuration: RESET_WIZARD_STATE.wizardDuration,
		wizardFormatsDegraded: RESET_WIZARD_STATE.wizardFormatsDegraded,
		wizardExtractor: RESET_WIZARD_STATE.wizardExtractor,
		wizardExtractorKey: RESET_WIZARD_STATE.wizardExtractorKey,
		wizardWebpageUrl: RESET_WIZARD_STATE.wizardWebpageUrl,
		formatsLoading: RESET_WIZARD_STATE.formatsLoading,
		wizardError: RESET_WIZARD_STATE.wizardError,
		wizardErrorOrigin: RESET_WIZARD_STATE.wizardErrorOrigin,
		playlistItems: RESET_WIZARD_STATE.playlistItems,
		selectedPlaylistItemIds: RESET_WIZARD_STATE.selectedPlaylistItemIds,
		playlistTitle: RESET_WIZARD_STATE.playlistTitle,
		playlistId: RESET_WIZARD_STATE.playlistId,
		playlistIsMultiVideo: RESET_WIZARD_STATE.playlistIsMultiVideo,
		playlistLikelyCapped: RESET_WIZARD_STATE.playlistLikelyCapped,
		playlistProbeLoading: RESET_WIZARD_STATE.playlistProbeLoading,
		playlistScopeReloading: RESET_WIZARD_STATE.playlistScopeReloading,
		playlistScopeError: RESET_WIZARD_STATE.playlistScopeError,
		playlistScope: RESET_WIZARD_STATE.playlistScope,
		playlistSelection: RESET_WIZARD_STATE.playlistSelection,
		bulkMetadataStatus: RESET_WIZARD_STATE.bulkMetadataStatus,
		bulkMetadataCompleted: RESET_WIZARD_STATE.bulkMetadataCompleted,
		bulkMetadataTotal: RESET_WIZARD_STATE.bulkMetadataTotal,
		bulkMetadataById: RESET_WIZARD_STATE.bulkMetadataById,
		quickDownloadStatus: RESET_WIZARD_STATE.quickDownloadStatus,
		quickDownloadError: RESET_WIZARD_STATE.quickDownloadError,
		quickDownloadQueueIds: RESET_WIZARD_STATE.quickDownloadQueueIds,
		quickDownloadProgressPhase: RESET_WIZARD_STATE.quickDownloadProgressPhase,
		quickDownloadProgressTotal: RESET_WIZARD_STATE.quickDownloadProgressTotal,
		quickDownloadProgressCompleted: RESET_WIZARD_STATE.quickDownloadProgressCompleted,
		quickDownloadProgressFailed: RESET_WIZARD_STATE.quickDownloadProgressFailed,
		quickDownloadProgressCurrent: RESET_WIZARD_STATE.quickDownloadProgressCurrent,
		quickDownloadProgressTitle: RESET_WIZARD_STATE.quickDownloadProgressTitle,
		quickDownloadProgressRunId: RESET_WIZARD_STATE.quickDownloadProgressRunId,
		syncedDownloadedIds: RESET_WIZARD_STATE.syncedDownloadedIds,
		syncScanState: RESET_WIZARD_STATE.syncScanState,

		setWizardUrl: url => set({wizardUrl: url, ...resetQuickDownloadFeedback()}),

		submitUrl: async () => {
			const cleaned = rewriteYouTubeChannelRoot(cleanUrl(get().wizardUrl.trim()))
			if (!cleaned) return
			// Mixed YouTube URLs (?v=X&list=Y) — disambiguate before probing so the
			// user picks intent rather than yt-dlp defaulting to playlist.
			if (isMixedYouTubeUrl(cleaned)) {
				set({wizardUrl: cleaned, mixedUrlPromptOpen: true, mixedUrlPending: cleaned, wizardError: null, cookiesConfigDialogIssue: null})
				return
			}
			if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return
			await runProbe(cleaned, 'auto', set, get)
		},

		quickDownload: () => quickDownload(set, get),

		quickDownloadUrls: urls => quickDownloadUrls(urls, set, get),

		cancelQuickDownload: () => cancelQuickDownload(set, get),

		startBulkUrls: urls => {
			const previousState = get()
			if (previousState.wizardMode === 'bulk' && previousState.bulkMetadataStatus === 'resolving') {
				cancelBulkMetadataProbes('start-new-bulk', previousState)
			}
			const bulkRunId = nextBulkMetadataRunId()
			const fromStep = get().wizardStep
			const projection = projectBulkStart(urls, get())

			set(projection.patch)
			bulkLogger.info('Bulk URL flow started', {runId: bulkRunId, count: urls.length, selectedCount: projection.playlistItems.length, allYouTubeVideos: projection.allYouTubeVideos, metadataConcurrency: BULK_METADATA_CONCURRENCY})
			void hydrateBulkMetadata(urls, set, bulkRunId)
			logStep('submitUrl', fromStep, 'playlistItems', pickWizardSnapshot(get()))
		},

		cancelBulkMetadata: (reason = 'queue-submit') => {
			const state = get()
			if (state.wizardMode !== 'bulk' || state.bulkMetadataStatus !== 'resolving') return
			cancelBulkMetadataProbes(reason, state)
			set({bulkMetadataStatus: 'done'})
		},

		dismissMixedPrompt: async choice => {
			const pending = get().mixedUrlPending
			set({mixedUrlPromptOpen: false, mixedUrlPending: null})
			if (!pending) return
			if (choice === 'video') {
				if (maybeBlockIncompleteCookiesConfig(pending, set, get)) return
				await runProbe(pending, 'video', set, get)
			} else {
				await runProbe(pending, 'playlist', set, get)
			}
		},

		setPlaylistItemSelected: (id, checked) => set(state => ({selectedPlaylistItemIds: checked ? (state.selectedPlaylistItemIds.includes(id) ? state.selectedPlaylistItemIds : [...state.selectedPlaylistItemIds, id]) : state.selectedPlaylistItemIds.filter(x => x !== id)})),

		setPlaylistScope: scope => set({playlistScope: scope}),

		reloadPlaylistWithScope: async scope => {
			await reloadPlaylistWithScope(scope, set, get)
		},

		selectAllPlaylistItems: () => set(state => ({selectedPlaylistItemIds: state.playlistItems.map(e => e.id)})),

		selectNonePlaylistItems: () => set({selectedPlaylistItemIds: []}),

		selectPlaylistRange: (from, to) =>
			set(state => {
				const lo = Math.min(from, to)
				const hi = Math.max(from, to)
				const ids = state.playlistItems.flatMap(e => (e.playlistIndex >= lo && e.playlistIndex <= hi ? [e.id] : []))
				return {selectedPlaylistItemIds: ids}
			}),

		confirmPlaylistSelection: () => {
			const {selectedPlaylistItemIds, wizardStep} = get()
			if (selectedPlaylistItemIds.length === 0) return
			set({wizardStep: 'playlistPresets', wizardError: null})
			logStep('advance', wizardStep, 'playlistPresets', pickWizardSnapshot(get()))
		},

		setPlaylistSelection: s => set({playlistSelection: s, wizardSubtitleSkipped: false}),

		// Scan the destination folder for already-downloaded items. Populates
		// syncedDownloadedIds (drives the "already downloaded" badges + the sync
		// alert) but does NOT change the selection — that's applyFolderSync's job.
		// Runs automatically after a playlist probe and on every folder change.
		scanDownloadedInFolder: async () => {
			const state = get()
			const videoIds = state.playlistItems.map(e => e.videoId).filter((v): v is string => v !== null)
			// Scan the resolved playlist dir (override or base+subfolder) — the exact
			// folder the files land in — via the shared resolver, so scan == download.
			const outputDir = resolvePlaylistDir(state)
			set({syncScanState: 'scanning'})
			const res = await window.appApi.playlist.scanFolder({outputDir, videoIds})
			if (!res.ok) {
				set({syncedDownloadedIds: [], syncScanState: 'done'})
				return
			}
			set({syncedDownloadedIds: res.data.matchedIds, syncScanState: 'done'})
		},

		// Deselect every item already present in the folder, leaving only the ones
		// that still need downloading. Driven by the sync alert's "Apply" action.
		applyFolderSync: () =>
			set(state => {
				const matched = new Set(state.syncedDownloadedIds)
				const selectedPlaylistItemIds = state.selectedPlaylistItemIds.filter(id => {
					const entry = state.playlistItems.find(e => e.id === id)
					return !entry?.videoId || !matched.has(entry.videoId)
				})
				return {selectedPlaylistItemIds}
			}),

		advance: () => {
			const state = get()
			const target = nextWizardStep(buildWizardStepGraph(state), 'forward')
			if (!target) return
			set({wizardStep: target})
			logStep('advance', state.wizardStep, target, pickWizardSnapshot(get()))
		},

		back: () => {
			const state = get()
			const target = nextWizardStep(buildWizardStepGraph(state), 'backward')
			if (!target) return
			if (state.wizardMode === 'bulk' && target === 'url' && state.bulkMetadataStatus === 'resolving') {
				cancelBulkMetadataProbes('back-to-url', state)
			}
			set({wizardStep: target, ...(target === 'subtitles' && {wizardSubtitleSkipped: false})})
			logStep('back', state.wizardStep, target, pickWizardSnapshot(get()))
		},

		skipSubtitles: () => {
			// Mark skipped first so WizardStepGraph treats `subtitles` as ineligible —
			// the rest of the routing reuses the same eligibility table as
			// advance(), so SponsorBlock + output skip rules can't drift.
			set({wizardSubtitleSkipped: true})
			const state = get()
			const target = nextWizardStep(buildWizardStepGraph(state), 'forward')
			if (!target) return
			set({wizardStep: target})
			logStep('skipSubtitles', state.wizardStep, target, pickWizardSnapshot(get()))
		},

		skipToConfirm: () => {
			const fromStep = get().wizardStep
			set({wizardStep: 'confirm'})
			logStep('skipToConfirm', fromStep, 'confirm', pickWizardSnapshot(get()))
		},

		reset: () => {
			const state = get()
			const fromStep = state.wizardStep
			if (state.wizardMode === 'bulk' && state.bulkMetadataStatus === 'resolving') {
				cancelBulkMetadataProbes('reset', state)
			}
			WizardCommands.resetAll(set)
			logStep('reset', fromStep, 'url', pickWizardSnapshot(get()))
		},

		retry: async () => {
			const {wizardErrorOrigin, wizardStep} = get()
			if (wizardErrorOrigin === 'formats') {
				set({wizardStep: 'formats', formatsLoading: true, wizardError: null})
				logStep('retry', wizardStep, 'formats', pickWizardSnapshot(get()))
				await get().submitUrl()
			}
		},

		retryFormatProbe: async () => {
			const {wizardUrl} = get()
			if (get().wizardMode === 'bulk') return
			if (!wizardUrl) return
			set({formatsLoading: true, wizardFormatsDegraded: null})
			const playlistMode: ProbePlaylistMode = get().wizardMode === 'playlist' ? 'playlist' : 'auto'
			await runProbe(wizardUrl, playlistMode, set, get, false)
		},

		retryProbeWithCookies: async () => {
			const settings = get().settings
			const path = settings?.common.cookiesPath?.trim()
			const browser = settings?.common.cookiesBrowser
			const targetMode: 'file' | 'browser' | null = path ? 'file' : browser ? 'browser' : null
			if (!targetMode) return
			await get().setCookiesMode(targetMode)
			await get().retryFormatProbe()
		},

		openCookiesSettings: () => {
			// Cancel any in-flight probe — leaving the formats step abandons it,
			// and a stalled YouTube fallback chain can otherwise keep the spinner
			// bound and emit results into a step the user already left.
			void window.appApi.downloads.probeCancel()
			replaceHash('settings')
			set({wizardStep: 'url', wizardError: null, wizardErrorOrigin: null, advancedAutoOpen: true, advancedAutoTarget: 'cookies', cookiesConfigDialogIssue: null})
		}
	}
}
