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
import {classifyUrlIntent} from '@shared/urlIntent.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import {resolvePlaylistDir} from './playlistDir.js'
import {WizardCommands, RESET_WIZARD_STATE} from './commands.js'
import type {AppState, GetState, SetState, ProbeOrchestratorSlice, WizardStep} from '../types.js'
import {buildWizardStepGraph, nextWizardStep} from './wizardStepGraph.js'
import {BULK_METADATA_CONCURRENCY, cancelBulkMetadataProbes, currentBulkMetadataRunId, hydrateBulkMetadata, nextBulkMetadataRunId} from './bulkMetadataHydration.js'
import {expandBulkCollectionUrls, hasCollectionUrl} from './bulkCollectionExpansion.js'
import {isSelectablePlaylistRow} from './playlistRowSelection.js'
import {playlistScopeReloadErrorMessage, unknownPlaylistScopeReloadErrorMessage} from './playlistScopeReload.js'
import {rewriteYouTubeChannelRoot} from './urlIntake.js'
import {quickDownload as runQuickDownload, quickDownloadUrls, cancelQuickDownload, retryQuickDownloadFailure, retryQuickDownloadWithCookies, retryQuickPlaylistCap} from './quickDownloadPreparation.js'
import {resetQuickDownloadFeedback} from './quickDownloadFeedback.js'
import {projectBulkStart, projectPlaylistProbeResult, projectProbeFailure, projectProbeStart, projectVideoProbeResult, type BulkEntrySeed} from './probeResultProjection.js'
import {mixedUrlPromptPatch} from './mixedUrlPrompt.js'
import {configuredCookiesRetryMode} from './probeErrorExperience.js'
import {policyForUrlIntent} from './urlIntentPolicy.js'
import {canScanPlaylistFolder} from './outputTemplates.js'

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
	set({wizardUrl: url, wizardStep: 'url', formatsLoading: false, playlistProbeLoading: false, playlistProbeProgress: null, wizardError: null, wizardErrorOrigin: null, cookiesConfigDialogIssue: issue})
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
	const previousLikelyCapped = state.playlistLikelyCapped

	void window.appApi.downloads.probeCancel()
	logStep('playlistScopeReloadStart', state.wizardStep, state.wizardStep, {...pickWizardSnapshot(state), requestedScope: scope, previousScope, previousItemsCount})
	set({playlistScope: scope, playlistScopeReloading: true, playlistScopeError: null, playlistLikelyCapped: false, playlistProbeProgress: null})

	let result: Awaited<ReturnType<typeof window.appApi.downloads.probe>>
	try {
		result = await window.appApi.downloads.probe({url, playlistMode: 'playlist', playlistScope: scope})
	} catch (error) {
		const message = `Could not reload that playlist scope: ${unknownPlaylistScopeReloadErrorMessage(error)}. Your previous list is still shown.`
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message, playlistLikelyCapped: previousLikelyCapped, playlistProbeProgress: null})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, errorKind: 'exception', message})
		return
	}

	if (!result.ok) {
		const message = playlistScopeReloadErrorMessage(result.error)
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message, playlistLikelyCapped: previousLikelyCapped, playlistProbeProgress: null})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, errorKind: result.error.kind, message})
		return
	}

	if (result.data.kind !== 'playlist') {
		const message = 'No videos matched that playlist scope. Your previous list is still shown.'
		set({playlistScope: previousScope, playlistScopeReloading: false, playlistScopeError: message, playlistLikelyCapped: previousLikelyCapped, playlistProbeProgress: null})
		logStep('playlistScopeReloadFailure', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, restoredScope: previousScope, previousItemsCount, resultKind: result.data.kind, message})
		return
	}

	const returnedEntryCount = result.data.entries.length
	applyPlaylistProbeResult(result.data, set, get, false)
	set({playlistScopeReloading: false, playlistScopeError: null, playlistProbeProgress: null})
	logStep('playlistScopeReloadSuccess', get().wizardStep, get().wizardStep, {...pickWizardSnapshot(get()), requestedScope: scope, previousScope, previousItemsCount, returnedEntryCount, visibleItemsCount: get().playlistItems.length})
	void get().scanDownloadedInFolder()
}

export function createProbeOrchestratorSlice(set: SetState, get: GetState): ProbeOrchestratorSlice {
	// Shared tail of both bulk entry paths: project the rows, then hydrate only
	// the ones no probe has spoken for yet.
	function startBulkRows(rows: readonly string[], seeds: ReadonlyMap<string, BulkEntrySeed> | undefined, bulkRunId: number, fromStep: WizardStep): void {
		const projection = projectBulkStart(rows, get(), seeds)
		set(projection.patch)
		bulkLogger.info('Bulk URL flow started', {runId: bulkRunId, count: rows.length, selectedCount: projection.playlistItems.length, seededCount: rows.length - projection.metadataTargets.length, allYouTubeVideos: projection.allYouTubeVideos, metadataConcurrency: BULK_METADATA_CONCURRENCY})
		void hydrateBulkMetadata(projection.metadataTargets, set, bulkRunId)
		logStep('submitUrl', fromStep, 'playlistItems', pickWizardSnapshot(get()))
	}

	return {
		wizardStep: RESET_WIZARD_STATE.wizardStep,
		wizardMode: RESET_WIZARD_STATE.wizardMode,
		wizardUrl: RESET_WIZARD_STATE.wizardUrl,
		wizardTitle: RESET_WIZARD_STATE.wizardTitle,
		wizardThumbnail: RESET_WIZARD_STATE.wizardThumbnail,
		wizardDuration: RESET_WIZARD_STATE.wizardDuration,
		wizardVideoId: RESET_WIZARD_STATE.wizardVideoId,
		wizardUploader: RESET_WIZARD_STATE.wizardUploader,
		wizardUploadDate: RESET_WIZARD_STATE.wizardUploadDate,
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
		playlistProbeProgress: RESET_WIZARD_STATE.playlistProbeProgress,
		playlistScopeReloading: RESET_WIZARD_STATE.playlistScopeReloading,
		playlistScopeError: RESET_WIZARD_STATE.playlistScopeError,
		playlistScope: RESET_WIZARD_STATE.playlistScope,
		playlistSelection: RESET_WIZARD_STATE.playlistSelection,
		multiProfileMode: RESET_WIZARD_STATE.multiProfileMode,
		playlistProfileAssignments: RESET_WIZARD_STATE.playlistProfileAssignments,
		removedPlaylistItemIds: RESET_WIZARD_STATE.removedPlaylistItemIds,
		removedSelectionIds: RESET_WIZARD_STATE.removedSelectionIds,
		bulkMetadataStatus: RESET_WIZARD_STATE.bulkMetadataStatus,
		bulkMetadataCompleted: RESET_WIZARD_STATE.bulkMetadataCompleted,
		bulkMetadataTotal: RESET_WIZARD_STATE.bulkMetadataTotal,
		bulkMetadataById: RESET_WIZARD_STATE.bulkMetadataById,
		quickDownloadStatus: RESET_WIZARD_STATE.quickDownloadStatus,
		quickDownloadFailure: RESET_WIZARD_STATE.quickDownloadFailure,
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
			const action = policyForUrlIntent(classifyUrlIntent(cleaned), 'interactive-submit')
			if (action.kind === 'show-mixed-prompt') {
				set(mixedUrlPromptPatch(cleaned, 'wizard'))
				return
			}
			if (action.kind === 'open-bulk-review' || action.kind === 'show-label') return
			if (maybeBlockIncompleteCookiesConfig(cleaned, set, get)) return
			await runProbe(cleaned, action.playlistMode, set, get)
		},

		quickDownload: () => runQuickDownload(set, get),

		quickDownloadUrls: urls => quickDownloadUrls(urls, set, get),

		retryQuickDownloadFailure: () => retryQuickDownloadFailure(set, get),

		retryQuickPlaylistCap: () => retryQuickPlaylistCap(set, get),

		retryQuickDownloadWithCookies: () => retryQuickDownloadWithCookies(set, get),

		cancelQuickDownload: () => cancelQuickDownload(set, get),

		startBulkUrls: urls => {
			const previousState = get()
			if (previousState.wizardMode === 'bulk' && previousState.bulkMetadataStatus === 'resolving') {
				cancelBulkMetadataProbes('start-new-bulk', previousState)
			}
			const bulkRunId = nextBulkMetadataRunId()
			const fromStep = get().wizardStep

			// A collection URL cannot become a row — see bulkCollectionExpansion.
			// Expanding needs a probe, so this branch is async; the common case
			// (a list of individual videos) stays synchronous, which is also what
			// the UI relies on to show the list immediately.
			if (hasCollectionUrl(urls)) {
				void (async () => {
					const expansion = await expandBulkCollectionUrls(urls, input => window.appApi.downloads.probe(input), get().playlistScope)
					if (currentBulkMetadataRunId() !== bulkRunId) return
					bulkLogger.info('Bulk collection expansion finished', {runId: bulkRunId, inputCount: urls.length, rowCount: expansion.urls.length, droppedCount: expansion.dropped.length})
					startBulkRows(expansion.urls, expansion.seeds, bulkRunId, fromStep)
				})()
				return
			}

			startBulkRows(urls, undefined, bulkRunId, fromStep)
		},

		cancelBulkMetadata: (reason = 'queue-submit') => {
			const state = get()
			if (state.wizardMode !== 'bulk' || state.bulkMetadataStatus !== 'resolving') return
			cancelBulkMetadataProbes(reason, state)
			set({bulkMetadataStatus: 'done'})
		},

		dismissMixedPrompt: async choice => {
			const pending = get().mixedUrlPending
			const source = get().mixedUrlPromptSource
			set({mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null})
			if (!pending) return
			if (source === 'quick-download') {
				set({wizardUrl: pending})
				await runQuickDownload(set, get, choice)
				return
			}
			if (choice === 'video') {
				if (maybeBlockIncompleteCookiesConfig(pending, set, get)) return
				await runProbe(pending, 'video', set, get)
			} else {
				await runProbe(pending, 'playlist', set, get)
			}
		},

		setPlaylistItemSelected: (id, checked) =>
			set(state => {
				// Selecting a playlist row would put the wizard one click from a
				// submission that silently drops it, so refuse rather than accept and
				// discard later. Unchecking always works — a row selected before the
				// probe learned what it was must stay correctable.
				if (checked && !isSelectablePlaylistRow(state.playlistItems.find(entry => entry.id === id))) return {}
				return {selectedPlaylistItemIds: checked ? (state.selectedPlaylistItemIds.includes(id) ? state.selectedPlaylistItemIds : [...state.selectedPlaylistItemIds, id]) : state.selectedPlaylistItemIds.filter(x => x !== id)}
			}),

		setPlaylistScope: scope => set({playlistScope: scope}),

		reloadPlaylistWithScope: async scope => {
			await reloadPlaylistWithScope(scope, set, get)
		},

		// Both filter against removedPlaylistItemIds so a removed row can never
		// reappear in the count — with no visible row to uncheck, the user would
		// have no way to correct an over-count. Both also skip playlist rows, for
		// the reason in setPlaylistItemSelected.
		selectAllPlaylistItems: () =>
			set(state => {
				const removed = new Set(state.removedPlaylistItemIds)
				return {selectedPlaylistItemIds: state.playlistItems.filter(e => !removed.has(e.id) && isSelectablePlaylistRow(e)).map(e => e.id)}
			}),

		selectNonePlaylistItems: () => set({selectedPlaylistItemIds: []}),

		selectPlaylistRange: (from, to) =>
			set(state => {
				const lo = Math.min(from, to)
				const hi = Math.max(from, to)
				const removed = new Set(state.removedPlaylistItemIds)
				const ids = state.playlistItems.flatMap(e => (e.playlistIndex >= lo && e.playlistIndex <= hi && !removed.has(e.id) && isSelectablePlaylistRow(e) ? [e.id] : []))
				return {selectedPlaylistItemIds: ids}
			}),

		confirmPlaylistSelection: () => {
			const {selectedPlaylistItemIds, wizardStep} = get()
			if (selectedPlaylistItemIds.length === 0) return
			set({wizardStep: 'playlistPresets', wizardError: null})
			logStep('advance', wizardStep, 'playlistPresets', pickWizardSnapshot(get()))
		},

		setPlaylistSelection: s => set({playlistSelection: s, wizardSubtitleSkipped: false}),

		// Logged here (not inside WizardCommands) so every other transition in
		// this file keeps calling logStep the same way, right after the set() —
		// without it the diagnostics stream shows no record of entry into or
		// exit from playlistProfiles at all.
		enterMultiProfileMode: () => {
			const fromStep = get().wizardStep
			WizardCommands.enterMultiProfileMode(set)
			logStep('advance', fromStep, get().wizardStep, pickWizardSnapshot(get()))
		},

		exitMultiProfileMode: () => {
			const fromStep = get().wizardStep
			WizardCommands.exitMultiProfileMode(set)
			logStep('back', fromStep, get().wizardStep, pickWizardSnapshot(get()))
		},

		assignPlaylistProfile: (itemIds, ref) => WizardCommands.assignPlaylistProfile(itemIds, ref, set, get),

		resetPlaylistProfile: itemIds => WizardCommands.resetPlaylistProfile(itemIds, set, get),

		removePlaylistItems: itemIds => WizardCommands.removePlaylistItems(itemIds, set, get),

		restoreRemovedPlaylistItems: () => WizardCommands.restoreRemovedPlaylistItems(set, get),

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
			// The scan matches files by `[videoId]` before the extension in one
			// directory. It cannot match when the template omits {id}, and it would
			// look in the wrong directory when the template sorts entries into
			// per-entry folders. Report "nothing found" rather than reporting wrongly.
			if (!canScanPlaylistFolder(undefined, state.settings?.common?.filenameTemplate)) {
				set({syncedDownloadedIds: [], syncScanState: 'done'})
				return
			}
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
			const targetMode = configuredCookiesRetryMode(get().settings?.common)
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
