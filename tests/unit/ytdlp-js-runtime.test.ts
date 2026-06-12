import {execFile, spawn} from 'node:child_process'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {promisify} from 'node:util'
import {describe, expect, it} from 'vitest'
import {applyJsRuntimeEnv, buildYtDlpJsRuntimeArgs, probeElectronNodeRuntime, type YtDlpJsRuntime} from '@main/services/ytDlpJsRuntime.js'

const execFileAsync = promisify(execFile)

const electronRuntime: YtDlpJsRuntime = {kind: 'electron-node', executablePath: '/Applications/Arroxy.app/Contents/MacOS/Arroxy', version: '24.16.0'}
const denoRuntime: YtDlpJsRuntime = {kind: 'deno', executablePath: '/runtime-cache/deno'}

describe('yt-dlp JS runtime selection', () => {
	it('builds Electron Node args with --no-js-runtimes before --js-runtimes', () => {
		expect(buildYtDlpJsRuntimeArgs(electronRuntime)).toEqual(['--no-js-runtimes', '--js-runtimes', `node:${electronRuntime.executablePath}`])
	})

	it('builds Deno fallback args without clearing yt-dlp defaults', () => {
		expect(buildYtDlpJsRuntimeArgs(denoRuntime)).toEqual(['--js-runtimes', `deno:${denoRuntime.executablePath}`])
	})

	it('adds ELECTRON_RUN_AS_NODE only for the Electron runtime without mutating the base env', () => {
		const base = {PATH: '/bin', ELECTRON_RUN_AS_NODE: '0'}

		const electronEnv = applyJsRuntimeEnv(base, electronRuntime)
		const denoEnv = applyJsRuntimeEnv(base, denoRuntime)

		expect(electronEnv).toEqual({PATH: '/bin', ELECTRON_RUN_AS_NODE: '1'})
		expect(denoEnv).toEqual(base)
		expect(electronEnv).not.toBe(base)
		expect(denoEnv).not.toBe(base)
		expect(base.ELECTRON_RUN_AS_NODE).toBe('0')
	})

	it('accepts Electron Node v20+ version output', async () => {
		const result = await probeElectronNodeRuntime({
			executablePath: '/mock/Arroxy',
			runVersionProbe: async ({executablePath, args, env, shell, windowsHide}) => {
				expect(executablePath).toBe('/mock/Arroxy')
				expect(args).toEqual(['--version'])
				expect(env.ELECTRON_RUN_AS_NODE).toBe('1')
				expect(shell).toBe(false)
				expect(windowsHide).toBe(true)
				return 'v24.16.0\n'
			}
		})

		expect(result).toEqual({ok: true, runtime: {kind: 'electron-node', executablePath: '/mock/Arroxy', version: '24.16.0'}, output: 'v24.16.0'})
	})

	it('rejects old, empty, and failed Electron Node probes', async () => {
		await expect(probeElectronNodeRuntime({executablePath: '/mock/old', runVersionProbe: async () => 'v18.19.0'})).resolves.toMatchObject({ok: false})
		await expect(probeElectronNodeRuntime({executablePath: '/mock/empty', runVersionProbe: async () => '   '})).resolves.toMatchObject({ok: false})
		await expect(
			probeElectronNodeRuntime({
				executablePath: '/mock/error',
				runVersionProbe: async () => {
					throw Object.assign(new Error('Command failed'), {code: 'ETIMEDOUT'})
				}
			})
		).resolves.toMatchObject({ok: false})
	})
})

async function findDeno(): Promise<string | null> {
	if (process.env.DENO_PATH && existsSync(process.env.DENO_PATH)) return process.env.DENO_PATH
	try {
		const {stdout} = await execFileAsync(process.platform === 'win32' ? 'where' : 'which', [process.platform === 'win32' ? 'deno.exe' : 'deno'], {windowsHide: true})
		return (
			stdout
				.split(/\r?\n/)
				.map(line => line.trim())
				.find(Boolean) ?? null
		)
	} catch {
		return null
	}
}

async function runStdinScript(executablePath: string, args: string[], script: string, env: NodeJS.ProcessEnv): Promise<string> {
	return new Promise((resolve, reject) => {
		const proc = spawn(executablePath, args, {env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		const timer = setTimeout(() => {
			proc.kill('SIGKILL')
			reject(new Error(`Timed out running ${executablePath}`))
		}, 20_000)
		proc.stdout.on('data', chunk => {
			stdout += String(chunk)
		})
		proc.stderr.on('data', chunk => {
			stderr += String(chunk)
		})
		proc.on('error', error => {
			clearTimeout(timer)
			reject(error)
		})
		proc.on('close', code => {
			clearTimeout(timer)
			if (code === 0) {
				resolve(stdout.trim())
				return
			}
			reject(new Error(`Process exited ${code}: ${stderr.trim()}`))
		})
		proc.stdin.end(script)
	})
}

describe('Electron Node runtime parity', () => {
	it('runs stdin JavaScript like Deno for yt-dlp challenge-solver style execution', async () => {
		const electronBin = path.resolve('node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron')
		expect(existsSync(electronBin)).toBe(true)
		const script = `
			const input = {values: [3, 4, 5], challenge: 'n:abc123'};
			const output = {
				sum: input.values.reduce((total, value) => total + value, 0),
				result: input.challenge.replace(/^n:/, '').split('').reverse().join('')
			};
			console.log(JSON.stringify(output));
		`

		const electronOutput = await runStdinScript(electronBin, ['-'], script, applyJsRuntimeEnv(process.env, {kind: 'electron-node', executablePath: electronBin, version: 'test'}))
		expect(electronOutput).toBe('{"sum":12,"result":"321cba"}')

		const denoBin = await findDeno()
		if (!denoBin) return

		const denoOutput = await runStdinScript(denoBin, ['run', '--ext=js', '--no-prompt', '--no-remote', '-'], script, process.env)
		expect(denoOutput).toBe(electronOutput)
	})
})
