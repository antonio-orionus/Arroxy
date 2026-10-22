import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import type {BrowserWindow} from 'electron'
import {mainT, mainTranslator} from '@main/i18n.js'
import type {ProbeService} from '@main/services/ProbeService.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {cookiesConfigIssueMessage, getIncompleteCookiesConfigIssue} from '@shared/cookiesConfig.js'
import type {IntakeEvent} from '@shared/intake/intakeEvents.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {fail} from '@shared/result.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {HotkeyOutcomePayload, ProbeResult, ProbeError} from '@shared/types.js'
import {ControlOutcomes} from './ControlOutcomes.js'
import {HotkeyIntake} from './HotkeyIntake.js'
import {IntakeService} from './IntakeService.js'

const logger = log.scope('intake')

export interface IntakeWiring {
	probeService: ProbeService
	queueService: QueueService
	settingsStore: SettingsStore
	playlistManifestStore: PlaylistManifestStore
	languageRef: {current: SupportedLang}
	mainWindow: BrowserWindow
	// Where the hotkey's outcomes go to the user (routeHotkeyOutcome).
	hotkeyFeedback(event: HotkeyOutcomePayload): void
}

// Composition root for intake: the real probe (behind the same cookies-setup
// check as the window's probes), queue, settings, manifests and the window's
// language. The hotkey's outcomes go to its intake, a Control API client's to
// the Control side (which also hears every other outcome), the rest to the window.
export function createIntakeService(wiring: IntakeWiring): {intake: IntakeService; hotkey: HotkeyIntake; control: ControlOutcomes} {
	const {probeService, queueService, settingsStore, playlistManifestStore, languageRef, mainWindow} = wiring
	const control = new ControlOutcomes()
	const intake = new IntakeService({
		queue: queueService,
		probe: async ({url, playlistMode, ownerKey, playlistScope}) => {
			const issue = getIncompleteCookiesConfigIssue((await settingsStore.get()).common)
			if (issue) return fail<ProbeResult, ProbeError>({kind: 'other', code: 'cookies_config', message: cookiesConfigIssueMessage(issue)})
			return probeService.probe(url, {kind: 'intake', playlistMode, ownerKey, playlistScope})
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
		profileFormatLabel: profile => profileFormatLabel(profile, mainTranslator(languageRef.current), languageRef.current),
		emit: (event: IntakeEvent) => {
			if (control.hear(event) || hotkey.hear(event)) return
			if (!mainWindow.isDestroyed()) mainWindow.webContents.send(IPC_CHANNELS.intakeEvent, event)
		},
		platform: process.platform,
		newId: randomUUID
	})
	const hotkey = new HotkeyIntake({intake, notify: event => wiring.hotkeyFeedback(event), newId: randomUUID})
	return {intake, hotkey, control}
}
