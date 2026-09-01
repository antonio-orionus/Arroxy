// Best-effort artifact cleanup for queue items leaving the active lifecycle:
// resume temp dirs (paused .part files) and probe info-json cache files.
// Extracted from QueueService (same pattern as QueueAutoRetry /
// QueueProbeLifecycle) so the scheduler keeps its single responsibility and
// stays under the repo LOC cap. Never throws — cleanup failures are logged,
// never surfaced to the user.
import log from 'electron-log/main.js'
import {QueueResumeLifecycle} from './QueueResumeLifecycle.js'
import type {ProbeInfoJsonCache} from '../ProbeInfoJsonCache.js'
import type {QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

export class QueueArtifactCleanup {
	constructor(private readonly probeInfoJsonCache?: ProbeInfoJsonCache) {}

	// Resume temp dir + probe info-json in one call — the shape every
	// cancel/remove/clear path needs.
	async cleanup(item: QueueItem): Promise<void> {
		await this.cleanupResumeContext(item)
		await this.cleanupProbeInfoJson(item)
	}

	async cleanupProbeInfoJson(item: QueueItem): Promise<void> {
		if (!item.probeInfoJsonRef) return
		try {
			await this.probeInfoJsonCache?.delete(item.probeInfoJsonRef)
		} catch (err) {
			logger.warn('probe info-json cleanup failed', {itemId: item.id, error: err instanceof Error ? err.message : String(err)})
		}
	}

	private async cleanupResumeContext(item: QueueItem): Promise<void> {
		try {
			await QueueResumeLifecycle.cleanupResumeContext(item)
		} catch (err) {
			logger.warn('resume-context cleanup failed', {itemId: item.id, error: err instanceof Error ? err.message : String(err)})
		}
	}
}
