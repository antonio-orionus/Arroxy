import {randomUUID} from 'node:crypto'
import type {ControlOutcomes} from '@main/intake/ControlOutcomes.js'
import type {IntakeService} from '@main/intake/IntakeService.js'
import {mainT} from '@main/i18n.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import type {SiteRequestState} from '@main/services/SiteRequestState.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {QueueItem} from '@shared/types.js'
import {ControlService} from './ControlService.js'
import {type ControlBinaries, type ControlStatus, createControlStatus} from './controlStatus.js'
import type {ControlFeed, ControlQueue} from './controlTypes.js'
import {controlRowsPerIntake} from './intakeAdmission.js'
import {IntakeRegistry} from './IntakeRegistry.js'

// What the event feed is built from.
export interface ControlFeedSources {
	queueService: QueueService
	registry: IntakeRegistry
	status: ControlStatus
	clientLabel(clientId: string): string | null
}

export interface ControlWiring {
	queueService: QueueService
	// createIntakeService's intake and its Control-side outcomes.
	intake: IntakeService
	outcomes: ControlOutcomes
	settingsStore: Pick<SettingsStore, 'get'>
	siteRequests: Pick<SiteRequestState, 'snapshot' | 'onChange'>
	binaries: ControlBinaries
	// Profile names follow the window's language; errors stay English.
	languageRef: {current: SupportedLang}
	// The Control client store's label for a client; null once removed.
	clientLabel(clientId: string): string | null
	createFeed(sources: ControlFeedSources): ControlFeed
}

// Composition root for the Control API: the intake registry follows the
// queue and every intake outcome, a client's intake rows are capped, and the
// service runs on the real queue, intake, settings and status sources.
export function createControlService(wiring: ControlWiring): {service: ControlService; registry: IntakeRegistry; status: ControlStatus} {
	const {queueService, intake, outcomes, settingsStore, siteRequests, binaries, languageRef} = wiring
	const clientLabel = (clientId: string): string | null => wiring.clientLabel(clientId)
	const registry = new IntakeRegistry({rows: () => queueService.snapshot(), now: Date.now, newId: randomUUID})
	queueService.on('added', ({items}: {items: QueueItem[]}) => registry.hearRows(items))
	queueService.on('updated', ({item}: {item: QueueItem}) => registry.hearRows([item]))
	queueService.on('removed', ({itemId, reason}: {itemId: string; reason: QueueRemovalReason}) => registry.hearRemoved(itemId, reason))
	outcomes.listen(event => registry.hearOutcome(event))
	queueService.onIntakeAdmission(controlRowsPerIntake)
	const status = createControlStatus({
		binaries,
		cooldowns: siteRequests,
		scheduler: {
			paused: () => queueService.snapshotPayload().schedulerPaused,
			onChange: listener => {
				const heard = (): void => listener()
				queueService.on('scheduler', heard)
				return () => queueService.off('scheduler', heard)
			}
		}
	})
	const queue: ControlQueue = {
		snapshot: () => queueService.snapshot(),
		pause: itemId => queueService.pause(itemId),
		resume: itemId => queueService.resume(itemId),
		cancel: itemId => queueService.cancel(itemId),
		retry: itemId => queueService.retry(itemId),
		remove: itemId => queueService.remove(itemId),
		pauseAll: () => queueService.pauseAll(),
		resumeAll: () => queueService.resumeAll(),
		onChange: listener => {
			const added = ({items}: {items: QueueItem[]}): void => listener(items.map(item => item.id))
			const updated = ({item}: {item: QueueItem}): void => listener([item.id])
			const removed = ({itemId}: {itemId: string}): void => listener([itemId])
			queueService.on('added', added)
			queueService.on('updated', updated)
			queueService.on('removed', removed)
			return () => {
				queueService.off('added', added)
				queueService.off('updated', updated)
				queueService.off('removed', removed)
			}
		}
	}
	const service = new ControlService({
		intake,
		queue,
		registry,
		settings: () => settingsStore.get(),
		status,
		feed: wiring.createFeed({queueService, registry, status, clientLabel}),
		clientLabel,
		profileName: profile => downloadProfileName(profile, key => mainT(languageRef.current, key)),
		errorText: kind => mainT('en', `errors.ytdlp.${kind}`),
		newId: randomUUID,
		now: Date.now
	})
	return {service, registry, status}
}
