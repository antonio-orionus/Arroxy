import {act, render, screen, fireEvent, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {installCanvasMocks} from '../shared/mockWebgl.js'
import {armQueue} from '../shared/quickDownloadHarness.js'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {BASE_STYLE} from '@renderer/styles/registry.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {ok} from '@shared/result.js'
import type {GraphicsPolicy} from '@shared/types.js'

const mockAppApi = buildMockAppApi()

const WEBGL_BLOCKED_GRAPHICS_POLICY: GraphicsPolicy = {backdrop: {webglBlocked: true, softwareWebglAllowed: false, fallbackReason: 'gpu-feature-disabled'}}

async function openProfileMenu(): Promise<void> {
	const profileMenuTrigger = await screen.findByRole('button', {name: 'Switch download profile: Balanced 720p'})
	fireEvent.click(profileMenuTrigger)
	expect(await screen.findByText('Switch profile')).toBeInTheDocument()
}

function expectProfileMenuClosed(): void {
	const profileMenu = screen.queryByTestId('profiles-profile-menu')
	if (profileMenu) {
		expect(profileMenu).toHaveAttribute('data-closed')
	} else {
		expect(profileMenu).not.toBeInTheDocument()
	}
}

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
			wizardMediaKind: 'video',
			wizardOutputDir: '',
			wizardError: null,
			wizardErrorOrigin: null,
			quickDownloadStatus: 'idle',
			quickDownloadFailure: null,
			quickDownloadQueueIds: [],
			queue: [],
			graphicsPolicy: null,
			uiStyle: DEFAULTS.uiStyle,
			backdropFailed: false
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

	it('does not mount a WebGL canvas before settings and graphics policy resolve', async () => {
		let resolveSettings!: (value: Awaited<ReturnType<typeof mockAppApi.settings.get>>) => void
		let resolveGraphicsPolicy!: (value: Awaited<ReturnType<typeof mockAppApi.app.getGraphicsPolicy>>) => void
		const api = buildMockAppApi()
		vi.mocked(api.settings.get).mockReturnValue(
			new Promise(resolve => {
				resolveSettings = resolve
			})
		)
		vi.mocked(api.app.getGraphicsPolicy).mockReturnValue(
			new Promise(resolve => {
				resolveGraphicsPolicy = resolve
			})
		)
		window.appApi = api

		render(<App />)

		expect(document.querySelector('canvas[data-backdrop-layer="webgl"]')).toBeNull()

		await act(async () => {
			resolveSettings(ok(defaultAppSettings('/tmp')))
		})
		expect(document.querySelector('canvas[data-backdrop-layer="webgl"]')).toBeNull()

		await act(async () => {
			resolveGraphicsPolicy(ok(WEBGL_BLOCKED_GRAPHICS_POLICY))
		})
	})

	it('paints the chosen style over its backdrop while the graphics policy allows WebGL', async () => {
		installCanvasMocks()

		render(<App />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(document.documentElement.dataset.style).toBe(DEFAULTS.uiStyle)
		expect(useAppStore.getState().backdropFailed).toBe(false)
		vi.restoreAllMocks()
	})

	it('paints the base style without a backdrop when the graphics policy blocks WebGL', async () => {
		const api = buildMockAppApi()
		vi.mocked(api.app.getGraphicsPolicy).mockResolvedValue(ok(WEBGL_BLOCKED_GRAPHICS_POLICY))
		window.appApi = api

		render(<App />)

		await waitFor(() => expect(document.documentElement.dataset.style).toBe(BASE_STYLE))
		expect(document.querySelector('canvas[data-backdrop-layer="webgl"]')).toBeNull()
		expect(useAppStore.getState().uiStyle).toBe(DEFAULTS.uiStyle)
	})

	it('paints the base style once the backdrop cannot draw, keeping the saved choice', async () => {
		render(<App />)

		await waitFor(() => expect(useAppStore.getState().backdropFailed).toBe(true))
		expect(document.documentElement.dataset.style).toBe(BASE_STYLE)
		expect(useAppStore.getState().uiStyle).toBe(DEFAULTS.uiStyle)
	})

	it('renders the backdrop isolation stage from the browser-mock query param', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')

		render(<App />)

		expect(await screen.findByTestId('backdrop-stage')).toBeInTheDocument()
		expect(screen.queryByTestId('title-bar')).not.toBeInTheDocument()
	})

	it('syncs backdrop isolation theme changes into the URL', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')

		render(<App />)

		fireEvent.click(await screen.findByRole('button', {name: 'Dark mode'}))
		let url = new URL(window.location.href)
		expect(url.searchParams.get('theme')).toBe('dark')
		expect(url.searchParams.get('backdrop')).toBe('1')

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

	it('renders quick download and prepares a link in the background, with no modal', async () => {
		// Intake runs in main: its own IntakeService, on a queue projected into the store.
		const api = buildMockAppApi()
		armQueue(api)
		window.appApi = api
		let resolveProbe!: (value: Awaited<ReturnType<typeof api.downloads.probe>>) => void
		vi.mocked(api.downloads.probe).mockReturnValue(
			new Promise(resolve => {
				resolveProbe = resolve
			})
		)
		render(<App />)

		const quick = await screen.findByTestId('profiles-quick-download')
		const fetch = screen.getByTestId('profiles-interactive-download')
		expect(quick.textContent).toMatch(/Quick download/i)
		expect(quick).toHaveTextContent('Will download using: Balanced 720p')
		expect(screen.getByTestId('profiles-quick-preview')).toHaveAttribute('data-linked-control', 'quick-profile')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('Balanced 720p')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('Active profile')
		expect(screen.getByTestId('profiles-active-profile-card')).toHaveTextContent('720p · best audio')
		expect(screen.getByTestId('profiles-profile-destination')).toHaveTextContent('Using global destination + profile subfolder')
		expect(screen.getByTestId('profiles-profile-destination')).toHaveTextContent('/tmp/Balanced 720p')
		expect(screen.getByRole('button', {name: 'Edit active profile'})).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Change global destination'})).toBeInTheDocument()
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

		// The link becomes a probing row in Downloads at once; the field clears
		// for the next link, and nothing blocks the window.
		await waitFor(() => expect(api.intake.add).toHaveBeenCalledTimes(1))
		await waitFor(() => expect(useAppStore.getState().queue).toMatchObject([{status: 'probing', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}]))
		await waitFor(() => expect(input).toHaveValue(''))
		expect(screen.queryByTestId('quick-download-progress-dialog')).not.toBeInTheDocument()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		fireEvent.change(input, {target: {value: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'}})
		expect(quick).toBeEnabled()
		expect(fetch).toBeEnabled()

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

		await waitFor(() => expect(api.queue.cmd.replaceProbing).toHaveBeenCalledTimes(1))
	})

	it('explains profile destination overrides on the active profile card', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		expect(balanced).toBeDefined()
		window.appApi = buildMockAppApi({settings: {profiles: {active: {kind: 'builtin', id: 'balanced'}, custom: [], overrides: [{...balanced!, output: {kind: 'fixed', dir: '/mnt/archive'}, subfolder: {enabled: true, name: 'Lectures'}}], enabledOverrides: {}}}})

		render(<App />)

		const destination = await screen.findByTestId('profiles-profile-destination')
		expect(destination).toHaveTextContent('Using profile override + profile subfolder')
		expect(destination).toHaveTextContent('/mnt/archive/Lectures')
	})

	// Bulk URLs still prepares its links in one modal run.
	it('shows and cancels a Bulk URLs preparation in the blocking progress dialog', async () => {
		vi.mocked(mockAppApi.downloads.probe).mockReturnValue(new Promise(() => undefined))
		render(<App />)
		await screen.findByTestId('profiles-main-input')

		act(() => {
			void useAppStore.getState().quickDownloadUrls(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=jNQXAC9IVRw'])
		})

		const progressDialog = await screen.findByTestId('quick-download-progress-dialog')
		expect(progressDialog).toHaveTextContent('Preparing Quick Download')
		expect(progressDialog).toHaveTextContent('Balanced 720p')
		expect(progressDialog).toHaveClass('overflow-hidden')
		expect(screen.getByTestId('quick-download-progress-body')).toHaveClass('min-w-0')
		expect(screen.getByTestId('quick-download-progress-current')).toHaveClass('max-w-full', 'min-w-0', 'overflow-hidden')
		// A dialog stays calm: the live status sits on an inset panel, not a lit glow tile.
		expect(screen.getByTestId('quick-download-progress-current')).toHaveAttribute('data-variant', 'inset')
		expect(screen.getByTestId('quick-download-progress-current')).not.toHaveClass('glow-tile')
		expect(screen.getByTestId('quick-download-progress-current-label')).toHaveClass('flex-1', 'min-w-0', 'truncate')
		expect(screen.getByTestId('quick-download-progress-count')).toHaveTextContent('0 / 2')

		act(() => {
			useAppStore.setState({playlistProbeProgress: {url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', playlistMode: 'playlist', phase: 'items', loaded: 48, total: 100, at: new Date().toISOString()}} as never)
		})
		expect(screen.getByTestId('quick-download-progress-current')).toHaveTextContent('Collecting videos')
		expect(screen.getByTestId('quick-download-progress-count')).toHaveTextContent('48 / 100')
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '48')

		fireEvent.click(screen.getByTestId('quick-download-progress-cancel'))

		await waitFor(() => {
			expect(screen.queryByTestId('quick-download-progress-dialog')).not.toBeInTheDocument()
		})
		expect(mockAppApi.downloads.probeCancel).toHaveBeenCalled()
	})

	it('closes the profile picker when opening the new profile editor', async () => {
		render(<App />)

		expect(screen.queryByTestId('profiles-editor-dialog')).not.toBeInTheDocument()
		await openProfileMenu()

		fireEvent.click(screen.getByRole('button', {name: 'New profile'}))

		await waitFor(() => {
			expectProfileMenuClosed()
		})
		expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()
	})

	it('closes the profile picker when opening profile management', async () => {
		render(<App />)

		await openProfileMenu()

		fireEvent.click(screen.getByRole('button', {name: 'Manage profiles'}))

		await waitFor(() => {
			expectProfileMenuClosed()
		})
		expect(await screen.findByTestId('profiles-manage-tab')).toBeInTheDocument()
	})

	it('shows Downloads as a top-level tab', async () => {
		render(<App />)
		fireEvent.click(await screen.findByRole('tab', {name: /^downloads/i}))
		expect(await screen.findByTestId('queue-manager-tab')).toBeInTheDocument()
	})

	it('shows the welcome-back greeting while warmup is still running', async () => {
		const pendingWarmupApi = buildMockAppApi({settings: {common: {defaultOutputDir: '/tmp', rememberLastOutputDir: false, clipboardWatchEnabled: false, hotkeyEnabled: false, launchCount: 4}}})
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
