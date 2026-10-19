import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const execFileMock = vi.hoisted(() => vi.fn())
const whereOnPathMock = vi.hoisted(() => vi.fn())
const firstExecutableMock = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({execFile: execFileMock}))
vi.mock('@main/services/binary/BinaryProbe.js', () => ({whereOnPath: whereOnPathMock, firstExecutable: firstExecutableMock}))

import {installFfmpegWithWinget, installYtDlpWithWinget} from '@main/services/binary/WingetRepair.js'

type ExecCallback = (err: (Error & {code?: number}) | null, out?: {stdout: string; stderr: string}) => void

const LINKS = 'C:\\Users\\me\\AppData\\Local\\Microsoft\\WinGet\\Links'
const realPlatform = process.platform

function stubPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

function onPath(found: Record<string, string>): void {
	whereOnPathMock.mockImplementation(async (name: string) => (found[name] ? [found[name]] : []))
	firstExecutableMock.mockImplementation(async (candidates: string[]) => candidates[0] ?? null)
}

function wingetArgs(): string[][] {
	return execFileMock.mock.calls.filter(call => call[0] !== 'reg.exe').map(call => call[1] as string[])
}

// What `reg query <key> /v Path` prints, keyed by hive.
function registryPath(paths: {user?: string; machine?: string}): void {
	execFileMock.mockImplementation((file: string, args: string[], _opts: unknown, cb: ExecCallback) => {
		if (file !== 'reg.exe') return cb(null, {stdout: '', stderr: ''})
		const value = args[1]?.startsWith('HKCU') ? paths.user : paths.machine
		if (value === undefined) return cb(Object.assign(new Error('value not found'), {code: 1}))
		cb(null, {stdout: `\r\n${args[1]}\r\n    Path    REG_EXPAND_SZ    ${value}\r\n\r\n`, stderr: ''})
	})
}

beforeEach(() => {
	vi.clearAllMocks()
	stubPlatform('win32')
	execFileMock.mockImplementation((_file: string, _args: string[], _opts: unknown, cb: ExecCallback) => cb(null, {stdout: '', stderr: ''}))
	onPath({'winget.exe': 'C:\\winget.exe', 'yt-dlp.exe': `${LINKS}\\yt-dlp.exe`, 'ffmpeg.exe': `${LINKS}\\ffmpeg.exe`, 'ffprobe.exe': `${LINKS}\\ffprobe.exe`})
})

afterEach(() => {
	stubPlatform(realPlatform)
	vi.unstubAllEnvs()
})

describe('installFfmpegWithWinget', () => {
	it('installs the full FFmpeg build and returns both media tools from the WinGet links', async () => {
		await expect(installFfmpegWithWinget()).resolves.toEqual({ffmpegPath: `${LINKS}\\ffmpeg.exe`, ffprobePath: `${LINKS}\\ffprobe.exe`})
		expect(wingetArgs()).toEqual([['install', '--id', 'Gyan.FFmpeg', '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements']])
	})

	// Found on the Windows VM: Gyan.FFmpeg adds its bin folder to the user PATH
	// in the registry instead of creating links, and the running app's PATH
	// predates the install.
	it('finds the media tools in a PATH folder the install just saved to the registry', async () => {
		vi.stubEnv('LOCALAPPDATA', 'C:\\Users\\me\\AppData\\Local')
		onPath({'winget.exe': 'C:\\winget.exe'})
		registryPath({user: '\\\\nas\\tools;%LOCALAPPDATA%\\Microsoft\\WindowsApps;relative\\dir;%LOCALAPPDATA%\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg\\bin'})
		firstExecutableMock.mockImplementation(async (candidates: string[]) => candidates.find(candidate => candidate.includes('Gyan.FFmpeg') || candidate.endsWith('winget.exe')) ?? null)

		const bin = 'C:\\Users\\me\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg\\bin'
		await expect(installFfmpegWithWinget()).resolves.toEqual({ffmpegPath: path.join(bin, 'ffmpeg.exe'), ffprobePath: path.join(bin, 'ffprobe.exe')})
		const searched = firstExecutableMock.mock.calls.flatMap(call => call[0] as string[])
		expect(searched.some(candidate => candidate.startsWith('relative') || candidate.includes('nas'))).toBe(false)
	})

	it('still fails clearly when neither PATH nor the registry has them', async () => {
		onPath({'winget.exe': 'C:\\winget.exe'})
		registryPath({})

		await expect(installFfmpegWithWinget()).rejects.toThrow('WinGet finished, but ffmpeg and ffprobe were not both found.')
	})

	it('treats "already installed" as success', async () => {
		execFileMock.mockImplementation((_file: string, _args: string[], _opts: unknown, cb: ExecCallback) => cb(Object.assign(new Error('already installed'), {code: -1978335189})))

		await expect(installFfmpegWithWinget()).resolves.toEqual({ffmpegPath: `${LINKS}\\ffmpeg.exe`, ffprobePath: `${LINKS}\\ffprobe.exe`})
	})

	it('fails with guidance when WinGet is missing', async () => {
		onPath({})

		await expect(installFfmpegWithWinget()).rejects.toThrow('WinGet was not found')
		expect(execFileMock).not.toHaveBeenCalled()
	})

	it('refuses to run outside Windows', async () => {
		stubPlatform('darwin')

		await expect(installFfmpegWithWinget()).rejects.toThrow('only available on Windows')
	})
})

describe('installYtDlpWithWinget', () => {
	it('still installs yt-dlp by its own package id', async () => {
		await expect(installYtDlpWithWinget()).resolves.toBe(`${LINKS}\\yt-dlp.exe`)
		expect(wingetArgs()[0]?.slice(0, 3)).toEqual(['install', '--id', 'yt-dlp.yt-dlp'])
	})
})
