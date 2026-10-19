// Runs the FFmpeg remux matrix against one ffmpeg/ffprobe pair:
//
//   bun scripts/ffmpeg-matrix/run.ts --ffmpeg <dir>/ffmpeg [--ffprobe <path>] [--title <text>] [--report <file.md>] [--json <file>]
//   bun scripts/ffmpeg-matrix/run.ts --pinned linux-x64 [--cache-root <dir>] ...
//
// --pinned downloads the approved FFmpeg package for that target from
// FfmpegPackagePins.ts and installs it with the app's own installer (SHA-256,
// file list and links checked), then tests that install. The target must be
// the machine it runs on.
//
// Each case runs the exact command yt-dlp or Arroxy would, then ffprobe checks
// the output holds what it should and ffmpeg decodes it. A case fails on a
// non-zero exit, a signal or Windows crash code, a timeout, or a wrong output;
// cases that read a failed case's output are reported as blocked. Exits 1 if
// any case did not pass. The report is also appended to $GITHUB_STEP_SUMMARY.
import {spawn} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {FfmpegPackageMaterializer} from '../../src/main/services/binary/FfmpegPackageMaterializer.js'
import {FFMPEG_PACKAGE_PINS} from '../../src/main/services/binary/FfmpegPackagePins.js'
import {envWithFfmpegPaths} from '../../src/main/utils/process.js'
import {isCliEntrypoint} from '../build/btbnResolver.js'
import {DEFAULT_FIXTURE_DIR} from './generate-fixtures.js'
import {classifyProcessEnd, describeFailure, formatReport, resultLabel, summarize, verifyProbe, type CaseResult, type ProcessEnd} from './outcome.js'
import {buildCases, decodeArgv, expectationFor, planInvocation, probeArgv, type Layout} from './remuxMatrix.js'

const TIMEOUT_MS = 60_000
const STDERR_TAIL_CHARS = 4000
const LOG_LINES = 12

interface Ran extends ProcessEnd {
	stdout: string
	stderrTail: string
}

function runProcess(binary: string, argv: readonly string[], env: NodeJS.ProcessEnv): Promise<Ran> {
	return new Promise(resolve => {
		let stdout = ''
		let stderrTail = ''
		let timedOut = false
		const child = spawn(binary, argv, {env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true})
		const timer = setTimeout(() => {
			timedOut = true
			child.kill('SIGKILL')
		}, TIMEOUT_MS)
		child.stdout.on('data', (chunk: Buffer) => {
			stdout += chunk.toString()
		})
		child.stderr.on('data', (chunk: Buffer) => {
			stderrTail = (stderrTail + chunk.toString()).slice(-STDERR_TAIL_CHARS)
		})
		child.on('error', error => {
			clearTimeout(timer)
			resolve({code: null, signal: null, timedOut, spawnError: error.message, stdout, stderrTail})
		})
		child.on('close', (code, signal) => {
			clearTimeout(timer)
			resolve({code, signal, timedOut, stdout, stderrTail})
		})
	})
}

function logTail(stderr: string): string | undefined {
	const lines = stderr.trimEnd().split(/\r?\n/).filter(line => line.trim() !== '')
	return lines.length > 0 ? lines.slice(-LOG_LINES).join('\n') : undefined
}

interface Tools {
	ffmpeg: string
	ffprobe: string
	env: NodeJS.ProcessEnv
}

async function runCase(tools: Tools, layout: Layout, matrixCase: ReturnType<typeof buildCases>[number]): Promise<CaseResult> {
	const {id} = matrixCase
	const invocation = planInvocation(matrixCase, layout)
	for (const file of invocation.files) fs.writeFileSync(file.path, file.content)
	const ran = await runProcess(tools.ffmpeg, invocation.argv, tools.env)
	const failure = classifyProcessEnd(ran)
	if (failure) return {id, status: 'fail', stage: 'ffmpeg', detail: describeFailure(failure), log: logTail(ran.stderrTail)}

	const probe = await runProcess(tools.ffprobe, probeArgv(invocation.output), tools.env)
	const probeFailure = classifyProcessEnd(probe)
	if (probeFailure) return {id, status: 'fail', stage: 'ffprobe', detail: describeFailure(probeFailure), log: logTail(probe.stderrTail)}
	const expectation = expectationFor(matrixCase)
	const problems = verifyProbe(expectation, probe.stdout)
	if (problems.length > 0) return {id, status: 'fail', stage: 'output', detail: problems.join('; ')}

	if (expectation.kind === 'media') {
		const decoded = await runProcess(tools.ffmpeg, decodeArgv(invocation.output), tools.env)
		const decodeFailure = classifyProcessEnd(decoded)
		if (decodeFailure) return {id, status: 'fail', stage: 'decode', detail: describeFailure(decodeFailure), log: logTail(decoded.stderrTail)}
	}
	return {id, status: 'pass'}
}

export async function runMatrix(tools: Tools, layout: Layout, onResult: (result: CaseResult) => void): Promise<CaseResult[]> {
	const results = new Map<string, CaseResult>()
	for (const matrixCase of buildCases()) {
		const blocker = matrixCase.needs.find(need => results.get(need)?.status !== 'pass')
		// Each case reads the previous ones' outputs, so they run one at a time.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop -- sequential by design
		const result: CaseResult = blocker ? {id: matrixCase.id, status: 'blocked', by: blocker} : await runCase(tools, layout, matrixCase)
		results.set(matrixCase.id, result)
		onResult(result)
	}
	return [...results.values()]
}

function flag(args: readonly string[], name: string): string | undefined {
	const index = args.indexOf(name)
	return index >= 0 ? args[index + 1] : undefined
}

async function versionLine(tools: Tools): Promise<string> {
	const ran = await runProcess(tools.ffmpeg, ['-hide_banner', '-version'], tools.env)
	const line = ran.stdout.split(/\r?\n/)[0]?.replace(/\s+Copyright.*$/, '').trim()
	return line || `${tools.ffmpeg} (no version: ${describeFailure(classifyProcessEnd(ran) ?? {kind: 'exit', code: 0})})`
}

const USAGE = 'usage: bun scripts/ffmpeg-matrix/run.ts (--ffmpeg <path> [--ffprobe <path>] | --pinned <platform>-<arch> [--cache-root <dir>]) [--title <text>] [--report <file.md>] [--json <file>]'

async function installPinned(target: string, cacheRoot: string): Promise<{ffmpeg: string; ffprobe: string}> {
	const host = `${process.platform}-${process.arch}`
	if (target !== host) throw new Error(`--pinned ${target} cannot run on ${host}`)
	const entry = FFMPEG_PACKAGE_PINS.find(pin => `${pin.platform}-${pin.arch}` === target)
	if (!entry) throw new Error(`no pinned FFmpeg package for ${target}`)
	console.log(`installing pinned FFmpeg ${entry.version} for ${target} from ${entry.url}`)
	const install = await new FfmpegPackageMaterializer().materialize(entry, {cacheRoot})
	return {ffmpeg: install.ffmpegPath, ffprobe: install.ffprobePath}
}

async function resolveTools(args: readonly string[]): Promise<Tools> {
	const pinned = flag(args, '--pinned')
	if (pinned) {
		const installed = await installPinned(pinned, path.resolve(flag(args, '--cache-root') ?? fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-ffmpeg-package-'))))
		return {...installed, env: envWithFfmpegPaths(installed.ffmpeg)}
	}
	const ffmpegArg = flag(args, '--ffmpeg')
	if (!ffmpegArg) throw new Error(USAGE)
	const ffmpeg = path.resolve(ffmpegArg)
	const ffprobe = path.resolve(flag(args, '--ffprobe') ?? path.join(path.dirname(ffmpeg), path.basename(ffmpeg).replace(/^ffmpeg/, 'ffprobe')))
	return {ffmpeg, ffprobe, env: envWithFfmpegPaths(ffmpeg)}
}

async function main(args: readonly string[]): Promise<number> {
	const tools = await resolveTools(args)
	const layout: Layout = {fixtures: path.resolve(flag(args, '--fixtures') ?? DEFAULT_FIXTURE_DIR), work: fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-remux-matrix-'))}

	const version = await versionLine(tools)
	console.log(`${version}\nwork directory: ${layout.work}\n`)
	const results = await runMatrix(tools, layout, result => {
		console.log(result.status === 'pass' ? `pass  ${result.id}` : `${result.status === 'fail' ? 'FAIL' : 'skip'}  ${result.id}: ${resultLabel(result)}`)
		if (result.status === 'fail' && result.log) console.log(result.log.replace(/^/gm, '      '))
	})

	const report = formatReport(`${flag(args, '--title') ?? 'FFmpeg remux matrix'}: ${version}`, results)
	const reportPath = flag(args, '--report')
	if (reportPath) fs.writeFileSync(reportPath, report)
	const jsonPath = flag(args, '--json')
	if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify({version, results}, null, 2)}\n`)
	if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`)

	const {pass, fail, blocked} = summarize(results)
	console.log(`\n${pass} passed, ${fail} failed, ${blocked} blocked`)
	return fail + blocked === 0 ? 0 : 1
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).then(
		code => process.exit(code),
		(error: unknown) => {
			console.error(error instanceof Error ? error.message : String(error))
			process.exit(2)
		}
	)
}
