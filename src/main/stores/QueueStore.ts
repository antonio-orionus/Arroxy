import Store from 'electron-store'
import log from 'electron-log/main.js'
import type {QueueItem} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {queueArraySchema, queueItemSchema} from '@shared/queueItemSchema.js'
import {fail, ok, type Result} from '@shared/result.js'
import {DEFAULT_FILENAME_TEMPLATE} from '@shared/filenameTemplate.js'
import {QueueResumeLifecycle} from '@main/services/download/QueueResumeLifecycle.js'

const logger = log.scope('queue')

interface QueueData {
	items: QueueItem[]
	// Global "queue paused" flag — persists user intent across app restart.
	// Without this, a quit-with-pause would silently auto-resume on next boot
	// because the in-memory flag resets to false.
	schedulerPaused?: boolean
}

// Pre-validation migrators for upgrades across schema breaks. Each migrator
// is per-row, like load()'s validation.
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

// Queue items persisted before filename templates carry a compiled yt-dlp
// output template under `job.outputTemplate`. `ranged-format` jobs *require* a
// template, so without this every legacy playlist item would be dropped on
// upgrade. Only two shapes were ever emitted, so map them back exactly;
// anything else falls through to the default rather than being trusted as
// Arroxy syntax.
const LEGACY_OUTPUT_TEMPLATES: Record<string, string> = {'%(title).200B [%(id)s].%(ext)s': '{title} [{id}]', '%(title).200B.%(ext)s': '{title}'}

function migrateLegacyOutputTemplate(row: Record<string, unknown>): Record<string, unknown> {
	const job = row.job
	if (typeof job !== 'object' || job === null) return row
	const jobRecord = job as Record<string, unknown>
	if (!('outputTemplate' in jobRecord)) return row

	const {outputTemplate, ...rest} = jobRecord
	if (typeof rest.filenameTemplate === 'string') return {...row, job: rest}
	const legacy = typeof outputTemplate === 'string' ? (LEGACY_OUTPUT_TEMPLATES[outputTemplate] ?? DEFAULT_FILENAME_TEMPLATE) : DEFAULT_FILENAME_TEMPLATE
	return {...row, job: {...rest, filenameTemplate: legacy}}
}

function migrateRow(raw: unknown): unknown {
	if (typeof raw !== 'object' || raw === null) return raw
	let out = raw as Record<string, unknown>
	out = migrateLegacyError(out)
	out = migrateLegacyStatus(out)
	out = migrateLegacyOutputTemplate(out)
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
		const toStore = items.flatMap((item): QueueItem[] => {
			const persisted = QueueResumeLifecycle.prepareItemForPersistence(item)
			return persisted ? [persisted] : []
		})

		const result = queueArraySchema.safeParse(toStore)
		if (!result.success) {
			throw new Error(`QueueStore.save: invalid queue payload — ${result.error.issues[0]?.message ?? 'schema mismatch'}`)
		}

		this.store.set('items', result.data)
		this.store.set('schedulerPaused', schedulerPaused)
		await Promise.resolve()
	}

	// Each row is migrated and validated on its own: a row this version cannot
	// read (a newer shape after a downgrade, a placeholder saved before rows
	// kept their probe mode, damage on disk) is dropped and counted, and the
	// rest of the queue loads. Only a payload that is not a list fails.
	async load(): Promise<Result<{items: QueueItem[]; schedulerPaused: boolean}>> {
		const raw: unknown = this.store.get('items')
		if (!Array.isArray(raw)) return fail({code: 'validation', message: 'Queue file is corrupted: the queue is not a list'})
		const items: QueueItem[] = []
		const issues: string[] = []
		for (const row of raw) {
			const validated = queueItemSchema.safeParse(migrateRow(row))
			if (validated.success) items.push(validated.data)
			else issues.push(validated.error.issues[0]?.message ?? 'schema mismatch')
		}
		if (issues.length > 0) logger.warn('Dropped queue rows that failed validation', {rejected: issues.length, kept: items.length, firstIssue: issues[0]})
		const schedulerPaused = this.store.get('schedulerPaused') === true
		await Promise.resolve()
		return ok({items, schedulerPaused})
	}
}
