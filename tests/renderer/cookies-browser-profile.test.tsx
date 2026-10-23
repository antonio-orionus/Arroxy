// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {CookiesSettingsFields} from '@renderer/components/wizard/CookiesSettingsFields.js'
import {notify} from '@renderer/lib/notify.js'
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
		vi.mocked(api.dialog.chooseBrowserProfileFolder).mockResolvedValue(ok({path: FLOORP}))
		fireEvent.click(screen.getByTestId('profiles-settings-cookies-browser-profile-choose'))
		await waitFor(() => expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesBrowserProfile: FLOORP}}))
	})

	it('says so when the folder dialog fails', async () => {
		const folderSelectFailed = vi.spyOn(notify, 'folderSelectFailed').mockImplementation(() => undefined)
		mount({cookiesBrowser: 'firefox'})
		vi.mocked(api.dialog.chooseBrowserProfileFolder).mockResolvedValue({ok: false, error: {code: 'unknown', message: 'portal unavailable'}} as never)
		fireEvent.click(screen.getByTestId('profiles-settings-cookies-browser-profile-choose'))
		await waitFor(() => expect(folderSelectFailed).toHaveBeenCalled())
		expect(api.settings.update).not.toHaveBeenCalled()
		folderSelectFailed.mockRestore()
	})

	it('says so when the folder dialog throws', async () => {
		const folderSelectFailed = vi.spyOn(notify, 'folderSelectFailed').mockImplementation(() => undefined)
		mount({cookiesBrowser: 'firefox'})
		vi.mocked(api.dialog.chooseBrowserProfileFolder).mockRejectedValue(new Error('ipc gone'))
		fireEvent.click(screen.getByTestId('profiles-settings-cookies-browser-profile-choose'))
		await waitFor(() => expect(folderSelectFailed).toHaveBeenCalled())
		folderSelectFailed.mockRestore()
	})

	it('tells Linux users how to show hidden folders, which the dialog cannot do for them there', () => {
		mount({cookiesBrowser: 'firefox'})
		expect(screen.getByTestId('cookies-browser-profile-hidden-hint')).toBeTruthy()
	})

	it('leaves the hidden-folder hint out where the dialog shows hidden folders itself', () => {
		window.platform = 'win32'
		mount({cookiesBrowser: 'firefox'})
		expect(screen.queryByTestId('cookies-browser-profile-hidden-hint')).toBeNull()
	})

	it('drops the folder when another browser is picked, since it belongs to the old one', async () => {
		mount({cookiesBrowser: 'firefox', cookiesBrowserProfile: FLOORP})
		await useAppStore.getState().setCookiesBrowser('chromium')
		expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesBrowser: 'chromium', cookiesBrowserProfile: ''}})
	})

	it('keeps the folder when the same browser is picked again', async () => {
		mount({cookiesBrowser: 'firefox', cookiesBrowserProfile: FLOORP})
		await useAppStore.getState().setCookiesBrowser('firefox')
		expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesBrowser: 'firefox'}})
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
