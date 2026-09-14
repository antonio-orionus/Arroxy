import {describe, expect, it} from 'vitest'
import {isProgressOnlyMutation} from '@main/services/download/queueMutation.js'

// Progress events arrive once per progress update for every active item. Their
// commit() debug line made up a third of a user's log (issue #222) while saying
// nothing the item's own status lines do not.
describe('isProgressOnlyMutation', () => {
	it('is true for a progress event', () => {
		expect(isProgressOnlyMutation({kind: 'event', itemId: 'a', evt: {kind: 'progress', percent: 42}})).toBe(true)
	})

	it('is false for every lifecycle event and structural mutation', () => {
		expect(isProgressOnlyMutation({kind: 'event', itemId: 'a', evt: {kind: 'started', lastJobId: 'job'}})).toBe(false)
		expect(isProgressOnlyMutation({kind: 'event', itemId: 'a', evt: {kind: 'cancelled'}})).toBe(false)
		expect(isProgressOnlyMutation({kind: 'add', items: []})).toBe(false)
		expect(isProgressOnlyMutation({kind: 'remove', itemId: 'a'})).toBe(false)
		expect(isProgressOnlyMutation({kind: 'patch', itemId: 'a', patcher: item => item, reason: 'title'})).toBe(false)
	})
})
