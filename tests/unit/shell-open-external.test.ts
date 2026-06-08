// @vitest-environment node

import {describe, expect, it, vi, beforeEach} from 'vitest'

const handleCalls: {channel: string; fn: (e: unknown, payload: unknown) => unknown}[] = []

vi.mock('electron', () => ({
	app: {getName: vi.fn().mockReturnValue('arroxy'), getVersion: vi.fn().mockReturnValue('1.0.0'), getPath: vi.fn().mockReturnValue('/tmp')},
	dialog: {showOpenDialog: vi.fn()},
	shell: {openPath: vi.fn(), openExternal: vi.fn().mockResolvedValue(undefined), showItemInFolder: vi.fn()},
	ipcMain: {
		handle: vi.fn().mockImplementation((channel: string, fn: (e: unknown, p: unknown) => unknown) => {
			handleCalls.push({channel, fn})
		}),
		removeHandler: vi.fn(),
		on: vi.fn()
	}
}))

import {registerFileHandlers} from '@main/ipc/fileHandlers.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {shell} from 'electron'

beforeEach(() => {
	handleCalls.length = 0
	vi.clearAllMocks()
	registerFileHandlers({} as never, {getRuntimeCacheDir: vi.fn().mockReturnValue('/tmp/cache')} as never)
})

function openExternalHandler() {
	const call = handleCalls.find(c => c.channel === IPC_CHANNELS.shellOpenExternal)
	if (!call) throw new Error(`handler for ${IPC_CHANNELS.shellOpenExternal} not registered`)
	return call.fn
}

describe('shell:openExternal IPC validation', () => {
	it('accepts https:// URLs', async () => {
		const result = (await openExternalHandler()(null, 'https://example.com')) as {ok: boolean}
		expect(result.ok).toBe(true)
		expect(shell.openExternal).toHaveBeenCalledWith('https://example.com')
	})

	it('accepts http:// URLs', async () => {
		const result = (await openExternalHandler()(null, 'http://example.com')) as {ok: boolean}
		expect(result.ok).toBe(true)
		expect(shell.openExternal).toHaveBeenCalled()
	})

	it('rejects javascript: without calling openExternal', async () => {
		const result = (await openExternalHandler()(null, 'javascript:alert(1)')) as {ok: boolean}
		expect(result.ok).toBe(false)
		expect(shell.openExternal).not.toHaveBeenCalled()
	})

	it('rejects file: URL', async () => {
		const result = (await openExternalHandler()(null, 'file:///etc/passwd')) as {ok: boolean}
		expect(result.ok).toBe(false)
		expect(shell.openExternal).not.toHaveBeenCalled()
	})

	it('rejects mailto:', async () => {
		const result = (await openExternalHandler()(null, 'mailto:test@example.com')) as {ok: boolean}
		expect(result.ok).toBe(false)
		expect(shell.openExternal).not.toHaveBeenCalled()
	})

	it('rejects empty string', async () => {
		const result = (await openExternalHandler()(null, '')) as {ok: boolean}
		expect(result.ok).toBe(false)
		expect(shell.openExternal).not.toHaveBeenCalled()
	})

	it('rejects non-string payload', async () => {
		const r1 = (await openExternalHandler()(null, null)) as {ok: boolean}
		const r2 = (await openExternalHandler()(null, 42)) as {ok: boolean}
		expect(r1.ok).toBe(false)
		expect(r2.ok).toBe(false)
		expect(shell.openExternal).not.toHaveBeenCalled()
	})
})
