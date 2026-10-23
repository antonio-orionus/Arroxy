// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {SuspectSignIns, type SuspectSignInMark} from '@main/services/SuspectSignIns.js'

const MINUTE = 60_000

function setup(fingerprints: Record<string, string | null> = {instagram: 'h1', x: 'hx'}) {
	let now = 1_000_000
	let saved: SuspectSignInMark[] = []
	const store = {read: () => saved, write: (marks: SuspectSignInMark[]) => void (saved = marks)}
	const suspects = new SuspectSignIns({store, cookieFingerprint: site => fingerprints[site] ?? null, now: () => now})
	return {suspects, advance: (ms: number) => (now += ms), saved: () => saved, fingerprints, store}
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

	it('counts one item once, however often it worked only anonymously (its probe, then its download)', () => {
		const {suspects, advance} = setup()
		suspects.record('instagram', 'anonymousWorked', {item: 'reel/a', startedAt: 0})
		advance(MINUTE)
		suspects.record('instagram', 'anonymousWorked', {item: 'reel/a', startedAt: 0})
		expect(suspects.isSuspect('instagram')).toBe(false)
		suspects.record('instagram', 'anonymousWorked', {item: 'reel/b', startedAt: 0})
		expect(suspects.isSuspect('instagram')).toBe(true)
	})

	it('counts a share link and its canonical address as one item', () => {
		const {suspects} = setup()
		suspects.record('instagram', 'anonymousWorked', {item: 'https://www.instagram.com/reel/A1/?igsh=xyz', startedAt: 0})
		suspects.record('instagram', 'anonymousWorked', {item: 'https://www.instagram.com/reel/A1/', startedAt: 0})
		expect(suspects.isSuspect('instagram')).toBe(false)
	})

	it('drops evidence from a launch that started before the user signed in again', () => {
		const {suspects, advance, fingerprints} = setup()
		const before = 1_000_000
		advance(MINUTE)
		fingerprints.x = 'hx2'
		suspects.cookieChanged('x')
		advance(MINUTE)
		suspects.record('x', 'cookiesRejected', {item: 'status/1', startedAt: before})
		expect(suspects.isSuspect('x')).toBe(false)
	})

	it('forgets evidence gathered on a cookie the user replaced, mark or not', () => {
		const {suspects, fingerprints} = setup()
		suspects.record('x', 'signedInUnknown')
		suspects.record('x', 'signedInUnknown')
		fingerprints.x = 'hx2'
		suspects.cookieChanged('x')
		suspects.record('x', 'signedInUnknown')
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
		const {suspects, store, fingerprints} = setup()
		suspects.record('instagram', 'accountWall')
		expect(store.read()).toEqual([{site: 'instagram', cookieFingerprint: 'h1', since: new Date(1_000_000).toISOString(), evidence: 'accountWall'}])

		const restarted = new SuspectSignIns({store, cookieFingerprint: site => fingerprints[site] ?? null, now: () => 2_000_000})
		expect(restarted.isSuspect('instagram')).toBe(true)
	})

	it('clears the mark when the user signs in again, which changes the cookie', () => {
		const {suspects, fingerprints} = setup()
		const listener = vi.fn()
		suspects.onChange(listener)
		suspects.record('instagram', 'accountWall')
		fingerprints.instagram = 'h2'
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
