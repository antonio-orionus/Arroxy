// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {MixedUrlPromptDialog} from '@renderer/components/wizard/MixedUrlPromptDialog.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {AppState} from '@renderer/store/types.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'
import type {SettingsPatch} from '@shared/api.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import type {Result} from '@shared/result.js'

type MixedUrlPromptSource = NonNullable<AppState['mixedUrlPromptSource']>

const MIXED_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'

let quickDownloadSpy: ReturnType<typeof vi.fn<AppState['quickDownload']>>
let mockApi: ReturnType<typeof buildMockAppApi>

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, clipboardWatchEnabled: false, cookiesMode: 'off', cookiesPath: '', ...common}}
}

function open(url: string, source: MixedUrlPromptSource): void {
	useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: url, mixedUrlPromptSource: source})
}

beforeEach(() => {
	mockApi = buildMockAppApi()
	mockApi.settings.update = vi.fn(async (input: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? buildSettings()
		return ok({common: {...current.common, ...(input.common ?? {})}, playlist: {...current.playlist, ...(input.playlist ?? {})}, profiles: {...current.profiles, ...(input.profiles ?? {})}})
	})
	window.appApi = mockApi
	quickDownloadSpy = vi.fn<AppState['quickDownload']>(async () => {})
	useAppStore.setState({initialized: true, settings: buildSettings(), quickDownload: quickDownloadSpy, mixedUrlPromptOpen: false, mixedUrlPending: null, mixedUrlPromptSource: null, cookiesConfigDialogIssue: null})
})

describe('the video-in-a-list dialog', () => {
	it.each([
		['list=PLx', 'Download from this playlist'],
		['list=OLAK5uy_x', 'Download from this album'],
		['list=UUx', "Download from this channel's uploads"],
		['list=WL', 'Download from Watch later'],
		['list=LL', 'Download from your liked videos']
	])('titles a %s link "%s"', (query, title) => {
		open(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&${query}`, 'url-tab')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent(title)
	})

	it('names the profile for a quick download and says "Choose formats yourself" for Interactive', () => {
		open(MIXED_URL, 'url-tab')
		const {unmount} = render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-prompt-subtitle')).toHaveTextContent('With Balanced 720p')
		expect(screen.getByTestId('mixed-playlist-choice')).toHaveTextContent('The playlist, first')
		unmount()

		open(MIXED_URL, 'wizard')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-prompt-subtitle')).toHaveTextContent('Choose formats yourself')
	})

	it('starts on Just this video, and Enter downloads only the video', async () => {
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)
		const single = screen.getByTestId('mixed-single-choice')
		expect(single).toHaveTextContent('Just this video')
		await waitFor(() => expect(single).toHaveFocus())

		// jsdom does not turn Enter on a focused button into a click; the browser does.
		fireEvent.click(document.activeElement ?? single)

		await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, entry: 'url-tab', playlistMode: 'video'})))
		expect(quickDownloadSpy.mock.calls[0]?.[0].take).toBeUndefined()
	})

	it('the list option downloads the first N, N being the load limit', async () => {
		useAppStore.setState({settings: buildSettings({playlistProbeLimit: 250})})
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-playlist-choice')).toHaveTextContent('Loads up to 250, then downloads them')

		fireEvent.click(screen.getByTestId('mixed-playlist-choice'))

		await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'first', count: 250}})))
	})

	it('uses the count the selector just saved', async () => {
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)

		fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'))
		fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-500'))
		await waitFor(() => expect(screen.getByTestId('mixed-playlist-choice')).not.toBeDisabled())
		await waitFor(() => expect(screen.getByTestId('mixed-playlist-probe-limit-trigger')).toHaveTextContent('500'))

		fireEvent.click(screen.getByTestId('mixed-playlist-choice'))

		await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith(expect.objectContaining({playlistMode: 'playlist', take: {kind: 'first', count: 500}})))
	})

	it('holds the list option while the selector saves', async () => {
		let release: () => void = () => {}
		mockApi.settings.update = vi.fn(
			(input: SettingsPatch) =>
				new Promise<Result<AppSettings>>(resolve => {
					release = () => {
						const current = useAppStore.getState().settings ?? buildSettings()
						resolve(ok({...current, common: {...current.common, ...(input.common ?? {})}}))
					}
				})
		)
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)

		fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'))
		fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-500'))

		await waitFor(() => expect(screen.getByTestId('mixed-playlist-choice')).toBeDisabled())
		release()
		await waitFor(() => expect(screen.getByTestId('mixed-playlist-choice')).not.toBeDisabled())
	})

	it('Interactive: the list option reads "Pick from the playlist, first" and opens the picker', async () => {
		open(MIXED_URL, 'wizard')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-single-choice')).toHaveTextContent('Opens its formats')
		expect(screen.getByTestId('mixed-playlist-choice')).toHaveTextContent('Pick from the playlist, first')
		expect(screen.getByTestId('mixed-playlist-choice')).toHaveTextContent('Loads up to 100 to choose from')

		fireEvent.click(screen.getByTestId('mixed-playlist-choice'))

		await waitFor(() => expect(mockApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, playlistMode: 'playlist'})))
		expect(quickDownloadSpy).not.toHaveBeenCalled()
	})

	it('Esc closes it and loads nothing', async () => {
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByText('Esc cancels. Nothing loads until you choose.')).toBeInTheDocument()
		await waitFor(() => expect(screen.getByTestId('mixed-single-choice')).toHaveFocus())

		fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'})

		await waitFor(() => expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false))
		expect(useAppStore.getState().mixedUrlPending).toBeNull()
		expect(quickDownloadSpy).not.toHaveBeenCalled()
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
	})

	it('renders with settings still loading', () => {
		useAppStore.setState({settings: null})
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)
		// No saved prefs: the default profile, Balanced 720p.
		expect(screen.getByTestId('mixed-prompt-subtitle')).toHaveTextContent('With Balanced 720p')
		expect(screen.getByTestId('mixed-playlist-probe-limit-trigger')).toHaveTextContent('100')
	})
})
