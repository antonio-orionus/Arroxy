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
	useAppStore.setState({initialized: true, initializing: false, settings: buildSettings()})
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
})
