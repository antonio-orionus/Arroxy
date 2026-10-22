// The way into the Control API from outside the app, behind the agentControl
// release flag: loads the allowed local clients and shows them to the window,
// composes the Control service on the real queue and intake, starts the local
// socket, and stops it on quit. With the flag off it returns before anything
// else: no socket folder, no socket or pipe, no control.json, no clean-up of
// an earlier launch's, no local clients file read or written, and no
// local-clients IPC.

import fs from 'node:fs/promises'
import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import {LocalClientRegistry} from './clients/LocalClientRegistry.js'
import type {LocalClientStore} from './clients/localClientStore.js'
import {e2eTestSecretCipher, type SecretCipher} from './clients/secretCipher.js'
import type {ControlService} from './ControlService.js'
import {type ControlWiring, createControlService} from './createControlService.js'
import type {ControlSocketLog} from './socket/controlConnection.js'
import {errnoCode, failureCode} from './socket/errnoCode.js'
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
	// The allowed local clients, kept between launches.
	readonly clientStore: LocalClientStore
	// Whether a client's secret can be stored encrypted right now.
	readonly secretsStorable: () => boolean
	// The window's local-clients IPC, registered before this starts.
	readonly localClients: LocalClientsHolder
	readonly log: ControlSocketLog
	// Tests replace these.
	readonly compose?: (wiring: ControlWiring) => {service: Pick<ControlService, 'openSession'>; registry: {readonly bootId: string}}
	readonly startSocket?: (options: ControlSocketOptions) => Promise<ControlSocket | null>
	readonly socketCheckIntervalMs?: number
}

// What the window's local-clients IPC answers from: the loaded clients while
// agent control runs; empty before they load and after it stops or fails to
// start, when every request answers not_running.
export interface LocalClientsHolder {
	set(clients: LocalClientRegistry): void
	clear(): void
}

export interface AgentControl {
	stop(): Promise<void>
}

interface LaunchGate {
	readonly e2eHarness: boolean
	readonly isPackaged: boolean
}

// An E2E run of an unpackaged build. A packaged build is never one, whatever
// its environment.
function isUnpackagedE2eRun(gate: LaunchGate): boolean {
	return gate.e2eHarness && !gate.isPackaged
}

// Set to 1 by an E2E spec that answers each request itself, through the
// window's IPC, as the user would. Read only in an unpackaged E2E run.
export const E2E_MANUAL_CLIENT_APPROVAL_VAR = 'ARROXY_E2E_MANUAL_CLIENT_APPROVAL'

// Clients are allowed at once only in an unpackaged E2E run that does not
// answer requests itself, so a packaged build never approves on its own.
export function autoAllowsClients(gate: LaunchGate, env: Readonly<Record<string, string | undefined>>): boolean {
	return isUnpackagedE2eRun(gate) && env[E2E_MANUAL_CLIENT_APPROVAL_VAR] !== '1'
}

// What encrypts the local clients' secrets: the marked test cipher in an
// unpackaged E2E run (no keychain dialog, no keyring on Linux CI), the
// platform's everywhere else.
export function localClientCipher(gate: LaunchGate, platformCipher: () => SecretCipher): SecretCipher {
	return isUnpackagedE2eRun(gate) ? e2eTestSecretCipher : platformCipher()
}

export async function startAgentControl(deps: AgentControlDeps): Promise<AgentControl | null> {
	if (!isReleaseFlagOn('agentControl')) return null
	const {userDataDir, appVersion, platform, env, autoAllowClients, clientStore, secretsStorable, localClients, log, compose = createControlService, startSocket = startControlSocket, socketCheckIntervalMs = SOCKET_CHECK_INTERVAL_MS, ...wiring} = deps
	// Before the socket listens, so a known client is let in from the first connection.
	const approvals = await LocalClientRegistry.load({store: clientStore, secretsStorable, log, autoAllow: autoAllowClients})
	// On stop, and on any failure from here on: the window is told not_running, and no timer stays behind.
	const release = async (): Promise<void> => {
		localClients.clear()
		await approvals.close()
	}
	// Composed before the socket, which needs the service and the registry's
	// bootId to start. If the socket then fails, the composition stays: its
	// queue listeners and the onIntakeAdmission cap, once per launch. Bounded,
	// and inert, since without a socket no client adds an intake.
	let listen: () => Promise<ControlSocket | null>
	let socket: ControlSocket | null
	try {
		const {service, registry} = compose({...wiring, clientLabel: clientId => approvals.label(clientId)})
		// Before the socket too, so the window hears the first request.
		localClients.set(approvals)
		listen = () => startSocket({userDataDir, appVersion, platform, env, service, approvals, bootId: registry.bootId, log})
		socket = await listen()
	} catch (error) {
		await release()
		throw error
	}
	if (socket === null) {
		await release()
		return null
	}
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
				await release()
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
