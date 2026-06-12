import {execFile} from 'node:child_process'

const ELECTRON_NODE_MIN_MAJOR = 22
const ELECTRON_NODE_PROBE_TIMEOUT_MS = 30_000

export interface YtDlpJsRuntime {
	kind: 'electron-node'
	executablePath: string
	version: string
	allowRemoteComponents?: boolean
}

export interface ElectronNodeVersionProbeOptions {
	executablePath: string
	args: string[]
	env: NodeJS.ProcessEnv
	shell: false
	windowsHide: true
	timeoutMs: number
	signal?: AbortSignal
}

export type ElectronNodeVersionProbeRunner = (opts: ElectronNodeVersionProbeOptions) => Promise<string>

export type ElectronNodeRuntimeProbeResult = {ok: true; runtime: Extract<YtDlpJsRuntime, {kind: 'electron-node'}>; output: string} | {ok: false; reason: string}

export type YtDlpJsRuntimeLogSummary = {jsRuntime: null; ejsComponents: 'none'} | {jsRuntime: 'electron-node'; jsRuntimePath: string; jsRuntimeVersion: string; ejsComponents: 'remote-github' | 'bundled-required'}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}

export function buildYtDlpJsRuntimeArgs(runtime: YtDlpJsRuntime | null | undefined): string[] {
	if (!runtime) return []
	const remoteComponentArgs = runtime.allowRemoteComponents ? ['--remote-components', 'ejs:github'] : []
	return [...remoteComponentArgs, '--no-js-runtimes', '--js-runtimes', `node:${runtime.executablePath}`]
}

export function applyJsRuntimeEnv(baseEnv: NodeJS.ProcessEnv, _runtime: YtDlpJsRuntime): NodeJS.ProcessEnv {
	return {...baseEnv, ELECTRON_RUN_AS_NODE: '1'}
}

export function summarizeYtDlpJsRuntimeForLog(runtime: YtDlpJsRuntime | null | undefined): YtDlpJsRuntimeLogSummary {
	if (!runtime) return {jsRuntime: null, ejsComponents: 'none'}
	return {jsRuntime: 'electron-node', jsRuntimePath: runtime.executablePath, jsRuntimeVersion: runtime.version, ejsComponents: runtime.allowRemoteComponents ? 'remote-github' : 'bundled-required'}
}

function parseNodeVersion(output: string): string | null {
	const match = /^\s*v?(\d+)\.(\d+)\.(\d+)/.exec(output)
	return match ? `${match[1]}.${match[2]}.${match[3]}` : null
}

function nodeMajor(version: string): number {
	return Number(version.split('.')[0])
}

async function defaultRunVersionProbe(opts: ElectronNodeVersionProbeOptions): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(opts.executablePath, opts.args, {env: opts.env, timeout: opts.timeoutMs, windowsHide: opts.windowsHide, maxBuffer: 1024 * 1024, shell: opts.shell, signal: opts.signal}, (err, stdout, stderr) => {
			if (err) {
				reject(err)
				return
			}
			resolve(String(stdout || stderr || ''))
		})
	})
}

export async function probeElectronNodeRuntime(opts: {executablePath?: string; baseEnv?: NodeJS.ProcessEnv; timeoutMs?: number; signal?: AbortSignal; runVersionProbe?: ElectronNodeVersionProbeRunner} = {}): Promise<ElectronNodeRuntimeProbeResult> {
	const executablePath = opts.executablePath ?? process.execPath
	const runtime: Extract<YtDlpJsRuntime, {kind: 'electron-node'}> = {kind: 'electron-node', executablePath, version: '0.0.0'}
	const probeOpts: ElectronNodeVersionProbeOptions = {executablePath, args: ['--version'], env: applyJsRuntimeEnv(opts.baseEnv ?? process.env, runtime), shell: false, windowsHide: true, timeoutMs: opts.timeoutMs ?? ELECTRON_NODE_PROBE_TIMEOUT_MS, signal: opts.signal}

	try {
		const output = (await (opts.runVersionProbe ?? defaultRunVersionProbe)(probeOpts)).trim()
		const version = parseNodeVersion(output)
		if (!version) return {ok: false, reason: 'Electron Node probe returned empty or invalid version output'}
		if (nodeMajor(version) < ELECTRON_NODE_MIN_MAJOR) return {ok: false, reason: `Electron Node ${version} is older than required Node ${ELECTRON_NODE_MIN_MAJOR}`}
		return {ok: true, runtime: {...runtime, version}, output}
	} catch (err) {
		return {ok: false, reason: errorMessage(err)}
	}
}
