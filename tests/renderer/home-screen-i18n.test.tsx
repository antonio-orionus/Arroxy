import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {createInstance, type i18n as I18nInstance} from 'i18next'
import {I18nextProvider, initReactI18next} from 'react-i18next'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Every word the URL panel shows must come from the catalog. A pseudo-locale
// that brackets each catalog string makes hardcoded English stand out: once the
// bracketed text, key caps and the user's own data (profile name, folder) are
// removed, no word may be left.

function bracketLeaves(node: unknown): unknown {
	if (typeof node === 'string') return `⟦${node}⟧`
	if (node === null || typeof node !== 'object' || Array.isArray(node)) return node
	return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, bracketLeaves(value)]))
}

async function pseudoI18n(): Promise<I18nInstance> {
	const instance = createInstance()
	await instance.use(initReactI18next).init({lng: 'en', fallbackLng: 'en', resources: {en: {translation: bracketLeaves(en) as Record<string, unknown>}}, interpolation: {escapeValue: false}, returnNull: false})
	return instance
}

function untranslatedWords(element: HTMLElement, userData: readonly string[]): string[] {
	const copy = element.cloneNode(true)
	if (!(copy instanceof HTMLElement)) throw new Error('expected an element')
	for (const keyCap of copy.querySelectorAll('kbd')) keyCap.remove()
	// Innermost first: a translated value interpolated into another nests its brackets.
	let text = copy.textContent ?? ''
	for (let previous = ''; previous !== text;) {
		previous = text
		text = text.replace(/⟦[^⟦⟧]*⟧/g, ' ')
	}
	// Longest first, so a folder is removed before the profile name inside it.
	for (const value of [...userData].sort((a, b) => b.length - a.length)) text = text.split(value).join(' ')
	return text.match(/[A-Za-z]{2,}/g) ?? []
}

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
		useAppStore.setState({initialized: false, initializing: false, splashDismissed: false, settings: null, language: 'en', wizardStep: 'url', wizardUrl: '', wizardOutputDir: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadQueueIds: [], queue: []})
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

	it.each(['preparing', 'queued'] as const)('translates the URL panel while Quick Download is %s', async status => {
		const panel = await renderHome()
		await screen.findByTestId('profiles-profile-destination')
		fireEvent.change(screen.getByTestId('profiles-main-input'), {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}})
		act(() => useAppStore.setState({quickDownloadStatus: status}))

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
