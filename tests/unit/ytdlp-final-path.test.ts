import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {EventEmitter} from 'node:events'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

vi.unmock('node:fs/promises')

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {clearFinalPathFile, finalPathPrintArgs, parseFinalPath, readFinalPathFile} from '@main/services/ytDlpFinalPath.js'

describe('finalPathPrintArgs', () => {
	it('asks for the path after the move', () => {
		expect(finalPathPrintArgs('/dl/.arroxy-temp/ab/final.txt')).toEqual(['--print-to-file', 'after_move:filepath', '/dl/.arroxy-temp/ab/final.txt'])
	})

	// FILE is an output template: a bare `%` would start a field. `$` is left
	// as it is, since `--paths` expands it unescaped too.
	it('doubles the % an output template would read as a field', () => {
		expect(finalPathPrintArgs('/dl/100% $ %APPDATA%/f.txt')[2]).toBe('/dl/100%% $ %%APPDATA%%/f.txt')
	})
})

describe('parseFinalPath', () => {
	it('takes the last path printed', () => {
		expect(parseFinalPath('/dl/first.mp4\n/dl/second.mkv\n')).toBe('/dl/second.mkv')
	})

	it('reads Windows line endings without keeping the \\r', () => {
		expect(parseFinalPath('C:\\Users\\a\\Clip.mkv\r\n')).toBe(process.platform === 'win32' ? 'C:\\Users\\a\\Clip.mkv' : null)
		expect(parseFinalPath('/dl/Clip.mkv\r\n')).toBe('/dl/Clip.mkv')
	})

	it('keeps a non-ASCII path as printed', () => {
		expect(parseFinalPath('/dl/این بازی‌ها 😂.mkv\n')).toBe('/dl/این بازی‌ها 😂.mkv')
	})

	it('refuses an empty file or a relative path', () => {
		expect(parseFinalPath('')).toBeNull()
		expect(parseFinalPath('\n\n')).toBeNull()
		expect(parseFinalPath('Clip.mkv\n')).toBeNull()
	})
})

describe('readFinalPathFile / clearFinalPathFile', () => {
	let dir: string

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), 'arroxy-final-path-'))
	})

	afterEach(() => {
		rmSync(dir, {recursive: true, force: true})
	})

	it('reads what yt-dlp appended, and nothing once cleared', async () => {
		const file = join(dir, 'final.txt')
		writeFileSync(file, `${join(dir, 'Clip.mkv')}\n`)
		expect(await readFinalPathFile(file)).toBe(join(dir, 'Clip.mkv'))
		expect(await clearFinalPathFile(file)).toBe(true)
		expect(await readFinalPathFile(file)).toBeNull()
	})

	it('answers null for a file that was never written, which needs no clearing', async () => {
		expect(await readFinalPathFile(join(dir, 'missing.txt'))).toBeNull()
		expect(await clearFinalPathFile(join(dir, 'missing.txt'))).toBe(true)
	})

	// A leftover that cannot be removed would answer for a run that prints nothing.
	it('reports a file it could not clear', async () => {
		const file = join(dir, 'final.txt')
		mkdirSync(join(file, 'blocker'), {recursive: true})
		expect(await clearFinalPathFile(file)).toBe(false)
	})
})

describe('YtDlp.run — finalPathFile', () => {
	function makeYtDlp(): YtDlp {
		const tokenService = {getToken: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd'}), invalidateCache: vi.fn()}
		const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
		return new YtDlp(binaryManager as never, tokenService as never, {get: vi.fn().mockResolvedValue({})})
	}

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: '/mock/Arroxy', version: '24.16.0'}, output: 'v24.16.0'})
		vi.mocked(spawnYtDlp).mockImplementation(() => {
			const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
			setTimeout(() => proc.emit('close', 0), 5)
			return proc as never
		})
	})

	const request = {kind: 'media', url: 'https://example.com/v/1', output: {directory: '/dl', tempDirectory: '/dl/.arroxy-temp/ab'}, selection: {remuxVideo: 'mkv'}} as const

	it('passes the print-to-file request when asked', async () => {
		await makeYtDlp().run(request, undefined, {finalPathFile: '/dl/.arroxy-temp/ab/final.txt'})
		const args = vi.mocked(spawnYtDlp).mock.calls[0]?.[1] ?? []
		const at = args.indexOf('--print-to-file')
		expect(args.slice(at, at + 3)).toEqual(['--print-to-file', 'after_move:filepath', '/dl/.arroxy-temp/ab/final.txt'])
	})

	it('passes none otherwise', async () => {
		await makeYtDlp().run(request)
		expect(vi.mocked(spawnYtDlp).mock.calls[0]?.[1]).not.toContain('--print-to-file')
	})
})
