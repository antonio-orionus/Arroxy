// @vitest-environment node
import {EventEmitter} from 'node:events'
import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {spawn} from 'node:child_process'
import {killActiveProcesses} from '@main/services/download/processControl.js'

vi.mock('node:child_process', () => ({spawn: vi.fn()}))

function child(state: {exitCode?: number | null; signalCode?: NodeJS.Signals | null}): ChildProcessWithoutNullStreams {
	return Object.assign(new EventEmitter(), {pid: 4242, exitCode: state.exitCode ?? null, signalCode: state.signalCode ?? null, kill: vi.fn()}) as unknown as ChildProcessWithoutNullStreams
}

const processKill = vi.spyOn(process, 'kill').mockImplementation(() => true)

const originalPlatform = process.platform
afterEach(() => {
	processKill.mockClear()
	vi.mocked(spawn).mockReset()
	Object.defineProperty(process, 'platform', {value: originalPlatform})
})

describe('killActiveProcesses', () => {
	it.skipIf(process.platform === 'win32')('signals a live child through its process group', () => {
		const proc = child({})
		killActiveProcesses({ytDlpProcess: proc}, 'SIGTERM')
		expect(processKill).toHaveBeenCalledWith(-4242, 'SIGTERM')
	})

	it('never signals a child that already exited or was killed: its pid may have been reused', () => {
		const exited = child({exitCode: 0})
		const signalled = child({signalCode: 'SIGKILL'})
		killActiveProcesses({ytDlpProcess: exited, ffmpegProcess: signalled}, 'SIGKILL')
		expect(processKill).not.toHaveBeenCalled()
		expect(exited.kill).not.toHaveBeenCalled()
		expect(signalled.kill).not.toHaveBeenCalled()
	})
})

// The tree kill itself (taskkill on Windows, the group fallback) is covered in
// yt-dlp-bridge's process-tree-kill tests; these cover the job wiring.
describe('killActiveProcesses on Windows', () => {
	it('tree-kills each live process with taskkill and survives a failed taskkill spawn', () => {
		Object.defineProperty(process, 'platform', {value: 'win32'})
		const taskkill = new EventEmitter()
		vi.mocked(spawn).mockReturnValue(taskkill as never)

		killActiveProcesses({ytDlpProcess: child({})}, 'SIGTERM')

		expect(spawn).toHaveBeenCalledWith('taskkill', ['/pid', '4242', '/T', '/F'], {windowsHide: true})
		// An unhandled 'error' event would throw here.
		expect(() => taskkill.emit('error', Object.assign(new Error('spawn taskkill ENOENT'), {code: 'ENOENT'}))).not.toThrow()
	})
})
