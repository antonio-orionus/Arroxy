import {afterEach, describe, expect, it, vi} from 'vitest'

type ExecFileCallback = (error: Error | null, result?: {stdout: string; stderr: string}) => void
const execFile = vi.hoisted(() => vi.fn())
vi.mock('node:child_process', () => ({execFile}))

const {whereOnPath} = await import('@main/services/binary/BinaryProbe.js')

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!

function setPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

function answerWith(stdout: string): void {
	execFile.mockImplementation((_tool: string, _args: string[], _options: unknown, callback: ExecFileCallback) => callback(null, {stdout, stderr: ''}))
}

afterEach(() => {
	Object.defineProperty(process, 'platform', originalPlatformDescriptor)
	execFile.mockReset()
})

// A name no fallback directory holds, so only the `where`/`which` answer counts.
const name = 'arroxy-path-lookup-test'

describe('whereOnPath', () => {
	it('asks `which -a` and returns every match in PATH order', async () => {
		setPlatform('linux')
		answerWith('/usr/local/bin/arroxy-path-lookup-test\n/usr/bin/arroxy-path-lookup-test\n')

		await expect(whereOnPath(name)).resolves.toEqual(['/usr/local/bin/arroxy-path-lookup-test', '/usr/bin/arroxy-path-lookup-test'])
		expect(execFile).toHaveBeenCalledWith('which', ['-a', name], expect.anything(), expect.any(Function))
	})

	it('asks `where` on Windows and splits its CRLF output, dropping duplicates', async () => {
		setPlatform('win32')
		answerWith('C:\\tools\\arroxy-path-lookup-test.exe\r\nC:\\bin\\arroxy-path-lookup-test.exe\r\nC:\\tools\\arroxy-path-lookup-test.exe\r\n')

		await expect(whereOnPath(`${name}.exe`)).resolves.toEqual(['C:\\tools\\arroxy-path-lookup-test.exe', 'C:\\bin\\arroxy-path-lookup-test.exe'])
		expect(execFile).toHaveBeenCalledWith('where', [`${name}.exe`], expect.anything(), expect.any(Function))
	})

	it('bounds the lookup with a timeout and the caller signal', async () => {
		setPlatform('linux')
		answerWith('')
		const signal = new AbortController().signal

		await whereOnPath(name, signal)

		expect(execFile).toHaveBeenCalledWith('which', ['-a', name], expect.objectContaining({signal, timeout: expect.any(Number), windowsHide: true}), expect.any(Function))
	})

	it('returns no candidates when the lookup is killed or finds nothing', async () => {
		setPlatform('linux')
		execFile.mockImplementation((_tool: string, _args: string[], _options: unknown, callback: ExecFileCallback) => callback(Object.assign(new Error('Command failed'), {killed: true, signal: 'SIGTERM'})))

		await expect(whereOnPath(name)).resolves.toEqual([])
	})
})
