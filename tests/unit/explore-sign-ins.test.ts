// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))
// The suspect store in memory: electron-store needs a running app.
vi.mock('electron-store', () => ({
	default: class {
		private readonly data: Record<string, unknown>
		constructor(options: {defaults: Record<string, unknown>}) {
			this.data = {...options.defaults}
		}
		get(key: string): unknown {
			return this.data[key]
		}
		set(key: string, value: unknown): void {
			this.data[key] = value
		}
	}
}))

import {createExploreSignIns} from '@main/services/exploreSignIns.js'
import type {ExploreCookie} from '@shared/sites/types.js'

function sessionId(value: string): ExploreCookie {
	return {name: 'sessionid', value, domain: '.instagram.com', hostOnly: false, path: '/', secure: true, httpOnly: true, session: true}
}

// An Explore session whose cookies the test changes, telling listeners as Electron does.
function fakeSession(initial: ExploreCookie[]) {
	let cookies = initial
	const listeners: Array<() => void> = []
	return {
		session: {readCookies: () => Promise.resolve(cookies), onCookiesChanged: (listener: () => void) => (listeners.push(listener), () => undefined)},
		setCookies: (next: ExploreCookie[]) => {
			cookies = next
			for (const listener of listeners) listener()
		}
	}
}

describe('createExploreSignIns: the parts wired together', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('starts a site signed in while its sign-in cookie is there', async () => {
		const {session} = fakeSession([sessionId('a')])
		const signIns = await createExploreSignIns({userDataPath: '/unused', session, settings: () => ({cookiesMode: 'explore', exploreEnabled: true})})

		expect(signIns.decideStart('https://www.instagram.com/reel/x/')).toMatchObject({auth: 'exploreSession'})
	})

	it('clears a not-working mark when the user signs in again, once the cookies settle', async () => {
		const {session, setCookies} = fakeSession([sessionId('a')])
		const signIns = await createExploreSignIns({userDataPath: '/unused', session, settings: () => ({cookiesMode: 'explore', exploreEnabled: true})})
		signIns.recordEvidence('instagram', 'accountWall')
		expect(signIns.decideStart('https://www.instagram.com/reel/x/')).toMatchObject({auth: 'anonymous', reason: 'signInSuspect'})

		setCookies([sessionId('b')])
		await vi.advanceTimersByTimeAsync(1000)

		expect(signIns.suspects.list()).toEqual([])
		expect(signIns.decideStart('https://www.instagram.com/reel/x/')).toMatchObject({auth: 'exploreSession'})
	})

	it('says when a start identity may have changed: a mark, a sign-out, a fresh sign-in', async () => {
		const {session, setCookies} = fakeSession([sessionId('a')])
		const signIns = await createExploreSignIns({userDataPath: '/unused', session, settings: () => ({cookiesMode: 'explore', exploreEnabled: true})})
		const changed = vi.fn()
		signIns.onStartChange(changed)

		signIns.recordEvidence('instagram', 'accountWall')
		expect(changed).toHaveBeenCalledTimes(1)

		setCookies([])
		await vi.advanceTimersByTimeAsync(1000)
		expect(signIns.decideStart('https://www.instagram.com/reel/x/')).toMatchObject({auth: 'anonymous'})
		expect(changed.mock.calls.length).toBeGreaterThanOrEqual(2)

		const beforeSignIn = changed.mock.calls.length
		setCookies([sessionId('b')])
		await vi.advanceTimersByTimeAsync(1000)
		expect(changed.mock.calls.length).toBeGreaterThan(beforeSignIn)
	})
})
