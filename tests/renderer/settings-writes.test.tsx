import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'
import {fail, ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Every settings write is optimistic: patch the store, send the IPC, and on
// failure restore the settings captured before the patch. That snapshot is
// only canonical while no other write is in flight, so these cover what
// happens when two of them overlap.

type MockApi = ReturnType<typeof buildMockAppApi>

let mockApi: MockApi

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

function mount(): void {
	mockApi = buildMockAppApi()
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	useAppStore.setState({initialized: true, initializing: false, settings: buildSettings(), warmupRunning: false, warmupCancellable: false})
}

describe('settings writes', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		useAppStore.setState({settings: null})
	})

	it('does not let a failed write roll back a sibling field another write persisted', async () => {
		// The rollback snapshot predates the sibling write, so a failure that
		// settles last restores it wholesale and discards a value main has already
		// committed — the renderer then disagrees with disk until initialize().
		mount()
		type UpdateResult = Awaited<ReturnType<MockApi['settings']['update']>>
		let failCookies: ((value: UpdateResult) => void) | undefined
		const persistedProxy = buildSettings({proxyUrl: 'http://proxy:8080'})
		mockApi.settings.update = vi
			.fn()
			.mockImplementationOnce(() => new Promise<UpdateResult>(resolve => (failCookies = resolve)))
			.mockImplementationOnce(() => Promise.resolve(ok(persistedProxy)))

		const writes = Promise.all([useAppStore.getState().setCookiesPath('/tmp/cookies.txt'), useAppStore.getState().setProxyUrl('http://proxy:8080')])
		await Promise.resolve()
		failCookies?.(fail({code: 'unknown', message: 'nope'}))
		await writes

		expect(useAppStore.getState().settings?.common.proxyUrl).toBe('http://proxy:8080')
		expect(useAppStore.getState().settings?.common.cookiesPath).toBe(buildSettings().common.cookiesPath)
	})

	it('sends overlapping settings writes one at a time', async () => {
		mount()
		let resolveFirst: ((value: Awaited<ReturnType<MockApi['settings']['update']>>) => void) | undefined
		const update = vi
			.fn()
			.mockImplementationOnce(() => new Promise(resolve => (resolveFirst = resolve)))
			.mockImplementationOnce(() => Promise.resolve(ok(buildSettings({proxyUrl: 'http://proxy:8080'}))))
		mockApi.settings.update = update

		const writes = Promise.all([useAppStore.getState().setCookiesPath('/tmp/cookies.txt'), useAppStore.getState().setProxyUrl('http://proxy:8080')])
		await Promise.resolve()
		expect(update).toHaveBeenCalledOnce()

		resolveFirst?.(ok(buildSettings({cookiesPath: '/tmp/cookies.txt'})))
		await writes

		expect(update).toHaveBeenCalledTimes(2)
	})

	it('restores canonical settings when the settings IPC call rejects', async () => {
		// main's handler turns thrown errors into a fail Result, so a rejection can
		// only come from the IPC transport — it must still roll the optimistic
		// patch back instead of escaping as an unhandled rejection.
		mount()
		mockApi.settings.update = vi.fn().mockRejectedValue(new Error('IPC channel closed'))
		mockApi.settings.get = vi.fn().mockResolvedValue(ok(buildSettings()))

		await expect(useAppStore.getState().setProxyUrl('http://proxy:8080')).resolves.toBeUndefined()

		expect(mockApi.settings.get).toHaveBeenCalledOnce()
		expect(useAppStore.getState().settings?.common.proxyUrl).toBe(buildSettings().common.proxyUrl)
	})

	it('keeps the stored language in step with the language the user picked', async () => {
		mount()
		mockApi.settings.update = vi.fn().mockResolvedValue(ok(buildSettings({language: 'de'})))

		useAppStore.getState().setLanguage('de')

		expect(useAppStore.getState().settings?.common.language).toBe('de')
		await vi.waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {language: 'de'}}))
	})

	it('queues a binary override behind an in-flight settings write', async () => {
		mount()
		type UpdateResult = Awaited<ReturnType<MockApi['settings']['update']>>
		let resolveFirst: ((value: UpdateResult) => void) | undefined
		const update = vi
			.fn()
			.mockImplementationOnce(() => new Promise<UpdateResult>(resolve => (resolveFirst = resolve)))
			.mockImplementationOnce(() => Promise.resolve(ok(buildSettings())))
		mockApi.settings.update = update

		const writes = Promise.all([useAppStore.getState().setProxyUrl('http://proxy:8080'), useAppStore.getState().setBinaryOverride('yt-dlp', '/opt/yt-dlp')])
		await Promise.resolve()
		expect(update).toHaveBeenCalledOnce()

		resolveFirst?.(ok(buildSettings({proxyUrl: 'http://proxy:8080'})))
		await writes

		expect(update).toHaveBeenCalledTimes(2)
		expect(mockApi.app.warmUp).toHaveBeenCalledWith({force: true})
	})

	it('runs warmup for the final override when override saves overlap', async () => {
		mount()
		type WarmUpResult = Awaited<ReturnType<MockApi['app']['warmUp']>>
		const warmUpResult = await mockApi.app.warmUp({force: true})
		let resolveFirstWarmup: ((value: WarmUpResult) => void) | undefined
		const warmUp = vi
			.fn()
			.mockImplementationOnce(() => new Promise<WarmUpResult>(resolve => (resolveFirstWarmup = resolve)))
			.mockResolvedValue(warmUpResult)
		mockApi.app.warmUp = warmUp
		mockApi.settings.update = vi
			.fn()
			.mockResolvedValueOnce(ok(buildSettings({binaryOverrides: {ytDlp: '/opt/yt-dlp-first'}})))
			.mockResolvedValueOnce(ok(buildSettings({binaryOverrides: {ytDlp: '/opt/yt-dlp-final'}})))

		const first = useAppStore.getState().setBinaryOverride('yt-dlp', '/opt/yt-dlp-first')
		await vi.waitFor(() => expect(warmUp).toHaveBeenCalledTimes(1))

		const second = useAppStore.getState().setBinaryOverride('yt-dlp', '/opt/yt-dlp-final')
		await vi.waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledTimes(2))
		expect(warmUp).toHaveBeenCalledTimes(1)

		resolveFirstWarmup?.(warmUpResult)
		await Promise.all([first, second])

		expect(warmUp).toHaveBeenCalledTimes(2)
	})

	it('verifies an override saved while an unrelated warmup is already running', async () => {
		// A manual repair (or startup, Homebrew, winget) holds warmupRunning, so
		// the override's own repair would hit the guard and never check the new
		// path. The running warmup must re-run a forced repair when it finishes.
		mount()
		type WarmUpResult = Awaited<ReturnType<MockApi['app']['warmUp']>>
		const warmUpResult = await mockApi.app.warmUp({force: true})
		let resolveRepair: ((value: WarmUpResult) => void) | undefined
		const warmUp = vi
			.fn()
			.mockImplementationOnce(() => new Promise<WarmUpResult>(resolve => (resolveRepair = resolve)))
			.mockResolvedValue(warmUpResult)
		mockApi.app.warmUp = warmUp

		const repair = useAppStore.getState().repairWarmup()
		expect(warmUp).toHaveBeenCalledTimes(1)
		await useAppStore.getState().setBinaryOverride('yt-dlp', '/opt/yt-dlp')
		expect(warmUp).toHaveBeenCalledTimes(1)

		resolveRepair?.(warmUpResult)
		await repair

		await vi.waitFor(() => expect(warmUp).toHaveBeenCalledTimes(2))
		await vi.waitFor(() => expect(useAppStore.getState().warmupRunning).toBe(false))
	})
})
