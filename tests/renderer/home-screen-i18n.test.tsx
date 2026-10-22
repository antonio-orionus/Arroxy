import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {I18nextProvider} from 'react-i18next'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {pseudoI18n, untranslatedWords} from '../shared/pseudoLocale.js'

// Every word the URL panel shows must come from the catalog (see pseudoLocale).

async function renderHome(): Promise<HTMLElement> {
	const i18n = await pseudoI18n()
	render(
		<I18nextProvider i18n={i18n}>
			<App />
		</I18nextProvider>
	)
	return screen.findByTestId('profiles-download-panel')
}

const USER_DATA = ['Balanced 720p', '/tmp/Balanced 720p', '/mnt/archive/Lectures']

describe('home screen copy', () => {
	beforeEach(() => {
		useAppStore.setState({initialized: false, initializing: false, splashDismissed: false, settings: null, language: 'en', wizardStep: 'url', wizardUrl: '', wizardOutputDir: '', queue: []})
		window.appApi = buildMockAppApi()
		window.platform = 'linux'
		window.history.replaceState(null, '', '/')
		vi.clearAllMocks()
	})

	it.each([
		['no link', ''],
		['a single video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
		['a playlist', 'https://www.youtube.com/playlist?list=PL590L5WQmH8fJ54F369BLDSqIwcs-TCfs'],
		['a video inside a playlist', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL590L5WQmH8fJ54F369BLDSqIwcs-TCfs'],
		['an unrecognised site', 'https://example.com/some/page']
	])('translates the URL panel for %s', async (_case, url) => {
		const panel = await renderHome()
		await screen.findByTestId('profiles-profile-destination')
		fireEvent.change(screen.getByTestId('profiles-main-input'), {target: {value: url}})

		expect(untranslatedWords(panel, USER_DATA)).toEqual([])
	})

	it('translates the summary and destination of a profile with its own folder', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		if (!balanced) throw new Error('expected the balanced profile')
		window.appApi = buildMockAppApi({settings: {profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: [{...balanced, output: {kind: 'fixed', dir: '/mnt/archive'}, subfolder: {enabled: true, name: 'Lectures'}}], enabledOverrides: {}}}})

		const panel = await renderHome()
		await waitFor(() => expect(screen.getByTestId('profiles-profile-destination')).toHaveTextContent('/mnt/archive/Lectures'))

		expect(untranslatedWords(panel, USER_DATA)).toEqual([])
	})
})
