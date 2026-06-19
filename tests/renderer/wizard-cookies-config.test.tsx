// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {MixedUrlPromptDialog} from '@renderer/components/wizard/MixedUrlPromptDialog.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppApi, SettingsPatch} from '@shared/api.js'
import type {AppSettings, GraphicsPolicy} from '@shared/types.js'
import {ok} from '../shared/fixtures.js'

const SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

let mockApi: AppApi

const CSS_FORCED_GRAPHICS_POLICY: GraphicsPolicy = {backdrop: {forceRenderMode: 'css-only', softwareWebglAllowed: false, fallbackReason: 'gpu-feature-disabled'}}

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, rememberLastOutputDir: false, clipboardWatchEnabled: false, cookiesMode: 'off', cookiesPath: '', ...common}}
}

function resetStore(settings: AppSettings): void {
	useAppStore.setState({
		initialized: true,
		initializing: false,
		settings,
		wizardStep: 'url',
		wizardMode: 'single',
		formatsLoading: false,
		playlistProbeLoading: false,
		wizardUrl: '',
		wizardTitle: '',
		wizardThumbnail: '',
		wizardDuration: undefined,
		wizardFormats: [],
		wizardFormatsDegraded: null,
		wizardExtractor: '',
		wizardExtractorKey: '',
		wizardWebpageUrl: '',
		advancedAutoOpen: false,
		advancedAutoTarget: 'cookies',
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		lastConvertBitrate: 192,
		activePreset: null,
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
		wizardSubtitleSkipped: false,
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		wizardSponsorBlockMode: 'off',
		wizardSponsorBlockCategories: ['sponsor', 'selfpromo'],
		wizardEmbedChapters: true,
		wizardEmbedMetadata: true,
		wizardEmbedThumbnail: false,
		wizardWriteDescription: false,
		wizardWriteThumbnail: false,
		playlistItems: [],
		selectedPlaylistItemIds: [],
		playlistTitle: '',
		playlistId: '',
		playlistIsMultiVideo: false,
		cookiesConfigDialogIssue: null,
		playlistSelection: null,
		quickDownloadStatus: 'idle',
		quickDownloadFailure: null,
		quickDownloadQueueIds: [],
		quickDownloadProgressPhase: 'probing',
		quickDownloadProgressTotal: 0,
		quickDownloadProgressCompleted: 0,
		quickDownloadProgressFailed: 0,
		quickDownloadProgressCurrent: null,
		quickDownloadProgressTitle: null,
		quickDownloadProgressRunId: null,
		queue: [],
		graphicsPolicy: null
	})
}

beforeEach(() => {
	window.history.replaceState(null, '', '/')
	mockApi = buildMockAppApi()
	mockApi.settings.update = vi.fn(async (input: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? buildSettings()
		const next: AppSettings = {common: {...current.common, ...(input.common ?? {})}, single: {...current.single, ...(input.single ?? {})}, playlist: {...current.playlist, ...(input.playlist ?? {})}, profiles: {...current.profiles, ...(input.profiles ?? {})}}
		return ok(next)
	})
	window.appApi = mockApi
	window.platform = 'linux'
	resetStore(buildSettings())
})

function openSettingsTab(): void {
	fireEvent.click(screen.getByRole('tab', {name: 'Settings'}))
}

function enterUrlAndStartInteractiveDownload(): void {
	fireEvent.change(screen.getByTestId('profiles-main-input'), {target: {value: SINGLE_URL}})
	fireEvent.click(screen.getByTestId('profiles-interactive-download'))
}

describe('advanced network settings', () => {
	it('renders and saves the playlist probe limit control', async () => {
		render(<StepUrlInput />)
		openSettingsTab()

		expect(screen.getByTestId('network-pacing-section')).toBeInTheDocument()
		const playlistLimitSection = screen.getByTestId('playlist-probe-limit-section')
		expect(within(playlistLimitSection).getByTestId('profiles-settings-playlist-probe-limit-trigger')).toHaveTextContent('100 items')
		expect(within(playlistLimitSection).queryByTestId('profiles-settings-playlist-probe-limit-current')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('profiles-settings-playlist-probe-limit-trigger'))
		fireEvent.click(await screen.findByTestId('profiles-settings-playlist-probe-limit-option-250'))

		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {playlistProbeLimit: 250}})
		})
	})

	it('saves the single-filename id suffix switch', async () => {
		render(<StepUrlInput />)
		openSettingsTab()

		fireEvent.click(screen.getByTestId('single-filename-id-toggle'))

		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {includeIdInSingleFilenames: false}})
		})
	})

	it('saves the global native audio preference', async () => {
		render(<StepUrlInput />)
		openSettingsTab()

		expect(screen.getByTestId('native-audio-preference')).toHaveTextContent('Compatible stereo')
		expect(screen.getByTestId('native-audio-preference')).toHaveTextContent('Prefer surround / Dolby')
		fireEvent.click(screen.getByTestId('native-audio-preference-surround'))

		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {nativeAudioPreference: 'surround'}})
		})
	})

	it('saves the backdrop performance mode slider', async () => {
		render(<StepUrlInput />)
		openSettingsTab()

		expect(screen.getByTestId('profiles-settings-backdrop-mode')).toHaveTextContent('Best performance')
		expect(screen.getByTestId('profiles-settings-backdrop-mode')).toHaveTextContent('Most beautiful')
		expect(screen.getByTestId('profiles-settings-backdrop-mode')).not.toHaveTextContent('Balanced')
		const options = within(screen.getByTestId('profiles-settings-backdrop-mode')).getAllByRole('button')
		expect(options[0]).toHaveTextContent('Most beautiful')
		expect(options[1]).toHaveTextContent('Best performance')
		expect(options).toHaveLength(2)
		expect(screen.queryByTestId('profiles-settings-backdrop-mode-fallback')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('profiles-settings-backdrop-mode-css-only'))
		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {backdropRenderMode: 'css-only'}})
		})

		fireEvent.click(screen.getByTestId('profiles-settings-backdrop-mode-gpu'))
		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {backdropRenderMode: 'gpu'}})
		})
	})

	it('shows when runtime graphics policy forces the performance backdrop', async () => {
		resetStore(buildSettings({backdropRenderMode: 'gpu'}))
		useAppStore.setState({graphicsPolicy: CSS_FORCED_GRAPHICS_POLICY})

		render(<StepUrlInput />)
		openSettingsTab()

		expect(screen.getByTestId('profiles-settings-backdrop-mode-fallback')).toHaveTextContent('Hardware WebGL is unavailable on this device, so Arroxy is using the performance backdrop.')
	})

	it('does not show a runtime fallback notice when the user selected CSS-only', async () => {
		resetStore(buildSettings({backdropRenderMode: 'css-only'}))
		useAppStore.setState({graphicsPolicy: CSS_FORCED_GRAPHICS_POLICY})

		render(<StepUrlInput />)
		openSettingsTab()

		expect(screen.queryByTestId('profiles-settings-backdrop-mode-fallback')).not.toBeInTheDocument()
	})

	it('mixed URL dialog shows the current playlist cap and changes it inline', async () => {
		resetStore(buildSettings({playlistProbeLimit: 250}))
		useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL, mixedUrlPromptSource: 'wizard'})

		render(
			<TooltipProvider>
				<MixedUrlPromptDialog />
			</TooltipProvider>
		)

		expect(screen.getByTestId('mixed-playlist-cap')).toHaveTextContent('250')
		expect(screen.queryByTestId('mixed-open-advanced')).not.toBeInTheDocument()
		fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'))
		fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-500'))

		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {playlistProbeLimit: 500}})
		})
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(true)
		expect(useAppStore.getState().advancedAutoOpen).toBe(false)
	})

	it('mixed URL dialog uses Quick Download labels when opened from Quick Download', () => {
		resetStore(buildSettings({playlistProbeLimit: 100}))
		useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL, mixedUrlPromptSource: 'quick-download'})

		render(
			<TooltipProvider>
				<MixedUrlPromptDialog />
			</TooltipProvider>
		)

		expect(screen.getByText('Download only this video, or queue the whole playlist with your active Quick Download profile.')).toBeInTheDocument()
		expect(screen.getByTestId('mixed-single-choice')).toHaveTextContent('Download this video')
		expect(screen.getByTestId('mixed-playlist-choice')).toHaveTextContent('Download whole playlist')
		expect(screen.queryByRole('button', {name: 'Pick from playlist'})).not.toBeInTheDocument()
	})

	it('keeps the mixed URL dialog close button working after closing the custom limit dialog', async () => {
		resetStore(buildSettings({playlistProbeLimit: 250}))
		useAppStore.setState({mixedUrlPromptOpen: true, mixedUrlPending: SINGLE_URL})

		render(
			<TooltipProvider>
				<MixedUrlPromptDialog />
			</TooltipProvider>
		)

		fireEvent.click(screen.getByTestId('mixed-playlist-probe-limit-trigger'))
		fireEvent.click(await screen.findByTestId('mixed-playlist-probe-limit-option-custom'))

		const customDialog = await screen.findByTestId('mixed-playlist-probe-limit-custom-dialog')
		fireEvent.click(within(customDialog).getByRole('button', {name: 'Close'}))

		await waitFor(() => {
			expect(screen.queryByTestId('mixed-playlist-probe-limit-custom-dialog')).not.toBeInTheDocument()
		})

		fireEvent.click(screen.getByRole('button', {name: 'Close'}))

		await waitFor(() => {
			expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
			expect(useAppStore.getState().mixedUrlPending).toBeNull()
		})
	})
})

describe('incomplete cookies config guard', () => {
	it('opens cookies settings from a quick download bot-block failure', async () => {
		useAppStore.setState({wizardUrl: SINGLE_URL, quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}}})
		render(<StepUrlInput />)

		expect(screen.getByTestId('quick-download-feedback')).toHaveTextContent('Bot protection triggered.')
		expect(screen.getByTestId('bot-wall-notice')).toHaveTextContent('Probe was limited')
		expect(screen.getByTestId('bot-wall-notice')).toHaveTextContent('Set up cookies in advanced settings')
		expect(screen.getByTestId('cookies-error-alert')).toHaveAttribute('data-density', 'compact')
		expect(screen.getByTestId('cookies-error-alert')).toHaveTextContent('This site requires sign-in')
		expect(screen.getByTestId('quick-download-retry')).toBeInTheDocument()

		fireEvent.click(screen.getByTestId('quick-download-cookies-settings'))

		await waitFor(() => {
			expect(screen.getByTestId('profiles-settings-tab')).toBeInTheDocument()
		})
		expect(mockApi.downloads.probeCancel).toHaveBeenCalled()
		expect(screen.getByTestId('cookies-source')).toBeInTheDocument()
	})

	it('enables configured cookies and retries quick download from a bot-wall failure', async () => {
		resetStore(buildSettings({cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}))
		useAppStore.setState({wizardUrl: SINGLE_URL, wizardOutputDir: '/tmp', quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}}})
		render(<StepUrlInput />)

		expect(screen.getByTestId('bot-wall-notice')).toHaveTextContent('Cookies are configured but turned off')
		fireEvent.click(screen.getByTestId('quick-download-enable-cookies-retry'))

		await waitFor(() => {
			expect(mockApi.settings.update).toHaveBeenCalledWith({common: {cookiesMode: 'file'}})
		})
		await waitFor(() => {
			expect(mockApi.downloads.probe).toHaveBeenCalled()
		})
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('file')
	})

	it('shows compact configured-cookies guidance for quick download probe failures while cookies are enabled', async () => {
		resetStore(buildSettings({cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}))
		useAppStore.setState({wizardUrl: SINGLE_URL, quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'network', raw: 'network failed'}}}})
		render(<StepUrlInput />)

		const cookiesAlert = screen.getByTestId('cookies-error-alert')
		expect(cookiesAlert).toHaveAttribute('data-density', 'compact')
		expect(cookiesAlert).toHaveTextContent('Cookies might be the cause')
		expect(cookiesAlert).toHaveTextContent('Cookies source')
		expect(cookiesAlert).toHaveTextContent('File')
		expect(screen.getByTestId('quick-download-cookies-settings')).toBeInTheDocument()
	})

	it('shows compact DPAPI guidance and docs from quick download browser-cookie failures', async () => {
		resetStore(buildSettings({cookiesMode: 'browser', cookiesBrowser: 'chrome'}))
		useAppStore.setState({wizardUrl: SINGLE_URL, quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'unknown', raw: 'ERROR: Failed to decrypt with DPAPI'}}}})
		render(<StepUrlInput />)

		const cookiesAlert = screen.getByTestId('cookies-error-alert')
		expect(cookiesAlert).toHaveAttribute('data-variant', 'dpapi')
		expect(cookiesAlert).toHaveAttribute('data-density', 'compact')
		expect(cookiesAlert).toHaveTextContent('Chrome cookies blocked by Windows encryption')
		expect(cookiesAlert).toHaveTextContent('Switch to Firefox')
		expect(screen.getByTestId('cookies-error-dpapi-docs-link')).toBeInTheDocument()
		expect(screen.getByTestId('quick-download-cookies-settings')).toBeInTheDocument()
	})

	it('keeps plain quick download probe failures compact without special guidance panels', async () => {
		useAppStore.setState({wizardUrl: SINGLE_URL, quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'probe', error: {kind: 'ytdlp', error: {kind: 'network', raw: 'network failed'}}}})
		render(<StepUrlInput />)

		expect(screen.getByTestId('quick-download-feedback')).toHaveTextContent('Network error')
		expect(screen.getByTestId('quick-download-retry')).toBeInTheDocument()
		expect(screen.queryByTestId('bot-wall-notice')).not.toBeInTheDocument()
		expect(screen.queryByTestId('cookies-error-alert')).not.toBeInTheDocument()
		expect(screen.queryByTestId('quick-download-cookies-settings')).not.toBeInTheDocument()
	})

	it('shows representative probe guidance for all-failed bulk quick download', async () => {
		useAppStore.setState({wizardUrl: SINGLE_URL, quickDownloadStatus: 'error', quickDownloadFailure: {kind: 'bulk-probe', error: {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}, urls: ['https://youtu.be/one', 'https://youtu.be/two'], failedCount: 2}})
		render(<StepUrlInput />)

		const alert = screen.getByTestId('quick-download-feedback')
		expect(alert).toHaveTextContent('None of those URLs could be prepared')
		expect(alert).toHaveTextContent('Bot protection triggered.')
		expect(screen.getByTestId('quick-download-cookies-settings')).toBeInTheDocument()
	})

	it('keeps cookie export help links with the cookies source controls', () => {
		render(<StepUrlInput />)
		openSettingsTab()

		const cookiesSource = screen.getByTestId('cookies-source')
		expect(within(cookiesSource).getByTestId('cookies-help-link')).toBeInTheDocument()
		expect(within(cookiesSource).getByTestId('cookies-firefox-link')).toBeInTheDocument()
		expect(within(cookiesSource).getByTestId('cookies-chrome-link')).toBeInTheDocument()
	})

	it('blocks fetch and opens a modal when file mode has no path', async () => {
		resetStore(buildSettings({cookiesMode: 'file', cookiesPath: '   '}))
		render(<StepUrlInput />)

		enterUrlAndStartInteractiveDownload()

		expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument()
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
	})

	it('blocks fetch and opens a modal when browser mode has no browser', async () => {
		resetStore(buildSettings({cookiesMode: 'browser'}))
		render(<StepUrlInput />)

		enterUrlAndStartInteractiveDownload()

		expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument()
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('browser-missing-selection')
	})

	it('opens the Advanced cookies section from the modal primary action', async () => {
		resetStore(buildSettings({cookiesMode: 'file', cookiesPath: ''}))
		render(<StepUrlInput />)

		enterUrlAndStartInteractiveDownload()
		expect(screen.queryByTestId('profiles-settings-tab')).not.toBeInTheDocument()

		fireEvent.click(await screen.findByTestId('cookies-config-dialog-open-settings'))

		await waitFor(() => {
			expect(screen.getByTestId('profiles-settings-tab')).toBeInTheDocument()
		})
		expect(screen.getByTestId('cookies-source')).toBeInTheDocument()
		expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument()
	})

	it('clears the dialog issue when dismissed via Cancel and re-blocks submit until config is fixed', async () => {
		resetStore(buildSettings({cookiesMode: 'file', cookiesPath: ''}))
		render(<StepUrlInput />)

		enterUrlAndStartInteractiveDownload()

		expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument()

		fireEvent.click(screen.getByTestId('cookies-config-dialog-cancel'))

		await waitFor(() => {
			expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument()
		})
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBeNull()
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()

		fireEvent.click(screen.getByTestId('profiles-interactive-download'))

		expect(await screen.findByTestId('cookies-config-dialog')).toBeInTheDocument()
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBe('file-missing-path')
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
	})

	it('clears the dialog issue when dismissed via ESC and keeps submit blocked', async () => {
		resetStore(buildSettings({cookiesMode: 'browser'}))
		render(<StepUrlInput />)

		enterUrlAndStartInteractiveDownload()

		const dialog = await screen.findByTestId('cookies-config-dialog')
		fireEvent.keyDown(dialog, {key: 'Escape', code: 'Escape'})

		await waitFor(() => {
			expect(screen.queryByTestId('cookies-config-dialog')).not.toBeInTheDocument()
		})
		expect(useAppStore.getState().cookiesConfigDialogIssue).toBeNull()
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
	})
})
