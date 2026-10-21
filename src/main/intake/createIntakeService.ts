import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import type {BrowserWindow} from 'electron'
import {mainT} from '@main/i18n.js'
import type {ProbeService} from '@main/services/ProbeService.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {cookiesConfigIssueMessage, getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {IntakeEvent} from '@shared/intake/intakeEvents.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {fail} from '@shared/result.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {ProbeResult, ProbeError} from '@shared/types.js'
import {IntakeService} from './IntakeService.js'

const logger = log.scope('intake')

export interface IntakeWiring {
	probeService: ProbeService
	queueService: QueueService
	settingsStore: SettingsStore
	playlistManifestStore: PlaylistManifestStore
	languageRef: {current: SupportedLang}
	mainWindow: BrowserWindow
}

// Composition root for intake: the real probe (behind the same cookies-setup
// check as the window's probes), queue, settings, manifests and the window's
// language, with outcomes sent to the window.
export function createIntakeService(wiring: IntakeWiring): IntakeService {
	const {probeService, queueService, settingsStore, playlistManifestStore, languageRef, mainWindow} = wiring
	return new IntakeService({
		queue: queueService,
		probe: async ({url, playlistMode, ownerKey, playlistScope}) => {
			const issue = getIncompleteCookiesConfigIssue((await settingsStore.get()).common)
			if (issue) return fail<ProbeResult, ProbeError>({kind: 'other', code: 'cookies_config', message: cookiesConfigIssueMessage(issue)})
			return probeService.probe(url, {playlistMode, ownerKey, ...(playlistScope ? {playlistScope} : {})})
		},
		registerManifest: async manifest => {
			try {
				await playlistManifestStore.save(manifest)
			} catch (error) {
				logger.warn('playlist manifest registration failed; M3U will be skipped', {error: error instanceof Error ? error.message : String(error)})
			}
		},
		settings: () => settingsStore.get(),
		text: key => mainT(languageRef.current, key),
		emit: (event: IntakeEvent) => {
			if (!mainWindow.isDestroyed()) mainWindow.webContents.send(IPC_CHANNELS.intakeEvent, event)
		},
		platform: process.platform,
		newId: randomUUID
	})
}
