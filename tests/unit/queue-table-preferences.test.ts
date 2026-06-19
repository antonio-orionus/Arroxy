import {describe, expect, it} from 'vitest'
import {DEFAULT_QUEUE_TABLE_PREFERENCES, sanitizeQueueTablePreferences} from '@renderer/components/queue/queueTablePreferences.js'

describe('queue table preferences', () => {
	it('defaults Added visible and Finished hidden', () => {
		expect(DEFAULT_QUEUE_TABLE_PREFERENCES.columnVisibility).toMatchObject({title: true, status: true, addedAt: true, finishedAt: false})
		expect(DEFAULT_QUEUE_TABLE_PREFERENCES.columnOrder).toEqual(['title', 'status', 'progressPercent', 'formatLabel', 'outputDir', 'artifacts', 'addedAt', 'finishedAt'])
		expect(DEFAULT_QUEUE_TABLE_PREFERENCES.sorting).toEqual([{id: 'addedAt', desc: true}])
	})

	it('drops unknown persisted columns and keeps locked columns visible', () => {
		expect(
			sanitizeQueueTablePreferences({
				version: 1,
				sorting: [
					{id: 'bogus', desc: true},
					{id: 'finishedAt', desc: true}
				],
				columnOrder: ['finishedAt', 'bogus', 'title'],
				columnVisibility: {title: false, status: false, formatLabel: false, bogus: true}
			})
		).toEqual({
			version: 1,
			sorting: [{id: 'finishedAt', desc: true}],
			columnOrder: ['finishedAt', 'title', 'status', 'progressPercent', 'formatLabel', 'outputDir', 'artifacts', 'addedAt'],
			columnVisibility: {title: true, status: true, progressPercent: true, formatLabel: false, outputDir: true, artifacts: true, addedAt: true, finishedAt: false}
		})
	})
})
