// Real-world smoke runner that boots inside Electron's main process and uses
// the same services that production downloads use:
//   - HiddenWindowTokenProvider (the bevasrs.wpc scrape)
//   - TokenService            (warmUp + mint cache)
//   - BinaryManager           (real yt-dlp binary)
//   - ProbeService            (full 3-attempt ladder via runYtDlp)
//
// Triggered by setting ARROXY_SMOKE_URL. Skips creating the main window;
// reports to stdout; exits cleanly.

import {nonEmpty} from '@shared/format.js'
import type {ProbeError, ProbeOtherErrorCode, YtDlpErrorKind} from '@shared/types.js'
import type {BinaryManager} from './services/BinaryManager.js'
import type {ProbeService} from './services/ProbeService.js'
import type {TokenService} from './services/TokenService.js'
import type {YtDlp, YtDlpInvocationSummary} from './services/YtDlp.js'

interface SmokeDeps {
	url: string
	binaryManager: BinaryManager
	tokenService: TokenService
	probeService: ProbeService
	ytDlp: YtDlp
}

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'
export const LIVE_PROBE_SMOKE_RESULT_PREFIX = 'ARROXY_LIVE_PROBE_SMOKE_RESULT '

export interface LiveProbeSmokeReport {
	liveProbeSmoke: true
	ok: boolean
	url: string
	platform: NodeJS.Platform
	arch: string
	execPath: string
	parentElectronRunAsNode: string | null
	ytDlp: {
		path: string | null
		args: string[]
		jsRuntime: 'electron-node' | null
		jsRuntimePath: string | null
		jsRuntimeVersion: string | null
		ejsComponents: 'none' | 'remote-github' | 'bundled-required'
		usesElectronNode: boolean
		usesDeno: boolean
		hasNoJsRuntimes: boolean
		hasBundledEjs: boolean
		hasRemoteEjs: boolean
		attempts: YtDlpInvocationSummary[]
	}
	probe: {ok: boolean; kind: 'video' | 'playlist' | null; title: string | null; formatCount: number; durationMs: number | null; error: string | null; errorKind: YtDlpErrorKind | ProbeOtherErrorCode | null}
	potMint: {ok: boolean; tokenLength: number | null; visitorDataLength: number | null; durationMs: number | null; error: string | null}
	failures: string[]
	warnings: string[]
}

// Electron's main process can buffer console.log oddly under xvfb-run; use
// a direct fd write so the report reliably reaches the parent terminal.
function out(line: string): void {
	process.stdout.write(line + '\n')
}
function pass(label: string, detail = ''): void {
	out(`  ${GREEN}PASS${RESET}  ${label}${detail ? '  ' + detail : ''}`)
}
function warn(label: string, detail: string): void {
	out(`  ${YELLOW}WARN${RESET}  ${label}  ${detail}`)
}
function fail(label: string, detail: string): void {
	out(`  ${RED}FAIL${RESET}  ${label}  ${detail}`)
}

function emptyLiveProbeSmokeReport(url: string): LiveProbeSmokeReport {
	return {
		liveProbeSmoke: true,
		ok: false,
		url,
		platform: process.platform,
		arch: process.arch,
		execPath: process.execPath,
		parentElectronRunAsNode: process.env.ELECTRON_RUN_AS_NODE ?? null,
		ytDlp: {path: null, args: [], jsRuntime: null, jsRuntimePath: null, jsRuntimeVersion: null, ejsComponents: 'none', usesElectronNode: false, usesDeno: false, hasNoJsRuntimes: false, hasBundledEjs: false, hasRemoteEjs: false, attempts: []},
		probe: {ok: false, kind: null, title: null, formatCount: 0, durationMs: null, error: null, errorKind: null},
		potMint: {ok: false, tokenLength: null, visitorDataLength: null, durationMs: null, error: null},
		failures: [],
		warnings: []
	}
}

function usesDenoRuntime(args: readonly string[]): boolean {
	return args.some(arg => arg === 'deno' || arg.startsWith('deno:'))
}

function usesRemoteEjs(args: readonly string[]): boolean {
	return args.some(arg => arg === '--remote-components' || arg === 'ejs:npm' || arg === 'ejs:github')
}

function usesYoutubePoToken(args: readonly string[]): boolean {
	return args.some(arg => arg.startsWith('youtube:po_token='))
}

function applyInvocationSummaries(report: LiveProbeSmokeReport, summaries: readonly YtDlpInvocationSummary[], fallbackYtDlpPath: string | null): void {
	const summary = summaries.at(-1) ?? null
	const args = summary?.args ?? []
	const jsRuntime = summary?.jsRuntime.jsRuntime === 'electron-node' ? summary.jsRuntime : null
	report.ytDlp = {
		path: summary?.ytDlpPath ?? fallbackYtDlpPath,
		args,
		jsRuntime: jsRuntime?.jsRuntime ?? null,
		jsRuntimePath: jsRuntime?.jsRuntimePath ?? null,
		jsRuntimeVersion: jsRuntime?.jsRuntimeVersion ?? null,
		ejsComponents: summary?.jsRuntime.ejsComponents ?? 'none',
		usesElectronNode: args.some(arg => arg === `node:${report.execPath}`),
		usesDeno: usesDenoRuntime(args),
		hasNoJsRuntimes: args.includes('--no-js-runtimes'),
		hasBundledEjs: summary?.jsRuntime.ejsComponents === 'bundled-required',
		hasRemoteEjs: summary?.jsRuntime.ejsComponents === 'remote-github' || usesRemoteEjs(args),
		attempts: summaries.map(item => ({...item, args: [...item.args]}))
	}
}

function addFailure(report: LiveProbeSmokeReport, label: string, detail: string): void {
	report.failures.push(`${label}: ${detail}`)
	fail(label, detail)
}

function addWarning(report: LiveProbeSmokeReport, label: string, detail: string): void {
	report.warnings.push(`${label}: ${detail}`)
	warn(label, detail)
}

function probeErrorMessage(error: ProbeError): string {
	if (error.kind === 'ytdlp') return error.error.raw
	if (error.message) return error.message
	return 'Probe failed'
}

function probeErrorKind(error: ProbeError): YtDlpErrorKind | ProbeOtherErrorCode {
	return error.kind === 'ytdlp' ? error.error.kind : error.code
}

export function serializeLiveProbeSmokeReport(report: LiveProbeSmokeReport): string {
	return `${LIVE_PROBE_SMOKE_RESULT_PREFIX}${JSON.stringify(report)}`
}

export function parseLiveProbeSmokeResultLine(line: string): LiveProbeSmokeReport | null {
	if (!line.startsWith(LIVE_PROBE_SMOKE_RESULT_PREFIX)) return null
	try {
		const parsed = JSON.parse(line.slice(LIVE_PROBE_SMOKE_RESULT_PREFIX.length)) as LiveProbeSmokeReport
		return parsed?.liveProbeSmoke === true ? parsed : null
	} catch {
		return null
	}
}

function legacyInvocationSummary(report: LiveProbeSmokeReport): YtDlpInvocationSummary {
	if (report.ytDlp.jsRuntime === 'electron-node' && report.ytDlp.jsRuntimePath && report.ytDlp.jsRuntimeVersion) {
		const ejsComponents = report.ytDlp.ejsComponents === 'remote-github' ? 'remote-github' : 'bundled-required'
		return {ytDlpPath: report.ytDlp.path ?? '', ffmpegPath: null, args: report.ytDlp.args, jsRuntime: {jsRuntime: 'electron-node', jsRuntimePath: report.ytDlp.jsRuntimePath, jsRuntimeVersion: report.ytDlp.jsRuntimeVersion, ejsComponents}, attempt: 'pot', reMint: false}
	}
	return {ytDlpPath: report.ytDlp.path ?? '', ffmpegPath: null, args: report.ytDlp.args, jsRuntime: {jsRuntime: null, ejsComponents: 'none'}, attempt: 'pot', reMint: false}
}

export function probeSmokeReportIsHealthy(report: LiveProbeSmokeReport): boolean {
	const attempts = report.ytDlp.attempts.length > 0 ? report.ytDlp.attempts : [legacyInvocationSummary(report)]
	const usesPackagedElectronNode = (args: readonly string[]): boolean => args.includes('--no-js-runtimes') && args.includes('--js-runtimes') && args.some(arg => arg === `node:${report.execPath}`) && !usesDenoRuntime(args) && !usesRemoteEjs(args)
	const allAttemptsUsePackagedRuntime =
		attempts.length > 0 &&
		attempts.every(attempt => {
			return usesPackagedElectronNode(attempt.args) && attempt.jsRuntime.jsRuntime === 'electron-node' && attempt.jsRuntime.jsRuntimePath === report.execPath && attempt.jsRuntime.ejsComponents === 'bundled-required'
		})
	const hasYoutubePoAttempt = attempts.some(attempt => attempt.attempt === 'pot' && attempt.args.includes('--no-playlist') && usesYoutubePoToken(attempt.args) && usesPackagedElectronNode(attempt.args))
	const successfulVideoProbe = report.probe.ok && report.probe.kind === 'video' && report.probe.formatCount > 0
	const acceptedRunnerBotBlock = !report.probe.ok && report.probe.errorKind === 'botBlock' && report.potMint.ok && hasYoutubePoAttempt
	return report.ok && report.potMint.ok && allAttemptsUsePackagedRuntime && hasYoutubePoAttempt && (successfulVideoProbe || acceptedRunnerBotBlock) && report.failures.length === 0
}

export async function runSmokeMode(deps: SmokeDeps): Promise<number> {
	const {url, binaryManager, tokenService, probeService, ytDlp} = deps
	const report = emptyLiveProbeSmokeReport(url)

	out('Live probe smoke — Electron, real yt-dlp, real YouTube')
	out(`  url: ${url}`)
	out('')

	// 1. Binary readiness — verifies BinaryManager's checksum/download path.
	let ytDlpPath: string | null = null
	try {
		ytDlpPath = await binaryManager.ensureYtDlp()
		report.ytDlp.path = ytDlpPath
		pass('yt-dlp binary ready', ytDlpPath)
	} catch (err) {
		addFailure(report, 'yt-dlp binary ready', err instanceof Error ? err.message : String(err))
	}

	// 2. PoT mint — exercises HiddenWindowTokenProvider's `bevasrs.wpc` scrape.
	//    This is the canary for "YouTube renamed the symbol."
	const mintStart = Date.now()
	try {
		const {token, visitorData} = await tokenService.mintTokenForUrl(url)
		const tokenLen = token.length
		const vdLen = visitorData.length
		if (tokenLen < 10) throw new Error(`suspiciously short token (${tokenLen} chars)`)
		report.potMint = {ok: true, tokenLength: tokenLen, visitorDataLength: vdLen, durationMs: Date.now() - mintStart, error: null}
		pass('PoT mint (bevasrs.wpc scrape)', `token=${tokenLen}ch  vd=${vdLen}ch  in ${Date.now() - mintStart}ms`)
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		report.potMint = {ok: false, tokenLength: null, visitorDataLength: null, durationMs: Date.now() - mintStart, error: message}
		addFailure(report, 'PoT mint (bevasrs.wpc scrape)', message)
	}

	// 3. Probe — real ProbeService invocation, real yt-dlp spawn, real network.
	if (ytDlpPath) {
		const probeStart = Date.now()
		const probe = await probeService.probe(url, 'off', 'video')
		const durationMs = Date.now() - probeStart
		if (probe.ok) {
			if (probe.data.kind === 'video') {
				report.probe = {ok: true, kind: 'video', title: probe.data.title || null, formatCount: probe.data.formats.length, durationMs, error: null, errorKind: null}
				pass('probe (ProbeService)', `${probe.data.formats.length} formats  in ${durationMs}ms`)
				pass('  └ schema parses', probe.data.title || '(no title)')
			} else {
				report.probe = {ok: true, kind: 'playlist', title: probe.data.playlistTitle || null, formatCount: probe.data.entries.length, durationMs, error: null, errorKind: null}
				pass('probe (ProbeService)', `${probe.data.entries.length} playlist entries  in ${durationMs}ms`)
				pass('  └ schema parses', probe.data.playlistTitle || '(no title)')
			}
		} else {
			const message = probeErrorMessage(probe.error)
			const kind = probeErrorKind(probe.error)
			report.probe = {ok: false, kind: null, title: null, formatCount: 0, durationMs, error: message, errorKind: kind}
			if (kind === 'botBlock') {
				addWarning(report, 'probe (ProbeService)', `${message} (accepted only when packaged PoT runtime proof is present)`)
			} else {
				addFailure(report, 'probe (ProbeService)', message)
			}
		}
	}

	applyInvocationSummaries(report, ytDlp.getLastInvocationSummaries(), ytDlpPath)
	report.ok = probeSmokeReportIsHealthy({...report, ok: report.failures.length === 0})

	out('')
	out(serializeLiveProbeSmokeReport(report))
	out('')
	if (report.ok) {
		out(`${GREEN}Live probe smoke passed.${RESET}`)
	} else if (report.failures.length === 0) {
		out(`${RED}Live probe smoke contract failed.${RESET}`)
	} else {
		out(`${RED}${report.failures.length} live probe smoke check${report.failures.length === 1 ? '' : 's'} failed.${RESET}`)
	}
	return report.ok ? 0 : 1
}

export function readSmokeUrl(): string | null {
	return nonEmpty(process.env.ARROXY_SMOKE_URL?.trim()) ?? null
}
