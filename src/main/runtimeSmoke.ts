import {spawn} from 'node:child_process'
import {app} from 'electron'
import type {DependencySource} from '@shared/types.js'
import type {BinaryManager} from './services/BinaryManager.js'
import {applyJsRuntimeEnv, buildYtDlpJsRuntimeArgs, probeElectronNodeRuntime, type YtDlpJsRuntime} from './services/ytDlpJsRuntime.js'

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'
const RUNTIME_SMOKE_TIMEOUT_MS = 60_000

export const RUNTIME_SMOKE_RESULT_PREFIX = 'ARROXY_RUNTIME_SMOKE_RESULT '

export interface YtDlpVerboseRuntimeSummary {
	hasNodeRuntime: boolean
	hasUnsupportedNodeRuntime: boolean
	hasYtDlpEjs: boolean
	hasDenoRuntime: boolean
	hasEjsNpmRemoteComponent: boolean
	jsRuntimeLines: string[]
	optionalLibraryLines: string[]
}

export interface RuntimeSmokeReport {
	runtimeSmoke: true
	ok: boolean
	execPath: string
	parentElectronRunAsNode: string | null
	nodeVersion: string | null
	nodeMajor: number | null
	stdinJs: {ok: boolean; output: string | null}
	ytDlp: {path: string | null; sourceKind: DependencySource['kind'] | null; sourceLabel: string | null; ejsComponents: 'bundled-required'; remoteComponentsEnabled: boolean; args: string[]; verbose: YtDlpVerboseRuntimeSummary | null}
	failures: string[]
}

interface RuntimeSmokeDeps {
	binaryManager: BinaryManager
}

interface ProcessResult {
	code: number | null
	stdout: string
	stderr: string
}

function out(line: string): void {
	process.stdout.write(line + '\n')
}

function pass(label: string, detail = ''): void {
	out(`  ${GREEN}PASS${RESET}  ${label}${detail ? '  ' + detail : ''}`)
}

function fail(label: string, detail: string): void {
	out(`  ${RED}FAIL${RESET}  ${label}  ${detail}`)
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err)
}

function sourceLabel(source: DependencySource | null | undefined): string | null {
	if (!source) return null
	if (source.kind === 'managedCache') return 'managed-cache'
	return source.kind
}

function nodeMajor(version: string | null): number | null {
	if (!version) return null
	const major = Number(version.split('.')[0])
	return Number.isFinite(major) ? major : null
}

function hasNodeToken(line: string): boolean {
	return /\bnode\b/i.test(line)
}

function lineMarksNodeUnsupported(line: string): boolean {
	return hasNodeToken(line) && /\b(unsupported|unavailable|not found|failed|missing|too old)\b/i.test(line)
}

function nodeRuntimeSegments(line: string): string[] {
	const runtimeList = line.split(/\bJS runtimes\b\s*:/i)[1] ?? line
	return runtimeList
		.split(/[,;]/)
		.map(segment => segment.trim())
		.filter(hasNodeToken)
}

function spawnText(file: string, args: string[], opts: {env: NodeJS.ProcessEnv; stdin?: string; timeoutMs?: number}): Promise<ProcessResult> {
	return new Promise((resolve, reject) => {
		const proc = spawn(file, args, {env: opts.env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']})
		let stdout = ''
		let stderr = ''
		let settled = false
		const finish = (fn: () => void): void => {
			if (settled) return
			settled = true
			clearTimeout(timer)
			fn()
		}
		const timer = setTimeout(() => {
			proc.kill('SIGKILL')
			finish(() => reject(new Error(`Timed out after ${opts.timeoutMs ?? RUNTIME_SMOKE_TIMEOUT_MS}ms running ${file}`)))
		}, opts.timeoutMs ?? RUNTIME_SMOKE_TIMEOUT_MS)

		proc.stdout.on('data', chunk => {
			stdout += String(chunk)
		})
		proc.stderr.on('data', chunk => {
			stderr += String(chunk)
		})
		proc.on('error', err => {
			finish(() => reject(err))
		})
		proc.on('close', code => {
			finish(() => resolve({code, stdout, stderr}))
		})
		proc.stdin.end(opts.stdin ?? '')
	})
}

export function readRuntimeSmokeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	return env.ARROXY_RUNTIME_SMOKE === '1'
}

export function summarizeYtDlpVerboseRuntime(text: string): YtDlpVerboseRuntimeSummary {
	const lines = text.split(/\r?\n/).flatMap(line => {
		const runtimeLine = line.trim()
		return runtimeLine ? [runtimeLine] : []
	})
	const jsRuntimeLines = lines.filter(line => /\bJS runtimes\b/i.test(line))
	const optionalLibraryLines = lines.filter(line => /\bOptional libraries\b/i.test(line))
	const nodeSegments = jsRuntimeLines.flatMap(nodeRuntimeSegments)
	const hasUnsupportedNodeRuntime = nodeSegments.some(lineMarksNodeUnsupported)
	const hasNodeRuntime = nodeSegments.some(line => hasNodeToken(line) && !lineMarksNodeUnsupported(line))

	return {hasNodeRuntime, hasUnsupportedNodeRuntime, hasYtDlpEjs: optionalLibraryLines.some(line => /\byt[-_]dlp[-_]ejs\b/i.test(line)), hasDenoRuntime: jsRuntimeLines.some(line => /\bdeno\b/i.test(line)), hasEjsNpmRemoteComponent: /\bejs:npm\b/i.test(text), jsRuntimeLines, optionalLibraryLines}
}

export function serializeRuntimeSmokeReport(report: RuntimeSmokeReport): string {
	return `${RUNTIME_SMOKE_RESULT_PREFIX}${JSON.stringify(report)}`
}

export function parseRuntimeSmokeResultLine(line: string): RuntimeSmokeReport | null {
	if (!line.startsWith(RUNTIME_SMOKE_RESULT_PREFIX)) return null
	try {
		const parsed = JSON.parse(line.slice(RUNTIME_SMOKE_RESULT_PREFIX.length)) as RuntimeSmokeReport
		return parsed?.runtimeSmoke === true ? parsed : null
	} catch {
		return null
	}
}

export function runtimeSmokeReportIsHealthy(report: RuntimeSmokeReport): boolean {
	return (
		report.ok &&
		report.nodeMajor !== null &&
		report.nodeMajor >= 22 &&
		report.stdinJs.ok &&
		report.parentElectronRunAsNode !== '1' &&
		(report.ytDlp.sourceKind === 'managed' || report.ytDlp.sourceKind === 'managedCache') &&
		!report.ytDlp.remoteComponentsEnabled &&
		report.ytDlp.args.includes('--no-js-runtimes') &&
		report.ytDlp.args.includes('--js-runtimes') &&
		report.ytDlp.args.some(arg => arg === `node:${report.execPath}`) &&
		!report.ytDlp.args.some(arg => arg.startsWith('deno:') || arg === 'ejs:npm') &&
		report.ytDlp.verbose !== null &&
		report.ytDlp.verbose.hasNodeRuntime &&
		!report.ytDlp.verbose.hasUnsupportedNodeRuntime &&
		report.ytDlp.verbose.hasYtDlpEjs &&
		!report.ytDlp.verbose.hasEjsNpmRemoteComponent &&
		report.failures.length === 0
	)
}

function addFailure(report: RuntimeSmokeReport, label: string, detail: string): void {
	report.failures.push(`${label}: ${detail}`)
	fail(label, detail)
}

async function runStdinProbe(runtime: YtDlpJsRuntime): Promise<string> {
	const script = `
		const values = [3, 4, 5];
		console.log(JSON.stringify({
			runtime: 'electron-node',
			sum: values.reduce((total, value) => total + value, 0),
			execPath: process.execPath
		}));
	`
	const result = await spawnText(runtime.executablePath, ['-'], {env: applyJsRuntimeEnv(process.env, runtime), stdin: script, timeoutMs: 20_000})
	if (result.code !== 0) {
		throw new Error(`exit ${result.code}: ${result.stderr.trim() || result.stdout.trim()}`)
	}
	return result.stdout.trim()
}

async function runYtDlpVerboseProbe(ytDlpPath: string, runtime: YtDlpJsRuntime, args: string[]): Promise<YtDlpVerboseRuntimeSummary> {
	const result = await spawnText(ytDlpPath, [...args, '--verbose'], {env: applyJsRuntimeEnv(process.env, runtime), timeoutMs: RUNTIME_SMOKE_TIMEOUT_MS})
	const output = `${result.stdout}\n${result.stderr}`
	const expectedNoUrlExit = result.code === 2 && /You must provide at least one URL/i.test(output)
	if (result.code !== 0 && !expectedNoUrlExit) {
		throw new Error(`exit ${result.code}: ${output.trim().slice(0, 2000)}`)
	}
	return summarizeYtDlpVerboseRuntime(output)
}

export async function runRuntimeSmokeMode({binaryManager}: RuntimeSmokeDeps): Promise<number> {
	out('Runtime smoke — packaged Electron Node + managed yt-dlp')
	out(`  execPath: ${process.execPath}`)
	out('')

	const report: RuntimeSmokeReport = {
		runtimeSmoke: true,
		ok: false,
		execPath: process.execPath,
		parentElectronRunAsNode: process.env.ELECTRON_RUN_AS_NODE ?? null,
		nodeVersion: null,
		nodeMajor: null,
		stdinJs: {ok: false, output: null},
		ytDlp: {path: null, sourceKind: null, sourceLabel: null, ejsComponents: 'bundled-required', remoteComponentsEnabled: false, args: [], verbose: null},
		failures: []
	}

	let runtime: YtDlpJsRuntime | null = null
	const electronProbe = await probeElectronNodeRuntime({executablePath: process.execPath})
	if (electronProbe.ok) {
		runtime = electronProbe.runtime
		report.nodeVersion = electronProbe.runtime.version
		report.nodeMajor = nodeMajor(electronProbe.runtime.version)
		pass('Electron runAsNode version probe', `node=${electronProbe.runtime.version}`)
	} else {
		addFailure(report, 'Electron runAsNode version probe', electronProbe.reason)
	}

	if (report.parentElectronRunAsNode === '1') {
		addFailure(report, 'parent ELECTRON_RUN_AS_NODE env', 'ELECTRON_RUN_AS_NODE leaked into the app process')
	} else {
		pass('parent ELECTRON_RUN_AS_NODE env', report.parentElectronRunAsNode === null ? 'unset' : `value=${JSON.stringify(report.parentElectronRunAsNode)}`)
	}

	if (runtime) {
		try {
			const output = await runStdinProbe(runtime)
			const parsed = JSON.parse(output) as {runtime?: string; sum?: number; execPath?: string}
			if (parsed.runtime !== 'electron-node' || parsed.sum !== 12 || parsed.execPath !== process.execPath) {
				throw new Error(`unexpected stdin result ${output}`)
			}
			report.stdinJs = {ok: true, output}
			pass('Electron Node stdin JS', output)
		} catch (err) {
			report.stdinJs = {ok: false, output: null}
			addFailure(report, 'Electron Node stdin JS', errorMessage(err))
		}
	}

	let ytDlpPath: string | null = null
	try {
		ytDlpPath = await binaryManager.ensureYtDlp()
		report.ytDlp.path = ytDlpPath
		const source = binaryManager.getLastDiagnostic('yt-dlp')?.source ?? null
		report.ytDlp.sourceKind = source?.kind ?? null
		report.ytDlp.sourceLabel = sourceLabel(source)
		if (source?.kind === 'managed' || source?.kind === 'managedCache') {
			pass('managed yt-dlp source', report.ytDlp.sourceLabel ?? source.kind)
		} else {
			addFailure(report, 'managed yt-dlp source', `expected managed or managed-cache, got ${report.ytDlp.sourceLabel ?? 'none'}`)
		}
	} catch (err) {
		addFailure(report, 'managed yt-dlp source', errorMessage(err))
	}

	if (runtime && ytDlpPath) {
		const runtimeForYtDlp: YtDlpJsRuntime = {...runtime, allowRemoteComponents: false}
		const args = buildYtDlpJsRuntimeArgs(runtimeForYtDlp)
		report.ytDlp.args = args
		report.ytDlp.remoteComponentsEnabled = args.includes('--remote-components')

		if (args.includes('--no-js-runtimes') && args.includes('--js-runtimes') && args.some(arg => arg === `node:${process.execPath}`) && !args.some(arg => arg.startsWith('deno:') || arg === 'ejs:npm') && !report.ytDlp.remoteComponentsEnabled) {
			pass('yt-dlp runtime args', args.join(' '))
		} else {
			addFailure(report, 'yt-dlp runtime args', args.join(' '))
		}

		try {
			const verbose = await runYtDlpVerboseProbe(ytDlpPath, runtimeForYtDlp, args)
			report.ytDlp.verbose = verbose
			if (verbose.hasNodeRuntime && !verbose.hasUnsupportedNodeRuntime && verbose.hasYtDlpEjs && !verbose.hasEjsNpmRemoteComponent) {
				pass('yt-dlp verbose runtime/EJS', [...verbose.jsRuntimeLines, ...verbose.optionalLibraryLines].join(' | '))
			} else {
				addFailure(report, 'yt-dlp verbose runtime/EJS', JSON.stringify(verbose))
			}
		} catch (err) {
			addFailure(report, 'yt-dlp verbose runtime/EJS', errorMessage(err))
		}
	}

	report.ok = runtimeSmokeReportIsHealthy({...report, ok: report.failures.length === 0})
	out('')
	out(serializeRuntimeSmokeReport(report))
	out('')
	if (report.ok) {
		out(`${GREEN}Runtime smoke passed.${RESET}`)
	} else {
		out(`${RED}${report.failures.length} runtime smoke check${report.failures.length === 1 ? '' : 's'} failed.${RESET}`)
	}
	return report.ok ? 0 : 1
}

export function exitWithCode(code: number): void {
	app.exit(code)
}
