import type {QueueItemStatus} from '@shared/types.js'
import {createListSelectionState, listSelectionReducer, pruneSet, type ListSelectionAction, type ListSelectionState} from '../shared/listSelection.js'
import {loadQueueTablePreferences, sanitizeQueueTablePreferences, type QueueTablePreferences} from './queueTablePreferences.js'

export type QueueStatusFilter = 'all' | QueueItemStatus

export interface QueueManagerState {
	filter: QueueStatusFilter
	selection: ListSelectionState
	expandedIds: Set<string>
	tablePreferences: QueueTablePreferences
	viewportWidth: number
}

export type QueueManagerAction =
	| {type: 'set-filter'; filter: QueueStatusFilter}
	| {type: 'selection'; action: ListSelectionAction}
	| {type: 'set-expanded'; ids: Set<string>}
	| {type: 'toggle-expanded'; itemId: string}
	| {type: 'set-table-preferences'; preferences: QueueTablePreferences}
	| {type: 'set-viewport-width'; viewportWidth: number}
	| {type: 'prune-ids'; liveIds: ReadonlySet<string>}

export function currentViewportWidth(): number {
	return typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth
}

export function createQueueManagerState(): QueueManagerState {
	return {filter: 'all', selection: createListSelectionState(), expandedIds: new Set(), tablePreferences: loadQueueTablePreferences(), viewportWidth: currentViewportWidth()}
}

export function queueManagerReducer(state: QueueManagerState, action: QueueManagerAction): QueueManagerState {
	if (action.type === 'set-filter') return {...state, filter: action.filter}
	if (action.type === 'selection') {
		const selection = listSelectionReducer(state.selection, action.action)
		return selection === state.selection ? state : {...state, selection}
	}
	if (action.type === 'set-expanded') return {...state, expandedIds: new Set(action.ids)}
	if (action.type === 'toggle-expanded') {
		const expandedIds = new Set(state.expandedIds)
		if (expandedIds.has(action.itemId)) expandedIds.delete(action.itemId)
		else expandedIds.add(action.itemId)
		return {...state, expandedIds}
	}
	if (action.type === 'set-table-preferences') return {...state, tablePreferences: sanitizeQueueTablePreferences(action.preferences)}
	if (action.type === 'set-viewport-width') return {...state, viewportWidth: action.viewportWidth}
	if (action.type === 'prune-ids') return {...state, selection: listSelectionReducer(state.selection, {type: 'prune', liveIds: action.liveIds}), expandedIds: pruneSet(state.expandedIds, action.liveIds).ids}
	return state
}
