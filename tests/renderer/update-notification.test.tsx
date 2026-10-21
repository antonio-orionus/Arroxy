import {render, screen, fireEvent, act} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {App} from '@renderer/App.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {AppApi} from '@shared/api.js'
import type {UpdateAvailablePayload} from '@shared/types.js'
import {ok} from '../shared/fixtures.js'

type UpdateListener = (info: UpdateAvailablePayload) => void

function makeApi(overrides: {onUpdateAvailable?: (listener: UpdateListener) => () => void; install?: () => Promise<{ok: true} | {ok: false; error: string}>; openExternal?: (url: string) => Promise<unknown>} = {}) {
	return {
		app: {warmUp: vi.fn().mockResolvedValue(ok({completed: true, dependencies: {}, blockingFailures: []})), getGraphicsPolicy: vi.fn().mockResolvedValue(ok({backdrop: {webglBlocked: false, softwareWebglAllowed: false}})), setLanguage: vi.fn().mockResolvedValue(undefined)},
		window: {minimize: vi.fn().mockResolvedValue(undefined), maximize: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined), isMaximized: vi.fn().mockResolvedValue(false), onMaximizedChange: vi.fn().mockReturnValue(() => undefined)},
		downloads: {
			probe: vi.fn().mockResolvedValue(ok({kind: 'video' as const, extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: '', formats: [], title: '', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false})),
			start: vi.fn(),
			cancel: vi.fn().mockResolvedValue(ok({cancelled: true})),
			pause: vi.fn().mockResolvedValue(ok({paused: true}))
		},
		settings: {get: vi.fn().mockResolvedValue(ok({defaultOutputDir: '/tmp', rememberLastOutputDir: true})), update: vi.fn()},
		hotkey: {rendererReady: vi.fn().mockResolvedValue(ok(undefined))},
		links: {rendererReady: vi.fn().mockResolvedValue(ok(undefined))},
		shell: {openFolder: vi.fn().mockResolvedValue(ok({opened: true})), openExternal: overrides.openExternal ?? vi.fn().mockResolvedValue(ok({opened: true}))},
		logs: {openDir: vi.fn().mockResolvedValue(ok({opened: true}))},
		dialog: {chooseFolder: vi.fn().mockResolvedValue(ok({path: '/tmp'}))},
		events: {
			onStatus: vi.fn().mockReturnValue(() => undefined),
			onProgress: vi.fn().mockReturnValue(() => undefined),
			onProbeProgress: vi.fn().mockReturnValue(() => undefined),
			onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
			onOpenedLink: vi.fn().mockReturnValue(() => undefined),
			onMenuAction: vi.fn().mockReturnValue(() => undefined),
			onHotkeyOutcome: vi.fn().mockReturnValue(() => undefined),
			onWarmupProgress: vi.fn().mockReturnValue(() => undefined)
		},
		queue: {
			cmd: {
				add: vi.fn().mockResolvedValue({ok: true, data: {ids: []}}),
				getSnapshot: vi.fn().mockResolvedValue({ok: true, data: {items: [], schedulerPaused: false}}),
				start: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				pause: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				resume: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				cancel: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				retry: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				clearCompleted: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				remove: vi.fn().mockResolvedValue({ok: true, data: undefined})
			},
			events: {onSnapshot: vi.fn().mockReturnValue(() => undefined), onAdded: vi.fn().mockReturnValue(() => undefined), onUpdated: vi.fn().mockReturnValue(() => undefined), onRemoved: vi.fn().mockReturnValue(() => undefined), onScheduler: vi.fn().mockReturnValue(() => undefined)}
		},
		explore: {
			navigate: vi.fn().mockResolvedValue(ok(undefined)),
			setBounds: vi.fn().mockResolvedValue(ok(undefined)),
			setVisible: vi.fn().mockResolvedValue(ok(undefined)),
			setActive: vi.fn().mockResolvedValue(ok(undefined)),
			signOut: vi.fn().mockResolvedValue(ok(undefined)),
			getState: vi.fn().mockResolvedValue(ok({url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'})),
			onStateChanged: vi.fn().mockReturnValue(() => undefined),
			onPointerInView: vi.fn().mockReturnValue(() => undefined)
		},
		intake: {add: vi.fn(), retry: vi.fn(), choose: vi.fn(), keptProbe: vi.fn(), setWindowContext: vi.fn().mockResolvedValue(ok(undefined)), onEvent: vi.fn().mockReturnValue(() => undefined)},
		siteRequests: {getCooldowns: vi.fn().mockResolvedValue({ok: true, data: []}), tryNow: vi.fn().mockResolvedValue({ok: true, data: undefined}), onCooldownsChanged: vi.fn().mockReturnValue(() => undefined)},
		updater: {onUpdateAvailable: overrides.onUpdateAvailable ?? (() => () => undefined), install: overrides.install ?? (vi.fn().mockResolvedValue({ok: true}) as () => Promise<{ok: true}>)}
	} as unknown as AppApi
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
		wizardMediaKind: 'video',
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		queue: []
	})
}

describe('UpdateBanner integration in App', () => {
	beforeEach(() => {
		resetStore()
		window.platform = 'linux'
		Object.defineProperty(navigator, 'clipboard', {writable: true, configurable: true, value: {writeText: vi.fn().mockResolvedValue(undefined)}})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('banner is not shown on initial render', async () => {
		window.appApi = makeApi()
		render(<App />)
		await act(async () => {})
		expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument()
	})

	it('banner appears when onUpdateAvailable fires', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		window.appApi = makeApi({onUpdateAvailable})

		render(<App />)
		await act(async () => {})

		expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument()

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		expect(screen.getByTestId('update-banner')).toBeInTheDocument()
	})

	it('shows correct version numbers from the IPC payload', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		window.appApi = makeApi({onUpdateAvailable})

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '3.1.0', currentVersion: '2.5.1', installChannel: 'direct', homebrewAvailable: false})
		})

		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 3.1.0 is available — you have 2.5.1.')
	})

	it('dismiss button hides the banner', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		window.appApi = makeApi({onUpdateAvailable})

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})
		expect(screen.getByTestId('update-banner')).toBeInTheDocument()

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Dismiss update banner'}))
		})
		expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument()
	})

	it('Install & Restart calls updater.install()', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		const installMock = vi.fn().mockResolvedValue({ok: true}) as () => Promise<{ok: true}>
		window.appApi = makeApi({onUpdateAvailable, install: installMock})

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Install & Restart'}))
		})

		expect(installMock).toHaveBeenCalledOnce()
	})

	it('Download DMG ↗ calls shell.openExternal with the website URL', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		const openExternal = vi.fn().mockResolvedValue(ok({opened: true}))
		window.appApi = makeApi({onUpdateAvailable, openExternal})
		window.platform = 'darwin'

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Download DMG ↗'}))
		})

		expect(openExternal).toHaveBeenCalledWith('https://arroxy.com/')
	})

	it('Download DMG ↗ dismisses the banner after clicking', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		window.appApi = makeApi({onUpdateAvailable})
		window.platform = 'darwin'

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})
		expect(screen.getByTestId('update-banner')).toBeInTheDocument()

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Download DMG ↗'}))
		})
		expect(screen.queryByTestId('update-banner')).not.toBeInTheDocument()
	})

	it('shows Download DMG ↗ (not Install & Restart) on macOS', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		window.appApi = makeApi({onUpdateAvailable})
		window.platform = 'darwin'

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 2.0.0 is available — download the new DMG.')
		expect(screen.getByRole('button', {name: 'Download DMG ↗'})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: /Install/i})).not.toBeInTheDocument()
	})

	it('shows the failure message and Retry button when install rejects', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		const installMock = vi.fn().mockResolvedValue({ok: false, error: 'no network'}) as () => Promise<{ok: false; error: string}>
		window.appApi = makeApi({onUpdateAvailable, install: installMock})

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Install & Restart'}))
		})

		// Spinner clears, error surfaces, button switches to Retry.
		expect(screen.getByTestId('update-banner-message').textContent).toMatch(/Update failed.*no network/)
		expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument()
	})

	it('Retry after failure calls install() again', async () => {
		let capturedListener: UpdateListener | null = null
		const onUpdateAvailable = (listener: UpdateListener) => {
			capturedListener = listener
			return () => undefined
		}
		const installMock = vi.fn().mockResolvedValue({ok: false, error: 'transient'}) as () => Promise<{ok: false; error: string}>
		window.appApi = makeApi({onUpdateAvailable, install: installMock})

		render(<App />)
		await act(async () => {})

		act(() => {
			capturedListener!({version: '2.0.0', currentVersion: '1.0.0', installChannel: 'direct', homebrewAvailable: false})
		})

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Install & Restart'}))
		})
		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: 'Retry'}))
		})

		expect(installMock).toHaveBeenCalledTimes(2)
	})

	it('registers and unregisters the listener on mount/unmount', async () => {
		const unsubscribe = vi.fn()
		const onUpdateAvailable = vi.fn().mockReturnValue(unsubscribe)
		window.appApi = makeApi({onUpdateAvailable})

		const {unmount} = render(<App />)
		await act(async () => {})

		expect(onUpdateAvailable).toHaveBeenCalledOnce()

		unmount()
		expect(unsubscribe).toHaveBeenCalledOnce()
	})
})
