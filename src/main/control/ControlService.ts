// The Control API's one service. An entry point opens a session per
// connection with the caller's context and its event sink, and hands it each
// parsed request; the session answers with a result checked against the
// package's schema, or a public error. Caller rules, idempotency, waits and
// projections live here; how a request arrived and how events are written
// do not.

import log from 'electron-log/main.js'
import {type ControlError, type ControlMethod, type ControlParams, type ControlRequest, type ControlResult, controlError, parseControlResult, type QueueItemView} from 'arroxy-control'
import {enabledDownloadProfiles} from '@shared/downloadProfiles.js'
import type {QueueItemStatus} from '@shared/schemas.js'
import type {QueueItem, QueueSchedulerCommandResult} from '@shared/types.js'
import {ControlFailure, controlErrorForApp, controlFailure, internalError} from './controlErrors.js'
import {ControlIntakes} from './ControlIntakes.js'
import {queuePage} from './controlPaging.js'
import {activeProfileRef} from './controlProfiles.js'
import {intakeView, profileView, queueItemView} from './controlProjections.js'
import type {ControlContext, ControlFeedSubscription, ControlQueue, ControlServiceDeps, ControlSink} from './controlTypes.js'
import {waitFor, type WaitEnd} from './controlWait.js'
import type {IntakeRecord} from './IntakeRegistry.js'

const logger = log.scope('control')

export type ControlResponse = {readonly ok: true; readonly result: ControlResult<ControlMethod>} | {readonly ok: false; readonly error: ControlError}

export interface ControlSession {
	handle(request: ControlRequest): Promise<ControlResponse>
	// Ends the session's event subscription and its pending waits.
	close(): void
}

export class ControlService {
	private readonly intakes: ControlIntakes

	constructor(private readonly deps: ControlServiceDeps) {
		this.intakes = new ControlIntakes(deps)
	}

	openSession(context: ControlContext, sink: ControlSink): ControlSession {
		return new Session(this.deps, this.intakes, context, sink)
	}
}

type ItemMethod = 'queue.pause' | 'queue.resume' | 'queue.cancel' | 'queue.retry' | 'queue.remove'

interface ItemCommand {
	// Statuses the command applies to; any other answers invalid_state.
	from: ReadonlySet<QueueItemStatus>
	run(queue: ControlQueue, itemId: string): ReturnType<ControlQueue['pause']>
}

const LIVE: QueueItemStatus[] = ['probing', 'needs-choice', 'pending', 'running', 'paused-held', 'paused-active']
const ITEM_COMMANDS: Record<ItemMethod, ItemCommand> = {
	'queue.pause': {from: new Set(['pending', 'running']), run: (queue, itemId) => queue.pause(itemId)},
	'queue.resume': {from: new Set(['paused-held', 'paused-active']), run: (queue, itemId) => queue.resume(itemId)},
	'queue.cancel': {from: new Set(LIVE), run: (queue, itemId) => queue.cancel(itemId)},
	'queue.retry': {from: new Set(['error', 'cancelled']), run: (queue, itemId) => queue.retry(itemId)},
	// A running download is cancelled first, as in the window.
	'queue.remove': {from: new Set([...LIVE.filter(status => status !== 'running'), 'done', 'error', 'cancelled']), run: (queue, itemId) => queue.remove(itemId)}
}

// No longer moving on its own: it needs someone, or it ended.
const ITEM_SETTLED: ReadonlySet<QueueItemStatus> = new Set(['needs-choice', 'paused-held', 'paused-active', 'done', 'error', 'cancelled'])

class Session implements ControlSession {
	private readonly closing = new AbortController()
	private subscription: ControlFeedSubscription | null = null

	constructor(
		private readonly deps: ControlServiceDeps,
		private readonly intakes: ControlIntakes,
		private readonly context: ControlContext,
		private readonly sink: ControlSink
	) {}

	async handle(request: ControlRequest): Promise<ControlResponse> {
		if (this.closing.signal.aborted) return {ok: false, error: controlError('internal', 'This session is closed.')}
		if (!this.context.rules.includes('trusted')) return {ok: false, error: controlError('unauthorized', 'This client may not use the Control API.')}
		try {
			const result = parseControlResult(request.method, await this.dispatch(request))
			if (result.success) return {ok: true, result: result.data}
			logger.error('a Control API result did not match its schema', {method: request.method, issues: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)})
		} catch (error) {
			if (error instanceof ControlFailure) return {ok: false, error: error.error}
			logger.error('a Control API request failed', {method: request.method, error: error instanceof Error ? error.message : String(error)})
		}
		return {ok: false, error: internalError()}
	}

	close(): void {
		this.closing.abort()
		this.subscription?.close()
		this.subscription = null
	}

	// Answers the method's result, unchecked: handle checks it.
	private async dispatch(request: ControlRequest): Promise<unknown> {
		switch (request.method) {
			case 'hello':
			case 'auth':
				throw controlFailure('invalid_state', 'The handshake is already done.')
			case 'status':
				return this.deps.status.current()
			case 'profiles.list':
				return this.profiles()
			case 'queue.list':
				return queuePage(this.deps.queue.snapshot(), item => this.view(item), request.params)
			case 'queue.get':
				return {item: this.view(this.item(request.params.itemId))}
			case 'intake.get':
				return {intake: intakeView(this.intakes.record(request.params.intakeId))}
			case 'wait':
				return this.wait(request.params)
			case 'links.add':
				return this.intakes.add(this.context.clientId, request.params)
			case 'intake.choose':
				return this.intakes.choose(request.params)
			case 'intake.retry':
				return this.intakes.retry(request.params)
			case 'intake.cancel':
				return this.intakes.cancel(request.params)
			case 'queue.pause':
			case 'queue.resume':
			case 'queue.cancel':
			case 'queue.retry':
				return {item: await this.itemCommand(request.method, request.params.itemId)}
			case 'queue.remove':
				await this.itemCommand(request.method, request.params.itemId)
				return {itemId: request.params.itemId}
			case 'queue.pauseAll':
				return bulkResult(await this.deps.queue.pauseAll())
			case 'queue.resumeAll':
				return bulkResult(await this.deps.queue.resumeAll())
			case 'events.subscribe':
				// Subscribing again starts over with a fresh feed, as after events.resync.
				this.subscription?.close()
				this.subscription = this.deps.feed.subscribe(this.sink, {context: this.context, snapshot: request.params.snapshot ?? true})
				return {bootId: this.deps.registry.bootId}
			case 'events.unsubscribe':
				this.subscription?.close()
				this.subscription = null
				return {}
		}
	}

	private async profiles(): Promise<ControlResult<'profiles.list'>> {
		const settings = await this.deps.settings()
		const profiles = enabledDownloadProfiles(settings.profiles).map(profile => profileView(profile, this.deps.profileName(profile)))
		return {profiles, active: activeProfileRef(settings, this.deps.intake.windowProfile())}
	}

	private view(item: QueueItem): QueueItemView {
		return queueItemView(item, {clientLabel: clientId => this.deps.clientLabel(clientId), errorText: kind => this.deps.errorText(kind), pathsRead: this.context.rules.includes('paths.read')})
	}

	private find(itemId: string): QueueItem | undefined {
		return this.deps.queue.snapshot().find(item => item.id === itemId)
	}

	private item(itemId: string): QueueItem {
		const item = this.find(itemId)
		if (!item) throw controlFailure('not_found', 'No queue item has that id.')
		return item
	}

	// Refused up front by status, so a refusal is invalid_state with the
	// item's own status, not whatever the queue's message says.
	private async itemCommand(method: ItemMethod, itemId: string): Promise<QueueItemView> {
		const before = this.item(itemId)
		const command = ITEM_COMMANDS[method]
		if (!command.from.has(before.status)) throw controlFailure('invalid_state', `The item is ${this.view(before).status}; ${method} does not apply to it.`)
		// A probe failure has no job to run again; its link is probed again instead.
		if (method === 'queue.retry' && before.job.kind === 'unresolved') throw controlFailure('invalid_state', 'The item failed before it had a job; retry its intake with intake.retry.')
		const done = await command.run(this.deps.queue, itemId)
		if (!done.ok) throw new ControlFailure(controlErrorForApp(done.error))
		const after = this.find(itemId)
		if (after) return this.view(after)
		// A placeholder's cancel drops its row.
		return {...this.view(before), status: 'cancelled'}
	}

	private async wait(params: ControlParams<'wait'>): Promise<ControlResult<'wait'>> {
		const subscribe = (onChange: () => void): (() => void) => {
			const stops = [this.deps.registry.onChange(() => onChange()), this.deps.queue.onChange(onChange)]
			return () => {
				for (const stop of stops) stop()
			}
		}
		if (params.intakeId !== undefined) {
			const {intakeId, until} = params
			const end = await waitFor({read: () => this.deps.registry.get(intakeId), reached: record => this.intakeReached(record, until), subscribe}, params.timeoutMs, this.closing.signal)
			return waitResult(end, record => ({kind: 'intake', intake: intakeView(record)}))
		}
		const {itemId, until} = params
		const end = await waitFor({read: () => this.find(itemId), reached: item => (until === 'done' ? item.status === 'done' : ITEM_SETTLED.has(item.status)), subscribe}, params.timeoutMs, this.closing.signal)
		return waitResult(end, item => ({kind: 'item', item: this.view(item)}))
	}

	// `done`: queued, and none of its rows left in the queue is unfinished. A
	// done row may already be gone (auto-remove), so a row the queue no longer
	// holds counts as finished.
	private intakeReached(record: IntakeRecord, until: 'settled' | 'done'): boolean {
		const {state} = record
		if (until === 'settled') return state.state !== 'probing'
		if (state.state !== 'queued') return false
		const rows = new Map(this.deps.queue.snapshot().map(item => [item.id, item.status]))
		return state.itemIds.every(itemId => (rows.get(itemId) ?? 'done') === 'done')
	}
}

function waitResult<T>(end: WaitEnd<T>, target: (value: T) => ControlResult<'wait'>['target']): ControlResult<'wait'> {
	switch (end.kind) {
		case 'reached':
		case 'timeout':
			return {reached: end.kind === 'reached', target: target(end.target)}
		case 'gone':
			throw controlFailure('not_found', 'No intake or queue item has that id now.')
		case 'aborted':
			throw controlFailure('internal', 'The session closed while waiting.')
	}
}

function bulkResult(result: QueueSchedulerCommandResult): ControlResult<'queue.pauseAll'> {
	return {scheduler: result.scheduler, done: result.done, failed: result.failed.map(({itemId, error}) => ({itemId, code: controlErrorForApp(error).code}))}
}
