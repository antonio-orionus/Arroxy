import {describe, expect, it} from 'vite-plus/test'
import {queueManagerReducer, type QueueManagerState} from '@renderer/components/queue/queueManagerState.js'
import {DEFAULT_QUEUE_TABLE_PREFERENCES} from '@renderer/components/queue/queueTablePreferences.js'

function selectedState(): QueueManagerState {
	return {filter: 'all', selection: {selectedIds: new Set(['a', 'b']), anchorId: 'b', contextIds: ['a', 'b']}, expandedIds: new Set(['a', 'b']), tablePreferences: DEFAULT_QUEUE_TABLE_PREFERENCES}
}

describe('queue manager selection cleanup', () => {
	it('preserves state identity when progress changes without removing items', () => {
		const state = selectedState()
		expect(queueManagerReducer(state, {type: 'prune-ids', liveIds: new Set(['a', 'b', 'c'])})).toBe(state)
	})

	it('drops removed items from selection, context actions, anchor, and expanded artifacts', () => {
		const state = selectedState()
		const next = queueManagerReducer(state, {type: 'prune-ids', liveIds: new Set(['a'])})
		expect([...next.selection.selectedIds]).toEqual(['a'])
		expect(next.selection.contextIds).toEqual(['a'])
		expect(next.selection.anchorId).toBeNull()
		expect([...next.expandedIds]).toEqual(['a'])
		expect(state.selection.selectedIds.has('b')).toBe(true)
		expect(state.expandedIds.has('b')).toBe(true)
	})

	it('removes a missing expanded item even when selection is unchanged', () => {
		const state = {...selectedState(), expandedIds: new Set(['a', 'missing'])}
		const next = queueManagerReducer(state, {type: 'prune-ids', liveIds: new Set(['a', 'b'])})
		expect(next.selection).toBe(state.selection)
		expect([...next.expandedIds]).toEqual(['a'])
	})
})
