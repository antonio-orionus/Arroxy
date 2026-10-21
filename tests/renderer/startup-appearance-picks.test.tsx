import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {AppSettings} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// The native menu works over the startup splash, so a language, theme or style
// pick can land while initialize() is still waiting on its first reads. The
// settings it read before that pick must not overwrite it.

type MockApi = ReturnType<typeof buildMockAppApi>
type GraphicsPolicyResult = Awaited<ReturnType<MockApi['app']['getGraphicsPolicy']>>

function persisted(): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, language: 'de', uiTheme: 'light', uiStyle: 'aurora'}}
}

describe('initialize', () => {
	let api: MockApi
	let resolveGraphicsPolicy!: (value: GraphicsPolicyResult) => void

	beforeEach(() => {
		api = buildMockAppApi()
		vi.mocked(api.settings.get).mockResolvedValue(ok(persisted()))
		vi.mocked(api.app.getGraphicsPolicy).mockReturnValue(
			new Promise(resolve => {
				resolveGraphicsPolicy = resolve
			})
		)
		window.appApi = api
		useAppStore.setState({initialized: false, initializing: false, settings: null, language: 'en', uiTheme: 'system', uiStyle: 'aurora'})
	})

	it('keeps a language, theme and style picked while it waits on its first reads', async () => {
		const starting = useAppStore.getState().initialize()
		await Promise.resolve()

		useAppStore.getState().setLanguage('fr')
		useAppStore.getState().setUiTheme('dark')
		useAppStore.getState().setUiStyle('minimal')
		resolveGraphicsPolicy(ok({backdrop: {webglBlocked: false, softwareWebglAllowed: false}}))
		await starting

		const state = useAppStore.getState()
		expect([state.language, state.uiTheme, state.uiStyle]).toEqual(['fr', 'dark', 'minimal'])
		expect(state.settings?.common).toMatchObject({language: 'fr', uiTheme: 'dark', uiStyle: 'minimal'})
		expect(document.documentElement.lang).toBe('fr')
		expect(vi.mocked(api.app.setLanguage).mock.calls.at(-1)).toEqual(['fr'])
	})

	it('keeps a pick that matches the value the store started with', async () => {
		const starting = useAppStore.getState().initialize()
		await Promise.resolve()

		// Saved theme is light; the store starts at system, so this pick changes nothing until the reads land.
		useAppStore.getState().setUiTheme('system')
		useAppStore.getState().setLanguage('fr')
		useAppStore.getState().setLanguage('en')
		resolveGraphicsPolicy(ok({backdrop: {webglBlocked: false, softwareWebglAllowed: false}}))
		await starting

		const state = useAppStore.getState()
		expect([state.language, state.uiTheme]).toEqual(['en', 'system'])
		expect(state.settings?.common).toMatchObject({language: 'en', uiTheme: 'system'})
	})

	it('applies the saved language, theme and style when nothing was picked', async () => {
		const starting = useAppStore.getState().initialize()
		resolveGraphicsPolicy(ok({backdrop: {webglBlocked: false, softwareWebglAllowed: false}}))
		await starting

		const state = useAppStore.getState()
		expect([state.language, state.uiTheme, state.uiStyle]).toEqual(['de', 'light', 'aurora'])
	})
})
