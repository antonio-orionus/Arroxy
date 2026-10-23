// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {SignedInPacer as SignedInPacerClass, type SignedInPacer} from '@main/services/SignedInPacer.js'
import {testPacer} from '../helpers/testPacer.js'
import {LaunchGate} from '@main/services/LaunchGate.js'
import {RATE_LIMIT_BASE_MS, SiteRequestState} from '@main/services/SiteRequestState.js'

function deferred<T>(): {promise: Promise<T>; resolve: (value: T) => void} {
	let resolve!: (value: T) => void
	const promise = new Promise<T>(r => {
		resolve = r
	})
	return {promise, resolve}
}

async function settle(): Promise<void> {
	for (let i = 0; i < 10; i++) await Promise.resolve()
}

function waits(): unknown[] {
	return logger.info.mock.calls.filter(([message]) => message === 'Launch waits').map(([, fields]) => fields)
}

function setup(signedIn: SignedInPacer = testPacer()) {
	let now = 1_000_000
	const cooldowns = new SiteRequestState({now: () => now, random: () => 1})
	const gate = new LaunchGate({cooldowns, signedIn})
	return {gate, cooldowns, now: () => now, advance: (ms: number) => (now += ms)}
}

function admitted(gate: LaunchGate, site = 'youtube') {
	const admission = gate.admit(site)
	if (admission.kind !== 'go') throw new Error('expected the launch to go')
	return admission.launch
}

beforeEach(() => {
	logger.info.mockClear()
})

describe('LaunchGate: the site cooldown', () => {
	it('holds a launch to a cooling site and logs the wait as a cooldown', () => {
		const {gate, cooldowns, now} = setup()
		cooldowns.recordRateLimit('youtube', 'rateLimited')

		expect(gate.admit('youtube')).toEqual({kind: 'wait', until: now() + RATE_LIMIT_BASE_MS})
		expect(waits()).toEqual([{site: 'youtube', reason: 'cooldown', until: new Date(now() + RATE_LIMIT_BASE_MS).toISOString()}])
	})

	it('lets a launch that does not honor the cooldown go, without a wait', () => {
		const {gate, cooldowns} = setup()
		cooldowns.recordRateLimit('youtube', 'rateLimited')

		expect(gate.admit('youtube', {honorCooldown: false}).kind).toBe('go')
		expect(waits()).toEqual([])
	})

	it('holds an admitted launch whose site started cooling before its spawn, and logs it', () => {
		const {gate, cooldowns, now} = setup()
		const launch = admitted(gate)
		cooldowns.recordRateLimit('youtube', 'rateLimited')

		expect(launch.recheck('direct')).toBe(now() + RATE_LIMIT_BASE_MS)
		expect(waits()).toEqual([{site: 'youtube', reason: 'cooldown', until: new Date(now() + RATE_LIMIT_BASE_MS).toISOString()}])
	})

	it('starts the cooldown from what the launch printed, and ends it early after a clean "Try now"', () => {
		const {gate, cooldowns, now} = setup()
		const launch = admitted(gate)
		launch.observe('ERROR: [youtube] abc: HTTP Error 429: Too Many Requests')
		expect(gate.rateLimitedUntil('youtube')).toBe(now() + RATE_LIMIT_BASE_MS)

		gate.allowOnce('youtube')
		const passed = admitted(gate)
		passed.finish('', true)
		expect(cooldowns.rateLimitedUntil('youtube')).toBeNull()
	})

	it('keeps no cooldown when it has none', () => {
		const gate = new LaunchGate({})
		expect(gate.admit('youtube').kind).toBe('go')
		expect(gate.rateLimitedUntil('youtube')).toBeNull()
		expect(gate.snapshot()).toEqual([])
	})
})

describe('LaunchGate: signed-in launches', () => {
	it('runs a signed-in launch once a slot is free', async () => {
		const {gate} = setup()
		expect(await admitted(gate).runSignedIn({jobKey: 'job'}, () => Promise.resolve('ran'))).toEqual({kind: 'ran', value: 'ran'})
	})

	it('refuses a launch past its job budget', async () => {
		const {gate} = setup(testPacer({}, 1))
		await admitted(gate).runSignedIn({jobKey: 'job'}, () => Promise.resolve('first'))
		expect(await admitted(gate).runSignedIn({jobKey: 'job'}, () => Promise.resolve('second'))).toEqual({kind: 'capReached'})

		gate.resetJob('job')
		expect(await admitted(gate).runSignedIn({jobKey: 'job'}, () => Promise.resolve('third'))).toEqual({kind: 'ran', value: 'third'})
	})

	it('gives a launch with no job a budget of its own each time', async () => {
		const {gate} = setup(testPacer({}, 1))
		for (let i = 0; i < 3; i++) expect(await admitted(gate).runSignedIn({}, () => Promise.resolve(i))).toEqual({kind: 'ran', value: i})
	})

	it('logs a wait for a full signed-in limit, and gives up when the wait budget runs out', async () => {
		vi.useFakeTimers()
		try {
			const {gate} = setup(testPacer({atOnce: 1}))
			const holder = deferred<string>()
			const first = admitted(gate).runSignedIn({jobKey: 'a'}, () => holder.promise)
			await settle()
			const second = admitted(gate).runSignedIn({jobKey: 'b', waitBudgetMs: 1000}, () => Promise.resolve('late'))
			await settle()
			expect(waits()).toEqual([{site: 'youtube', reason: 'signedInLimit'}])

			await vi.advanceTimersByTimeAsync(1000)
			expect(await second).toEqual({kind: 'waitExpired'})
			holder.resolve('done')
			expect(await first).toEqual({kind: 'ran', value: 'done'})
		} finally {
			vi.useRealTimers()
		}
	})

	it('never holds a launch on one site behind a full other site', async () => {
		const {gate} = setup(testPacer({atOnce: 1}))
		const holder = deferred<string>()
		void admitted(gate).runSignedIn({jobKey: 'a'}, () => holder.promise)
		await settle()

		expect(await admitted(gate, 'instagram').runSignedIn({jobKey: 'b'}, () => Promise.resolve('ran'))).toEqual({kind: 'ran', value: 'ran'})
		expect(gate.signedInStartsAt('youtube')).toBe('full')
		expect(gate.signedInStartsAt('instagram')).toBeNull()
		holder.resolve('done')
	})

	it('lets an explicit launch skip the budget, and charges a listing against it', async () => {
		const {gate} = setup(testPacer({perWindow: 2, entriesPerLaunch: 10}))
		await admitted(gate, 'x').runSignedIn({jobKey: 'a'}, () => Promise.resolve('ran'))
		gate.chargeListing('x', 10)
		expect(gate.signedInStartsAt('x')).toEqual(expect.any(Number))
		expect(gate.signedInStartsAt('x', {explicit: true})).toBeNull()
	})

	it('logs the spacing between signed-in starts', async () => {
		let clock = 0
		const sleep = vi.fn((ms: number) => {
			clock += ms
			return Promise.resolve()
		})
		const {gate} = setup(new SignedInPacerClass({pacing: () => ({atOnce: 2, spacingMs: 5000, jitterMs: 0, windowMs: 60 * 60_000, perWindow: 1000, entriesPerLaunch: 50}), now: () => clock, sleep}))
		await admitted(gate).runSignedIn({jobKey: 'a'}, () => Promise.resolve('first'))
		await admitted(gate).runSignedIn({jobKey: 'b'}, () => Promise.resolve('second'))

		expect(waits()).toEqual([{site: 'youtube', reason: 'signedInSpacing', waitMs: 5000}])
	})

	it('reports a launch stopped while it waits as cancelled, not as a spent wait budget', async () => {
		const {gate} = setup(testPacer({atOnce: 1}))
		const holder = deferred<string>()
		void admitted(gate).runSignedIn({jobKey: 'a'}, () => holder.promise)
		await settle()
		const stop = new AbortController()
		const waiting = admitted(gate).runSignedIn({jobKey: 'b', stop: stop.signal, waitBudgetMs: 60_000}, () => Promise.resolve('never'))
		stop.abort()

		expect(await waiting).toEqual({kind: 'cancelled'})
		holder.resolve('done')
	})
})
