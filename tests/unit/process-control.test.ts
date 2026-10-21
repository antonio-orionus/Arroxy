// @vitest-environment node
import {EventEmitter} from 'node:events'
import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {spawn} from 'node:child_process'
import {stopActiveProcesses} from '@main/services/download/processControl.js'
import {spawnFFmpeg} from '@main/utils/process.js'

vi.mock('node:child_process', () => ({spawn: vi.fn()}))

function child(state: {exitCode?: number | null; signalCode?: NodeJS.Signals | null}): ChildProcessWithoutNullStreams {
	return Object.assign(new EventEmitter(), {pid: 4242, exitCode: state.exitCode ?? null, signalCode: state.signalCode ?? null, kill: vi.fn()}) as unknown as ChildProcessWithoutNullStreams
}

// Spawned the way a job spawns its children, then closed.
function closed(proc: ChildProcessWithoutNullStreams): ChildProcessWithoutNullStreams {
	vi.mocked(spawn).mockReturnValueOnce(proc)
	spawnFFmpeg('/fake/ffmpeg', [])
	proc.emit('close', 0, null)
	return proc
}

const processKill = vi.spyOn(process, 'kill').mockImplementation(() => true)

const originalPlatform = process.platform
afterEach(() => {
	processKill.mockClear()
	vi.mocked(spawn).mockReset()
	Object.defineProperty(process, 'platform', {value: originalPlatform})
})

describe('stopActiveProcesses', () => {
	it.skipIf(process.platform === 'win32')('signals a live child through its process group', () => {
		const proc = child({})
		stopActiveProcesses({ytDlpProcess: proc})
		expect(processKill).toHaveBeenCalledWith(-4242, 'SIGTERM')
	})

	it('never signals a child whose tree already closed: its pid may have been reused', () => {
		const exited = closed(child({exitCode: 0}))
		const signalled = closed(child({signalCode: 'SIGKILL'}))
		stopActiveProcesses({ytDlpProcess: exited, ffmpegProcess: signalled})
		expect(processKill).not.toHaveBeenCalled()
		expect(exited.kill).not.toHaveBeenCalled()
		expect(signalled.kill).not.toHaveBeenCalled()
	})
})

// The tree kill itself (taskkill on Windows, the group fallback) is covered in
// yt-dlp-bridge's process-tree-kill tests; these cover the job wiring.
describe('stopActiveProcesses on Windows', () => {
	it('tree-kills each live process with taskkill and survives a failed taskkill spawn', () => {
		Object.defineProperty(process, 'platform', {value: 'win32'})
		const taskkill = new EventEmitter()
		vi.mocked(spawn).mockReturnValue(taskkill as never)

		stopActiveProcesses({ytDlpProcess: child({})})

		expect(spawn).toHaveBeenCalledWith('taskkill', ['/pid', '4242', '/T', '/F'], {windowsHide: true})
		// An unhandled 'error' event would throw here.
		expect(() => taskkill.emit('error', Object.assign(new Error('spawn taskkill ENOENT'), {code: 'ENOENT'}))).not.toThrow()
	})
})
