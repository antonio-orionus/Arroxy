// control.json, which tells a local client where the app listens and keys
// the handshake. It lives in userData (owner-only on every OS), is written
// owner-only through a temp file and a rename so a client never reads half of
// it, and is deleted on a clean quit. A launch after a crash removes the
// socket folder the old file names, but only one this app made.

import {randomBytes} from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import {CONTROL_DISCOVERY_FILE_NAME, type ControlDiscovery, controlDiscoverySchema} from 'arroxy-control'
import {errnoCode} from './errnoCode.js'
import {isOwnSocketDirName} from './socketPaths.js'

export async function writeDiscoveryFile(userDataDir: string, discovery: ControlDiscovery): Promise<void> {
	const target = path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME)
	const temp = `${target}.${randomBytes(6).toString('hex')}.tmp`
	const body = JSON.stringify(controlDiscoverySchema.parse(discovery))
	try {
		// `wx`: a file already at the temp name (a planted symlink) fails rather than being followed.
		await fs.writeFile(temp, body, {mode: 0o600, flag: 'wx'})
		await fs.rename(temp, target)
	} catch (error) {
		await fs.rm(temp, {force: true})
		throw error
	}
}

// The file an earlier launch left, or null when there is none or it does not parse.
export async function readDiscoveryFile(userDataDir: string): Promise<ControlDiscovery | null> {
	let text: string
	try {
		text = await fs.readFile(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), 'utf8')
	} catch {
		return null
	}
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return null
	}
	const parsed = controlDiscoverySchema.safeParse(raw)
	return parsed.success ? parsed.data : null
}

// Deletes control.json while it still names this launch's socket (a fresh
// folder or pipe name each launch), so a late stop never deletes a newer
// launch's file.
export async function deleteDiscoveryFile(userDataDir: string, socketPath: string): Promise<void> {
	const current = await readDiscoveryFile(userDataDir)
	if (current?.socketPath === socketPath) await fs.rm(path.join(userDataDir, CONTROL_DISCOVERY_FILE_NAME), {force: true})
}

export type StaleSocketDirCleanup = {readonly status: 'removed'} | {readonly status: 'gone'} | {readonly status: 'refused'; readonly reason: string}

// Removes the folder holding an earlier launch's socket when it is ours: a
// launch-folder name right under `baseDir`, a real directory (lstat, so a
// symlink is never followed) owned by `uid`. Anything else stays.
export async function removeStaleSocketDir(socketPath: string, baseDir: string, uid: number): Promise<StaleSocketDirCleanup> {
	const dir = path.posix.dirname(socketPath)
	if (!isOwnSocketDirName(dir, baseDir)) return {status: 'refused', reason: `${dir} is not a launch folder under ${baseDir}`}
	let stat: Awaited<ReturnType<typeof fs.lstat>>
	try {
		stat = await fs.lstat(dir)
	} catch (error) {
		if (errnoCode(error) === 'ENOENT') return {status: 'gone'}
		return {status: 'refused', reason: `${dir} could not be checked (${errnoCode(error) ?? 'unknown error'})`}
	}
	if (!stat.isDirectory()) return {status: 'refused', reason: `${dir} is not a folder`}
	if (stat.uid !== uid) return {status: 'refused', reason: `${dir} belongs to another user`}
	// fs.rm removes symlinks inside without following them.
	await fs.rm(dir, {recursive: true, force: true})
	return {status: 'removed'}
}
