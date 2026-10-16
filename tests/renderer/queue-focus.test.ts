// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// "View" on a toast is a store command, not a component callback: it must work
// from any tab, including after the component that raised the toast unmounted.

beforeEach(() => {
	window.appApi = buildMockAppApi()
	window.history.replaceState(null, '', '#download')
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), queue: [], queueFocus: null})
})

afterEach(() => {
	window.history.replaceState(null, '', '#download')
})

describe('showQueueItem', () => {
	it('opens the Downloads tab and records which row to show', () => {
		useAppStore.getState().showQueueItem('row-1')
		expect(window.location.hash).toBe('#queue')
		expect(useAppStore.getState().queueFocus).toMatchObject({itemId: 'row-1'})
	})

	it('makes a repeated View on the same row a new command', () => {
		useAppStore.getState().showQueueItem('row-1')
		const first = useAppStore.getState().queueFocus
		useAppStore.getState().showQueueItem('row-1')
		expect(useAppStore.getState().queueFocus?.seq).not.toBe(first?.seq)
	})

	// P2-R41: a View never throws away a wizard run in progress.
	it('does nothing while a wizard run is open', () => {
		useAppStore.setState({wizardStep: 'formats', wizardUrl: 'https://youtu.be/abc'})
		useAppStore.getState().showQueueItem('row-1')
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'formats', wizardUrl: 'https://youtu.be/abc', queueFocus: null})
		expect(window.location.hash).toBe('#download')
	})

	it('consumes only the command it was given', () => {
		useAppStore.getState().showQueueItem('row-1')
		const stale = useAppStore.getState().queueFocus?.seq ?? -1
		useAppStore.getState().showQueueItem('row-2')
		useAppStore.getState().clearQueueFocus(stale)
		expect(useAppStore.getState().queueFocus).toMatchObject({itemId: 'row-2'})
	})
})
