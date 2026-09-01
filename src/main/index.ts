import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import {app, BrowserWindow, dialog, nativeTheme} from 'electron'
import log from 'electron-log/main.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {GraphicsPolicy} from '@shared/types.js'
import {TrayManager} from '@main/services/TrayManager.js'
import {mainT, pluralKey} from '@main/i18n.js'
import {pickLanguage} from '@shared/i18n/index.js'
import {registerIpcHandlers} from '@main/ipc/registerIpcHandlers.js'
import {registerUpdaterHandlers} from '@main/ipc/registerUpdaterHandlers.js'
import {setupAnalytics, setAnalyticsEnabled, trackCrashDetectedOncePerSession, trackMain} from '@main/services/analytics.js'
import {detectInstallChannel} from '@main/installChannel.js'
import {BinaryManager} from '@main/services/BinaryManager.js'
import {buildGraphicsPolicy} from '@main/services/GraphicsPolicy.js'
import {DownloadService} from '@main/services/DownloadService.js'
import {QueueService} from '@main/services/QueueService.js'
import {ProbeService} from '@main/services/ProbeService.js'
import {ProbeInfoJsonCache} from '@main/services/ProbeInfoJsonCache.js'
import {TokenService} from '@main/services/TokenService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import {SettingsStore} from '@main/stores/SettingsStore.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import {writePlaylistM3u} from '@main/services/playlistM3u.js'
import {ClipboardWatcher, watcherWindowFromBrowserWindow} from '@main/services/ClipboardWatcher.js'
import {HotkeyService, hotkeyWindowFromBrowserWindow, electronShortcutRegistry} from '@main/services/HotkeyService.js'
import {createHotkeyOsNotifier} from '@main/services/hotkeyOsNotifier.js'
import {HiddenWindowTokenProvider} from '@main/token/providers/HiddenWindowTokenProvider.js'
import {MockTokenProvider} from '@main/token/providers/MockTokenProvider.js'
import {defaultAppSettings, DEFAULTS, NORMAL_LANE_CAP, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT, WINDOW_DEFAULT_WIDTH, WINDOW_DEFAULT_HEIGHT} from '@shared/constants.js'
import {readSmokeUrl, runSmokeMode} from '@main/smoke.js'
import {readRuntimeSmokeEnabled, runRuntimeSmokeMode, exitWithCode} from '@main/runtimeSmoke.js'
import {cancelQueueBeforeExit} from '@main/shutdown.js'
import {decideCloseAction, decideRendererCrashAction, normalizeCloseBehavior} from '@main/windowLifecycle.js'
import {resolveMainWindowBackgroundColor} from '@main/windowPresentation.js'
import {registerPreloadDiagnostics, resolveMainWindowPreloadPath} from '@main/preloadDiagnostics.js'
import {isHeadlessWindowRequested, resolveE2eHarnessMode} from '@main/e2eHarness.js'
import {watchInitialGpuInfoUpdate} from '@main/gpuInfoReadiness.js'
import {applyChromiumSwitches, applyChromiumSwitchesFromEnv, chromiumSwitchesForRuntime, chromiumSwitchLogSummary} from '@main/chromiumSwitches.js'
import contextMenu from 'electron-context-menu'
import windowStateKeeper from 'electron-window-state'

log.initialize()

// Catch fatal main-process errors that would otherwise crash silently before
// any window appears — without these, pre-ready bugs leave no diagnostic trail.
// Deliberately non-fatal: killing the app on every uncaught main-process error
// would turn survivable faults into a hard crash for the user. The phase marker
// is what makes the log actionable — "died before the window existed" and
// "threw during a download" are very different bugs that otherwise look alike.
let lifecyclePhase: 'pre-ready' | 'ready' = 'pre-ready'
process.on('uncaughtException', err => {
	log.error('uncaughtException', {phase: lifecyclePhase}, err)
})
process.on('unhandledRejection', reason => {
	log.error('unhandledRejection', {phase: lifecyclePhase}, reason)
})

// Log platform identity at top-level (NOT inside whenReady) so a pre-ready
// hang still produces a log line we can read in bug reports.
log.info('boot', {platform: process.platform, arch: process.arch, release: os.release(), electron: process.versions.electron, chrome: process.versions.chrome, node: process.versions.node, argv: process.argv.slice(1)})

const isMockBackend = process.env.MOCK_BACKEND === '1'
// Throwing at module scope leaves the exit code to module-evaluation semantics.
// E2E-only path, but a harness that misconfigures itself should say so and exit
// non-zero rather than fail in a way the runner has to guess at.
const e2eMode = ((): ReturnType<typeof resolveE2eHarnessMode> => {
	try {
		return resolveE2eHarnessMode(process.env, {isPackaged: app.isPackaged})
	} catch (err) {
		log.error('E2E harness configuration is invalid', err)
		app.exit(1)
		throw err
	}
})()
const gpuMode = process.env.ARROXY_GPU_MODE

for (const commandLineSwitch of e2eMode.commandLineSwitches) {
	app.commandLine.appendSwitch(commandLineSwitch)
}

const runtimeChromiumSwitches = applyChromiumSwitches(chromiumSwitchesForRuntime({platform: process.platform, release: os.release()}), app.commandLine)
if (runtimeChromiumSwitches.length > 0) {
	log.info('runtime Chromium switches applied', {switches: runtimeChromiumSwitches})
}

const envChromiumSwitches = applyChromiumSwitchesFromEnv(process.env, app.commandLine)
if (envChromiumSwitches.length > 0) {
	log.info('env Chromium switches applied', chromiumSwitchLogSummary(envChromiumSwitches))
}

if (gpuMode === 'force') {
	const switches = applyChromiumSwitches(['ignore-gpu-blocklist', 'enable-gpu-rasterization'], app.commandLine)
	log.info('gpu mode applied', {mode: gpuMode, switches})
} else if (gpuMode === 'swiftshader') {
	const switches = applyChromiumSwitches(['ignore-gpu-blocklist', 'enable-unsafe-swiftshader', 'use-angle=swiftshader'], app.commandLine)
	log.info('gpu mode applied', {mode: gpuMode, switches})
} else if (gpuMode === 'software') {
	app.disableHardwareAcceleration()
	log.info('gpu mode applied', {mode: gpuMode})
} else if (gpuMode && gpuMode !== 'auto') {
	log.warn('unknown ARROXY_GPU_MODE ignored', {value: gpuMode})
}

if (process.env.ELECTRON_USER_DATA) {
	app.setPath('userData', process.env.ELECTRON_USER_DATA)
}

// Pre-flight runtime args. Lets users recover from GPU/driver hangs that prevent
// the window from ever appearing — they edit argv.json by hand, no UI needed.
// Mirrors VS Code's `argv.json` pattern.
try {
	const argvPath = path.join(app.getPath('userData'), 'argv.json')
	if (fs.existsSync(argvPath)) {
		const raw = fs.readFileSync(argvPath, 'utf8')
		const cfg = JSON.parse(raw) as {'disable-hardware-acceleration'?: boolean}
		if (cfg['disable-hardware-acceleration']) {
			if (gpuMode === 'force' || gpuMode === 'swiftshader') {
				log.info('argv.json hardware acceleration disable ignored because ARROXY_GPU_MODE overrides it', {mode: gpuMode})
			} else {
				app.disableHardwareAcceleration()
				log.info('argv.json applied', {'disable-hardware-acceleration': true})
			}
		}
	}
} catch (err) {
	log.warn('argv.json read failed', err)
}

// Sandbox every BrowserWindow without per-window opt-in. Matches vscode +
// element-desktop. Must run before BrowserWindow construction; safe to call
// pre-`whenReady`. contextIsolation + nodeIntegration:false stay declared on
// each BrowserWindow because they're orthogonal guarantees that
// app.enableSandbox() does not subsume.
app.enableSandbox()

const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
	app.quit()
}

const GPU_INFO_BUDGET_MS = 2_500

// Attach now so an early `gpu-info-update` cannot be missed; the budget only
// starts at app-ready (see whenReady below) so it measures Chromium's reporting
// latency rather than however long the main process took to boot.
const gpuInfoReadiness = hasSingleInstanceLock ? watchInitialGpuInfoUpdate(app) : null

function createMainWindow(backgroundColor: string): BrowserWindow {
	const winState = windowStateKeeper({defaultWidth: WINDOW_DEFAULT_WIDTH, defaultHeight: WINDOW_DEFAULT_HEIGHT})
	const preloadPath = resolveMainWindowPreloadPath(import.meta.dirname)

	// Electron has no Chrome-style `--headless`, and xvfb only helps on Linux —
	// on macOS every E2E launch otherwise pops a real window and steals focus.
	// An unshown window still loads, renders, and accepts CDP input, so Playwright
	// drives it exactly the same; it just never appears or activates.
	// Background throttling has to be off or a hidden window's timers stall and
	// progress-driven waits time out.
	const headless = isHeadlessWindowRequested(process.env)

	const mainWindow = new BrowserWindow({
		x: winState.x,
		y: winState.y,
		width: winState.width,
		height: winState.height,
		minWidth: WINDOW_MIN_WIDTH,
		minHeight: WINDOW_MIN_HEIGHT,
		title: 'Arroxy',
		frame: false,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		backgroundColor,
		show: !headless,
		webPreferences: {preload: preloadPath, contextIsolation: true, nodeIntegration: false, backgroundThrottling: !headless}
	})

	registerPreloadDiagnostics(mainWindow, preloadPath)
	winState.manage(mainWindow)

	mainWindow.on('maximize', () => mainWindow.webContents.send(IPC_CHANNELS.windowMaximizedChange, true))
	mainWindow.on('unmaximize', () => mainWindow.webContents.send(IPC_CHANNELS.windowMaximizedChange, false))

	mainWindow.webContents.setWindowOpenHandler(() => ({action: 'deny'}))
	mainWindow.webContents.on('will-navigate', event => {
		event.preventDefault()
	})

	if (process.env.ELECTRON_RENDERER_URL) {
		const rendererUrl = new URL(process.env.ELECTRON_RENDERER_URL)
		void mainWindow.loadURL(rendererUrl.toString())
	} else {
		void mainWindow.loadFile(path.join(import.meta.dirname, '../renderer/index.html'))
	}

	return mainWindow
}

if (hasSingleInstanceLock) {
	// macOS keeps a hidden window's app in the dock and lets it steal focus on
	// activate. 'accessory' makes the process background-only, so an E2E run
	// cannot pull focus away from whatever the developer is doing.
	if (isHeadlessWindowRequested(process.env) && process.platform === 'darwin') {
		app.setActivationPolicy('accessory')
	}

	void app.whenReady().then(async () => {
		lifecyclePhase = 'ready'
		gpuInfoReadiness?.startBudget(GPU_INFO_BUDGET_MS)
		const userDataPath = app.getPath('userData')
		log.transports.file.resolvePathFn = () => path.join(userDataPath, 'logs', 'main.log')
		log.info('Session started')
		let graphicsPolicyPromise: Promise<GraphicsPolicy> | null = null
		const graphicsPolicyProvider = async (): Promise<GraphicsPolicy> => {
			graphicsPolicyPromise ??= (async () => {
				const gpuInfoUpdated = (await gpuInfoReadiness?.whenUpdated) ?? false
				const gpuFeatureStatus: Partial<Record<string, string>> = {}
				for (const [feature, status] of Object.entries(app.getGPUFeatureStatus())) {
					if (typeof status === 'string') gpuFeatureStatus[feature] = status
				}
				log.info('gpu features', {gpuInfoUpdated, status: gpuFeatureStatus})
				let gpuInfo: unknown
				try {
					gpuInfo = await app.getGPUInfo('basic')
					log.info('gpu info', gpuInfo)
				} catch (err: unknown) {
					log.warn('gpu info failed', err)
					gpuInfo = undefined
				}
				const policy = buildGraphicsPolicy({isPackaged: app.isPackaged, env: process.env, featureStatus: gpuFeatureStatus, featureStatusUsable: gpuInfoUpdated, gpuInfo, gpuInfoUnavailable: gpuInfo === undefined})
				log.info('graphics policy', policy)
				return policy
			})()
			return graphicsPolicyPromise
		}

		const baseSettings = defaultAppSettings(app.getPath('downloads'))
		const settingsStore = new SettingsStore(userDataPath, e2eMode.applyAppSettingsDefaults(baseSettings))
		let initialSettings = await settingsStore.get()
		const e2eShouldDisableClipboardWatch = e2eMode.enabled && !e2eMode.allowClipboardWatch && initialSettings.common.clipboardWatchEnabled
		if (e2eMode.enabled && (e2eShouldDisableClipboardWatch || initialSettings.common.analyticsEnabled !== false)) {
			initialSettings = await settingsStore.update({common: {clipboardWatchEnabled: e2eMode.allowClipboardWatch ? initialSettings.common.clipboardWatchEnabled : false, analyticsEnabled: false}})
		}
		// installId is stamped lazily by SettingsStore on first launch — guaranteed
		// present after `get()`. Empty string fallback keeps TS happy without
		// weakening the type elsewhere.
		const installId = initialSettings.common.installId ?? ''
		const isDev = !!process.env.ELECTRON_RENDERER_URL || isMockBackend || e2eMode.enabled || !!process.env.ARROXY_SMOKE_URL || readRuntimeSmokeEnabled()
		const cpuModel = os.cpus()[0]?.model ?? 'unknown'
		const osLocale = app.getLocale()
		if (!e2eMode.disableAnalytics) {
			setupAnalytics(process.env.OPENPANEL_CLIENT_ID, process.env.OPENPANEL_CLIENT_SECRET, isDev, installId, {appVersion: app.getVersion(), platform: process.platform, architecture: process.arch, systemVersion: os.release(), modelName: cpuModel, osLocale, appLocale: initialSettings.common.language ?? osLocale})
		}
		const languageRef: {current: ReturnType<typeof pickLanguage>} = {current: pickLanguage(initialSettings.common.language ?? app.getLocale())}
		const recentJobsStore = new RecentJobsStore(userDataPath)
		const queueStore = new QueueStore(userDataPath)
		const playlistManifestStore = new PlaylistManifestStore(userDataPath)
		const probeInfoJsonCache = new ProbeInfoJsonCache(userDataPath)
		await probeInfoJsonCache.sweepExpired()
		const binaryManager = new BinaryManager(userDataPath, {overridesProvider: () => settingsStore.getSync().common.binaryOverrides})

		// Packaged runtime smoke mode — exercises Electron-as-Node and managed
		// yt-dlp before any renderer window or queue lifecycle can interfere.
		if (readRuntimeSmokeEnabled()) {
			const code = await runRuntimeSmokeMode({binaryManager})
			exitWithCode(code)
			return
		}

		const tokenProvider = isMockBackend || e2eMode.useMockTokenProvider ? new MockTokenProvider() : new HiddenWindowTokenProvider()
		const tokenService = new TokenService(tokenProvider)
		const ytDlp = new YtDlp(binaryManager, tokenService, settingsStore, {e2eMode})
		const downloadService = new DownloadService(ytDlp, recentJobsStore, isMockBackend)
		const probeService = new ProbeService(ytDlp, isMockBackend, probeInfoJsonCache)
		const queueService = new QueueService(queueStore, downloadService, undefined, undefined, {manifestStore: playlistManifestStore, writeM3u: writePlaylistM3u}, probeInfoJsonCache)
		// Apply the persisted concurrency before init() runs its boot-time spawn
		// pass, so a restart honors the user's limit instead of falling back to
		// the built-in cap for the first batch.
		queueService.setConcurrentDownloads(initialSettings.common.concurrentDownloads ?? NORMAL_LANE_CAP)
		// Must precede init() too — init re-arms retries persisted across the
		// restart, and does nothing unless auto-retry is already configured.
		queueService.setAutoRetryAttempts(initialSettings.common.autoRetryAttempts ?? 0)
		await queueService.init()

		// Headless smoke mode — exercises PoT scrape + retry ladder against real
		// YouTube using production services, then exits. No window created.
		const smokeUrl = readSmokeUrl()
		if (smokeUrl) {
			const code = await runSmokeMode({url: smokeUrl, binaryManager, tokenService, probeService, ytDlp})
			tokenService.dispose()
			exitWithCode(code)
			return
		}

		const launch = await settingsStore.recordLaunch()
		if (!e2eMode.disableAnalytics) {
			// Enable analytics now that we know it's a real (non-smoke) session.
			setAnalyticsEnabled(initialSettings.common.analyticsEnabled ?? true)
			const arch: string = process.arch === 'arm64' ? 'arm64' : 'x64'
			trackMain('app_started', {install_channel: detectInstallChannel(app.getName()), platform_arch: `${process.platform}-${arch}`, is_first_run: launch.isFirstRun})
		} else {
			void launch
		}

		const mainWindow = createMainWindow(resolveMainWindowBackgroundColor(initialSettings.common.uiTheme, nativeTheme.shouldUseDarkColors))

		contextMenu({window: mainWindow.webContents, showSaveImageAs: true, showCopyImageAddress: true, showInspectElement: !app.isPackaged})

		app.on('second-instance', () => {
			if (mainWindow.isDestroyed()) return
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
		})

		// Declare tray before the close handler so the handler can reference it.
		let tray: TrayManager | null = null

		// The tray's Quit item and the window's close handler both land here, and
		// a second close attempt arrives while the first dialog is still open —
		// without this every attempt stacks its own dialog, and each "Quit" reply
		// fires its own app.quit().
		let quitDialogOpen = false

		async function warnActiveDownloadsThenQuit(): Promise<void> {
			if (downloadService.runningJobCount === 0) {
				app.quit()
				return
			}
			if (quitDialogOpen) return
			quitDialogOpen = true
			let response: number
			try {
				const count = downloadService.runningJobCount
				const lang = languageRef.current
				;({response} = await dialog.showMessageBox(mainWindow, {
					type: 'warning',
					buttons: [mainT(lang, 'dialogs.quitWithActiveDownloads.pause'), mainT(lang, 'dialogs.quitWithActiveDownloads.confirm'), mainT(lang, 'dialogs.quitWithActiveDownloads.keep')],
					defaultId: 2,
					cancelId: 2,
					message: mainT(lang, `dialogs.quitWithActiveDownloads.${pluralKey('message', count)}`, {count}),
					detail: mainT(lang, 'dialogs.quitWithActiveDownloads.detail')
				}))
			} finally {
				// Must clear on the throw path too, or one failed dialog permanently
				// disables the warning and the app can never be quit this way again.
				quitDialogOpen = false
			}
			if (response === 0) {
				await queueService.pauseAll()
				app.quit()
			} else if (response === 1) {
				app.quit()
			}
			// response === 2: keep downloading — do nothing
		}

		mainWindow.on('close', event => {
			const hasTray = tray !== null

			if (process.platform === 'darwin' || !hasTray) {
				// No tray: allow if idle, else intercept and warn
				if (downloadService.runningJobCount === 0) return
				event.preventDefault()
				void warnActiveDownloadsThenQuit()
				return
			}

			// Tray present: always intercept; read persisted behavior async
			event.preventDefault()
			void settingsStore
				.get()
				.then(async settings => {
					const action = decideCloseAction({platform: process.platform, hasTray, closeBehavior: normalizeCloseBehavior(settings.common.closeBehavior), runningCount: downloadService.runningJobCount})

					if (action === 'hide') {
						mainWindow.hide()
						return
					}
					if (action === 'quit-direct') {
						app.quit()
						return
					}
					if (action === 'warn-and-quit') {
						await warnActiveDownloadsThenQuit()
						return
					}

					// 'ask-tray': active downloads present — offer the first-time tray dialog
					const lang = languageRef.current
					const {response, checkboxChecked} = await dialog.showMessageBox(mainWindow, {
						type: 'question',
						buttons: [mainT(lang, 'dialogs.closeToTray.hide'), mainT(lang, 'dialogs.closeToTray.quit')],
						defaultId: 0,
						cancelId: 1,
						message: mainT(lang, 'dialogs.closeToTray.message'),
						detail: mainT(lang, 'dialogs.closeToTray.detail'),
						checkboxLabel: mainT(lang, 'dialogs.closeToTray.remember'),
						checkboxChecked: false
					})
					const choice = response === 0 ? 'tray' : 'quit'
					if (checkboxChecked) {
						await settingsStore.update({common: {closeBehavior: choice}})
					}
					trackMain('tray_close_chosen', {choice, remember: checkboxChecked})
					if (choice === 'tray') {
						mainWindow.hide()
					} else {
						await warnActiveDownloadsThenQuit()
					}
				})
				// preventDefault() above already vetoed this close. Without a fallback, a
				// rejected settings read or dialog leaves the window permanently
				// unclosable — the user clicks X and nothing at all happens. Hiding is the
				// non-destructive recovery: nothing is lost and the tray brings it back.
				.catch((err: unknown) => {
					log.error('Close handler failed — hiding to tray instead', err)
					if (!mainWindow.isDestroyed()) mainWindow.hide()
				})
		})

		const clipboardWatcher = new ClipboardWatcher(watcherWindowFromBrowserWindow(mainWindow))
		clipboardWatcher.setEnabled(initialSettings.common.clipboardWatchEnabled)

		const hotkeyService = new HotkeyService(hotkeyWindowFromBrowserWindow(mainWindow), electronShortcutRegistry())
		hotkeyService.apply(initialSettings.common.hotkeyEnabled, initialSettings.common.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator)
		if (e2eMode.enabled) {
			// Lets the hotkey spec drive the registered-chord path directly —
			// the OS owns real chords and contested-chord coverage stays manual.
			;(globalThis as Record<string, unknown>).__arroxyHotkeyService = hotkeyService
		}
		const hotkeyOsNotifier = createHotkeyOsNotifier(mainWindow)
		// Keeps the tray item in sync with the chord's registration state; the
		// tray may not exist yet (it is created later), hence the lazy read.
		const syncHotkeyTrayItem = (): void => tray?.setHotkeyUsable(hotkeyService.getState().registered)
		hotkeyService.onStateChange(syncHotkeyTrayItem)

		registerIpcHandlers({mainWindow, binaryManager, downloadService, probeService, settingsStore, queueService, tokenService, languageRef, clipboardWatcher, hotkeyService, hotkeyOsNotifier, playlistManifestStore, graphicsPolicyProvider})

		if (!e2eMode.disableUpdater) {
			registerUpdaterHandlers(mainWindow)
		}

		app.on('render-process-gone', (_event, webContents, details) => {
			log.error(`Renderer process gone: reason=${details.reason} exitCode=${details.exitCode}`)
			if (details.reason === 'clean-exit') return
			const isMainWindow = webContents === mainWindow.webContents
			trackCrashDetectedOncePerSession({kind: 'renderer', windowRole: isMainWindow ? 'main-window' : 'auxiliary-window', reason: details.reason})
			if (!isMainWindow) return
			const lang = languageRef.current
			const opts = {type: 'error' as const, buttons: [mainT(lang, 'dialogs.rendererCrashed.reload'), mainT(lang, 'dialogs.rendererCrashed.quit')], defaultId: 0, cancelId: 1, message: mainT(lang, 'dialogs.rendererCrashed.message'), detail: mainT(lang, 'dialogs.rendererCrashed.detail', {reason: details.reason})}
			void (mainWindow.isDestroyed() ? dialog.showMessageBox(opts) : dialog.showMessageBox(mainWindow, opts)).then(({response}) => {
				const action = decideRendererCrashAction({reason: details.reason, isMainWindow: true, dialogResponse: response})
				if (action === 'reload' && !mainWindow.isDestroyed()) mainWindow.reload()
				else app.quit()
			})
		})

		app.on('child-process-gone', (_event, details) => {
			if (details.reason === 'clean-exit') return
			log.warn(`Child process gone: type=${details.type} reason=${details.reason} exitCode=${details.exitCode} name=${details.name ?? 'unknown'} serviceName=${details.serviceName ?? 'unknown'}`)
			trackCrashDetectedOncePerSession({kind: 'child', type: details.type, reason: details.reason, name: details.name, serviceName: details.serviceName})
		})

		if (process.platform !== 'darwin') {
			try {
				tray = new TrayManager(
					mainWindow,
					queueService,
					languageRef,
					() => {
						void warnActiveDownloadsThenQuit()
					},
					hotkeyService
				)
				tray.start()
				// Keep the tray item honest: it must appear/disappear with the
				// chord's actual registration state.
				syncHotkeyTrayItem()
			} catch (e) {
				log.warn(`Tray init failed — running without tray: ${String(e)}`)
				tray = null
			}
		}

		app.on('before-quit', event => {
			tray?.destroy()
			tray = null
			clipboardWatcher.dispose()
			hotkeyService.dispose()
			if (downloadService.runningJobCount === 0) {
				tokenService.dispose()
				log.info('App shutting down')
				return
			}
			event.preventDefault()
			void cancelQueueBeforeExit({
				queueService,
				tokenService,
				logInfo: (message, meta) => {
					if (meta) log.info(message, meta)
					else log.info(message)
				},
				exit: code => app.exit(code) // must use exit(), not quit() — quit() re-emits before-quit causing infinite loop
			})
		})
	})
}

app.on('window-all-closed', () => {
	// In smoke modes, hidden windows can churn before the runner calls app.exit().
	if (readSmokeUrl() || readRuntimeSmokeEnabled()) return
	app.quit()
})
