import {describe, expect, it, vi, beforeEach} from 'vitest'
import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

// Capture every ipcMain.handle / removeHandler call so tests can introspect.
const handleCalls: {channel: string; fn: (e: unknown, payload: unknown) => unknown}[] = []
const removeHandlerCalls: string[] = []

vi.mock('electron', () => ({
	app: {getName: vi.fn().mockReturnValue('arroxy'), getVersion: vi.fn().mockReturnValue('1.0.0'), getPath: vi.fn().mockReturnValue('/tmp')},
	dialog: {showOpenDialog: vi.fn()},
	shell: {openPath: vi.fn(), openExternal: vi.fn(), showItemInFolder: vi.fn()},
	ipcMain: {
		handle: vi.fn().mockImplementation((channel: string, fn: (e: unknown, payload: unknown) => unknown) => {
			handleCalls.push({channel, fn})
		}),
		removeHandler: vi.fn().mockImplementation((channel: string) => {
			removeHandlerCalls.push(channel)
		}),
		on: vi.fn(),
		removeAllListeners: vi.fn()
	}
}))

import {registerIpcHandlers} from '@main/ipc/registerIpcHandlers.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {shell} from 'electron'
import log from 'electron-log/main.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function makeDeps() {
	const downloadService = new FakeDownloadService()
	const probeService = Object.assign(new EventEmitter(), {probe: vi.fn(), cancelInFlight: vi.fn()})
	const mainWindow = {isDestroyed: vi.fn().mockReturnValue(false), webContents: {send: vi.fn()}, minimize: vi.fn(), maximize: vi.fn(), unmaximize: vi.fn(), close: vi.fn(), isMaximized: vi.fn().mockReturnValue(false)}
	const queueService = Object.assign(new EventEmitter(), {
		add: vi.fn().mockReturnValue({ok: true, data: {ids: []}}),
		start: vi.fn().mockResolvedValue({ok: true, data: undefined}),
		pause: vi.fn().mockResolvedValue({ok: true, data: undefined}),
		resume: vi.fn().mockResolvedValue({ok: true, data: undefined}),
		cancel: vi.fn().mockResolvedValue({ok: true, data: undefined}),
		retry: vi.fn().mockResolvedValue({ok: true, data: undefined}),
		clearCompleted: vi.fn().mockReturnValue({ok: true, data: undefined}),
		remove: vi.fn().mockReturnValue({ok: true, data: undefined}),
		snapshot: vi.fn().mockReturnValue([])
	})
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {defaultOutputDir: '/tmp', rememberLastOutputDir: true, clipboardWatchEnabled: false, cookiesMode: 'off'}, single: {}, playlist: {}}), update: vi.fn()}
	const languageRef: {current: string} = {current: 'en'}
	const clipboardWatcher = {setEnabled: vi.fn(), dispose: vi.fn()}
	return {
		mainWindow: mainWindow as never,
		downloadService: downloadService as never,
		probeService: probeService as never,
		settingsStore: settingsStore as never,
		queueService: queueService as never,
		binaryManager: {
			ensureYtDlp: vi.fn(),
			ensureFFmpeg: vi.fn(),
			ensureDeno: vi.fn(),
			ensureFFprobe: vi.fn(),
			installYtDlpWithHomebrew: vi.fn().mockResolvedValue('/opt/homebrew/bin/yt-dlp'),
			installYtDlpWithWinget: vi.fn().mockResolvedValue('C:\\Users\\mock\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe')
		} as never,
		tokenService: {warmUp: vi.fn()} as never,
		languageRef: languageRef as never,
		clipboardWatcher: clipboardWatcher as never,
		playlistManifestStore: {save: vi.fn(), get: vi.fn(), remove: vi.fn()} as never,
		_raw: {downloadService, probeService, mainWindow, queueService, settingsStore, languageRef, clipboardWatcher}
	}
}

function findCall(channel: string) {
	for (let i = handleCalls.length - 1; i >= 0; i--) {
		if (handleCalls[i].channel === channel) return handleCalls[i]
	}
	return undefined
}

describe('registerIpcHandlers', () => {
	beforeEach(() => {
		handleCalls.length = 0
		removeHandlerCalls.length = 0
		vi.clearAllMocks()
	})

	describe('re-registration safety', () => {
		it('removes prior handler before re-binding so re-registering does not stack', () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)
			registerIpcHandlers(deps)

			// Every channel that registerIpcHandlers binds should have removeHandler
			// called at least twice (once per registration).
			const startRemovals = removeHandlerCalls.filter(c => c === IPC_CHANNELS.downloadsStart).length
			expect(startRemovals).toBeGreaterThanOrEqual(2)
		})

		it('does not stack DownloadService listeners across re-registration', () => {
			const deps = makeDeps()
			const ds = deps._raw.downloadService

			registerIpcHandlers(deps)
			expect(ds.listenerCount('status')).toBe(1)
			expect(ds.listenerCount('progress')).toBe(1)

			registerIpcHandlers(deps)
			// Second register must drop prior bridge before adding the new one.
			expect(ds.listenerCount('status')).toBe(1)
			expect(ds.listenerCount('progress')).toBe(1)
		})

		it('pre-existing DownloadService listeners survive bridge re-attachment', () => {
			const deps = makeDeps()
			const ds = deps._raw.downloadService
			const received: string[] = []
			ds.on('status', () => received.push('survivor'))

			registerIpcHandlers(deps)
			registerIpcHandlers(deps)

			ds.emit('status', {jobId: 'j1', stage: 'done', statusKey: 'complete', at: new Date().toISOString()})

			expect(received).toContain('survivor')
		})
	})

	describe('progress throttle', () => {
		it('drops progress events that arrive within 100ms of the prior event for the same job', () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)
			const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>
			const ds = deps._raw.downloadService

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			ds.emit('progress', {jobId: 'j1', percent: 10, line: ''})
			now += 50
			ds.emit('progress', {jobId: 'j1', percent: 20, line: ''})
			now += 60 // total 110 ms past first
			ds.emit('progress', {jobId: 'j1', percent: 30, line: ''})

			const progressSends = send.mock.calls.filter(c => c[0] === IPC_CHANNELS.eventsProgress)
			expect(progressSends).toHaveLength(2)
			vi.restoreAllMocks()
		})

		it('keeps separate throttle windows per jobId', () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)
			const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>
			const ds = deps._raw.downloadService

			vi.spyOn(Date, 'now').mockReturnValue(1_000_000)

			ds.emit('progress', {jobId: 'a', percent: 10, line: ''})
			ds.emit('progress', {jobId: 'b', percent: 10, line: ''})

			const progressSends = send.mock.calls.filter(c => c[0] === IPC_CHANNELS.eventsProgress)
			expect(progressSends).toHaveLength(2)
			vi.restoreAllMocks()
		})

		it('clears the throttle entry on done so a same-jobId restart is not throttled', () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)
			const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>
			const ds = deps._raw.downloadService

			let now = 1_000_000
			vi.spyOn(Date, 'now').mockImplementation(() => now)

			ds.emit('progress', {jobId: 'reused', percent: 50, line: ''})
			ds.emit('status', {jobId: 'reused', stage: 'done', statusKey: 'complete', at: ''})

			// 10ms later, a new progress for the same jobId should not be throttled
			// because the cleanup deleted the entry.
			now += 10
			ds.emit('progress', {jobId: 'reused', percent: 5, line: ''})

			const progressSends = send.mock.calls.filter(c => c[0] === IPC_CHANNELS.eventsProgress)
			expect(progressSends).toHaveLength(2)
			vi.restoreAllMocks()
		})

		it('clears the throttle entry on error stage as well', () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)
			const ds = deps._raw.downloadService

			vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
			ds.emit('progress', {jobId: 'erred', percent: 50, line: ''})
			ds.emit('status', {jobId: 'erred', stage: 'error', statusKey: 'ytdlpExitCode', at: ''})

			// Inspect the internal map via re-emit: another progress same tick
			// should now pass.
			ds.emit('progress', {jobId: 'erred', percent: 60, line: ''})
			const send = deps._raw.mainWindow.webContents.send as ReturnType<typeof vi.fn>
			const progressSends = send.mock.calls.filter(c => c[0] === IPC_CHANNELS.eventsProgress)
			expect(progressSends).toHaveLength(2)
			vi.restoreAllMocks()
		})
	})

	describe('payload validation', () => {
		it('app:setLanguage rejects invalid language codes silently and does not mutate languageRef', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.appSetLanguage)!.fn
			await handler(null, 'klingon')

			expect(deps._raw.languageRef.current).toBe('en')
		})

		it('app:setLanguage accepts a valid SupportedLang', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.appSetLanguage)!.fn
			await handler(null, 'fr')

			expect(deps._raw.languageRef.current).toBe('fr')
		})

		it('app:installYtDlpHomebrew invokes the binary manager repair action', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.appInstallYtDlpHomebrew)!.fn
			const result = (await handler(null, undefined)) as {ok: boolean; data?: {installedPath: string}}

			expect(result).toEqual({ok: true, data: {installedPath: '/opt/homebrew/bin/yt-dlp'}})
		})

		it('app:installYtDlpWinget invokes the binary manager repair action', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.appInstallYtDlpWinget)!.fn
			const result = (await handler(null, undefined)) as {ok: boolean; data?: {installedPath: string}}

			expect(result).toEqual({ok: true, data: {installedPath: 'C:\\Users\\mock\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe'}})
		})

		it('queue:cmd:add rejects non-array payloads with a Result failure', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.queueCmdAdd)!.fn
			const result = (await handler(null, 'not an array')) as {ok: boolean; error?: {code: string}}
			expect(result.ok).toBe(false)
			expect(deps._raw.queueService.add).not.toHaveBeenCalled()
		})

		it('queue:cmd:add accepts a valid queue array and forwards to QueueService.add', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.queueCmdAdd)!.fn
			const validItem = {
				id: 'a',
				url: 'u',
				title: 't',
				thumbnail: '',
				outputDir: '/tmp',
				formatLabel: 'Best',
				status: 'done',
				progressPercent: 100,
				progressDetail: null,
				lastStatus: null,
				error: null,
				finishedAt: null,
				job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
			}
			const result = (await handler(null, [validItem])) as {ok: boolean}
			expect(result.ok).toBe(true)
			expect(deps._raw.queueService.add).toHaveBeenCalledOnce()
		})

		it('downloads:probe rejects incomplete cookies config before probing', async () => {
			const deps = makeDeps()
			deps._raw.settingsStore.get.mockResolvedValue({common: {defaultOutputDir: '/tmp', rememberLastOutputDir: true, clipboardWatchEnabled: false, cookiesMode: 'file', cookiesPath: '   '}, single: {}, playlist: {}})
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.downloadsProbe)!.fn
			const result = (await handler(null, {url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})) as {ok: boolean; error?: {kind: string; code: string; message: string}}

			expect(result.ok).toBe(false)
			expect(result.error).toMatchObject({kind: 'other', code: 'cookies_config', message: 'Pick a file to use cookies'})
			expect(deps._raw.probeService.probe).not.toHaveBeenCalled()
		})

		it('downloads:start rejects incomplete cookies config before starting downloads', async () => {
			const deps = makeDeps()
			deps._raw.settingsStore.get.mockResolvedValue({common: {defaultOutputDir: '/tmp', rememberLastOutputDir: true, clipboardWatchEnabled: false, cookiesMode: 'browser'}, single: {}, playlist: {}})
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.downloadsStart)!.fn
			const result = (await handler(null, {
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				outputDir: '/tmp',
				job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
			})) as {ok: boolean; error?: {code: string; message: string}}

			expect(result.ok).toBe(false)
			expect(result.error).toMatchObject({code: 'validation', message: 'Pick a browser to use cookies'})
			expect(deps._raw.downloadService.start).not.toHaveBeenCalled()
		})
	})

	describe('file handlers', () => {
		it('logs:openDir reveals main.log in Explorer on Windows', async () => {
			const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!
			Object.defineProperty(process, 'platform', {value: 'win32', configurable: true})
			try {
				const deps = makeDeps()
				registerIpcHandlers(deps)

				const handler = findCall(IPC_CHANNELS.logsOpenDir)!.fn
				const result = (await handler(null, undefined)) as {ok: boolean}

				expect(result.ok).toBe(true)
				expect(shell.showItemInFolder).toHaveBeenCalledWith('/tmp/logs/main.log')
				expect(shell.openPath).not.toHaveBeenCalled()
			} finally {
				Object.defineProperty(process, 'platform', originalPlatform)
			}
		})

		it.each(['/Users/monterey/Library/Application Support/arroxy/logs/main.log', '/Users/monterey/Library/Application Support/Arroxy/logs/main.log'])('logs:openDir reveals the active macOS main.log path (%s)', async logPath => {
			const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!
			Object.defineProperty(process, 'platform', {value: 'darwin', configurable: true})
			vi.mocked(log.transports.file.getFile).mockReturnValue({path: logPath} as ReturnType<typeof log.transports.file.getFile>)
			try {
				const deps = makeDeps()
				registerIpcHandlers(deps)

				const handler = findCall(IPC_CHANNELS.logsOpenDir)!.fn
				const result = (await handler(null, undefined)) as {ok: boolean}

				expect(result.ok).toBe(true)
				expect(shell.showItemInFolder).toHaveBeenCalledWith(logPath)
				expect(shell.openPath).not.toHaveBeenCalled()
			} finally {
				Object.defineProperty(process, 'platform', originalPlatform)
			}
		})

		it('logs:uploadFeedbackDiagnostic uploads a compressed log diagnostic', async () => {
			const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-ipc-feedback-'))
			const logPath = path.join(tempDir, 'main.log')
			await fs.writeFile(logPath, 'diagnostic log\n')
			vi.mocked(log.transports.file.getFile).mockReturnValue({path: logPath} as ReturnType<typeof log.transports.file.getFile>)
			const reportId = '11111111-1111-4111-8111-111111111111'
			const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({report_id: reportId, diagnostic_url: null}), {status: 201, headers: {'content-type': 'application/json'}}))
			vi.stubGlobal('fetch', fetchImpl)
			try {
				const deps = makeDeps()
				registerIpcHandlers(deps)

				const handler = findCall(IPC_CHANNELS.logsUploadFeedbackDiagnostic)!.fn
				const result = (await handler(null, {reportId})) as {ok: boolean; data?: {reportId: string; rawBytes: number; compressedBytes: number; truncated: boolean; sha256: string}}

				expect(result.ok).toBe(true)
				expect(result.data).toMatchObject({reportId, rawBytes: 15, truncated: false})
				expect(result.data?.compressedBytes).toBeGreaterThan(0)
				expect(result.data?.sha256).toMatch(/^[a-f0-9]{64}$/)
				expect(fetchImpl).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({headers: expect.objectContaining({'x-arroxy-report-id': reportId})}))
			} finally {
				vi.unstubAllGlobals()
				await fs.rm(tempDir, {force: true, recursive: true})
			}
		})

		it('logs:uploadFeedbackDiagnostic rejects missing report ids before reading the log', async () => {
			const deps = makeDeps()
			registerIpcHandlers(deps)

			const handler = findCall(IPC_CHANNELS.logsUploadFeedbackDiagnostic)!.fn
			const result = (await handler(null, undefined)) as {ok: boolean; error?: {message: string}}

			expect(result.ok).toBe(false)
			expect(result.error?.message).toBe('Invalid feedback report id')
			expect(log.transports.file.getFile).not.toHaveBeenCalled()
		})
	})
})
