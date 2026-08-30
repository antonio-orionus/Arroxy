import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type {ProfileKind} from './journeys.js'

export interface ProvisionOptions {
	kind: ProfileKind
	baseDir: string
	/** Populated profile to clone for the `warm` kind. */
	warmSource?: string
	/** Profile written by the previous release, for the `inherited` kind. */
	inheritedSource?: string
}

/**
 * ProbeVerdictCache keys on mtime, so a copy that does not preserve it silently
 * invalidates the exact cache under test and forces a re-probe — this corrupted
 * the first five "warm" runs of the original startup investigation. `cp -R` is
 * therefore never acceptable here.
 */
export function copyProfilePreservingMtime(from: string, to: string): void {
	fs.mkdirSync(path.dirname(to), {recursive: true})
	if (process.platform === 'darwin') {
		execFileSync('ditto', [from, to])
		return
	}
	if (process.platform === 'win32') {
		// robocopy exits 1 on "files copied", which is success, not failure.
		try {
			execFileSync('robocopy', [from, to, '/E', '/COPYALL', '/NFL', '/NDL', '/NJH', '/NJS'])
		} catch (err) {
			const status = (err as {status?: number}).status ?? 0
			if (status >= 8) throw err
		}
		return
	}
	execFileSync('cp', ['-a', `${from}/.`, to])
}

function freshDir(baseDir: string, name: string): string {
	const dir = path.join(baseDir, name)
	fs.rmSync(dir, {recursive: true, force: true})
	fs.mkdirSync(dir, {recursive: true})
	return dir
}

export async function provisionProfile(opts: ProvisionOptions): Promise<string> {
	// Every branch below is synchronous (fs, execFileSync); this await exists only
	// so throws here reject the returned promise instead of throwing synchronously,
	// matching what every caller (and the "requires warmSource" test) expects.
	await Promise.resolve()

	const {kind, baseDir} = opts

	if (kind === 'empty') return freshDir(baseDir, 'profile-empty')

	if (kind === 'corrupt') {
		const dir = freshDir(baseDir, 'profile-corrupt')
		fs.writeFileSync(path.join(dir, 'settings.json'), '{"common":')
		fs.writeFileSync(path.join(dir, 'queue.json'), 'not json at all')
		return dir
	}

	if (kind === 'warm') {
		if (!opts.warmSource) throw new Error('provisionProfile: warm kind requires warmSource')
		const dir = path.join(baseDir, 'profile-warm')
		fs.rmSync(dir, {recursive: true, force: true})
		copyProfilePreservingMtime(opts.warmSource, dir)
		dropCopiedLogs(dir)
		return dir
	}

	if (!opts.inheritedSource) throw new Error('provisionProfile: inherited kind requires inheritedSource')
	const dir = path.join(baseDir, 'profile-inherited')
	fs.rmSync(dir, {recursive: true, force: true})
	copyProfilePreservingMtime(opts.inheritedSource, dir)
	dropCopiedLogs(dir)
	return dir
}

/**
 * The log oracle must judge only the session under test. A copied profile
 * carries the seeding session's main.log — a stale "Warmup completed" from that
 * session would satisfy this session's oracle even if its own warmup never
 * logged — and for `inherited`, the previous release's warnings and errors would
 * pollute this build's verdict. electron-log recreates the file on demand.
 */
function dropCopiedLogs(dir: string): void {
	fs.rmSync(path.join(dir, 'logs'), {recursive: true, force: true})
}
