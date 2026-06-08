import Store from 'electron-store'
import type {QueueItem} from '@shared/types.js'
import {queueArraySchema, QUEUE_STATUS} from '@shared/schemas.js'
import {fail, ok, type Result} from '@shared/result.js'

interface QueueData {
	items: QueueItem[]
	// Global "queue paused" flag — persists user intent across app restart.
	// Without this, a quit-with-pause would silently auto-resume on next boot
	// because the in-memory flag resets to false.
	schedulerPaused?: boolean
}

// Pre-validation migrators for upgrades across schema breaks. Each migrator
// is per-row so a single corrupted entry can be dropped without losing the
// rest of the queue.
//
// Beta-shape error: `{ key, rawMessage }` → new `{ kind, raw }`.
function migrateLegacyError(raw: Record<string, unknown>): Record<string, unknown> {
	const error = raw.error as {key?: unknown; rawMessage?: unknown; kind?: unknown; raw?: unknown} | null | undefined
	if (!error || typeof error !== 'object') return raw
	if ('kind' in error && typeof error.kind === 'string') return raw
	if ('key' in error || 'rawMessage' in error) {
		const kind = typeof error.key === 'string' ? error.key : 'unknown'
		const rawText = typeof error.rawMessage === 'string' ? error.rawMessage : ''
		return {...raw, error: {kind, raw: rawText}}
	}
	return raw
}

// Status enum migration:
//   downloading → pending (in-flight at last save, restart loses the process)
//   paused + downloadJobId → paused-held (we never persisted tempDir before;
//     mid-download .part files survive in outputDir and yt-dlp --continue
//     picks them up on the next start)
//   paused + !downloadJobId → paused-held
//   strip downloadJobId
function migrateLegacyStatus(raw: Record<string, unknown>): Record<string, unknown> {
	const status = raw.status
	const out = {...raw}
	if (status === 'downloading') {
		out.status = QUEUE_STATUS.pending
		out.progressPercent = 0
		out.progressDetail = null
	} else if (status === 'paused') {
		out.status = QUEUE_STATUS.pausedHeld
		out.progressPercent = 0
		out.progressDetail = null
	}
	// Strip the legacy downloadJobId field — replaced by lastJobId, but a
	// restored queue has no live jobs so we just drop it.
	if ('downloadJobId' in out) {
		delete out.downloadJobId
	}
	return out
}

function migrateRow(raw: unknown): unknown {
	if (typeof raw !== 'object' || raw === null) return raw
	let out = raw as Record<string, unknown>
	out = migrateLegacyError(out)
	out = migrateLegacyStatus(out)
	return out
}

export class QueueStore {
	private readonly store: Store<QueueData>

	constructor(userDataPath: string) {
		this.store = new Store<QueueData>({name: 'queue', cwd: userDataPath, defaults: {items: []}, clearInvalidConfig: true})
	}

	// QueueService is the queue-of-record; QueueStore is pure persistence
	// behind it. save() takes the in-memory snapshot and writes it to disk.
	// Cancelled items are stripped (not worth restoring); running items are
	// demoted to pending on save (the process didn't survive — restart it).
	async save(items: QueueItem[], schedulerPaused = false): Promise<void> {
		const toStore = items
			.filter(item => item.status !== QUEUE_STATUS.cancelled)
			.map((item): QueueItem => {
				const wasRunning = item.status === QUEUE_STATUS.running
				return {
					...item,
					status: wasRunning ? QUEUE_STATUS.pending : item.status,
					progressPercent: wasRunning ? 0 : item.progressPercent,
					progressDetail: wasRunning ? null : item.progressDetail,
					// Running jobs lose their lastJobId on restart; paused-active keeps it
					// so resume() can re-spawn under the same id when main still has it.
					lastJobId: wasRunning ? undefined : item.lastJobId
				}
			})

		const result = queueArraySchema.safeParse(toStore)
		if (!result.success) {
			throw new Error(`QueueStore.save: invalid queue payload — ${result.error.issues[0]?.message ?? 'schema mismatch'}`)
		}

		this.store.set('items', result.data)
		this.store.set('schedulerPaused', schedulerPaused)
	}

	async load(): Promise<Result<{items: QueueItem[]; schedulerPaused: boolean}>> {
		const raw = this.store.get('items')
		const migrated = Array.isArray(raw) ? raw.map(migrateRow) : raw
		const validated = queueArraySchema.safeParse(migrated)
		if (!validated.success) {
			const issue = validated.error.issues[0]?.message ?? 'schema mismatch'
			return fail({code: 'validation', message: `Queue file is corrupted: ${issue}`})
		}
		const schedulerPaused = this.store.get('schedulerPaused') === true
		return ok({items: validated.data, schedulerPaused})
	}
}
