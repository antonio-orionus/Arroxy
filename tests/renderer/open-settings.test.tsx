import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'

describe('openSettings', () => {
	beforeEach(() => {
		window.location.hash = ''
		useAppStore.setState({wizardStep: 'formats', wizardOrigin: 'explore', wizardError: null, advancedAutoOpen: false})
	})

	it('leaves an interactive wizard step for the Settings tab', () => {
		useAppStore.getState().openSettings()
		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('url')
		expect(state.wizardOrigin).toBe('download')
		expect(window.location.hash).toBe('#settings')
	})

	it('does not scroll to an advanced section the way the error shortcuts do', () => {
		useAppStore.getState().openSettings()
		expect(useAppStore.getState().advancedAutoOpen).toBe(false)
	})
})
