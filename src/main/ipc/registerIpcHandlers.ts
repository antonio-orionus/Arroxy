import type {BrowserWindow} from 'electron'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {ProbeService} from '@main/services/ProbeService.js'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import type {TokenService} from '@main/services/TokenService.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {ClipboardWatcher} from '@main/services/ClipboardWatcher.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import {DownloadEventBridge} from '@main/services/DownloadEventBridge.js'
import {QueueEventBridge} from '@main/services/QueueEventBridge.js'
import {ProbeEventBridge} from '@main/services/ProbeEventBridge.js'
import {WarmupService} from '@main/services/WarmupService.js'
import {registerAppHandlers} from './appHandlers.js'
import {registerWindowHandlers} from './windowHandlers.js'
import {registerDownloadHandlers} from './downloadHandlers.js'
import {registerSettingsHandlers} from './settingsHandlers.js'
import {registerFileHandlers} from './fileHandlers.js'
import {registerQueueHandlers} from './queueHandlers.js'
import {registerAnalyticsHandlers} from './analyticsHandlers.js'
import {registerDiagnosticsHandlers} from './diagnosticsHandlers.js'
import {registerPlaylistHandlers} from './playlistHandlers.js'

export interface IpcDependencies {
	mainWindow: BrowserWindow
	downloadService: DownloadService
	probeService: ProbeService
	settingsStore: SettingsStore
	queueService: QueueService
	binaryManager: BinaryManager
	tokenService: TokenService
	languageRef: {current: SupportedLang}
	clipboardWatcher: ClipboardWatcher
	playlistManifestStore: PlaylistManifestStore
}

let activeDownloadBridge: DownloadEventBridge | null = null
let activeQueueBridge: QueueEventBridge | null = null
let activeProbeBridge: ProbeEventBridge | null = null

export function registerIpcHandlers(deps: IpcDependencies): void {
	const {mainWindow, downloadService, probeService, settingsStore, queueService, binaryManager, tokenService, languageRef, clipboardWatcher, playlistManifestStore} = deps

	const warmupService = new WarmupService({binaryManager, tokenService, window: mainWindow})
	registerAppHandlers({warmupService, binaryManager, languageRef})
	registerWindowHandlers(mainWindow)
	registerDownloadHandlers({downloadService, probeService, settingsStore})
	registerSettingsHandlers({settingsStore, clipboardWatcher})
	registerFileHandlers(mainWindow, binaryManager)
	registerQueueHandlers(queueService)
	registerAnalyticsHandlers()
	registerDiagnosticsHandlers()
	registerPlaylistHandlers(playlistManifestStore, settingsStore)

	activeDownloadBridge?.detach()
	activeDownloadBridge = new DownloadEventBridge(downloadService, mainWindow)
	activeDownloadBridge.attach()

	activeProbeBridge?.detach()
	activeProbeBridge = new ProbeEventBridge(probeService, mainWindow)
	activeProbeBridge.attach()

	activeQueueBridge?.detach()
	activeQueueBridge = new QueueEventBridge(queueService, mainWindow)
	activeQueueBridge.attach()
}
