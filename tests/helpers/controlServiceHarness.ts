import {vi} from 'vite-plus/test'
import {CONTROL_METHODS, type AppStatus, type ControlError, type ControlMethod, type ControlParams, type ControlResult, type ControlRule, parseControlRequest} from 'arroxy-control'
import {ControlService, type ControlResponse, type ControlSession} from '@main/control/ControlService.js'
import type {ControlContext, ControlFeed, ControlQueue, ControlSink} from '@main/control/controlTypes.js'
import {IntakeRegistry} from '@main/control/IntakeRegistry.js'
import type {IntakeService} from '@main/intake/IntakeService.js'
import type {QueueRemovalReason} from '@main/services/download/queueMutation.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {IntakeAddRequest} from '@main/intake/IntakeService.js'
import type {IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import {ok, type Result} from '@shared/result.js'
import type {QueueItem, QueueSchedulerCommandResult} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// ControlService over fakes: a queue of plain rows that tells its listeners,
// the real intake registry fed the way the composition feeds it, and an
// intake that places a client's placeholder row the way IntakeService does.

const START = 1_000_000
export const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const READY: AppStatus = {ready: true, binaries: {ytDlp: 'ready', ffmpeg: 'ready'}, scheduler: 'running', cooldowns: []}
export const SINK: ControlSink = {write: () => true, onDrain: () => () => undefined}

export function context(clientId = 'client-1', rules: ControlRule[] = ['trusted']): ControlContext {
	return {clientId, kind: 'localClient', label: `Label of ${clientId}`, rules}
}

export function harness() {
	const rows: QueueItem[] = []
	const queueListeners = new Set<(itemIds: readonly string[]) => void>()
	const clock = {now: START}
	let ids = 0
	const registry = new IntakeRegistry({rows: () => rows, now: () => clock.now, newId: () => `adopted-${++ids}`, defer: run => run()})
	const changed = (itemIds: readonly string[]): void => {
		for (const listener of [...queueListeners]) listener(itemIds)
	}
	// Writes a row the way the queue does: the registry hears it, then listeners.
	const put = (row: QueueItem): QueueItem => {
		const index = rows.findIndex(candidate => candidate.id === row.id)
		if (index >= 0) rows[index] = row
		else rows.push(row)
		registry.hearRows([row])
		changed([row.id])
		return row
	}
	const drop = (itemId: string, reason: QueueRemovalReason): void => {
		const index = rows.findIndex(row => row.id === itemId)
		if (index >= 0) rows.splice(index, 1)
		registry.hearRemoved(itemId, reason)
		changed([itemId])
	}
	const schedulerResult = (): QueueSchedulerCommandResult => ({scheduler: 'paused', done: [], failed: []})
	const queue = {
		snapshot: vi.fn((): readonly QueueItem[] => rows),
		pause: vi.fn((_itemId: string): Promise<Result<void>> => Promise.resolve(ok(undefined))),
		resume: vi.fn((_itemId: string): Promise<Result<void>> => Promise.resolve(ok(undefined))),
		cancel: vi.fn((itemId: string): Promise<Result<void>> => {
			const row = rows.find(candidate => candidate.id === itemId)
			if (row?.job.kind === 'unresolved' && (row.status === 'probing' || row.status === 'needs-choice')) drop(itemId, 'cancelled')
			else if (row) put({...row, status: 'cancelled'})
			return Promise.resolve(ok(undefined))
		}),
		retry: vi.fn((_itemId: string): Promise<Result<void>> => Promise.resolve(ok(undefined))),
		remove: vi.fn((itemId: string): Promise<Result<void>> => {
			drop(itemId, 'removed')
			return Promise.resolve(ok(undefined))
		}),
		pauseAll: vi.fn(() => Promise.resolve(schedulerResult())),
		resumeAll: vi.fn(() => Promise.resolve({...schedulerResult(), scheduler: 'running' as const})),
		onChange: (listener: (itemIds: readonly string[]) => void) => {
			queueListeners.add(listener)
			return () => queueListeners.delete(listener)
		}
	} satisfies ControlQueue
	let placed = 0
	// Places a probing placeholder for the caller, as IntakeService does.
	const placeholder = (request: IntakeAddRequest): IntakePlacement => {
		placed++
		const intakeId = `intake-${placed}`
		const itemId = `row-${placed}`
		const from = request.origin.kind === 'localClient' ? {kind: 'localClient' as const, clientId: request.origin.clientId, intakeId} : {kind: request.origin.kind, intakeId}
		put(makeItem({id: itemId, status: 'probing', url: request.url, title: request.url, job: UNRESOLVED, probeMode: request.playlistMode, origin: from}))
		return {kind: 'added', itemId, title: request.url, intakeId}
	}
	const intake = {
		add: vi.fn((request: IntakeAddRequest) => Promise.resolve(placeholder(request))),
		choose: vi.fn((_call: Parameters<IntakeService['choose']>[0]): Result<void> => ok(undefined)),
		retry: vi.fn((_call: Parameters<IntakeService['retry']>[0]): Result<void> => ok(undefined)),
		windowProfile: vi.fn((): ReturnType<IntakeService['windowProfile']> => undefined)
	}
	const settings = defaultAppSettings('/downloads')
	const status = {value: READY}
	const subscriptions: {close: ReturnType<typeof vi.fn>}[] = []
	const feed = {
		subscribe: vi.fn<ControlFeed['subscribe']>(() => {
			const subscription = {close: vi.fn()}
			subscriptions.push(subscription)
			return subscription
		})
	}
	const labels: Record<string, string> = {'client-1': 'Claude Code'}
	const service = new ControlService({
		intake,
		queue,
		registry,
		settings: () => Promise.resolve(settings),
		status: {current: () => status.value},
		feed,
		clientLabel: clientId => labels[clientId] ?? null,
		profileName: profile => profile.name ?? `Built-in ${profile.id}`,
		errorText: kind => `Text for ${kind}`,
		newId: () => `request-${++ids}`,
		now: () => clock.now
	})
	const sessions = new Map<string, ControlSession>()
	const session = (from: ControlContext = context()): ControlSession => {
		const key = JSON.stringify(from)
		const known = sessions.get(key)
		if (known) return known
		const opened = service.openSession(from, SINK)
		sessions.set(key, opened)
		return opened
	}
	let requests = 0
	// Sends one request the way an entry point does: parsed by the package first.
	const send = <M extends ControlMethod>(method: M, params: ControlParams<M> | Record<string, unknown>, from?: ControlContext): Promise<ControlResponse> => {
		const parsed = parseControlRequest({type: 'request', id: `req-${++requests}`, method, params})
		if (!parsed.ok) throw new Error(`the test sent an invalid request: ${parsed.error.message}`)
		return session(from).handle(parsed.request)
	}
	// The intake's outcome, the way ControlOutcomes hands it to the registry.
	const outcome = (intakeId: string, told: QuickDownloadEvent): void => registry.hearOutcome({kind: 'outcome', requestId: 'r', intakeId, origin: 'localClient', outcome: told})
	return {rows, queue, queueListeners, registry, intake, settings, status, feed, subscriptions, service, session, send, put, drop, outcome, clock, labels}
}

export type Harness = ReturnType<typeof harness>

export function resultOf<M extends ControlMethod>(method: M, response: ControlResponse): ControlResult<M> {
	if (!response.ok) throw new Error(`expected ${method} to succeed, got ${response.error.code}: ${response.error.message}`)
	const parsed = CONTROL_METHODS[method].result.safeParse(response.result)
	if (!parsed.success) throw new Error(`${method} answered an invalid result`)
	return response.result as ControlResult<M>
}

export function errorOf(response: ControlResponse): ControlError {
	if (response.ok) throw new Error(`expected an error, got ${JSON.stringify(response.result)}`)
	return response.error
}
