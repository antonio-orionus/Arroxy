import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {defaultAppSettings} from '@shared/constants.js'

const mockAppApi = buildMockAppApi()

describe('App renderer', () => {
	beforeEach(() => {
		useAppStore.setState({
			initialized: false,
			initializing: false,
			splashDismissed: false,
			settings: null,
			language: 'en',
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
			quickDownloadStatus: 'idle',
			quickDownloadError: null,
			quickDownloadQueueIds: [],
			queue: []
		})

		window.appApi = mockAppApi
		window.platform = 'linux'
		window.history.replaceState(null, '', '/')

		vi.clearAllMocks()
	})

	it('renders the app heading and URL input', async () => {
		render(<App />)
		expect(await screen.findByTestId('title-bar')).toHaveTextContent('Arroxy')
		expect(await screen.findByText('Download from URL')).toBeInTheDocument()
		expect(await screen.findByTestId('profiles-main-input')).toBeInTheDocument()
	})

	it('renders the backdrop isolation stage from the browser-mock query param', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')

		render(<App />)

		expect(await screen.findByTestId('backdrop-stage')).toBeInTheDocument()
		expect(screen.queryByTestId('title-bar')).not.toBeInTheDocument()
	})

	it('switches backdrop isolation render paths and explains each mode', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')

		render(<App />)

		expect(await screen.findByTestId('backdrop-preview-controls')).toBeInTheDocument()
		expect(screen.getByTestId('backdrop-preview-gpu')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('backdrop-preview-description')).toHaveTextContent('WebGL shader preview: hardware when available, software allowed in this stage.')

		fireEvent.click(screen.getByTestId('backdrop-preview-canvas2d'))
		expect(new URL(window.location.href).searchParams.get('backdropForceFallback')).toBe('canvas2d')
		expect(screen.getByTestId('backdrop-preview-canvas2d')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('backdrop-preview-description')).toHaveTextContent('Canvas2D fallback: WebGL is bypassed, static canvas plus CSS drift.')

		fireEvent.click(screen.getByTestId('backdrop-preview-css'))
		expect(new URL(window.location.href).searchParams.get('backdropForceFallback')).toBe('css')
		expect(screen.getByTestId('backdrop-preview-css')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('backdrop-preview-description')).toHaveTextContent('CSS emergency: no canvas, body gradients only.')

		fireEvent.click(screen.getByTestId('backdrop-preview-gpu'))
		expect(new URL(window.location.href).searchParams.get('backdropForceFallback')).toBeNull()
		expect(screen.getByTestId('backdrop-preview-gpu')).toHaveAttribute('aria-pressed', 'true')
	})

	it('syncs backdrop isolation theme changes into the URL', async () => {
		window.history.replaceState(null, '', '/?backdrop=1&backdropForceFallback=canvas2d')

		render(<App />)

		fireEvent.click(await screen.findByRole('button', {name: 'Dark mode'}))
		let url = new URL(window.location.href)
		expect(url.searchParams.get('theme')).toBe('dark')
		expect(url.searchParams.get('backdrop')).toBe('1')
		expect(url.searchParams.get('backdropForceFallback')).toBe('canvas2d')

		fireEvent.click(screen.getByRole('button', {name: 'Light mode'}))
		url = new URL(window.location.href)
		expect(url.searchParams.get('theme')).toBe('light')

		fireEvent.click(screen.getByRole('button', {name: 'System default'}))
		url = new URL(window.location.href)
		expect(url.searchParams.get('theme')).toBe('system')
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
		expect(quick).toHaveTextContent('Will download using: Balanced 720p')
		expect(screen.getByTestId('profiles-quick-preview')).toHaveAttribute('data-linked-control', 'quick-profile')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('Balanced 720p')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('Active profile')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('720p · best audio')
		expect(screen.queryByRole('button', {name: 'Edit active profile: Balanced 720p'})).not.toBeInTheDocument()
		const profileMenuTrigger = screen.getByRole('button', {name: 'Switch download profile: Balanced 720p'})
		expect(profileMenuTrigger).toBeInTheDocument()
		expect(quick).toBeDisabled()

		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()
		const profileMenu = screen.getByTestId('profiles-profile-menu')
		expect(profileMenu).toBeInTheDocument()
		expect(profileMenu).toHaveClass('w-[min(50rem,calc(100vw-2rem))]')
		const profileGrid = screen.getByTestId('profiles-profile-menu-grid')
		expect(profileGrid).toHaveClass('grid')
		expect(profileGrid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))]')
		expect(screen.getByTestId('profiles-profile-option-balanced')).toHaveClass('min-h-12')
		const profileActions = screen.getByTestId('profiles-profile-menu-actions')
		expect(profileActions).toHaveClass('sm:grid-cols-3')
		expect(profileActions).toHaveTextContent('Edit active profile')
		expect(profileActions).toHaveTextContent('New profile')
		expect(profileActions).toHaveTextContent('Manage profiles')

		const input = await screen.findByTestId('profiles-main-input')
		fireEvent.change(input, {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}})
		fireEvent.click(quick)

		expect(await screen.findByTestId('quick-download-progress-dialog')).toHaveTextContent('Preparing Quick Download')
		expect(screen.getByTestId('quick-download-progress-dialog')).toHaveTextContent('Balanced 720p')
		expect(screen.getByTestId('quick-download-progress-count')).toHaveTextContent('0 / 1')

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
		await waitFor(() => {
			expect(screen.queryByTestId('quick-download-progress-dialog')).not.toBeInTheDocument()
		})
	})

	it('cancels quick download preparation from the blocking progress dialog', async () => {
		vi.mocked(mockAppApi.downloads.probe).mockReturnValue(new Promise(() => undefined))
		render(<App />)

		const input = await screen.findByTestId('profiles-main-input')
		fireEvent.change(input, {target: {value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}})
		fireEvent.click(screen.getByTestId('profiles-quick-download'))

		expect(await screen.findByTestId('quick-download-progress-dialog')).toBeInTheDocument()
		fireEvent.click(screen.getByTestId('quick-download-progress-cancel'))

		await waitFor(() => {
			expect(screen.queryByTestId('quick-download-progress-dialog')).not.toBeInTheDocument()
		})
		expect(mockAppApi.downloads.probeCancel).toHaveBeenCalled()
		expect(screen.getByTestId('profiles-main-input')).toHaveValue('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	})

	it('closes the profile picker when opening profile editor surfaces', async () => {
		render(<App />)

		const profileMenuTrigger = await screen.findByRole('button', {name: 'Switch download profile: Balanced 720p'})
		expect(screen.queryByTestId('profiles-editor-dialog')).not.toBeInTheDocument()
		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'New profile'}))

		await waitFor(() => {
			expect(screen.getByTestId('profiles-profile-menu')).toHaveAttribute('data-closed')
		})
		expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
		await waitFor(() => {
			expect(screen.queryByTestId('profiles-editor-dialog')).not.toBeInTheDocument()
		})
		fireEvent.click(profileMenuTrigger)
		expect(await screen.findByText('Switch profile')).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Manage profiles'}))

		await waitFor(() => {
			expect(screen.queryByTestId('profiles-profile-menu')).not.toBeInTheDocument()
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
		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Preparing downloads')
		expect(useAppStore.getState().initialized).toBe(false)
	})

	it('applies persisted document language and direction during initialization', async () => {
		const settings = defaultAppSettings('/tmp')
		const rtlApi = buildMockAppApi({settings: {...settings, common: {...settings.common, language: 'ar'}}})
		window.appApi = rtlApi
		document.documentElement.lang = 'en'
		document.documentElement.dir = 'ltr'

		await useAppStore.getState().initialize()

		expect(useAppStore.getState().language).toBe('ar')
		expect(document.documentElement.lang).toBe('ar')
		expect(document.documentElement.dir).toBe('rtl')
		expect(rtlApi.app.setLanguage).toHaveBeenCalledWith('ar')
	})
})
