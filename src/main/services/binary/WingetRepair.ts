import {execFile} from 'node:child_process'
import path from 'node:path'
import {promisify} from 'node:util'
import log from 'electron-log/main.js'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'
import {ffmpegPairOnPath, type FfmpegPairPaths} from './ffmpegPairOnPath.js'

const execFileAsync = promisify(execFile)
const logger = log.scope('winget-repair')
const WINGET_INSTALL_TIMEOUT_MS = 10 * 60 * 1000
const WINGET_ALREADY_INSTALLED_CODES = new Set([-1978335135, -1978334963, -1978335189, 2316632161, 2316632333, 2316632107])

// Gyan's full build: the static FFmpeg with the GPL codecs yt-dlp relies on,
// and ffprobe alongside. Its manifest has WinGet add the build's bin folder to
// PATH rather than link the tools into WinGet's Links folder.
const WINGET_FFMPEG_ID = 'Gyan.FFmpeg'

const PATH_REGISTRY_KEYS = ['HKCU\\Environment', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment'] as const

function isIdempotentWingetInstallExit(error: unknown): boolean {
	const code = (error as {code?: unknown}).code
	return typeof code === 'number' && WINGET_ALREADY_INSTALLED_CODES.has(code)
}

async function wingetInstall(packageId: string): Promise<void> {
	if (process.platform !== 'win32') {
		throw new Error('WinGet repair is only available on Windows.')
	}

	const wingetPath = await firstExecutable(await whereOnPath('winget.exe'))
	if (!wingetPath) {
		throw new Error('WinGet was not found. Install App Installer from Microsoft Store, then retry setup.')
	}

	logger.info('Installing with WinGet', {wingetPath, packageId})
	try {
		await execFileAsync(wingetPath, ['install', '--id', packageId, '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements'], {timeout: WINGET_INSTALL_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, windowsHide: true})
	} catch (error) {
		if (!isIdempotentWingetInstallExit(error)) throw error
		logger.info('WinGet reported the package is already installed', {wingetPath, packageId, code: (error as {code?: unknown}).code})
	}
}

// A package that adds a folder to PATH writes it to the registry, and this
// process keeps the PATH it started with until it restarts. Read the saved
// user and machine PATH instead. Absolute local entries only: unlike
// whereOnPath, nothing here bounds a stat on an unreachable network share.
async function savedPathDirectories(): Promise<string[]> {
	const values = await Promise.all(
		PATH_REGISTRY_KEYS.map(async key => {
			try {
				const {stdout} = await execFileAsync('reg.exe', ['query', key, '/v', 'Path'], {timeout: 10_000, windowsHide: true})
				return /^\s*Path\s+REG_(?:EXPAND_)?SZ\s+(.*)$/im.exec(stdout)?.[1]?.trim() ?? ''
			} catch {
				return ''
			}
		})
	)
	return values
		.flatMap(value => value.split(';'))
		.map(entry => entry.replace(/%([^%]+)%/g, (match, name: string) => process.env[name] ?? match).replace(/^"(.*)"$/, '$1'))
		.filter(entry => path.win32.isAbsolute(entry) && !/^[\\/]{2}/.test(entry))
}

export async function installYtDlpWithWinget(): Promise<string> {
	await wingetInstall('yt-dlp.yt-dlp')

	const installed = await firstExecutable([...(await whereOnPath('yt-dlp.exe')), ...(await savedPathDirectories()).map(dir => path.join(dir, 'yt-dlp.exe'))])
	if (installed) return installed

	throw new Error('WinGet finished, but yt-dlp was not found.')
}

export async function installFfmpegWithWinget(): Promise<FfmpegPairPaths> {
	await wingetInstall(WINGET_FFMPEG_ID)
	const saved = await savedPathDirectories()
	// Folders WinGet itself writes to come first: its Links folder and the
	// package folders it added to PATH.
	const links = [process.env.LOCALAPPDATA && path.win32.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links'), process.env.ProgramFiles && path.win32.join(process.env.ProgramFiles, 'WinGet', 'Links')].filter((dir): dir is string => Boolean(dir))
	const wingetOwned = saved.filter(dir => /[\\/]WinGet[\\/](Packages|Links)([\\/]|$)/i.test(dir))
	return ffmpegPairOnPath('WinGet', {preferred: [...wingetOwned, ...links], extra: saved})
}
