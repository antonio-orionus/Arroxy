import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const mockAppApi = buildMockAppApi()

describe('App renderer', () => {
	beforeEach(() => {
		useAppStore.setState({
			initialized: false,
			splashDismissed: false,
			settings: null,
			wizardStep: 'url',
			formatsLoading: false,
			wizardUrl: '',
			wizardTitle: '',
			wizardThumbnail: '',
			wizardFormats: [],
			selectedVideoFormatId: '',
			audioSelection: {kind: 'none'},
			activePreset: null,
			wizardOutputDir: '',
			wizardError: null,
			wizardErrorOrigin: null,
			queue: []
		})

		window.appApi = mockAppApi
		window.platform = 'linux'

		vi.clearAllMocks()
	})

	it('renders the app heading and URL input', async () => {
		render(<App />)
		expect(await screen.findByTestId('title-bar')).toHaveTextContent('Arroxy')
		expect(await screen.findByTestId('profiles-main-input')).toBeInTheDocument()
	})

	it('submits URL probes through the preload API', async () => {
		render(<App />)

		const input = await screen.findByTestId('profiles-main-input')
		fireEvent.change(input, {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}})

		fireEvent.click(screen.getByTestId('profiles-interactive-download'))

		await waitFor(() => {
			expect(mockAppApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}))
		})
	})

	it('renders quick download and disables URL actions while preparing', async () => {
		let resolveProbe!: (value: Awaited<ReturnType<typeof mockAppApi.downloads.probe>>) => void
		vi.mocked(mockAppApi.downloads.probe).mockReturnValue(
			new Promise(resolve => {
				resolveProbe = resolve
			})
		)
		render(<App />)

		const quick = await screen.findByTestId('profiles-quick-download')
		const fetch = screen.getByTestId('profiles-interactive-download')
		expect(quick).toHaveTextContent(/Quick download/i)
		expect(screen.getByTestId('profiles-quick-preview')).toHaveTextContent('Active profile')
		expect(screen.getByRole('button', {name: 'Edit active profile: Balanced'})).toBeInTheDocument()
		const profileMenuTrigger = screen.getByRole('button', {name: 'Switch download profile'})
		expect(profileMenuTrigger).toBeInTheDocument()
		expect(quick).toBeDisabled()

		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-profile-menu')).toBeInTheDocument()

		const input = await screen.findByTestId('profiles-main-input')
		fireEvent.change(input, {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}})
		fireEvent.click(quick)

		await waitFor(() => {
			expect(quick).toBeDisabled()
			expect(fetch).toBeDisabled()
		})

		resolveProbe({
			ok: true,
			data: {
				kind: 'video',
				extractor: 'youtube',
				extractorKey: 'Youtube',
				webpageUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				isAudioOnlySource: false,
				formats: [{formatId: '22', label: '720p | mp4', ext: 'mp4', resolution: '720p', fps: 30, isVideoOnly: false, isAudioOnly: false}],
				title: 'Test Video',
				thumbnail: '',
				subtitles: {},
				automaticCaptions: {},
				isLive: false,
				hasDrm: false
			}
		})

		await waitFor(() => {
			expect(mockAppApi.queue.cmd.add).toHaveBeenCalledTimes(1)
		})
	})

	it('closes the profile picker when opening profile editor surfaces', async () => {
		render(<App />)

		const profileMenuTrigger = await screen.findByRole('button', {name: 'Switch download profile'})
		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'New profile'}))

		await waitFor(() => {
			expect(screen.queryByText('Switch profile')).not.toBeInTheDocument()
		})
		expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Manage profiles'}))

		await waitFor(() => {
			expect(screen.queryByText('Switch profile')).not.toBeInTheDocument()
		})
		expect(await screen.findByTestId('profiles-manage-tab')).toBeInTheDocument()
	})

	it('shows queue panel below wizard', async () => {
		render(<App />)
		expect(await screen.findByLabelText('Download Queue')).toBeInTheDocument()
		expect(await screen.findAllByText(/no downloads yet/i)).not.toHaveLength(0)
	})

	it('shows the welcome-back greeting while warmup is still running', async () => {
		const pendingWarmupApi = buildMockAppApi({settings: {common: {defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, launchCount: 4}}})
		vi.mocked(pendingWarmupApi.app.warmUp).mockReturnValue(new Promise(() => undefined))
		window.appApi = pendingWarmupApi

		render(<App />)

		expect(await screen.findByTestId('splash-greeting')).toHaveTextContent('Hey, welcome back!')
		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Arroxy is warming up')
		expect(useAppStore.getState().initialized).toBe(false)
	})
})
