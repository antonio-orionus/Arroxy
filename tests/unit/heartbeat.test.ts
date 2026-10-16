// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {buildHeartbeatPageview, counterscaleSender, createHeartbeat, HEARTBEAT_URL, heartbeatUrl, osLabel, type HeartbeatSnapshot} from '@main/services/heartbeat.js'

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

describe('buildHeartbeatPageview', () => {
	it('maps the snapshot onto Counterscale path and UTM fields with no identifier', () => {
		expect(buildHeartbeatPageview(SNAPSHOT)).toEqual({url: '/0.5.1', hostname: 'desktop.arroxy', utmSource: 'homebrew', utmMedium: 'darwin-arm64', utmCampaign: 'macos-26', utmTerm: 'uk', utmContent: 'en-US'})
	})
})

describe('createHeartbeat', () => {
	function makeHeartbeat(opts: {enabled?: boolean; lastDay?: string; now?: Date} = {}) {
		let lastDay = opts.lastDay
		let now = opts.now ?? new Date('2026-10-16T23:30:00Z')
		let enabled = opts.enabled ?? true
		const send = vi.fn(async () => undefined)
		const heartbeat = createHeartbeat({
			send,
			now: () => now,
			isEnabled: () => enabled,
			snapshot: () => SNAPSHOT,
			lastDay: () => lastDay,
			recordDay: day => {
				lastDay = day
			}
		})
		return {heartbeat, send, setNow: (next: Date) => (now = next), setEnabled: (next: boolean) => (enabled = next), lastDay: () => lastDay}
	}

	it('sends once per UTC day and records the day', async () => {
		const t = makeHeartbeat()
		expect(await t.heartbeat.maybeSend()).toBe(true)
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).toHaveBeenCalledTimes(1)
		expect(t.send).toHaveBeenCalledWith(buildHeartbeatPageview(SNAPSHOT))
		expect(t.lastDay()).toBe('2026-10-16')

		t.setNow(new Date('2026-10-17T00:05:00Z'))
		expect(await t.heartbeat.maybeSend()).toBe(true)
		expect(t.send).toHaveBeenCalledTimes(2)
		expect(t.lastDay()).toBe('2026-10-17')
	})

	it('skips a day already sent in an earlier session', async () => {
		const t = makeHeartbeat({lastDay: '2026-10-16'})
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).not.toHaveBeenCalled()
	})

	it('sends nothing and records nothing while disabled', async () => {
		const t = makeHeartbeat({enabled: false})
		expect(await t.heartbeat.maybeSend()).toBe(false)
		expect(t.send).not.toHaveBeenCalled()
		expect(t.lastDay()).toBeUndefined()

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
		const recordDay = vi.fn(() => {
			throw new Error('EACCES: settings.json')
		})
		const heartbeat = createHeartbeat({send, now: () => new Date('2026-10-16T10:00:00Z'), isEnabled: () => true, snapshot: () => SNAPSHOT, lastDay: () => undefined, recordDay, onError})

		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		expect(recordDay).toHaveBeenCalledTimes(1)
		expect(send).not.toHaveBeenCalled()
		expect(onError).toHaveBeenCalledTimes(1)
	})

	it('never rejects when building the snapshot or sending throws', async () => {
		const onError = vi.fn()
		const heartbeat = createHeartbeat({
			send: async () => {
				throw new Error('boom')
			},
			now: () => new Date('2026-10-16T10:00:00Z'),
			isEnabled: () => true,
			snapshot: () => SNAPSHOT,
			lastDay: () => undefined,
			recordDay: () => undefined,
			onError
		})
		await expect(heartbeat.maybeSend()).resolves.toBe(false)
		expect(onError).toHaveBeenCalledTimes(1)
	})
})

describe('heartbeatUrl', () => {
	it('uses the production collector only in release builds', () => {
		expect(heartbeatUrl({isDev: false, envUrl: undefined})).toBe(HEARTBEAT_URL)
		expect(heartbeatUrl({isDev: true, envUrl: undefined})).toBeUndefined()
	})

	it('lets an explicit collector override either mode', () => {
		expect(heartbeatUrl({isDev: true, envUrl: 'http://127.0.0.1:3005/collect'})).toBe('http://127.0.0.1:3005/collect')
		expect(heartbeatUrl({isDev: false, envUrl: 'http://127.0.0.1:3005/collect'})).toBe('http://127.0.0.1:3005/collect')
	})

	it('treats an empty override as unset', () => {
		expect(heartbeatUrl({isDev: false, envUrl: ''})).toBe(HEARTBEAT_URL)
		expect(heartbeatUrl({isDev: true, envUrl: ''})).toBeUndefined()
	})
})

describe('counterscaleSender', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('sends a Counterscale collect request that counts as a new visit', async () => {
		const fetchMock = vi.fn(async () => new Response(''))
		vi.stubGlobal('fetch', fetchMock)

		await counterscaleSender('https://stats.example.test/collect', 'arroxy')(buildHeartbeatPageview(SNAPSHOT))

		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [requestUrl, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		const url = new URL(requestUrl)
		expect(url.origin + url.pathname).toBe('https://stats.example.test/collect')
		expect(Object.fromEntries(url.searchParams)).toEqual({sid: 'arroxy', h: 'https://desktop.arroxy', p: '/0.5.1', ht: '1', us: 'homebrew', um: 'darwin-arm64', uc: 'macos-26', ut: 'uk', uco: 'en-US'})
		expect(init.method).toBe('GET')
	})

	it('swallows network failures', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('fetch failed')
			})
		)
		await expect(counterscaleSender('https://stats.example.test/collect', 'arroxy')(buildHeartbeatPageview(SNAPSHOT))).resolves.toBeUndefined()
	})
})
