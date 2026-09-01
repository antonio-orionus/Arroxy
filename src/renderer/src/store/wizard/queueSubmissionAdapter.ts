import type {QueueItem} from '@shared/types.js'
import {queueIdsFromAddResult} from './quickDownloadFeedback.js'
import type {PreparedQueueSubmission} from './queueSubmission.js'

export type QueueSubmissionResult = {ok: true; ids: string[]; items: QueueItem[]} | {ok: false; error: string}

export async function submitPreparedQueueSubmission(prepared: PreparedQueueSubmission): Promise<QueueSubmissionResult> {
	if (prepared.manifest) {
		try {
			const manifestRes = await window.appApi.playlist.registerManifest(prepared.manifest)
			if (!manifestRes.ok) console.warn('playlist manifest registration failed; M3U will be skipped', manifestRes.error)
		} catch (err) {
			console.warn('playlist manifest registration threw; M3U will be skipped', err)
		}
	}

	const addResult = await window.appApi.queue.cmd.add(prepared.items)
	if (!addResult.ok) return {ok: false, error: addResult.error.message}
	return {ok: true, ids: queueIdsFromAddResult(addResult.data.ids, prepared.items), items: prepared.items}
}

// Hotkey probe-stage variant: instead of plain `add`, the prepared items go
// through the atomic swap that replaces the probing placeholder row. If the
// user cancelled/removed the placeholder while the probe was in flight, the
// swap refuses and NOTHING is enqueued — no orphaned downloads behind a
// cancelled submission.
export async function submitProbeStageQueueSubmission(itemId: string, prepared: PreparedQueueSubmission): Promise<QueueSubmissionResult> {
	if (prepared.manifest) {
		try {
			const manifestRes = await window.appApi.playlist.registerManifest(prepared.manifest)
			if (!manifestRes.ok) console.warn('playlist manifest registration failed; M3U will be skipped', manifestRes.error)
		} catch (err) {
			console.warn('playlist manifest registration threw; M3U will be skipped', err)
		}
	}

	const replaceResult = await window.appApi.queue.cmd.replaceProbing({itemId, items: prepared.items})
	if (!replaceResult.ok) return {ok: false, error: replaceResult.error.message}
	return {ok: true, ids: replaceResult.data.ids, items: prepared.items}
}
