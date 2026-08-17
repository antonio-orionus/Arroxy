// Selection state for any ordered, virtualized list: which rows are selected,
// which row anchors a shift-range, and which rows a context menu is acting on.
//
// Pure and React-free so it can be exercised as a fast logic test. The list's
// order lives with the caller (a table's row model, a wizard's entry array);
// this module only ever receives it as an argument.

export interface ListSelectionState {
	selectedIds: Set<string>
	anchorId: string | null
	contextIds: string[]
}

export type ListSelectionAction = {type: 'replace'; id: string} | {type: 'toggle'; id: string} | {type: 'set'; ids: Iterable<string>; anchorId?: string | null} | {type: 'context'; ids: string[]} | {type: 'prune'; liveIds: ReadonlySet<string>} | {type: 'clear'}

export function createListSelectionState(): ListSelectionState {
	return {selectedIds: new Set(), anchorId: null, contextIds: []}
}

export function pruneSet(ids: Set<string>, liveIds: ReadonlySet<string>): {ids: Set<string>; changed: boolean} {
	let changed = false
	const next = new Set<string>()
	for (const id of ids) {
		if (liveIds.has(id)) next.add(id)
		else changed = true
	}
	return {ids: changed ? next : ids, changed}
}

export function listSelectionReducer(state: ListSelectionState, action: ListSelectionAction): ListSelectionState {
	if (action.type === 'replace') return {...state, selectedIds: new Set([action.id]), anchorId: action.id}
	if (action.type === 'toggle') {
		const selectedIds = new Set(state.selectedIds)
		if (selectedIds.has(action.id)) selectedIds.delete(action.id)
		else selectedIds.add(action.id)
		return {...state, selectedIds, anchorId: action.id}
	}
	if (action.type === 'set') return {...state, selectedIds: new Set(action.ids), anchorId: action.anchorId === undefined ? state.anchorId : action.anchorId}
	if (action.type === 'context') return {...state, contextIds: [...action.ids]}
	if (action.type === 'prune') {
		const selected = pruneSet(state.selectedIds, action.liveIds)
		const contextChanged = state.contextIds.some(id => !action.liveIds.has(id))
		const anchorDropped = state.anchorId !== null && !action.liveIds.has(state.anchorId)
		// Returning the same object when nothing changed keeps a `prune` on every
		// upstream render from invalidating memoized consumers.
		if (!selected.changed && !contextChanged && !anchorDropped) return state
		return {...state, selectedIds: selected.ids, anchorId: anchorDropped ? null : state.anchorId, contextIds: contextChanged ? state.contextIds.filter(id => action.liveIds.has(id)) : state.contextIds}
	}
	if (action.type === 'clear') return createListSelectionState()
	return state
}

export function rangeIds(orderedIds: readonly string[], anchorId: string, targetId: string): string[] {
	const anchorIndex = orderedIds.indexOf(anchorId)
	const targetIndex = orderedIds.indexOf(targetId)
	if (anchorIndex === -1 || targetIndex === -1) return [targetId]
	const start = Math.min(anchorIndex, targetIndex)
	const end = Math.max(anchorIndex, targetIndex)
	return orderedIds.slice(start, end + 1)
}
