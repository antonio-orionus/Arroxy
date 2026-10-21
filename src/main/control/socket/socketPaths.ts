// Where the control socket listens. A Unix socket path must fit sun_path
// (104 bytes on macOS, 108 on Linux), and userData or os.tmpdir() is already
// longer than that in a dev worktree, so each launch makes a fresh 0700
// folder under a short, fixed base. Windows uses a named pipe with a random
// name per launch. Pure: env and platform come in, so every OS is tested on
// every OS.

import path from 'node:path'

// Node accepts a path that fills sun_path with no NUL; other clients (Python,
// Go, C) may need room for one, hence a margin under the smallest limit.
export const SOCKET_PATH_MAX_BYTES = 100
export const SOCKET_DIR_PREFIX = 'arroxy-'
const SOCKET_FILE_NAME = 'control.sock'
const PIPE_PREFIX = '\\\\.\\pipe\\arroxy-control-'
const FALLBACK_BASE = '/tmp'
// fs.mkdtemp appends six characters from this set.
const SOCKET_DIR_NAME = /^arroxy-[A-Za-z0-9]{6}$/
const FLATPAK_ID = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/

export type ControlEndpointPlan = {readonly kind: 'pipe'} | {readonly kind: 'unix'; readonly baseDir: string} | {readonly kind: 'unavailable'; readonly reason: string}

type Env = Readonly<Record<string, string | undefined>>

export function controlEndpointPlan(platform: NodeJS.Platform, env: Env): ControlEndpointPlan {
	if (platform === 'win32') return {kind: 'pipe'}
	// macOS and the rest: /tmp, never os.tmpdir(), which dev runs point inside the checkout.
	if (platform !== 'linux') return {kind: 'unix', baseDir: FALLBACK_BASE}
	const runtimeDir = absolute(env.XDG_RUNTIME_DIR)
	const flatpakId = env.FLATPAK_ID
	if (flatpakId !== undefined && flatpakId !== '') {
		// Inside the sandbox only $XDG_RUNTIME_DIR/app/<id> is visible to the host;
		// /tmp and the rest of the runtime dir are private to it.
		if (!FLATPAK_ID.test(flatpakId)) return {kind: 'unavailable', reason: `FLATPAK_ID ${JSON.stringify(flatpakId)} is not an app id`}
		if (runtimeDir === undefined) return {kind: 'unavailable', reason: 'XDG_RUNTIME_DIR is not set inside the Flatpak sandbox'}
		return {kind: 'unix', baseDir: path.posix.join(runtimeDir, 'app', flatpakId)}
	}
	return {kind: 'unix', baseDir: runtimeDir ?? FALLBACK_BASE}
}

export function socketPathIn(socketDir: string): string {
	return path.posix.join(socketDir, SOCKET_FILE_NAME)
}

export function fitsSocketPath(socketPath: string): boolean {
	return Buffer.byteLength(socketPath) <= SOCKET_PATH_MAX_BYTES
}

// `randomHex`: 16 hex characters, new each launch and on EADDRINUSE.
export function pipePath(randomHex: string): string {
	return `${PIPE_PREFIX}${randomHex}`
}

// Whether a socket folder from an earlier launch is one this app made: a
// mkdtemp name right under the base. The folder itself is checked on disk
// separately (removeStaleSocketDir).
export function isOwnSocketDirName(socketDir: string, baseDir: string): boolean {
	if (path.posix.normalize(socketDir) !== socketDir) return false
	return path.posix.dirname(socketDir) === path.posix.resolve(baseDir) && SOCKET_DIR_NAME.test(path.posix.basename(socketDir))
}

function absolute(value: string | undefined): string | undefined {
	return value !== undefined && path.posix.isAbsolute(value) ? path.posix.resolve(value) : undefined
}
