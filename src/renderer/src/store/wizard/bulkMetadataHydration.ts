import type {BulkMetadataCancelReason, BulkMetadataItemStatus} from '@shared/types.js'
import {bulkLogger, redactUrlForLog} from '@renderer/lib/bulkLogger.js'
import type {AppState, SetState} from '../types.js'

export const BULK_METADATA_CONCURRENCY = 2

let bulkMetadataRunSeq = 0

export function nextBulkMetadataRunId(): number {
	bulkMetadataRunSeq += 1
	return bulkMetadataRunSeq
}

/** Current run id, so an async pre-pass can tell whether it was superseded. */
export function currentBulkMetadataRunId(): number {
	return bulkMetadataRunSeq
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

export function cancelBulkMetadataProbes(reason: BulkMetadataCancelReason, state?: Pick<AppState, 'bulkMetadataStatus' | 'bulkMetadataCompleted' | 'bulkMetadataTotal'>): void {
	const previousRunId = bulkMetadataRunSeq
	const nextRunId = nextBulkMetadataRunId()
	bulkLogger.info('Bulk metadata cancellation requested', {reason, previousRunId, nextRunId, status: state?.bulkMetadataStatus, completed: state?.bulkMetadataCompleted, total: state?.bulkMetadataTotal})
	if (typeof window.appApi.downloads.probeCancel === 'function') {
		void window.appApi.downloads.probeCancel()
	}
}

/**
 * One row awaiting a metadata probe. `index` is its position in
 * `state.playlistItems`, carried rather than derived because rows expanded from
 * a collection URL arrive pre-seeded and are not probed — so a target's
 * position no longer matches its position in the probe list.
 */
export interface BulkMetadataTarget {
	id: string
	url: string
	index: number
}

export async function hydrateBulkMetadata(targets: readonly BulkMetadataTarget[], set: SetState, runId: number): Promise<void> {
	let nextTarget = 0
	bulkLogger.info('Bulk metadata hydration started', {runId, total: targets.length, concurrency: Math.min(BULK_METADATA_CONCURRENCY, targets.length)})

	async function worker(): Promise<void> {
		if (bulkMetadataRunSeq !== runId || nextTarget >= targets.length) return
		const target = targets[nextTarget]
		nextTarget += 1
		const {id, index, url} = target
		let finalStatus: BulkMetadataItemStatus = 'failed'

		set(state => {
			if (state.wizardMode !== 'bulk') return {}
			const current = state.playlistItems[index]
			if (current?.id !== id || current.url !== url) return {}
			return {bulkMetadataById: {...state.bulkMetadataById, [id]: 'resolving'}}
		})

		try {
			bulkLogger.debug('Bulk metadata probe started', {runId, itemId: id, index: index + 1, url: redactUrlForLog(url)})
			const result = await window.appApi.downloads.probe({url, playlistMode: 'video'})
			if (!result.ok) {
				if (result.error.kind === 'other' && result.error.message === 'Probe cancelled') {
					bulkLogger.info('Bulk metadata probe cancelled', {runId, itemId: id, index: index + 1, url: redactUrlForLog(url)})
					return worker()
				}
				bulkLogger.warn('Bulk metadata probe failed', {runId, itemId: id, index: index + 1, url: redactUrlForLog(url), error: result.error})
				return worker()
			}
			if (result.data.kind !== 'video') {
				// We asked for a single video and got a set back, so this row is a
				// playlist however its URL looked. Marking it is what stops it:
				// URL-shape classification cannot catch every container (a bare
				// `/browse/<id>` has no other tell, and other sites have their own
				// shapes), and unmarked the row stays selected and reaches the queue
				// carrying one filename for the whole set.
				bulkLogger.warn('Bulk metadata probe returned non-video result', {runId, itemId: id, index: index + 1, url: redactUrlForLog(url), kind: result.data.kind})
				if (bulkMetadataRunSeq === runId) {
					set(state => {
						if (state.wizardMode !== 'bulk') return {}
						const current = state.playlistItems[index]
						if (current?.id !== id || current.url !== url) return {}
						return {playlistItems: state.playlistItems.map(entry => (entry.id === id ? {...entry, isContainer: true as const} : entry)), selectedPlaylistItemIds: state.selectedPlaylistItemIds.filter(selectedId => selectedId !== id)}
					})
				}
				return worker()
			}
			if (bulkMetadataRunSeq !== runId) return

			const probe = result.data
			finalStatus = 'done'
			bulkLogger.info('Bulk metadata resolved', {runId, itemId: id, index: index + 1, title: probe.title, videoId: probe.videoId, extractor: probe.extractor, duration: probe.duration})
			set(state => {
				if (state.wizardMode !== 'bulk') return {}
				const current = state.playlistItems[index]
				if (current?.id !== id || current.url !== url) return {}
				return {
					playlistItems: state.playlistItems.map(entry =>
						entry.id === id ? {...entry, title: probe.title.trim() || entry.title, thumbnail: probe.thumbnail || entry.thumbnail, duration: probe.duration ?? entry.duration, videoId: probe.videoId ?? entry.videoId, ...(probe.probeInfoJsonRef ? {probeInfoJsonRef: probe.probeInfoJsonRef} : {})} : entry
					)
				}
			})
		} catch (error) {
			// Metadata hydration is best-effort; synthetic rows remain usable.
			bulkLogger.warn('Bulk metadata probe threw', {runId, itemId: id, index: index + 1, url: redactUrlForLog(url), error: errorMessage(error)})
		} finally {
			if (bulkMetadataRunSeq === runId) {
				set(state => {
					if (state.wizardMode !== 'bulk') return {}
					const current = state.playlistItems[index]
					if (current?.id !== id || current.url !== url) return {}
					const completed = Math.min(state.bulkMetadataCompleted + 1, state.bulkMetadataTotal)
					return {bulkMetadataCompleted: completed, bulkMetadataStatus: completed >= state.bulkMetadataTotal ? 'done' : 'resolving', bulkMetadataById: {...state.bulkMetadataById, [id]: finalStatus}}
				})
			}
		}
		return worker()
	}

	await Promise.all(Array.from({length: Math.min(BULK_METADATA_CONCURRENCY, targets.length)}, () => worker()))
	if (bulkMetadataRunSeq === runId) {
		bulkLogger.info('Bulk metadata hydration finished', {runId, total: targets.length})
	} else {
		bulkLogger.info('Bulk metadata hydration stopped', {runId, supersededByRunId: bulkMetadataRunSeq})
	}
}
