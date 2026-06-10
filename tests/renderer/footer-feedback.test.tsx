import {render, screen, fireEvent, waitFor, act} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

function ok<T>(data: T) {
	return Promise.resolve({ok: true as const, data})
}

const mockOpenExternal = vi.fn().mockResolvedValue(ok({opened: true}))
const mockOpenLogsDir = vi.fn().mockResolvedValue(ok({opened: true}))
const mockUploadFeedbackDiagnostic = vi.fn(async ({reportId}: {reportId: string}) => ok({reportId, diagnosticUrl: null, rawBytes: 42, compressedBytes: 31, truncated: false, sha256: 'a'.repeat(64)}))
const mockTallyOpenPopup = vi.fn()

const mockAppApi = {
	app: {
		warmUp: vi.fn().mockResolvedValue(ok({completed: true, dependencies: {}, blockingFailures: [], cancelled: false})),
		cancelWarmup: vi.fn().mockResolvedValue(undefined),
		installYtDlpWithHomebrew: vi.fn().mockResolvedValue(ok({installedPath: '/opt/homebrew/bin/yt-dlp'})),
		installYtDlpWithWinget: vi.fn().mockResolvedValue(ok({installedPath: 'C:\\Users\\mock\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe'})),
		setLanguage: vi.fn().mockResolvedValue(undefined)
	},
	window: {minimize: vi.fn().mockResolvedValue(undefined), maximize: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined), isMaximized: vi.fn().mockResolvedValue(false), onMaximizedChange: vi.fn().mockReturnValue(() => undefined)},
	downloads: {
		probe: vi.fn().mockResolvedValue(ok({kind: 'video' as const, extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: '', formats: [], title: '', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false})),
		probeCancel: vi.fn().mockResolvedValue(undefined),
		start: vi.fn(),
		cancel: vi.fn().mockResolvedValue(ok({cancelled: true})),
		pause: vi.fn().mockResolvedValue(ok({paused: true})),
		resume: vi.fn().mockResolvedValue(ok({resumed: false}))
	},
	settings: {get: vi.fn().mockResolvedValue(ok({defaultOutputDir: '/tmp', rememberLastOutputDir: true})), update: vi.fn()},
	shell: {openFolder: vi.fn().mockResolvedValue(ok({opened: true})), openExternal: mockOpenExternal, openBinariesDir: vi.fn().mockResolvedValue(ok({opened: true}))},
	logs: {openDir: mockOpenLogsDir, uploadFeedbackDiagnostic: mockUploadFeedbackDiagnostic},
	dialog: {chooseFolder: vi.fn().mockResolvedValue(ok({path: '/tmp'})), chooseFile: vi.fn().mockResolvedValue(ok({path: null})), chooseExecutable: vi.fn().mockResolvedValue(ok({path: null}))},
	events: {onStatus: vi.fn().mockReturnValue(() => undefined), onProgress: vi.fn().mockReturnValue(() => undefined), onClipboardUrl: vi.fn().mockReturnValue(() => undefined), onWarmupProgress: vi.fn().mockReturnValue(() => undefined)},
	queue: {
		cmd: {
			add: vi.fn().mockResolvedValue({ok: true, data: {ids: []}}),
			getSnapshot: vi.fn().mockResolvedValue({ok: true, data: []}),
			start: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			pause: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			resume: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			cancel: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			retry: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			clearCompleted: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			remove: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			setLane: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			pauseAll: vi.fn().mockResolvedValue({ok: true, data: undefined}),
			resumeAll: vi.fn().mockResolvedValue({ok: true, data: undefined})
		},
		events: {onSnapshot: vi.fn().mockReturnValue(() => undefined), onAdded: vi.fn().mockReturnValue(() => undefined), onUpdated: vi.fn().mockReturnValue(() => undefined), onRemoved: vi.fn().mockReturnValue(() => undefined)}
	},
	updater: {onUpdateAvailable: vi.fn().mockReturnValue(() => undefined), install: vi.fn().mockResolvedValue(undefined)},
	analytics: {track: vi.fn()},
	diagnostics: {logWizardStep: vi.fn()},
	playlist: {scanFolder: vi.fn().mockResolvedValue({ok: true, data: {matchedIds: []}}), registerManifest: vi.fn().mockResolvedValue({ok: true, data: undefined})}
}

function resetStore() {
	useAppStore.setState({
		initialized: false,
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
		queue: [],
		language: 'en'
	})
}

describe('Footer feedback controls', () => {
	beforeEach(() => {
		resetStore()
		window.appApi = mockAppApi
		window.appVersion = '1.2.3'
		window.platform = 'linux'
		;(window as unknown as {Tally?: {openPopup: typeof mockTallyOpenPopup}}).Tally = {openPopup: mockTallyOpenPopup}
		Object.defineProperty(navigator, 'clipboard', {writable: true, configurable: true, value: {writeText: vi.fn().mockResolvedValue(undefined)}})
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.useRealTimers()
		delete (window as unknown as {Tally?: unknown}).Tally
	})

	it('renders all three footer utility buttons', async () => {
		render(<App />)
		expect(await screen.findByTestId('btn-debug')).toBeInTheDocument()
		expect(screen.getByTestId('btn-feedback')).toBeInTheDocument()
		expect(screen.getByTestId('btn-logs')).toBeInTheDocument()
	})

	it('uses compact footer classes so mobile widths do not clip utility actions', async () => {
		render(<App />)

		const footer = await screen.findByTestId('app-footer')
		expect(footer.className).toContain('min-w-0')
		expect(footer.className).toContain('max-sm:px-2')

		expect(screen.getByTestId('footer-left-controls').className).toContain('min-w-0')
		expect(screen.getByTestId('footer-language-picker').className).toContain('[&_select]:max-w-[4.75rem]')
		expect(screen.getByTestId('footer-actions').className).toContain('shrink-0')
		expect(screen.getByTestId('btn-about-version').className).toContain('max-sm:hidden')
		expect(screen.getByTestId('btn-about').className).toContain('max-sm:hidden')
		expect(screen.getByTestId('btn-share-label').className).toContain('max-sm:sr-only')
		expect(screen.getByTestId('btn-feedback-label').className).toContain('max-sm:sr-only')
		expect(screen.getByTestId('btn-logs-label').className).toContain('max-sm:sr-only')
	})

	it('Feedback button opens Tally immediately with context and no GitHub navigation', async () => {
		render(<App />)
		fireEvent.click(await screen.findByTestId('btn-feedback'))

		await waitFor(() => {
			expect(mockTallyOpenPopup).toHaveBeenCalledOnce()
		})
		expect(mockOpenExternal).not.toHaveBeenCalled()
		expect(mockUploadFeedbackDiagnostic).not.toHaveBeenCalled()
		expect(mockTallyOpenPopup).toHaveBeenCalledWith(
			'Ek6M8B',
			expect.objectContaining({
				autoClose: 3000,
				hiddenFields: expect.objectContaining({
					app_version: '1.2.3',
					platform: 'linux',
					app_locale: 'en',
					extractor: 'none',
					yt_dlp_error_kind: 'none',
					error_code: 'none',
					source: 'app-footer',
					diagnostic_report_created: 'true',
					diagnostic_upload_status: 'requested',
					diagnostic_raw_bytes: 'pending',
					diagnostic_compressed_bytes: 'pending',
					diagnostic_truncated: 'pending',
					diagnostic_sha256: 'pending',
					report_id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
				})
			})
		)
		const hiddenFields = mockTallyOpenPopup.mock.calls[0][1].hiddenFields as Record<string, string>
		expect(Object.values(hiddenFields)).not.toContain('')
	})

	it('uploads the diagnostic log after Tally submission using the same report id', async () => {
		render(<App />)
		fireEvent.click(await screen.findByTestId('btn-feedback'))

		await waitFor(() => {
			expect(mockTallyOpenPopup).toHaveBeenCalledOnce()
		})
		const options = mockTallyOpenPopup.mock.calls[0][1] as {hiddenFields: Record<string, string>; onSubmit: () => void}
		const reportId = options.hiddenFields.report_id
		options.onSubmit()

		await waitFor(() => {
			expect(mockUploadFeedbackDiagnostic).toHaveBeenCalledWith({reportId})
		})
		expect(mockAppApi.analytics.track).toHaveBeenCalledWith('feedback_submitted', {report_id: reportId, diagnostic_report_created: true})
		expect(mockAppApi.analytics.track).toHaveBeenCalledWith('feedback_diagnostic_uploaded', {report_id: reportId, raw_bytes: 42, compressed_bytes: 31, truncated: false})
	})

	it('Copy debug info writes platform, Electron, and Chrome fields to clipboard', async () => {
		Object.defineProperty(navigator, 'userAgent', {configurable: true, value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Electron/33.2.0 Chrome/130.0.6723.191 Safari/537.36'})

		render(<App />)
		fireEvent.click(await screen.findByTestId('btn-debug'))

		await waitFor(() => {
			expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
		})

		const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
		expect(written).toContain('Platform: linux')
		expect(written).toContain('Electron: 33.2.0')
		expect(written).toContain('Chrome: 130.0.6723.191')
	})

	it('Copy debug info falls back to "unknown" when Electron is absent from userAgent', async () => {
		Object.defineProperty(navigator, 'userAgent', {configurable: true, value: 'Mozilla/5.0 (jsdom)'})

		render(<App />)
		fireEvent.click(await screen.findByTestId('btn-debug'))

		await waitFor(() => {
			expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
		})

		const written = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
		expect(written).toContain('Electron: unknown')
		expect(written).toContain('Chrome: unknown')
	})

	it('title shows "Copied!" immediately after click then reverts after 1.5 s', async () => {
		render(<App />)

		// Wait for initialization, then switch to fake timers
		await act(async () => {})
		vi.useFakeTimers()

		await act(async () => {
			fireEvent.click(screen.getByTestId('btn-debug'))
		})

		expect(screen.getByTestId('btn-debug')).toHaveAttribute('title', 'Copied!')

		act(() => {
			vi.advanceTimersByTime(1600)
		})

		expect(screen.getByTestId('btn-debug')).toHaveAttribute('title', 'Copy debug info (Electron, OS, Chrome versions)')
	})

	it('Logs button opens the log directory', async () => {
		render(<App />)
		fireEvent.click(await screen.findByTestId('btn-logs'))
		await waitFor(() => {
			expect(mockOpenLogsDir).toHaveBeenCalledOnce()
		})
	})
})
