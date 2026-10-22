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

	it('names the Mix and says it changes every time', () => {
		open('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 'explore')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent('Download from this Mix')
		expect(screen.getByTestId('mixed-prompt-mix-note')).toHaveTextContent('A Mix changes every time you open it.')
	})

	it('reads a YouTube Music playlist (RDCLAK) as a playlist, with no Mix note', () => {
		open('https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDCLAK5uy_x', 'url-tab')
		render(<MixedUrlPromptDialog />)
		expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent('Download from this playlist')
		expect(screen.queryByTestId('mixed-prompt-mix-note')).toBeNull()
	})

	describe('from the list button', () => {
		it('offers four answers, the video alone first, names only, what each does in its hint', () => {
			useAppStore.setState({settings: buildSettings({playlistProbeLimit: 250})})
			open(MIXED_URL, 'url-tab')
			render(<MixedUrlPromptDialog />)
			const video = screen.getByTestId('mixed-video-choice')
			expect(video).toHaveTextContent('Just this video')
			expect(video).toHaveAttribute('aria-description', "Only the video you opened, with Balanced 720p. The list isn't loaded.")
			const answers = screen.getAllByRole('button').filter(button => button.dataset.testid?.endsWith('-choice'))
			expect(answers.map(button => button.dataset.testid)).toEqual(['mixed-video-choice', 'mixed-list-choice', 'mixed-first-choice', 'mixed-pick-choice'])
			const list = screen.getByTestId('mixed-list-choice')
			const first = screen.getByTestId('mixed-first-choice')
			const pick = screen.getByTestId('mixed-pick-choice')
			expect(list).toHaveTextContent('Download in the background')
			expect(list).toHaveAttribute('aria-description', 'With Balanced 720p. If it has more than 250 videos, Downloads asks how many.')
			expect(first).toHaveTextContent('Download the first250')
			expect(screen.getByTestId('mixed-first-count')).toHaveTextContent('250')
			expect(first).toHaveAttribute('aria-description', 'Exactly the first 250, with Balanced 720p.')
			expect(pick).toHaveTextContent('Interactive download…')
			expect(pick).toHaveAttribute('aria-description', expect.stringContaining('Pick from the first 250 videos'))
			expect(screen.getByTestId('mixed-limit')).toHaveTextContent('Limit')
			expect(screen.getByText('Esc cancels.')).toBeInTheDocument()
		})

		it.each([
			['url-tab', MIXED_URL],
			['explore', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1']
		] as const)('Just this video from %s queues the video alone and loads no list', async (source, url) => {
			open(url, source)
			render(<MixedUrlPromptDialog />)

			fireEvent.click(screen.getByTestId('mixed-video-choice'))

			await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith({url, entry: source, playlistMode: 'video'}))
			expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
			expect(mockApi.downloads.probe).not.toHaveBeenCalled()
		})

		it('starts on Download in the background, and Enter queues the list with no count', async () => {
			open(MIXED_URL, 'url-tab')
			render(<MixedUrlPromptDialog />)
			const list = screen.getByTestId('mixed-list-choice')
			await waitFor(() => expect(list).toHaveFocus())

			// jsdom does not turn Enter on a focused button into a click; the browser does.
			fireEvent.click(document.activeElement ?? list)

			await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith({url: MIXED_URL, entry: 'url-tab', playlistMode: 'playlist'}))
		})

		it('Download the first N takes exactly N, N being the load limit', async () => {
			useAppStore.setState({settings: buildSettings({playlistProbeLimit: 250})})
			open(MIXED_URL, 'explore')
			render(<MixedUrlPromptDialog />)

			fireEvent.click(screen.getByTestId('mixed-first-choice'))

			await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith({url: MIXED_URL, entry: 'explore', playlistMode: 'playlist', take: {kind: 'first', count: 250}}))
		})

		it('Interactive download… opens the picker with the load limit', async () => {
			open(MIXED_URL, 'url-tab')
			render(<MixedUrlPromptDialog />)

			fireEvent.click(screen.getByTestId('mixed-pick-choice'))

			await waitFor(() => expect(mockApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, playlistMode: 'playlist', playlistScope: {items: {kind: 'app-limit'}}})))
			expect(quickDownloadSpy).not.toHaveBeenCalled()
		})

		it('uses the count the selector just saved', async () => {
			open(MIXED_URL, 'url-tab')
			render(<MixedUrlPromptDialog />)

			fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'))
			fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-500'))
			await waitFor(() => expect(screen.getByTestId('mixed-first-choice')).not.toHaveAttribute('aria-disabled', 'true'))
			await waitFor(() => expect(screen.getByTestId('mixed-first-count')).toHaveTextContent('500'))

			fireEvent.click(screen.getByTestId('mixed-first-choice'))

			await waitFor(() => expect(quickDownloadSpy).toHaveBeenCalledWith(expect.objectContaining({playlistMode: 'playlist', take: {kind: 'first', count: 500}})))
			expect(useAppStore.getState().settings?.common.playlistProbeLimit).toBe(500)
		})

		it('holds every answer while the selector saves', async () => {
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

			await waitFor(() => expect(screen.getByTestId('mixed-first-choice')).toHaveAttribute('aria-disabled', 'true'))
			fireEvent.click(screen.getByTestId('mixed-list-choice'))
			expect(quickDownloadSpy).not.toHaveBeenCalled()
			release()
			await waitFor(() => expect(screen.getByTestId('mixed-first-choice')).not.toHaveAttribute('aria-disabled', 'true'))
		})

		it('Esc closes it and loads nothing', async () => {
			open(MIXED_URL, 'url-tab')
			render(<MixedUrlPromptDialog />)
			await waitFor(() => expect(screen.getByTestId('mixed-list-choice')).toHaveFocus())

			// Focus opens the focused answer's hint (jsdom reads every focus as
			// keyboard focus); the first Esc dismisses the hint, the next the dialog.
			fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'})
			fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'})

			await waitFor(() => expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false))
			expect(useAppStore.getState().mixedUrlPending).toBeNull()
			expect(quickDownloadSpy).not.toHaveBeenCalled()
			expect(mockApi.downloads.probe).not.toHaveBeenCalled()
		})
	})

	describe('from Interactive', () => {
		it.each([
			['list=PLx', 'Pick from this playlist'],
			['list=RDx', 'Pick from this Mix'],
			['list=OLAK5uy_x', 'Pick from this album']
		])('titles a %s link "%s" and only confirms how many to load', (query, title) => {
			open(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&${query}`, 'wizard')
			render(<MixedUrlPromptDialog />)
			expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent(title)
			expect(screen.getByText(/Load the first/)).toHaveTextContent('Load the first')
			expect(screen.getByText('You can change it on the next step.')).toBeInTheDocument()
			expect(screen.getByTestId('mixed-playlist-probe-limit-trigger')).toHaveTextContent('100')
			expect(screen.queryByTestId('mixed-list-choice')).toBeNull()
			expect(screen.queryByTestId('mixed-first-choice')).toBeNull()
		})

		it('starts on Continue, which opens the picker with the load limit', async () => {
			open(MIXED_URL, 'wizard')
			render(<MixedUrlPromptDialog />)
			const next = screen.getByTestId('mixed-pick-continue')
			expect(next).toHaveTextContent('Continue')
			await waitFor(() => expect(next).toHaveFocus())

			fireEvent.click(next)

			await waitFor(() => expect(mockApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, playlistMode: 'playlist', playlistScope: {items: {kind: 'app-limit'}}})))
			expect(quickDownloadSpy).not.toHaveBeenCalled()
		})

		it('Just this video sets up the video alone, without its list', async () => {
			open(MIXED_URL, 'wizard')
			render(<MixedUrlPromptDialog />)
			const video = screen.getByTestId('mixed-video-choice')
			expect(video).toHaveTextContent('Just this video')
			expect(video).toHaveAttribute('aria-description', "Set up only the video you opened. The list isn't loaded.")

			fireEvent.click(video)

			await waitFor(() => expect(mockApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: MIXED_URL, playlistMode: 'video'})))
			expect(mockApi.downloads.probe).not.toHaveBeenCalledWith(expect.objectContaining({playlistScope: expect.anything()}))
			expect(quickDownloadSpy).not.toHaveBeenCalled()
		})

		it('Cancel loads nothing', async () => {
			open(MIXED_URL, 'wizard')
			render(<MixedUrlPromptDialog />)

			fireEvent.click(screen.getByTestId('mixed-pick-cancel'))

			await waitFor(() => expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false))
			expect(mockApi.downloads.probe).not.toHaveBeenCalled()
		})
	})

	it('keeps the kind-specific wording while the dialog closes', async () => {
		// jsdom runs no animations, so the content would unmount at once; hold it
		// mounted the way a running exit animation does.
		let finishExit: () => void = () => {}
		const exiting = new Promise<void>(resolve => {
			finishExit = resolve
		})
		const original = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations')
		Object.defineProperty(Element.prototype, 'getAnimations', {configurable: true, value: () => [{finished: exiting}]})
		try {
			open('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=OLAK5uy_x', 'url-tab')
			render(<MixedUrlPromptDialog />)
			expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent('Download from this album')
			await waitFor(() => expect(screen.getByTestId('mixed-list-choice')).toHaveFocus())

			// The first Esc dismisses the focused answer's hint, the next the dialog.
			fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'})
			fireEvent.keyDown(document.activeElement ?? document.body, {key: 'Escape'})

			expect(useAppStore.getState().mixedUrlPending).toBeNull()
			// The store has let go of the link; the content, still on screen while it
			// fades out, must not fall back to the generic playlist wording or form.
			expect(screen.getByTestId('mixed-prompt-title')).toHaveTextContent('Download from this album')
			expect(screen.getByTestId('mixed-list-choice')).toBeInTheDocument()
		} finally {
			finishExit()
			if (original) Object.defineProperty(Element.prototype, 'getAnimations', original)
			else Reflect.deleteProperty(Element.prototype, 'getAnimations')
		}
	})

	it('renders with settings still loading', () => {
		useAppStore.setState({settings: null})
		open(MIXED_URL, 'url-tab')
		render(<MixedUrlPromptDialog />)
		// No saved prefs: the default profile, Balanced 720p.
		expect(screen.getByTestId('mixed-list-choice')).toHaveAttribute('aria-description', expect.stringContaining('With Balanced 720p.'))
		expect(screen.getByTestId('mixed-playlist-probe-limit-trigger')).toHaveTextContent('100')
	})
})
