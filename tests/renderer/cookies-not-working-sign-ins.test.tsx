// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {CookiesSettingsFields} from '@renderer/components/wizard/CookiesSettingsFields.js'
import {exploreSignInSiteFor} from '@renderer/store/exploreSignInSite.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {knownSiteSignIn} from '@shared/sites/siteKeys.js'
import type {AppApi} from '@shared/api.js'
import type {CookiesMode} from '@shared/schemas.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'

let api: AppApi

function mount(notWorkingSignIns: string[], cookiesMode: CookiesMode = 'explore'): {openExploreSignIn: ReturnType<typeof vi.fn>} {
	const settings = buildAppSettings({cookiesMode})
	api = buildMockAppApi({settings})
	window.appApi = api
	const openExploreSignIn = vi.fn()
	useAppStore.setState({settings, notWorkingSignIns, openExploreSignIn})
	render(<CookiesSettingsFields />)
	return {openExploreSignIn}
}

describe('Settings: sign-ins that stopped working', () => {
	afterEach(() => {
		cleanup()
		useAppStore.setState({notWorkingSignIns: []})
	})

	it('shows one quiet row per marked site, saying downloads from it run signed out', () => {
		mount(['instagram', 'x'])

		const rows = screen.getAllByTestId(/^cookies-not-working-sign-in-/)
		expect(rows.map(row => row.dataset.testid)).toEqual(['cookies-not-working-sign-in-instagram', 'cookies-not-working-sign-in-x'])
		const instagram = screen.getByTestId('cookies-not-working-sign-in-instagram')
		expect(instagram.textContent).toContain('Instagram stopped working with your sign-in')
		expect(instagram.textContent).toContain('Downloads from Instagram now run signed out. Sign in to Instagram again in Explore, and Arroxy will use it.')
		// A status, not an alert: opening Settings must not interrupt a screen reader.
		expect(instagram.getAttribute('role')).toBe('status')
		expect(within(screen.getByTestId('cookies-not-working-sign-ins')).queryByRole('alert')).toBeNull()
	})

	it('hides the Open Explore link while a row links to Explore itself', () => {
		mount(['instagram'])
		expect(screen.queryByTestId('cookies-open-explore')).toBeNull()
	})

	it('opens Explore on the site sign-in page from the row', () => {
		const {openExploreSignIn} = mount(['instagram'])
		fireEvent.click(screen.getByTestId('cookies-sign-in-again-instagram'))
		expect(openExploreSignIn).toHaveBeenCalledWith(exploreSignInSiteFor(knownSiteSignIn('instagram')?.page))
	})

	it('asks main to use the sign-in again', () => {
		mount(['instagram'])
		fireEvent.click(within(screen.getByTestId('cookies-not-working-sign-in-instagram')).getByRole('button', {name: 'Use my sign-in again'}))
		expect(api.signIns.useAgain).toHaveBeenCalledWith('instagram')
	})

	it('shows Open Explore and no rows while every sign-in works', () => {
		mount([])
		expect(screen.getByTestId('cookies-open-explore')).toBeTruthy()
		expect(screen.queryByTestId('cookies-not-working-sign-ins')).toBeNull()
	})

	it('shows no rows outside Explore mode, where downloads never use the Explore sign-in', () => {
		mount(['instagram'], 'browser')
		expect(screen.queryByTestId('cookies-not-working-sign-ins')).toBeNull()
	})
})
