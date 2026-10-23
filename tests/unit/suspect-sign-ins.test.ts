// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {SuspectSignIns, type SuspectSignInMark} from '@main/services/SuspectSignIns.js'

const MINUTE = 60_000

function setup(hashes: Record<string, string | null> = {instagram: 'h1', x: 'hx'}) {
	let now = 1_000_000
	let saved: SuspectSignInMark[] = []
	const store = {read: () => saved, write: (marks: SuspectSignInMark[]) => void (saved = marks)}
	const suspects = new SuspectSignIns({store, cookieHash: site => hashes[site] ?? null, now: () => now})
	return {suspects, advance: (ms: number) => (now += ms), saved: () => saved, hashes, store}
}

describe('SuspectSignIns: what marks a sign-in as not working', () => {
	it('marks a site after two items worked only anonymously within ten minutes', () => {
		const {suspects, advance} = setup()
		suspects.record('instagram', 'anonymousWorked')
		expect(suspects.isSuspect('instagram')).toBe(false)
		advance(9 * MINUTE)
		suspects.record('instagram', 'anonymousWorked')
		expect(suspects.isSuspect('instagram')).toBe(true)
		expect(suspects.isSuspect('x')).toBe(false)
	})

	it('needs both within ten minutes, with no signed-in success between them', () => {
		const {suspects, advance} = setup()
		suspects.record('x', 'anonymousWorked')
		advance(11 * MINUTE)
		suspects.record('x', 'anonymousWorked')
		expect(suspects.isSuspect('x')).toBe(false)

		suspects.record('x', 'signedInSucceeded')
		suspects.record('x', 'anonymousWorked')
		expect(suspects.isSuspect('x')).toBe(false)
	})

	it('marks a site after three unclassified signed-in failures within ten minutes', () => {
		const {suspects} = setup()
		suspects.record('x', 'signedInUnknown')
		suspects.record('x', 'signedInUnknown')
		expect(suspects.isSuspect('x')).toBe(false)
		suspects.record('x', 'signedInUnknown')
		expect(suspects.isSuspect('x')).toBe(true)
	})

	it('marks a site at once on an account wall or rejected cookies', () => {
		const {suspects} = setup()
		suspects.record('instagram', 'accountWall')
		suspects.record('x', 'cookiesRejected')
		expect(suspects.isSuspect('instagram')).toBe(true)
		expect(suspects.isSuspect('x')).toBe(true)
		expect(suspects.list()).toEqual(['instagram', 'x'])
	})

	it('never marks a site the session holds no sign-in cookie for', () => {
		const {suspects} = setup({instagram: null})
		suspects.record('instagram', 'accountWall')
		expect(suspects.isSuspect('instagram')).toBe(false)
	})
})

describe('SuspectSignIns: what clears the mark', () => {
	it('keeps the mark across restarts, saved as the cookie hash only', () => {
		const {suspects, store, hashes} = setup()
		suspects.record('instagram', 'accountWall')
		expect(store.read()).toEqual([{site: 'instagram', cookieHash: 'h1', since: new Date(1_000_000).toISOString(), evidence: 'accountWall'}])

		const restarted = new SuspectSignIns({store, cookieHash: site => hashes[site] ?? null, now: () => 2_000_000})
		expect(restarted.isSuspect('instagram')).toBe(true)
	})

	it('clears the mark when the user signs in again, which changes the cookie', () => {
		const {suspects, hashes} = setup()
		const listener = vi.fn()
		suspects.onChange(listener)
		suspects.record('instagram', 'accountWall')
		hashes.instagram = 'h2'
		suspects.cookieChanged('instagram')

		expect(suspects.isSuspect('instagram')).toBe(false)
		expect(suspects.list()).toEqual([])
		expect(listener).toHaveBeenLastCalledWith([])
	})

	it('clears the mark when the user says to use the sign-in again, and starts counting afresh', () => {
		const {suspects} = setup()
		suspects.record('x', 'signedInUnknown')
		suspects.record('x', 'signedInUnknown')
		suspects.record('x', 'signedInUnknown')
		suspects.useAgain('x')
		expect(suspects.isSuspect('x')).toBe(false)
		suspects.record('x', 'signedInUnknown')
		expect(suspects.isSuspect('x')).toBe(false)
	})
})
