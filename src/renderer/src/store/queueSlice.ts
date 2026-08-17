// Renderer-side queue slice — pure projection of QueueService (main).
// All mutations route through IPC commands; the queue array is hydrated
// from main's snapshot + diff events.
//
// Shims like addToQueue / addAndDownloadImmediately still build QueueItems
// from wizard state because the wizard data lives in the renderer; once
// built, the items are pushed to main via queue.cmd.add.

import type {QueueLane} from '@shared/types.js'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import type {GetState, SetState, QueueSlice} from './types.js'
import {persistFormatPrefs} from './wizard/persistFormatPrefs.js'
import {prepareManualQueueSubmission, prepareMultiProfileQueueSubmission} from './wizard/queueSubmission.js'
import {submitPreparedQueueSubmission} from './wizard/queueSubmissionAdapter.js'
import {queueLoadedPlaylistWithActiveProfile} from './wizard/quickDownloadPreparation.js'

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
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
		const result = await submitPreparedQueueSubmission(prepared)
		if (!result.ok) {
			set({wizardStep: 'error', wizardError: {kind: 'other', code: 'unknown', message: result.error}, wizardErrorOrigin: null})
			return
		}
		await persistFormatPrefs(set, get)
		get().reset()
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
		isSubmittingToQueue: false,

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
		}
	}
}
