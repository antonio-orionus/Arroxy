import fs from 'node:fs/promises'
import path from 'node:path'
import {CONTROL_DISCOVERY_FILE_NAME, type ControlDiscovery, controlDiscoverySchema} from 'arroxy-control'

// The control.json Arroxy wrote into this userData folder, or null when there
// is none or it does not parse. Read fresh on every call, so an app restart
// (new token, new socket) needs no bridge restart.
export async function readDiscovery(userDataDir: string): Promise<ControlDiscovery | null> {
	let text: string
	try {
		text = await fs.readFile(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), 'utf8')
	} catch {
		return null
	}
	try {
		const parsed = controlDiscoverySchema.safeParse(JSON.parse(text))
		return parsed.success ? parsed.data : null
	} catch {
		return null
	}
}

// Whether the folder holding a Unix socket can be trusted: a real folder owned
// by this user and closed to everyone else. Another user
// who can write there could swap in a socket of their own. Windows pipe names
// have no folder; the handshake's server proof covers them.
// `gone`: the folder no longer exists (a control.json left behind by a reboot),
// so nothing can be listening there.
export type SocketDirCheck = {readonly status: 'trusted'} | {readonly status: 'gone'} | {readonly status: 'untrusted'; readonly reason: string}

export async function checkSocketDir(socketPath: string, platform: NodeJS.Platform): Promise<SocketDirCheck> {
	if (platform === 'win32') return {status: 'trusted'}
	const dir = path.dirname(socketPath)
	let stat: Awaited<ReturnType<typeof fs.lstat>>
	try {
		stat = await fs.lstat(dir)
	} catch (error) {
		const code = error instanceof Error && 'code' in error ? error.code : undefined
		if (code === 'ENOENT' || code === 'ENOTDIR') return {status: 'gone'}
		return {status: 'untrusted', reason: `${dir} could not be checked (${error instanceof Error ? error.message : String(error)})`}
	}
	if (!stat.isDirectory()) return {status: 'untrusted', reason: `${dir} is not a folder`}
	if (process.getuid !== undefined && stat.uid !== process.getuid()) return {status: 'untrusted', reason: `${dir} belongs to another user`}
	if ((stat.mode & 0o077) !== 0) return {status: 'untrusted', reason: `${dir} is open to other users (mode ${(stat.mode & 0o777).toString(8)})`}
	return {status: 'trusted'}
}
