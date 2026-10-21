// The local entry point to the Control API: a Unix socket in a fresh 0700
// folder per launch (a named pipe on Windows), and control.json in userData
// naming it with this launch's token. Start-up first removes what a crashed
// launch left, if it is ours; stop closes every connection and the server,
// removes the folder and deletes control.json. Nothing here throws: a socket
// that cannot start is logged and the app runs without it.

import {randomBytes} from 'node:crypto'
import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import type {ControlService} from '../ControlService.js'
import {type ControlSocketLog, serveControlConnection} from './controlConnection.js'
import {errnoCode} from './errnoCode.js'
import {deleteDiscoveryFile, readDiscoveryFile, removeStaleSocketDir, writeDiscoveryFile} from './discoveryFile.js'
import type {LocalClientApprovals} from './localClientApprovals.js'
import {type ControlEndpointPlan, controlEndpointPlan, fitsSocketPath, pipePath, SOCKET_DIR_PREFIX, SOCKET_PATH_MAX_BYTES, socketPathIn} from './socketPaths.js'

// Connections open at once, authenticated or not. A handshake ends within
// 2 s, so this only stops a runaway local script from exhausting descriptors.
const CONTROL_SOCKET_MAX_CONNECTIONS = 32
// Fresh pipe names tried when one is taken.
const PIPE_NAME_ATTEMPTS = 3

export interface ControlSocketOptions {
	readonly userDataDir: string
	readonly appVersion: string
	readonly platform: NodeJS.Platform
	readonly env: Readonly<Record<string, string | undefined>>
	readonly service: Pick<ControlService, 'openSession'>
	readonly approvals: LocalClientApprovals
	// The intake registry's bootId; a client resyncs when it changes.
	readonly bootId: string
	readonly log: ControlSocketLog
	readonly now?: () => number
	// Tests shorten it; the protocol fixes it.
	readonly handshakeTimeoutMs?: number
}

export interface ControlSocket {
	readonly socketPath: string
	stop(): Promise<void>
}

interface Listening {
	readonly server: net.Server
	readonly socketPath: string
	// The launch folder to remove on stop; none for a pipe.
	readonly socketDir: string | null
}

export async function startControlSocket(options: ControlSocketOptions): Promise<ControlSocket | null> {
	const {log, userDataDir} = options
	const plan = controlEndpointPlan(options.platform, options.env)
	await clearPreviousLaunch(userDataDir, plan, log)
	if (plan.kind === 'unavailable') {
		log.error('the control socket is off', {reason: plan.reason})
		return null
	}
	const token = randomBytes(32).toString('base64url')
	const sockets = new Set<net.Socket>()
	const server = net.createServer(socket => {
		sockets.add(socket)
		socket.on('close', () => sockets.delete(socket))
		const {appVersion, bootId, approvals, service, handshakeTimeoutMs} = options
		serveControlConnection(socket, {token, appVersion, bootId, approvals, service, log, ...(handshakeTimeoutMs === undefined ? {} : {handshakeTimeoutMs})})
	})
	server.maxConnections = CONTROL_SOCKET_MAX_CONNECTIONS
	let listening: Listening | null = null
	try {
		listening = plan.kind === 'pipe' ? await listenOnPipe(server) : await listenInFreshDir(server, plan.baseDir, log)
		if (listening === null) return null
		server.on('error', error => log.error('the control socket failed', {code: errnoCode(error)}))
		await writeDiscoveryFile(userDataDir, {socketPath: listening.socketPath, token, version: options.appVersion, startedAt: (options.now ?? Date.now)()})
	} catch (error) {
		log.error('the control socket could not start', {code: errnoCode(error), message: error instanceof Error ? error.message : String(error)})
		await close(server, sockets, listening?.socketDir ?? null)
		return null
	}
	log.info('the control socket is listening', {socketPath: listening.socketPath})
	const {socketPath, socketDir} = listening
	let stopping: Promise<void> | null = null
	return {
		socketPath,
		stop: () => {
			stopping ??= (async () => {
				await deleteDiscoveryFile(userDataDir, socketPath).catch((error: unknown) => log.warn('control.json could not be deleted', {code: errnoCode(error)}))
				await close(server, sockets, socketDir)
			})()
			return stopping
		}
	}
}

// Removes the socket folder an earlier launch's control.json names, when it
// is ours, then that control.json, so a failed start leaves nothing stale.
async function clearPreviousLaunch(userDataDir: string, plan: ControlEndpointPlan, log: ControlSocketLog): Promise<void> {
	const previous = await readDiscoveryFile(userDataDir)
	if (previous === null) return
	if (plan.kind === 'unix' && process.getuid) {
		const cleanup = await removeStaleSocketDir(previous.socketPath, plan.baseDir, process.getuid()).catch((error: unknown) => ({status: 'refused' as const, reason: `removal failed (${errnoCode(error) ?? 'unknown error'})`}))
		if (cleanup.status === 'refused') log.warn('an earlier control socket folder was left in place', {reason: cleanup.reason})
	}
	await deleteDiscoveryFile(userDataDir, previous.socketPath).catch((error: unknown) => log.warn('an earlier control.json could not be deleted', {code: errnoCode(error)}))
}

async function listenInFreshDir(server: net.Server, baseDir: string, log: ControlSocketLog): Promise<Listening | null> {
	// mkdtemp makes the folder 0700 with a random name, atomically.
	const socketDir = await fs.mkdtemp(path.posix.join(baseDir, SOCKET_DIR_PREFIX))
	const socketPath = socketPathIn(socketDir)
	if (!fitsSocketPath(socketPath)) {
		log.error('the control socket is off: its path is too long', {bytes: Buffer.byteLength(socketPath), max: SOCKET_PATH_MAX_BYTES})
		await fs.rm(socketDir, {recursive: true, force: true})
		return null
	}
	try {
		await listen(server, socketPath)
		// The 0700 folder covers the moment before this.
		await fs.chmod(socketPath, 0o600)
	} catch (error) {
		await fs.rm(socketDir, {recursive: true, force: true})
		throw error
	}
	return {server, socketPath, socketDir}
}

// A name another user already holds answers EADDRINUSE; take a new one.
async function listenOnPipe(server: net.Server): Promise<Listening> {
	for (let attempt = 1; ; attempt++) {
		const socketPath = pipePath(randomBytes(8).toString('hex'))
		try {
			await listen(server, socketPath)
			return {server, socketPath, socketDir: null}
		} catch (error) {
			if (errnoCode(error) !== 'EADDRINUSE' || attempt >= PIPE_NAME_ATTEMPTS) throw error
		}
	}
}

function listen(server: net.Server, socketPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const onError = (error: Error): void => reject(error)
		server.once('error', onError)
		server.listen(socketPath, () => {
			server.off('error', onError)
			resolve()
		})
	})
}

async function close(server: net.Server, sockets: Set<net.Socket>, socketDir: string | null): Promise<void> {
	for (const socket of sockets) socket.destroy()
	if (server.listening) await new Promise<void>(resolve => server.close(() => resolve()))
	if (socketDir !== null) await fs.rm(socketDir, {recursive: true, force: true})
}
