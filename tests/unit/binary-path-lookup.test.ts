import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {whereOnPath} from '@main/services/binary/BinaryProbe.js'

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!

function setPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

afterEach(() => {
	Object.defineProperty(process, 'platform', originalPlatformDescriptor)
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
	vi.useRealTimers()
})

// A name no fallback location holds, so only PATH can produce a match.
const name = `arroxy-path-lookup-test${process.platform === 'win32' ? '.exe' : ''}`

async function pathDir(withBinary: boolean): Promise<string> {
	const dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'bm-path-lookup-')))
	if (withBinary) {
		await fs.writeFile(path.join(dir, name), 'fake binary')
		await fs.chmod(path.join(dir, name), 0o755)
	}
	return dir
}

function stubPath(...dirs: string[]): void {
	vi.stubEnv('PATH', dirs.join(path.delimiter))
}

function enoent(): NodeJS.ErrnoException {
	return Object.assign(new Error('ENOENT: no such file or directory'), {code: 'ENOENT'})
}

describe('whereOnPath', () => {
	it('returns every runnable match on PATH, in PATH order', async () => {
		const first = await pathDir(true)
		const empty = await pathDir(false)
		const last = await pathDir(true)
		stubPath(first, empty, last)

		await expect(whereOnPath(name)).resolves.toEqual([path.join(first, name), path.join(last, name)])
	})

	it('skips a directory that carries the binary name', async () => {
		const decoy = await pathDir(false)
		await fs.mkdir(path.join(decoy, name))
		const real = await pathDir(true)
		stubPath(decoy, real)

		await expect(whereOnPath(name)).resolves.toEqual([path.join(real, name)])
	})

	it.skipIf(process.platform === 'win32')('skips a file without the execute bit', async () => {
		const plain = await pathDir(true)
		await fs.chmod(path.join(plain, name), 0o644)
		stubPath(plain)

		await expect(whereOnPath(name)).resolves.toEqual([])
	})

	// `where.exe` searches the working directory before PATH, and a relative or
	// empty PATH entry resolves against it: either lets a binary planted next to
	// the process shadow the real one.
	it('ignores relative and empty PATH entries', async () => {
		setPlatform('linux') // no fallback locations to match
		stubPath('', 'bin', `.${path.sep}tools`)
		// Every candidate "exists", so any match would come from those entries.
		vi.spyOn(fs, 'stat').mockResolvedValue({isFile: () => true} as Awaited<ReturnType<typeof fs.stat>>)
		vi.spyOn(fs, 'access').mockResolvedValue(undefined)

		await expect(whereOnPath(name)).resolves.toEqual([])
	})

	it('quotes around a PATH entry do not hide its binaries', async () => {
		const dir = await pathDir(true)
		stubPath(`"${dir}"`)

		await expect(whereOnPath(name)).resolves.toEqual([path.join(dir, name)])
	})

	// App Execution Aliases (WindowsApps\winget.exe) are reparse points that
	// fs.stat refuses with EACCES even though Windows launches them; fs.access
	// still sees them. Measured on Windows 11 25H2.
	it('accepts a Windows App Execution Alias that stat refuses', async () => {
		setPlatform('win32')
		const aliasDir = path.join(os.tmpdir(), 'WindowsApps')
		const alias = path.join(aliasDir, 'winget.exe')
		stubPath(aliasDir)
		vi.spyOn(fs, 'stat').mockImplementation(async candidate => {
			if (candidate === alias) throw Object.assign(new Error('EACCES: permission denied'), {code: 'EACCES'})
			throw enoent()
		})
		vi.spyOn(fs, 'access').mockImplementation(async candidate => {
			if (candidate !== alias) throw enoent()
		})

		await expect(whereOnPath('winget.exe')).resolves.toEqual([alias])
	})

	it('stops waiting on a stalled PATH entry and keeps the matches that answered', async () => {
		vi.useFakeTimers()
		const stalled = path.join(os.tmpdir(), 'offline-share')
		const healthy = path.join(os.tmpdir(), 'healthy')
		stubPath(stalled, healthy)
		vi.spyOn(fs, 'stat').mockImplementation(async candidate => {
			if (String(candidate).startsWith(stalled)) return new Promise<never>(() => {})
			if (candidate === path.join(healthy, name)) return {isFile: () => true} as Awaited<ReturnType<typeof fs.stat>>
			throw enoent()
		})
		vi.spyOn(fs, 'access').mockImplementation(async candidate => {
			if (candidate !== path.join(healthy, name)) throw enoent()
		})

		const lookup = whereOnPath(name)
		await vi.advanceTimersByTimeAsync(10_000)

		await expect(lookup).resolves.toEqual([path.join(healthy, name)])
	})

	// A stat on an unreachable share holds one of libuv's four threadpool workers
	// for the SMB timeout (21s measured). Five such entries ahead of a local one
	// returned nothing and stalled an unrelated stat for 20.8s on Windows 11.
	it.runIf(process.platform === 'win32')('checks network PATH entries one at a time so local ones still answer', async () => {
		vi.useFakeTimers()
		const shares = [1, 2, 3, 4, 5].map(host => `\\\\192.0.2.${host}\\offline-share`)
		const local = path.join(os.tmpdir(), 'local-bin')
		stubPath(...shares, local)
		const stalled: Array<() => void> = []
		vi.spyOn(fs, 'stat').mockImplementation(async candidate => {
			if (String(candidate).startsWith('\\\\')) return new Promise<never>((_, reject) => stalled.push(() => reject(enoent())))
			if (candidate === path.join(local, name)) return {isFile: () => true} as Awaited<ReturnType<typeof fs.stat>>
			throw enoent()
		})
		vi.spyOn(fs, 'access').mockImplementation(async candidate => {
			if (candidate !== path.join(local, name)) throw enoent()
		})

		const lookup = whereOnPath(name)
		await vi.advanceTimersByTimeAsync(10_000)

		await expect(lookup).resolves.toEqual([path.join(local, name)])
		expect(stalled).toHaveLength(1)
		for (const release of stalled) release()
	})

	it('stops waiting as soon as the caller aborts', async () => {
		const stalled = path.join(os.tmpdir(), 'offline-share')
		stubPath(stalled)
		vi.spyOn(fs, 'stat').mockImplementation(async () => new Promise<never>(() => {}))
		const controller = new AbortController()

		const lookup = whereOnPath(name, controller.signal)
		controller.abort()

		await expect(lookup).resolves.toEqual([])
	})

	// The Homebrew fallbacks are literal posix paths; on a Windows host they never
	// compare equal to a PATH entry joined with backslashes.
	it.skipIf(process.platform === 'win32')('appends platform fallback locations after PATH matches, without duplicates', async () => {
		setPlatform('darwin')
		const homebrew = path.posix.join('/opt/homebrew/bin', 'yt-dlp')
		const pipx = path.join(os.tmpdir(), 'pipx-bin')
		stubPath(pipx, '/opt/homebrew/bin')
		const present = new Set([path.join(pipx, 'yt-dlp'), homebrew])
		vi.spyOn(fs, 'stat').mockImplementation(async candidate => {
			if (present.has(String(candidate))) return {isFile: () => true} as Awaited<ReturnType<typeof fs.stat>>
			throw enoent()
		})
		vi.spyOn(fs, 'access').mockImplementation(async candidate => {
			if (!present.has(String(candidate))) throw enoent()
		})

		await expect(whereOnPath('yt-dlp')).resolves.toEqual([path.join(pipx, 'yt-dlp'), homebrew])
	})
})
