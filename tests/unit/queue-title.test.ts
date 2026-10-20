// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {withBackfilledTitle} from '@shared/queueTitle.js'
import {makeItem} from '../shared/fixtures.js'

describe('withBackfilledTitle', () => {
	it('sets the title and drops the placeholder flag so layers never fight', () => {
		const item = makeItem({id: 'placeholder', status: 'pending', title: 'Untitled · #1', titleIsPlaceholder: true})

		const next = withBackfilledTitle(item, 'Real Title')

		expect(next.title).toBe('Real Title')
		expect(next.titleIsPlaceholder).toBeUndefined()
		expect(next).toMatchObject({id: 'placeholder', status: 'pending', url: item.url})
	})
})
