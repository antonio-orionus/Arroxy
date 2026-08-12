import {describe, expect, it} from 'vitest'
import {createListSelectionState, listSelectionReducer, rangeIds, type ListSelectionState} from '@renderer/components/shared/listSelection.js'

const ORDER = ['a', 'b', 'c', 'd', 'e']

function stateWith(ids: string[], anchorId: string | null = null, contextIds: string[] = []): ListSelectionState {
	return {selectedIds: new Set(ids), anchorId, contextIds}
}

describe('listSelection', () => {
	it('starts empty', () => {
		const state = createListSelectionState()
		expect(state.selectedIds.size).toBe(0)
		expect(state.anchorId).toBeNull()
	})

	it('replace keeps exactly one id and sets the anchor', () => {
		const next = listSelectionReducer(stateWith(['a', 'b']), {type: 'replace', id: 'd'})
		expect([...next.selectedIds]).toEqual(['d'])
		expect(next.anchorId).toBe('d')
	})

	it('toggle adds then removes, moving the anchor each time', () => {
		const added = listSelectionReducer(stateWith(['a']), {type: 'toggle', id: 'c'})
		expect([...added.selectedIds].sort()).toEqual(['a', 'c'])
		expect(added.anchorId).toBe('c')

		const removed = listSelectionReducer(added, {type: 'toggle', id: 'c'})
		expect([...removed.selectedIds]).toEqual(['a'])
	})

	it('set replaces the whole selection and can carry an anchor', () => {
		const next = listSelectionReducer(stateWith(['a']), {type: 'set', ids: ['b', 'c'], anchorId: 'b'})
		expect([...next.selectedIds].sort()).toEqual(['b', 'c'])
		expect(next.anchorId).toBe('b')
	})

	it('prune drops ids that are no longer live, including the anchor', () => {
		const next = listSelectionReducer(stateWith(['a', 'b'], 'b'), {type: 'prune', liveIds: new Set(['a'])})
		expect([...next.selectedIds]).toEqual(['a'])
		expect(next.anchorId).toBeNull()
	})

	it('prune returns the identical state object when nothing changed', () => {
		const before = stateWith(['a', 'b'], 'a')
		const after = listSelectionReducer(before, {type: 'prune', liveIds: new Set(['a', 'b'])})
		expect(after).toBe(before)
	})

	it('context replaces contextIds with a copy, leaving selection untouched', () => {
		const ids = ['b', 'c']
		const before = stateWith(['a'])
		const next = listSelectionReducer(before, {type: 'context', ids})

		expect(next.contextIds).toEqual(['b', 'c'])
		expect(next.contextIds).not.toBe(ids)

		ids.push('z')
		expect(next.contextIds).toEqual(['b', 'c'])
		expect([...next.selectedIds]).toEqual(['a'])
	})

	it('prune filters dead ids out of contextIds while keeping live ones', () => {
		const before = stateWith(['a', 'b'], 'a', ['a', 'b', 'zz'])
		const next = listSelectionReducer(before, {type: 'prune', liveIds: new Set(['a', 'b'])})

		expect(next).not.toBe(before)
		expect(next.contextIds).toEqual(['a', 'b'])
	})

	it('clear empties selection, anchor and context', () => {
		const next = listSelectionReducer({selectedIds: new Set(['a']), anchorId: 'a', contextIds: ['a']}, {type: 'clear'})
		expect(next.selectedIds.size).toBe(0)
		expect(next.anchorId).toBeNull()
		expect(next.contextIds).toEqual([])
	})

	it('rangeIds spans the ordered list in either direction', () => {
		expect(rangeIds(ORDER, 'b', 'd')).toEqual(['b', 'c', 'd'])
		expect(rangeIds(ORDER, 'd', 'b')).toEqual(['b', 'c', 'd'])
	})

	it('rangeIds falls back to the target when the anchor is gone', () => {
		expect(rangeIds(ORDER, 'zz', 'c')).toEqual(['c'])
	})
})
