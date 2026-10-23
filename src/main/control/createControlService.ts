import {randomUUID} from 'node:crypto'
import type {ControlOutcomes} from '@main/intake/ControlOutcomes.js'
import type {IntakeService} from '@main/intake/IntakeService.js'
import {mainT} from '@main/i18n.js'
import type {QueueService} from '@main/services/QueueService.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import type {LaunchGate} from '@main/services/LaunchGate.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import type {YtDlpErrorKind} from 'ytdlp-errors'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import type {QueueItem} from '@shared/types.js'
import {ControlEventFeed, type ControlFeedQueue, type ControlFeedSources} from './ControlEventFeed.js'
import {ControlService} from './ControlService.js'
import {type ControlBinaries, type ControlStatus, createControlStatus} from './controlStatus.js'
import type {ControlFeed, ControlQueue} from './controlTypes.js'
import {controlRowsPerIntake} from './intakeAdmission.js'
import {IntakeRegistry} from './IntakeRegistry.js'

export interface ControlWiring {
	queueService: QueueService
	// createIntakeService's intake and its Control-side outcomes.
	intake: IntakeService
	outcomes: ControlOutcomes
	settingsStore: Pick<SettingsStore, 'get'>
	launchGate: Pick<LaunchGate, 'snapshot' | 'onChange'>
	binaries: ControlBinaries
	// Profile names follow the window's language; errors stay English.
	languageRef: {current: SupportedLang}
	// The Control client store's label for a client; null once removed.
	clientLabel(clientId: string): string | null
	// The event feed; ControlEventFeed unless a test supplies another.
	createFeed?(sources: ControlFeedSources): ControlFeed
}

// Composition root for the Control API: the intake registry follows the
// queue and every intake outcome, a client's intake rows are capped, and the
// service runs on the real queue, intake, settings and status sources.
export function createControlService(wiring: ControlWiring): {service: ControlService; registry: IntakeRegistry; status: ControlStatus} {
	const {queueService, intake, outcomes, settingsStore, launchGate, binaries, languageRef} = wiring
	const clientLabel = (clientId: string): string | null => wiring.clientLabel(clientId)
	const errorText = (kind: YtDlpErrorKind): string => mainT('en', `errors.ytdlp.${kind}`)
	const registry = new IntakeRegistry({rows: () => queueService.snapshot(), now: Date.now, newId: randomUUID})
	onQueue(queueService, 'added', ({items}) => registry.hearRows(items))
	onQueue(queueService, 'updated', ({item}) => registry.hearRows([item]))
	onQueue(queueService, 'removed', ({itemId, reason}) => registry.hearRemoved(itemId, reason))
	outcomes.listen(event => registry.hearOutcome(event))
	queueService.onIntakeAdmission(controlRowsPerIntake)
	const status = createControlStatus({
		binaries,
		cooldowns: launchGate,
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
			const stops = [onQueue(queueService, 'added', ({items}) => listener(items.map(item => item.id))), onQueue(queueService, 'updated', ({item}) => listener([item.id])), onQueue(queueService, 'removed', ({itemId}) => listener([itemId]))]
			return () => {
				for (const stop of stops) stop()
			}
		}
	}
	const feedSources: ControlFeedSources = {queue: feedQueue(queueService), registry, status, clientLabel, errorText}
	const service = new ControlService({
		intake,
		queue,
		registry,
		settings: () => settingsStore.get(),
		status,
		feed: wiring.createFeed ? wiring.createFeed(feedSources) : new ControlEventFeed(feedSources),
		clientLabel,
		profileName: profile => downloadProfileName(profile, key => mainT(languageRef.current, key)),
		errorText,
		newId: randomUUID,
		now: Date.now
	})
	return {service, registry, status}
}

// QueueService's row events. Its emitter is untyped; these payloads rest on
// its commit pipeline, the only place that emits them (commit and
// emitImmediate in QueueService.ts), which builds each from these types.
interface QueueRowEvents {
	added: {items: QueueItem[]}
	updated: {item: QueueItem}
	removed: {itemId: string; reason: QueueRemovalReason}
}

function onQueue<E extends keyof QueueRowEvents>(queueService: QueueService, event: E, listener: (payload: QueueRowEvents[E]) => void): () => void {
	queueService.on(event, listener)
	return () => queueService.off(event, listener)
}

function feedQueue(queueService: QueueService): ControlFeedQueue {
	return {
		snapshot: () => queueService.snapshot(),
		onAdded: listener => onQueue(queueService, 'added', ({items}) => listener(items)),
		onUpdated: listener => onQueue(queueService, 'updated', ({item}) => listener(item)),
		onRemoved: listener => onQueue(queueService, 'removed', ({itemId, reason}) => listener(itemId, reason))
	}
}
