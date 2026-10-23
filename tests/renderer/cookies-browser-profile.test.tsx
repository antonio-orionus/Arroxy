// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {CookiesSettingsFields} from '@renderer/components/wizard/CookiesSettingsFields.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {AppApi} from '@shared/api.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'

const FLOORP = '/home/u/.var/app/one.ablaze.floorp/.floorp'

let api: AppApi

function mount(common: Record<string, unknown>): void {
	const settings = buildAppSettings({cookiesMode: 'browser', ...common})
	api = buildMockAppApi({settings})
	window.appApi = api
	useAppStore.setState({settings})
	render(<CookiesSettingsFields />)
}

describe('cookies browser profile folder', () => {
	const platform = window.platform

	beforeEach(() => {
		window.platform = 'linux'
	})

	afterEach(() => {
		cleanup()
		window.platform = platform
	})

	it('saves the folder picked for the browser', async () => {
		mount({cookiesBrowser: 'firefox'})
		vi.mocked(api.dialog.chooseFolder).mockResolvedValue(ok({path: FLOORP}))
		fireEvent.click(screen.getByTestId('profiles-settings-cookies-browser-profile-choose'))
		await waitFor(() => expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesBrowserProfile: FLOORP}}))
	})

	it('clears the saved folder', async () => {
		mount({cookiesBrowser: 'firefox', cookiesBrowserProfile: FLOORP})
		expect(screen.getByTestId<HTMLInputElement>('profiles-settings-cookies-browser-profile').value).toContain('.floorp')
		fireEvent.click(screen.getByTestId('profiles-settings-cookies-browser-profile-clear'))
		await waitFor(() => expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesBrowserProfile: ''}}))
	})

	it('offers no folder for Safari', () => {
		window.platform = 'darwin'
		mount({cookiesBrowser: 'safari'})
		expect(screen.queryByTestId('profiles-settings-cookies-browser-profile')).toBeNull()
	})
})
