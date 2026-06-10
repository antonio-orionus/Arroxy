import {describe, expect, it} from 'vitest'
import {buildClipboardCandidate, resolveClipboardIntake} from '@renderer/components/wizard/clipboardIntake.js'

const singleUrl = 'https://www.youtube.com/watch?v=one'
const bulkRaw = 'Grab https://example.com/one, https://example.com/two'

describe('clipboard intake decisions', () => {
	it('fills an empty URL field from one accepted URL', () => {
		const candidate = buildClipboardCandidate(singleUrl)

		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: false, quickPreparing: false, bulkOpen: false})).toMatchObject({kind: 'fill-single', url: singleUrl})
	})

	it('opens bulk input from multiple accepted URLs instead of filling the first one', () => {
		const candidate = buildClipboardCandidate(bulkRaw)

		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: false, quickPreparing: false, bulkOpen: false})).toMatchObject({kind: 'open-bulk', candidate: {raw: bulkRaw, count: 2, kind: 'bulk'}})
	})

	it('stores a candidate when the URL field already has input', () => {
		const candidate = buildClipboardCandidate(singleUrl)

		expect(resolveClipboardIntake({candidate, hasInput: true, formatsLoading: false, quickPreparing: false, bulkOpen: false})).toMatchObject({kind: 'store-pending', candidate})
	})

	it('stores a candidate while probing or quick download preparation blocks safe autofill', () => {
		const candidate = buildClipboardCandidate(singleUrl)

		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: true, quickPreparing: false, bulkOpen: false})).toMatchObject({kind: 'store-pending', candidate})
		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: false, quickPreparing: true, bulkOpen: false})).toMatchObject({kind: 'store-pending', candidate})
	})

	it('stores a candidate without overwriting an open bulk dialog', () => {
		const candidate = buildClipboardCandidate(bulkRaw)

		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: false, quickPreparing: false, bulkOpen: true})).toMatchObject({kind: 'store-pending', candidate})
	})

	it('ignores payloads with no accepted URL', () => {
		const candidate = buildClipboardCandidate('not a url')

		expect(candidate).toBeNull()
		expect(resolveClipboardIntake({candidate, hasInput: false, formatsLoading: false, quickPreparing: false, bulkOpen: false})).toEqual({kind: 'ignore'})
	})
})
