// Local UI state for the playlist-profiles table: which profile the row list
// is filtered to (a chip; purely a view over the same rows), and row
// selection. Mirrors queueManagerState.ts's split of filter + selection into
// one reducer so the step component only wires, never owns, this state.

import {createListSelectionState, listSelectionReducer, type ListSelectionAction, type ListSelectionState} from '../shared/listSelection.js'

// 'all', or a DownloadProfile id — arbitrary user-defined ids, so this can't
// be a narrower literal union.
export type PlaylistProfileFilter = string

export interface PlaylistProfileTableState {
	filter: PlaylistProfileFilter
	selection: ListSelectionState
}

export type PlaylistProfileTableAction = {type: 'set-filter'; filter: PlaylistProfileFilter} | {type: 'selection'; action: ListSelectionAction} | {type: 'prune-ids'; liveIds: ReadonlySet<string>}

export function createPlaylistProfileTableState(): PlaylistProfileTableState {
	return {filter: 'all', selection: createListSelectionState()}
}

export function playlistProfileTableReducer(state: PlaylistProfileTableState, action: PlaylistProfileTableAction): PlaylistProfileTableState {
	if (action.type === 'set-filter') return {...state, filter: action.filter}
	if (action.type === 'selection') {
		const selection = listSelectionReducer(state.selection, action.action)
		return selection === state.selection ? state : {...state, selection}
	}
	if (action.type === 'prune-ids') {
		const selection = listSelectionReducer(state.selection, {type: 'prune', liveIds: action.liveIds})
		return selection === state.selection ? state : {...state, selection}
	}
	return state
}
