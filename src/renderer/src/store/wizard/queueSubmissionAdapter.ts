import {queueIdsFromAddResult} from './quickDownloadFeedback.js'
import type {PreparedQueueSubmission} from '@shared/queueSubmission.js'

// `skippedAlreadyQueued`: rows main left out because their video is live
// there (the renderer's queue lags main's); the preparation counts its own.
export type QueueSubmissionResult = {ok: true; ids: string[]; skippedAlreadyQueued: number} | {ok: false; error: string}

async function registerManifest(prepared: PreparedQueueSubmission): Promise<void> {
	if (!prepared.manifest) return
	try {
		const manifestRes = await window.appApi.playlist.registerManifest(prepared.manifest)
		if (!manifestRes.ok) console.warn('playlist manifest registration failed; M3U will be skipped', manifestRes.error)
	} catch (err) {
		console.warn('playlist manifest registration threw; M3U will be skipped', err)
	}
}

// `replacing`: a placeholder row this submission resolves (a needs-choice
// row's review, P2-R40). Its first item keeps the row's id, so the row turns
// into the queued videos in place. A row that is already gone (cancelled or
// removed meanwhile) is no reason to lose the submission: it is added plainly.
// A conflict (the videos went live meanwhile) or the intake's admission limit
// is a real refusal, which adding plainly would only get around.
export async function submitPreparedQueueSubmission(prepared: PreparedQueueSubmission, replacing: string | null = null): Promise<QueueSubmissionResult> {
	await registerManifest(prepared)
	if (replacing !== null) {
		const [first, ...rest] = prepared.items
		const items = first ? [{...first, id: replacing}, ...rest] : []
		const replaced = await window.appApi.queue.cmd.replaceProbing({itemId: replacing, items})
		if (replaced.ok) return {ok: true, ...replaced.data}
		if (replaced.error.code === 'conflict' || replaced.error.code === 'limit') return {ok: false, error: replaced.error.message}
	}
	const addResult = await window.appApi.queue.cmd.add(prepared.items)
	if (!addResult.ok) return {ok: false, error: addResult.error.message}
	return {ok: true, ids: queueIdsFromAddResult(addResult.data.ids, prepared.items), skippedAlreadyQueued: addResult.data.skippedAlreadyQueued}
}
