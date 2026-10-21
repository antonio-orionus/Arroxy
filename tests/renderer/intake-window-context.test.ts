// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {AppApi} from '@shared/api.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// The store reports the window's context to main through the watcher it
// installs at load (useAppStore), so these drive the real store.
let api: AppApi

beforeEach(() => {
	api = buildMockAppApi()
	api.intake.setWindowContext = vi.fn(() => Promise.resolve(ok(undefined)))
	window.appApi = api
	useAppStore.setState({initialized: false, settings: null, wizardOutputDir: ''})
})

describe('the window context main prepares hotkey links with', () => {
	it('stays silent while settings have not loaded', () => {
		useAppStore.setState({wizardOutputDir: '/early'})
		expect(api.intake.setWindowContext).not.toHaveBeenCalled()
	})

	// Settings, and with them the wizard folder, land before warmup ends; the
	// hotkey answers from then, so main must hear the folder from then too.
	it('reports the wizard folder once settings load, before warmup ends', () => {
		useAppStore.setState({settings: defaultAppSettings('/tmp'), wizardOutputDir: '/downloads'})
		expect(api.intake.setWindowContext).toHaveBeenLastCalledWith({currentOutputDir: '/downloads', displayShowsHdr: false})

		useAppStore.setState({wizardOutputDir: '/videos'})
		expect(useAppStore.getState().initialized).toBe(false)
		expect(api.intake.setWindowContext).toHaveBeenLastCalledWith({currentOutputDir: '/videos', displayShowsHdr: false})
	})
})
