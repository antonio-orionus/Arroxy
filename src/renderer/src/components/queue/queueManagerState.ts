import type {QueueItemStatus} from '@shared/types.js'
import {loadQueueTablePreferences, sanitizeQueueTablePreferences, type QueueTablePreferences} from './queueTablePreferences.js'

export type QueueStatusFilter = 'all' | QueueItemStatus

export interface QueueManagerState {
	filter: QueueStatusFilter
	selectedIds: Set<string>
	expandedIds: Set<string>
	contextIds: string[]
	tablePreferences: QueueTablePreferences
	viewportWidth: number
}

export type QueueManagerAction =
	| {type: 'set-filter'; filter: QueueStatusFilter}
	| {type: 'replace-selection'; itemId: string}
	| {type: 'toggle-selection'; itemId: string}
	| {type: 'set-selection'; ids: Iterable<string>}
	| {type: 'set-expanded'; ids: Set<string>}
	| {type: 'toggle-expanded'; itemId: string}
	| {type: 'set-context-ids'; ids: string[]}
	| {type: 'set-table-preferences'; preferences: QueueTablePreferences}
	| {type: 'set-viewport-width'; viewportWidth: number}
	| {type: 'prune-ids'; liveIds: ReadonlySet<string>}

export function currentViewportWidth(): number {
	return typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth
}

export function createQueueManagerState(): QueueManagerState {
	return {filter: 'all', selectedIds: new Set(), expandedIds: new Set(), contextIds: [], tablePreferences: loadQueueTablePreferences(), viewportWidth: currentViewportWidth()}
}

function pruneIds(ids: Set<string>, liveIds: ReadonlySet<string>): Set<string> {
	let changed = false
	const next = new Set<string>()
	for (const id of ids) {
		if (liveIds.has(id)) next.add(id)
		else changed = true
	}
	return changed ? next : ids
}

export function queueManagerReducer(state: QueueManagerState, action: QueueManagerAction): QueueManagerState {
	if (action.type === 'set-filter') return {...state, filter: action.filter}
	if (action.type === 'replace-selection') return {...state, selectedIds: new Set([action.itemId])}
	if (action.type === 'toggle-selection') {
		const selectedIds = new Set(state.selectedIds)
		if (selectedIds.has(action.itemId)) selectedIds.delete(action.itemId)
		else selectedIds.add(action.itemId)
		return {...state, selectedIds}
	}
	if (action.type === 'set-selection') return {...state, selectedIds: new Set(action.ids)}
	if (action.type === 'set-expanded') return {...state, expandedIds: new Set(action.ids)}
	if (action.type === 'toggle-expanded') {
		const expandedIds = new Set(state.expandedIds)
		if (expandedIds.has(action.itemId)) expandedIds.delete(action.itemId)
		else expandedIds.add(action.itemId)
		return {...state, expandedIds}
	}
	if (action.type === 'set-context-ids') return {...state, contextIds: [...action.ids]}
	if (action.type === 'set-table-preferences') return {...state, tablePreferences: sanitizeQueueTablePreferences(action.preferences)}
	if (action.type === 'set-viewport-width') return {...state, viewportWidth: action.viewportWidth}
	if (action.type === 'prune-ids') return {...state, selectedIds: pruneIds(state.selectedIds, action.liveIds), expandedIds: pruneIds(state.expandedIds, action.liveIds)}
	return state
}
