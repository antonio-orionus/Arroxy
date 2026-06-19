import {QUEUE_TABLE_COLUMN_IDS, type QueueTableColumnId} from '@shared/schemas.js'

export type {QueueTableColumnId}

export interface QueueTableSortingRule {
	id: QueueTableColumnId
	desc: boolean
}

export interface QueueTablePreferences {
	version: 1
	sorting: QueueTableSortingRule[]
	columnOrder: QueueTableColumnId[]
	columnVisibility: Record<QueueTableColumnId, boolean>
}

const STORAGE_KEY = 'arroxy.queueTablePreferences.v1'
const COLUMN_ID_SET = new Set<string>(QUEUE_TABLE_COLUMN_IDS)
const LOCKED_VISIBLE_COLUMNS = new Set<QueueTableColumnId>(['title', 'status'])

export const DEFAULT_QUEUE_TABLE_PREFERENCES: QueueTablePreferences = {
	version: 1,
	sorting: [{id: 'addedAt', desc: true}],
	columnOrder: [...QUEUE_TABLE_COLUMN_IDS],
	columnVisibility: {title: true, status: true, progressPercent: true, formatLabel: true, outputDir: true, artifacts: true, addedAt: true, finishedAt: false}
}

function isColumnId(value: unknown): value is QueueTableColumnId {
	return typeof value === 'string' && COLUMN_ID_SET.has(value)
}

function sanitizeColumnOrder(value: unknown): QueueTableColumnId[] {
	const seen = new Set<QueueTableColumnId>()
	const ordered: QueueTableColumnId[] = []
	if (Array.isArray(value)) {
		for (const candidate of value) {
			if (!isColumnId(candidate) || seen.has(candidate)) continue
			seen.add(candidate)
			ordered.push(candidate)
		}
	}
	for (const columnId of QUEUE_TABLE_COLUMN_IDS) {
		if (!seen.has(columnId)) ordered.push(columnId)
	}
	return ordered
}

function sanitizeColumnVisibility(value: unknown): Record<QueueTableColumnId, boolean> {
	const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
	const next = {...DEFAULT_QUEUE_TABLE_PREFERENCES.columnVisibility}
	for (const columnId of QUEUE_TABLE_COLUMN_IDS) {
		if (typeof raw[columnId] === 'boolean') next[columnId] = raw[columnId]
		if (LOCKED_VISIBLE_COLUMNS.has(columnId)) next[columnId] = true
	}
	return next
}

function sanitizeSorting(value: unknown): QueueTableSortingRule[] {
	if (!Array.isArray(value)) return []
	return value.flatMap(candidate => {
		if (typeof candidate !== 'object' || candidate === null) return []
		const raw = candidate as Record<string, unknown>
		if (!isColumnId(raw.id)) return []
		return [{id: raw.id, desc: raw.desc === true}]
	})
}

export function sanitizeQueueTablePreferences(value: unknown): QueueTablePreferences {
	const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
	return {version: 1, sorting: sanitizeSorting(raw.sorting), columnOrder: sanitizeColumnOrder(raw.columnOrder), columnVisibility: sanitizeColumnVisibility(raw.columnVisibility)}
}

export function loadQueueTablePreferences(storage: Pick<Storage, 'getItem'> = window.localStorage): QueueTablePreferences {
	try {
		const raw = storage.getItem(STORAGE_KEY)
		return raw ? sanitizeQueueTablePreferences(JSON.parse(raw)) : DEFAULT_QUEUE_TABLE_PREFERENCES
	} catch {
		return DEFAULT_QUEUE_TABLE_PREFERENCES
	}
}

export function saveQueueTablePreferences(preferences: QueueTablePreferences, storage: Pick<Storage, 'setItem'> = window.localStorage): void {
	storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeQueueTablePreferences(preferences)))
}
