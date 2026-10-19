import {setTimeout as sleep} from 'node:timers/promises'
import {describe, expect, it} from 'vite-plus/test'
import {CommandExecutionError, runCommand} from '../src/runner.js'

const node = process.execPath
const BASE = {timeoutMs: 10_000, maxOutputBytes: 1024 * 1024}

function isAlive(pid: number): boolean {
	try {
		process.kill(pid, 0)
		return true
	} catch {
		return false
	}
}

describe('runCommand — streaming', () => {
	it('streams stderr lines as they arrive, splitting progress redraws on bare carriage returns', async () => {
		const lines: string[] = []
		const script = "process.stderr.write('[download]   1% of 10MiB\\r[download]  50% of 10MiB\\r'); process.stderr.write('[download] Destination: /out/a.mp4\\n'); process.stderr.write('tail without newline')"
		const result = await runCommand(node, ['-e', script], {...BASE, onStderrLine: line => lines.push(line)})
		expect(lines).toEqual(['[download]   1% of 10MiB', '[download]  50% of 10MiB', '[download] Destination: /out/a.mp4', 'tail without newline'])
		expect(result.stderr).toContain('tail without newline')
	})

	it('streams stdout lines and keeps a multi-byte character split across writes intact', async () => {
		const lines: string[] = []
		const script = "const b = Buffer.from('/out/سلام.mp4\\n'); process.stdout.write(b.subarray(0, 7)); setTimeout(() => process.stdout.write(b.subarray(7)), 20)"
		const result = await runCommand(node, ['-e', script], {...BASE, onStdoutLine: line => lines.push(line)})
		expect(lines).toEqual(['/out/سلام.mp4'])
		expect(result.stdout).toBe('/out/سلام.mp4\n')
	})

	it('keeps only the last maxOutputBytes of a stream', async () => {
		const script = "for (let i = 0; i < 200; i++) process.stdout.write(String(i).padStart(4, '0') + '\\n')"
		const result = await runCommand(node, ['-e', script], {...BASE, maxOutputBytes: 50})
		expect(Buffer.byteLength(result.stdout)).toBe(50)
		expect(result.stdout.endsWith('0199\n')).toBe(true)
	})
})

describe('runCommand — line callback failures', () => {
	it('rejects with the callback error and stops a child that would run on', async () => {
		const boom = new Error('bad line')
		const startedAt = Date.now()
		const run = runCommand(node, ['-e', "console.log('first'); setInterval(() => {}, 1000)"], {
			...BASE,
			onStdoutLine: () => {
				throw boom
			}
		})
		await expect(run).rejects.toBe(boom)
		expect(Date.now() - startedAt).toBeLessThan(5_000)
	})

	it('rejects when the callback throws on the trailing line flushed at exit', async () => {
		const boom = new Error('bad trailing line')
		const run = runCommand(node, ['-e', "process.stderr.write('no newline at end')"], {
			...BASE,
			onStderrLine: () => {
				throw boom
			}
		})
		await expect(run).rejects.toBe(boom)
	})
})

describe('runCommand — stopping', () => {
	it('reports a timeout as exit code 124', async () => {
		await expect(runCommand(node, ['-e', "process.on('SIGTERM', () => process.exit(0)); setInterval(() => {}, 1000)"], {timeoutMs: 50, maxOutputBytes: 1024})).rejects.toMatchObject({result: {exitCode: 124}})
	})

	it('reports a cancel as exit code 130', async () => {
		const controller = new AbortController()
		const run = runCommand(node, ['-e', 'setInterval(() => {}, 1000)'], {...BASE, signal: controller.signal})
		controller.abort()
		await expect(run).rejects.toBeInstanceOf(CommandExecutionError)
		await expect(run).rejects.toMatchObject({result: {exitCode: 130}})
	})

	// yt-dlp forks ffmpeg; killing only the parent leaves ffmpeg running.
	it.skipIf(process.platform === 'win32')('kills the processes the child forked, not just the child', async () => {
		const controller = new AbortController()
		let grandchild: number | undefined
		const script = "const {spawn} = require('node:child_process'); const g = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {stdio: 'ignore'}); console.log(g.pid); setInterval(() => {}, 1000)"
		const run = runCommand(node, ['-e', script], {
			...BASE,
			signal: controller.signal,
			onStdoutLine: line => {
				grandchild = Number(line)
				controller.abort()
			}
		})
		await expect(run).rejects.toMatchObject({result: {exitCode: 130}})
		expect(grandchild).toBeGreaterThan(0)
		for (let i = 0; i < 50 && grandchild && isAlive(grandchild); i++) await sleep(20)
		expect(grandchild && isAlive(grandchild)).toBe(false)
	})

	it('rejects with exit code 127 when the command cannot be spawned', async () => {
		await expect(runCommand('/definitely/not/a/binary', [], BASE)).rejects.toMatchObject({result: {exitCode: 127}})
	})
})
