import {describe, expect, it} from 'vite-plus/test'
import {canApplyCopiedLink, resolveCopiedLink} from '@renderer/components/wizard/clipboardIntake.js'

const link = 'https://www.youtube.com/watch?v=one'
const idle = {downloadTabActive: true, bulkOpen: false, formatsLoading: false, quickPreparing: false}

describe('copied link intake', () => {
	it('fills an empty URL field', () => {
		expect(resolveCopiedLink(link, '')).toEqual({kind: 'fill', url: link})
		expect(resolveCopiedLink(link, '   ')).toEqual({kind: 'fill', url: link})
	})

	it('replaces whatever the URL field holds, keeping it for undo', () => {
		expect(resolveCopiedLink(link, 'https://example.com/old')).toEqual({kind: 'replace', url: link, previous: 'https://example.com/old'})
		expect(resolveCopiedLink(link, 'half-typed')).toEqual({kind: 'replace', url: link, previous: 'half-typed'})
	})

	it('does nothing when the field already holds the copied link', () => {
		expect(resolveCopiedLink(link, ` ${link} `)).toEqual({kind: 'none'})
	})

	it('applies only on the idle Download tab', () => {
		expect(canApplyCopiedLink(idle)).toBe(true)
		expect(canApplyCopiedLink({...idle, downloadTabActive: false})).toBe(false)
		expect(canApplyCopiedLink({...idle, bulkOpen: true})).toBe(false)
		expect(canApplyCopiedLink({...idle, formatsLoading: true})).toBe(false)
		expect(canApplyCopiedLink({...idle, quickPreparing: true})).toBe(false)
	})
})
