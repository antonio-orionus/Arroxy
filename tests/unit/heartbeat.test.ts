// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {buildHeartbeatPageview, counterscaleSender, createHeartbeat, HEARTBEAT_OFF, HEARTBEAT_URL, heartbeatUrl, installAge, osLabel, type HeartbeatHistory, type HeartbeatSnapshot} from '@main/services/heartbeat.js'

const SNAPSHOT: HeartbeatSnapshot = {appVersion: '0.5.1', platform: 'darwin', arch: 'arm64', osVersion: '26.0.1', installChannel: 'homebrew', appLocale: 'uk', osLocale: 'en-US'}

describe('osLabel', () => {
	it('names the OS release without kernel or build noise, and without spaces', () => {
		expect(osLabel('darwin', '26.0.1')).toBe('macos-26')
		expect(osLabel('win32', '10.0.26200')).toBe('windows-11')
		expect(osLabel('win32', '10.0.19045')).toBe('windows-10')
		expect(osLabel('linux', '6.8.0-111-generic')).toBe('linux-6.8')
		expect(osLabel('freebsd', '14.1')).toBe('freebsd')
	})
})

describe('installAge', () => {
	it('buckets the days since the first heartbeat', () => {
		expect(installAge('2026-10-16', '2026-10-16')).toBe('new')
		expect(installAge('2026-10-15', '2026-10-16')).toBe('1-7d')
		expect(installAge('2026-10-09', '2026-10-16')).toBe('1-7d')
		expect(installAge('2026-10-08', '2026-10-16')).toBe('8-30d')
		expect(installAge('2026-09-16', '2026-10-16')).toBe('8-30d')
		expect(installAge('2026-09-15', '2026-10-16')).toBe('31-90d')
		expect(installAge('2026-07-18', '2026-10-16')).toBe('31-90d')
		expect(installAge('2026-07-17', '2026-10-16')).toBe('over-90d')
	})

	it('reports an install whose first day is unknown or unreadable as existing', () => {
		expect(installAge(undefined, '2026-10-16')).toBe('existing')
		expect(installAge('not-a-date', '2026-10-16')).toBe('existing')
		expect(installAge('2026-13-45', '2026-10-16')).toBe('existing')
		expect(installAge('2026-02-30', '2026-10-16')).toBe('existing')
	})

	// A clock set back must not report the install as new again.
	it('keeps a first day in the future out of the new bucket', () => {
		expect(installAge('2026-10-20', '2026-10-16')).toBe('1-7d')
	})
})

describe('buildHeartbeatPageview', () => {
	it('maps the snapshot onto Counterscale path, UTM and referrer fields with no identifier', () => {
		expect(buildHeartbeatPageview(SNAPSHOT, 'new')).toEqual({url: '/0.5.1', hostname: 'desktop.arroxy', referrer: 'new', utmSource: 'homebrew', utmMedium: 'darwin-arm64', utmCampaign: 'macos-26', utmTerm: 'uk', utmContent: 'en-US'})
	})
})

describe('createHeartbeat', () => {
	function makeHeartbeat(opts: {enabled?: boolean; history?: HeartbeatHistory; now?: Date} = {}) {
		let history = opts.history ?? {}
		let now = opts.now ?? new Date('2026-10-16T23:30:00Z')
		let enabled = opts.enabled ?? true
		const send = vi.fn(async () => undefined)
		const onSent = vi.fn()
		const heartbeat = createHeartbeat({
			send,
			now: () => now,
			isEnabled: () => enabled,
			snapshot: () => SNAPSHOT,
			history: () => history,
			record: next => {
				history = next
			},
			onSent
		})
		return {heartbeat, send, onSent, setNow: (next: Date) => (now = next), setEnabled: (next: boolean) => (enabled = next), history: () => history}
	}

	it('sends once per UTC day and records the day', async () => {
		const t = makeHeartbeat()
		expect(await t.heartbeat.maybeSend()).toBe(true)
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).toHaveBeenCalledTimes(1)
		expect(t.history().lastDay).toBe('2026-10-16')

		t.setNow(new Date('2026-10-17T00:05:00Z'))
		expect(await t.heartbeat.maybeSend()).toBe(true)
		expect(t.send).toHaveBeenCalledTimes(2)
		expect(t.history().lastDay).toBe('2026-10-17')
	})

	it('reports a first heartbeat as new and later ones by install age', async () => {
		const t = makeHeartbeat()
		await t.heartbeat.maybeSend()
		expect(t.send).toHaveBeenLastCalledWith(buildHeartbeatPageview(SNAPSHOT, 'new'))
		expect(t.history()).toEqual({firstDay: '2026-10-16', lastDay: '2026-10-16'})

		t.setNow(new Date('2026-10-26T12:00:00Z'))
		await t.heartbeat.maybeSend()
		expect(t.send).toHaveBeenLastCalledWith(buildHeartbeatPageview(SNAPSHOT, '8-30d'))
		expect(t.history()).toEqual({firstDay: '2026-10-16', lastDay: '2026-10-26'})
	})

	// Installs counted before the first day was recorded have an unknown age;
	// guessing one would make them look new.
	it('reports an install counted before first days were recorded as existing, and keeps its first day unknown', async () => {
		const t = makeHeartbeat({history: {lastDay: '2026-10-01'}})
		await t.heartbeat.maybeSend()
		expect(t.send).toHaveBeenLastCalledWith(buildHeartbeatPageview(SNAPSHOT, 'existing'))
		expect(t.history()).toEqual({firstDay: undefined, lastDay: '2026-10-16'})
	})

	// main.log is the only place a user can check that today's heartbeat went out.
	it('reports each sent heartbeat with its day and install age, and nothing for a skipped day', async () => {
		const t = makeHeartbeat()
		await t.heartbeat.maybeSend()
		expect(t.onSent).toHaveBeenCalledExactlyOnceWith({day: '2026-10-16', installAge: 'new'})

		await t.heartbeat.maybeSend()
		expect(t.onSent).toHaveBeenCalledTimes(1)
	})

	it('skips a day already sent in an earlier session', async () => {
		const t = makeHeartbeat({history: {firstDay: '2026-10-01', lastDay: '2026-10-16'}})
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).not.toHaveBeenCalled()
	})

	it('sends nothing and records nothing while disabled', async () => {
		const t = makeHeartbeat({enabled: false})
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).not.toHaveBeenCalled()
		expect(t.history()).toEqual({})

		t.setEnabled(true)
		expect(await t.heartbeat.maybeSend()).toBe(true)
	})

	it('does not double-send when ticks overlap', async () => {
		const t = makeHeartbeat()
		const [first, second] = await Promise.all([t.heartbeat.maybeSend(), t.heartbeat.maybeSend()])
		expect([first, second].filter(Boolean)).toHaveLength(1)
		expect(t.send).toHaveBeenCalledTimes(1)
	})
})

describe('createHeartbeat failure handling', () => {
	it('never rejects, warns once, and does not retry a failed day', async () => {
		const onError = vi.fn()
		const send = vi.fn(async () => undefined)
		const record = vi.fn(() => {
			throw new Error('EACCES: settings.json')
		})
		const heartbeat = createHeartbeat({send, now: () => new Date('2026-10-16T10:00:00Z'), isEnabled: () => true, snapshot: () => SNAPSHOT, history: () => ({}), record, onError})

		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		expect(record).toHaveBeenCalledTimes(1)
		expect(send).not.toHaveBeenCalled()
		expect(onError).toHaveBeenCalledTimes(1)
	})

	it('never rejects when building the snapshot or sending throws', async () => {
		const onError = vi.fn()
		const onSent = vi.fn()
		const heartbeat = createHeartbeat({
			send: async () => {
				throw new Error('boom')
			},
			now: () => new Date('2026-10-16T10:00:00Z'),
			isEnabled: () => true,
			snapshot: () => SNAPSHOT,
			history: () => ({}),
			record: () => undefined,
			onError,
			onSent
		})
		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		expect(onError).toHaveBeenCalledTimes(1)
		expect(onSent).not.toHaveBeenCalled()
	})
})

describe('heartbeatUrl', () => {
	it('uses the production collector only in release builds', () => {
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: undefined})).toBe(HEARTBEAT_URL)
		expect(heartbeatUrl({isPackaged: true, isDev: true, envUrl: undefined})).toBeUndefined()
	})

	// `bun run preview` and a hand-run `electron out/main/index.js` start no dev
	// server, so only the packaged flag tells them from a release build.
	it('reports nowhere from an unpackaged build, even outside the dev server', () => {
		expect(heartbeatUrl({isPackaged: false, isDev: false, envUrl: undefined})).toBeUndefined()
		expect(heartbeatUrl({isPackaged: false, isDev: false, envUrl: ''})).toBeUndefined()
	})

	it('lets an explicit collector override any build', () => {
		expect(heartbeatUrl({isPackaged: false, isDev: false, envUrl: 'http://127.0.0.1:3005/collect'})).toBe('http://127.0.0.1:3005/collect')
		expect(heartbeatUrl({isPackaged: true, isDev: true, envUrl: 'http://127.0.0.1:3005/collect'})).toBe('http://127.0.0.1:3005/collect')
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: 'http://127.0.0.1:3005/collect'})).toBe('http://127.0.0.1:3005/collect')
	})

	it('accepts plain HTTP only for a loopback collector', () => {
		expect(heartbeatUrl({isPackaged: true, isDev: true, envUrl: 'http://localhost:3005/collect'})).toBe('http://localhost:3005/collect')
		expect(heartbeatUrl({isPackaged: true, isDev: true, envUrl: 'http://[::1]:3005/collect'})).toBe('http://[::1]:3005/collect')
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: 'https://stats.example.test/collect'})).toBe('https://stats.example.test/collect')
	})

	it('sends nowhere when the override is plain HTTP to a remote host or not a URL', () => {
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: 'http://stats.example.test/collect'})).toBeUndefined()
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: 'ftp://stats.example.test/collect'})).toBeUndefined()
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: 'not a url'})).toBeUndefined()
	})

	it('sends nowhere when the override is off, even from a release build', () => {
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: HEARTBEAT_OFF})).toBeUndefined()
		expect(HEARTBEAT_OFF).toBe('off')
	})

	it('treats an empty override as unset', () => {
		expect(heartbeatUrl({isPackaged: true, isDev: false, envUrl: ''})).toBe(HEARTBEAT_URL)
		expect(heartbeatUrl({isPackaged: true, isDev: true, envUrl: ''})).toBeUndefined()
	})
})

describe('counterscaleSender', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('sends a Counterscale collect request that counts as a new visit', async () => {
		const fetchMock = vi.fn(async () => new Response(''))
		vi.stubGlobal('fetch', fetchMock)

		await counterscaleSender('https://stats.example.test/collect', 'arroxy')(buildHeartbeatPageview(SNAPSHOT, 'new'))

		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [requestUrl, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		const url = new URL(requestUrl)
		expect(url.origin + url.pathname).toBe('https://stats.example.test/collect')
		expect(Object.fromEntries(url.searchParams)).toEqual({sid: 'arroxy', h: 'https://desktop.arroxy', p: '/0.5.1', r: 'new', ht: '1', us: 'homebrew', um: 'darwin-arm64', uc: 'macos-26', ut: 'uk', uco: 'en-US'})
		expect(init.method).toBe('GET')
	})

	it('swallows network failures', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('fetch failed')
			})
		)
		await expect(counterscaleSender('https://stats.example.test/collect', 'arroxy')(buildHeartbeatPageview(SNAPSHOT, 'new'))).resolves.toBeUndefined()
	})
})
