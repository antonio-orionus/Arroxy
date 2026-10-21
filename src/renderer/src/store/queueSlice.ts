// Renderer-side queue slice — pure projection of QueueService (main).
// All mutations route through IPC commands; the queue array is hydrated
// from main's snapshot + diff events.
//
// Shims like addToQueue / addAndDownloadImmediately still build QueueItems
// from wizard state because the wizard data lives in the renderer; once
// built, the items are pushed to main via queue.cmd.add.

import type {DownloadProfile, QueueLane} from '@shared/types.js'
import {i18next} from '@shared/i18n/index.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {notify} from '@renderer/lib/notify.js'
import {profileDisplayName} from '@renderer/lib/profileName.js'
import {replaceHash} from '@renderer/lib/navigation.js'
import type {GetState, SetState, QueueSlice} from './types.js'
import {persistFormatPrefs} from './wizard/persistFormatPrefs.js'
import {editedProfileDraft} from './wizard/wizardProfileState.js'
import {configuredCookiesRetryMode} from './wizard/probeErrorExperience.js'
import {prepareManualQueueSubmission, prepareMultiProfileQueueSubmission} from './wizard/queueSubmission.js'
import {submitPreparedQueueSubmission} from './wizard/queueSubmissionAdapter.js'
import {queueLoadedPlaylistWithActiveProfile} from './wizard/quickDownloadPreparation.js'
import {settlePlaceholder} from './quickDownload/quickDownloadPipeline.js'

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

async function saveEditedProfile(get: GetState, profile: DownloadProfile): Promise<void> {
	try {
		await get().saveDownloadProfile(profile, false)
		notify.profileSaved(profileDisplayName(profile))
	} catch (error) {
		notify.profileSaveFailed(error)
	}
}

async function submitWizardToQueue(set: SetState, get: GetState, lane: QueueLane): Promise<void> {
	// Re-entry guard: large playlists (e.g. 290 entries) take a perceptible
	// moment to enumerate, serialize over IPC, and commit on the main process.
	// Without this, a user who thinks the app froze will click the button again
	// and end up with duplicate queue items. Pair with `isSubmittingToQueue`
	// being read by StepConfirm to also disable the buttons.
	if (get().isSubmittingToQueue) return
	const stateBeforeSubmit = get()
	if (stateBeforeSubmit.wizardMode === 'bulk') {
		bulkLogger.info('Bulk queue submission requested', {
			lane,
			selectedCount: stateBeforeSubmit.selectedPlaylistItemIds.length,
			total: stateBeforeSubmit.playlistItems.length,
			metadataStatus: stateBeforeSubmit.bulkMetadataStatus,
			metadataCompleted: stateBeforeSubmit.bulkMetadataCompleted,
			metadataTotal: stateBeforeSubmit.bulkMetadataTotal
		})
		get().cancelBulkMetadata('queue-submit')
	}
	set({isSubmittingToQueue: true})
	try {
		const prepared = stateBeforeSubmit.multiProfileMode ? prepareMultiProfileQueueSubmission(get(), lane) : prepareManualQueueSubmission(get(), lane)
		if (!prepared) return
		const reviewSourceRowId = stateBeforeSubmit.reviewSourceRowId
		if (prepared.items.length === 0) {
			// Everything selected is already queued: nothing failed and nothing
			// was queued. Tell the user and leave the wizard where it is, so they
			// can adjust the selection. A reviewed row has nothing left to wait for.
			if (reviewSourceRowId !== null) {
				await settlePlaceholder(reviewSourceRowId)
				set({reviewSourceRowId: null})
			}
			notify.queueSkippedAlreadyQueued(prepared.skippedAlreadyQueued)
			return
		}
		const result = await submitPreparedQueueSubmission(prepared, reviewSourceRowId)
		if (!result.ok) {
			set({wizardStep: 'error', wizardError: {kind: 'other', code: 'unknown', message: result.error}, wizardErrorOrigin: null})
			return
		}
		const skippedAlreadyQueued = prepared.skippedAlreadyQueued + result.skippedAlreadyQueued
		if (skippedAlreadyQueued > 0) notify.queueSkippedAlreadyQueued(skippedAlreadyQueued)
		await persistFormatPrefs(set, get)
		const state = get()
		const edited = state.wizardProfile ? editedProfileDraft(state, i18next.t('wizard.review.nextTime.defaultName', {profile: profileDisplayName(state.wizardProfile)})) : null
		get().reset()
		if (edited) notify.offerSaveEdits(() => void saveEditedProfile(get, edited))
	} catch (error) {
		// prepareMultiProfileQueueSubmission can throw synchronously —
		// resolveDownloadProfileOutputDir throws for an assigned profile with no
		// resolvable output dir (e.g. a fixed dir left blank). The confirm
		// screen's breakdown guards the same call (downloadReviewProjection.ts's
		// safeProfileOutputDir) so it can render a blank row instead of
		// crashing; this call site has no such guard upstream, so left
		// uncaught, Add to Queue silently rejected with no wizard error shown.
		set({wizardStep: 'error', wizardError: {kind: 'other', code: 'unknown', message: errorMessage(error)}, wizardErrorOrigin: null})
	} finally {
		set({isSubmittingToQueue: false})
	}
}

export function createQueueSlice(set: SetState, get: GetState): QueueSlice {
	return {
		queue: [],
		schedulerPaused: false,
		isSubmittingToQueue: false,
		queueFocus: null,

		// "+ Queue" → normal lane: respects cap=1, waits for the active slot.
		// "Pull it!" → priority lane: spawns alongside running normal items,
		// gated by maxConcurrent ceiling. Both go through the same builder; the
		// only difference is the lane stamped on the QueueItem.
		addToQueue: () => submitWizardToQueue(set, get, 'normal'),

		addAndDownloadImmediately: () => submitWizardToQueue(set, get, 'priority'),

		queueLoadedPlaylistWithActiveProfile: () => queueLoadedPlaylistWithActiveProfile(set, get, 'normal'),

		setItemLane: async (itemId, lane) => {
			await window.appApi.queue.cmd.setLane({itemId, lane})
		},

		cancelItemDownload: async itemId => {
			await window.appApi.queue.cmd.cancel({itemId})
		},

		pauseItemDownload: async itemId => {
			await window.appApi.queue.cmd.pause({itemId})
		},

		resumeItemDownload: async itemId => {
			await window.appApi.queue.cmd.resume({itemId})
		},

		removeQueueItem: async itemId => {
			await window.appApi.queue.cmd.remove({itemId})
		},

		retryQueueItem: async itemId => {
			await window.appApi.queue.cmd.retry({itemId})
		},

		retryDownloadWithCookies: async itemId => {
			const targetMode = configuredCookiesRetryMode(get().settings?.common)
			if (!targetMode) return
			await get().setCookiesMode(targetMode)
			await get().retryQueueItem(itemId)
		},

		applyQueueSelectionAction: async (action, itemIds) => {
			return window.appApi.queue.cmd.applySelectionAction({action, itemIds})
		},

		changeQueueOutputTarget: async (itemIds, outputDir) => {
			return window.appApi.queue.cmd.changeOutputTarget({itemIds, outputDir})
		},

		clearCompleted: async () => {
			await window.appApi.queue.cmd.clearCompleted()
		},

		// Delegated to QueueService — the global pauseAll/resumeAll route flips
		// the scheduler-paused flag atomically with the per-item pause/resume so
		// pause-all can't auto-spawn the next pending item mid-flight.
		pauseAll: async () => {
			await window.appApi.queue.cmd.pauseAll()
		},

		resumeAll: async () => {
			await window.appApi.queue.cmd.resumeAll()
		},

		cancelAll: async () => {
			await window.appApi.queue.cmd.cancel({itemId: null})
		},

		openItemFolder: async itemId => {
			const item = get().queue.find(i => i.id === itemId)
			if (!item) return
			await window.appApi.shell.openFolder(item.outputDir)
		},

		openItemUrl: itemId => {
			const item = get().queue.find(i => i.id === itemId)
			if (!item) return
			void window.appApi.shell.openExternal(item.url)
		},

		// The tab bar lives on the download home. A wizard run in progress is
		// never thrown away for it (P2-R41): the toasts offer no View then, and a
		// stray call does nothing.
		showQueueItem: itemId => {
			if (get().wizardStep !== 'url') return
			replaceHash('queue')
			if (itemId !== null) set(state => ({queueFocus: {itemId, seq: (state.queueFocus?.seq ?? 0) + 1}}))
		},

		clearQueueFocus: seq => {
			if (get().queueFocus?.seq === seq) set({queueFocus: null})
		}
	}
}
