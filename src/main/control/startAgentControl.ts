// The way into the Control API from outside the app, behind the agentControl
// release flag: composes the Control service on the real queue and intake,
// starts the local socket with in-memory client approvals, and stops it on
// quit. With the flag off it returns before anything else: no socket folder,
// no socket or pipe, no control.json, and no clean-up of an earlier launch's.

import fs from 'node:fs/promises'
import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import type {ControlService} from './ControlService.js'
import {type ControlWiring, createControlService} from './createControlService.js'
import type {ControlSocketLog} from './socket/controlConnection.js'
import {errnoCode} from './socket/errnoCode.js'
import {MemoryLocalClientApprovals} from './socket/localClientApprovals.js'
import {type ControlSocket, type ControlSocketOptions, startControlSocket} from './socket/startControlSocket.js'

// How often the socket's path is checked. macOS deletes what sits in /tmp
// unused for days; a socket whose path is gone can no longer be reached.
const SOCKET_CHECK_INTERVAL_MS = 60 * 60_000
// How long a quit waits for the socket to close and control.json to go.
const QUIT_STOP_BUDGET_MS = 2000

export interface AgentControlDeps extends Omit<ControlWiring, 'clientLabel' | 'createFeed'> {
	readonly userDataDir: string
	readonly appVersion: string
	readonly platform: NodeJS.Platform
	readonly env: Readonly<Record<string, string | undefined>>
	// Allow every client at once: E2E runs only (the e2eHarness gate).
	readonly autoAllowClients: boolean
	readonly log: ControlSocketLog
	// Tests replace these.
	readonly compose?: (wiring: ControlWiring) => {service: Pick<ControlService, 'openSession'>; registry: {readonly bootId: string}}
	readonly startSocket?: (options: ControlSocketOptions) => Promise<ControlSocket | null>
	readonly socketCheckIntervalMs?: number
}

export interface AgentControl {
	stop(): Promise<void>
}

// Clients are allowed at once only in an E2E run of an unpackaged build, so
// a packaged build never approves on its own, whatever its environment.
export function autoAllowsClients(gate: {readonly e2eHarness: boolean; readonly isPackaged: boolean}): boolean {
	return gate.e2eHarness && !gate.isPackaged
}

// For logs: the errno code, else the error's name; never the message, which can carry paths.
function failureCode(error: unknown): string {
	return errnoCode(error) ?? (error instanceof Error ? error.name : 'unknown')
}

export async function startAgentControl(deps: AgentControlDeps): Promise<AgentControl | null> {
	if (!isReleaseFlagOn('agentControl')) return null
	const {userDataDir, appVersion, platform, env, autoAllowClients, log, compose = createControlService, startSocket = startControlSocket, socketCheckIntervalMs = SOCKET_CHECK_INTERVAL_MS, ...wiring} = deps
	const approvals = new MemoryLocalClientApprovals({autoAllow: autoAllowClients})
	// Composed before the socket, which needs the service and the registry's
	// bootId to start. If the socket then fails, the composition stays: its
	// queue listeners and the onIntakeAdmission cap, once per launch. Bounded,
	// and inert, since without a socket no client adds an intake.
	const {service, registry} = compose({...wiring, clientLabel: clientId => approvals.label(clientId)})
	const listen = (): Promise<ControlSocket | null> => startSocket({userDataDir, appVersion, platform, env, service, approvals, bootId: registry.bootId, log})
	let socket = await listen()
	if (socket === null) return null
	let stopping: Promise<void> | null = null
	// A pipe has no path on disk to lose.
	const check =
		platform === 'win32'
			? null
			: setInterval(() => {
					if (relistening !== null || stopping !== null) return
					relistening = relistenIfGone()
						.catch((error: unknown) => log.error('the control socket could not listen again', {code: failureCode(error)}))
						.finally(() => (relistening = null))
				}, socketCheckIntervalMs)
	check?.unref()
	// The check under way, which stop waits for.
	let relistening: Promise<void> | null = null
	// Listens afresh when the path is gone, and again at each check after a
	// failed attempt left no socket.
	const relistenIfGone = async (): Promise<void> => {
		const current = socket
		if (current !== null) {
			if (await pathExists(current.socketPath)) return
			log.warn('the control socket was deleted; listening again', {socketPath: current.socketPath})
			socket = null
			await current.stop()
		}
		const next = await listen()
		if (stopping === null) socket = next
		else await next?.stop()
	}
	return {
		stop: () => {
			stopping ??= (async () => {
				if (check !== null) clearInterval(check)
				// A re-listen under way stops what it made once it sees stopping.
				await relistening
				await socket?.stop()
				socket = null
			})()
			return stopping
		}
	}
}

async function pathExists(target: string): Promise<boolean> {
	try {
		await fs.lstat(target)
		return true
	} catch (error) {
		return errnoCode(error) !== 'ENOENT'
	}
}

interface QuitEvent {
	preventDefault(): void
}

// Electron's app, as far as quitting goes.
export interface QuitHooks {
	on(event: 'before-quit', listener: (event: QuitEvent) => void): unknown
	on(event: 'will-quit', listener: (event: QuitEvent) => void): unknown
	exit(code: number): void
}

// Starts stopping as the quit begins, then holds the quit at will-quit until
// the socket is closed and control.json deleted (or the budget runs out). A
// quit that ends in app.exit (downloads still running) skips will-quit; the
// next launch removes what is left.
export function stopAgentControlOnQuit(app: QuitHooks, starting: Promise<AgentControl | null>, log: ControlSocketLog): void {
	let control: AgentControl | null = null
	let quitting = false
	let stopped: Promise<void> | null = null
	const stop = (running: AgentControl): Promise<void> => (stopped ??= running.stop())
	void starting
		.then(started => {
			control = started
			if (quitting && started !== null) void stop(started)
		})
		.catch((error: unknown) => log.error('agent control could not start', {code: failureCode(error)}))
	app.on('before-quit', () => {
		quitting = true
		if (control !== null) void stop(control)
	})
	app.on('will-quit', event => {
		const running = control
		if (running === null) return
		control = null
		event.preventDefault()
		const settled = stop(running).then(
			() => true,
			(error: unknown) => {
				log.warn('agent control did not stop cleanly', {code: failureCode(error)})
				return true
			}
		)
		const budget = new Promise<false>(resolve => setTimeout(() => resolve(false), QUIT_STOP_BUDGET_MS).unref())
		void Promise.race([settled, budget]).then(done => {
			if (!done) log.warn('agent control took too long to stop; quitting anyway', {budgetMs: QUIT_STOP_BUDGET_MS})
			app.exit(0)
		})
	})
}
