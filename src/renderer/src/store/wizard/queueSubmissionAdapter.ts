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
