import {describe, expect, it} from 'vitest'
import {parseRuntimeSmokeResultLine, readRuntimeSmokeEnabled, RUNTIME_SMOKE_RESULT_PREFIX, runtimeSmokeReportIsHealthy, serializeRuntimeSmokeReport, summarizeYtDlpVerboseRuntime, type RuntimeSmokeReport} from '@main/runtimeSmoke.js'
import {LIVE_PROBE_SMOKE_RESULT_PREFIX, parseLiveProbeSmokeResultLine, probeSmokeReportIsHealthy, serializeLiveProbeSmokeReport, type LiveProbeSmokeReport} from '@main/smoke.js'

const healthyReport: RuntimeSmokeReport = {
	runtimeSmoke: true,
	ok: true,
	execPath: '/Applications/Arroxy.app/Contents/MacOS/Arroxy',
	parentElectronRunAsNode: null,
	nodeVersion: '24.16.0',
	nodeMajor: 24,
	stdinJs: {ok: true, output: '{"runtime":"electron-node","sum":12}'},
	ytDlp: {
		path: '/tmp/runtime-cache/yt-dlp',
		sourceKind: 'managed',
		sourceLabel: 'managed',
		ejsComponents: 'bundled-required',
		remoteComponentsEnabled: false,
		args: ['--no-js-runtimes', '--js-runtimes', 'node:/Applications/Arroxy.app/Contents/MacOS/Arroxy'],
		verbose: {hasNodeRuntime: true, hasUnsupportedNodeRuntime: false, hasYtDlpEjs: true, hasDenoRuntime: false, hasEjsNpmRemoteComponent: false, jsRuntimeLines: ['[debug] JS runtimes: node 24.16.0'], optionalLibraryLines: ['[debug] Optional libraries: curl_cffi-0.11.4, yt-dlp-ejs-0.3.0']}
	},
	failures: []
}

const healthyLiveProbeReport: LiveProbeSmokeReport = {
	liveProbeSmoke: true,
	ok: true,
	url: 'https://www.youtube.com/watch?v=abc123',
	platform: 'darwin',
	arch: 'arm64',
	execPath: '/Applications/Arroxy.app/Contents/MacOS/Arroxy',
	parentElectronRunAsNode: null,
	ytDlp: {
		path: '/tmp/runtime-cache/yt-dlp',
		args: ['--no-js-runtimes', '--js-runtimes', 'node:/Applications/Arroxy.app/Contents/MacOS/Arroxy', '--extractor-args', 'youtube:po_token=[REDACTED];visitor_data=[REDACTED]', '--dump-single-json', '--flat-playlist', '--no-playlist', 'https://www.youtube.com/watch?v=abc123'],
		jsRuntime: 'electron-node',
		jsRuntimePath: '/Applications/Arroxy.app/Contents/MacOS/Arroxy',
		jsRuntimeVersion: '24.16.0',
		ejsComponents: 'bundled-required',
		usesElectronNode: true,
		usesDeno: false,
		hasNoJsRuntimes: true,
		hasBundledEjs: true,
		hasRemoteEjs: false,
		attempts: [
			{
				ytDlpPath: '/tmp/runtime-cache/yt-dlp',
				ffmpegPath: null,
				args: ['--no-js-runtimes', '--js-runtimes', 'node:/Applications/Arroxy.app/Contents/MacOS/Arroxy', '--extractor-args', 'youtube:po_token=[REDACTED];visitor_data=[REDACTED]', '--dump-single-json', '--flat-playlist', '--no-playlist', 'https://www.youtube.com/watch?v=abc123'],
				jsRuntime: {jsRuntime: 'electron-node', jsRuntimePath: '/Applications/Arroxy.app/Contents/MacOS/Arroxy', jsRuntimeVersion: '24.16.0', ejsComponents: 'bundled-required'},
				attempt: 'pot',
				reMint: false
			}
		]
	},
	probe: {ok: true, kind: 'video', title: 'Canary Video', formatCount: 12, durationMs: 1234, error: null, errorKind: null},
	potMint: {ok: true, tokenLength: 64, visitorDataLength: 128, durationMs: 432, error: null},
	failures: [],
	warnings: []
}

describe('runtime smoke contract', () => {
	it('is enabled only by ARROXY_RUNTIME_SMOKE=1', () => {
		expect(readRuntimeSmokeEnabled({ARROXY_RUNTIME_SMOKE: '1'})).toBe(true)
		expect(readRuntimeSmokeEnabled({ARROXY_RUNTIME_SMOKE: '0'})).toBe(false)
		expect(readRuntimeSmokeEnabled({})).toBe(false)
	})

	it('summarizes yt-dlp verbose output for Node runtime and bundled EJS', () => {
		const summary = summarizeYtDlpVerboseRuntime(`
			[debug] Optional libraries: brotli-1.1.0, yt_dlp_ejs-0.8.0
			[debug] JS runtimes: node-24.16.0
			yt-dlp: error: You must provide at least one URL.
		`)

		expect(summary.hasNodeRuntime).toBe(true)
		expect(summary.hasUnsupportedNodeRuntime).toBe(false)
		expect(summary.hasYtDlpEjs).toBe(true)
		expect(summary.hasEjsNpmRemoteComponent).toBe(false)
	})

	it('flags old or unusable Node runtime output and missing yt-dlp-ejs', () => {
		const summary = summarizeYtDlpVerboseRuntime(`
			[debug] Optional libraries: brotli-1.1.0
			[debug] JS runtimes: node unsupported, deno 2.3.0
			--remote-components ejs:npm
		`)

		expect(summary.hasNodeRuntime).toBe(false)
		expect(summary.hasUnsupportedNodeRuntime).toBe(true)
		expect(summary.hasDenoRuntime).toBe(true)
		expect(summary.hasYtDlpEjs).toBe(false)
		expect(summary.hasEjsNpmRemoteComponent).toBe(true)
	})

	it('serializes one JSON result line and rejects malformed lines', () => {
		const line = serializeRuntimeSmokeReport(healthyReport)

		expect(line.startsWith(RUNTIME_SMOKE_RESULT_PREFIX)).toBe(true)
		expect(parseRuntimeSmokeResultLine(line)).toEqual(healthyReport)
		expect(parseRuntimeSmokeResultLine(`noise ${JSON.stringify(healthyReport)}`)).toBe(null)
		expect(parseRuntimeSmokeResultLine(`${RUNTIME_SMOKE_RESULT_PREFIX}{bad json`)).toBe(null)
	})

	it('requires managed yt-dlp, Electron Node args, no remote components, and bundled EJS', () => {
		const healthyVerbose = healthyReport.ytDlp.verbose
		expect(healthyVerbose).not.toBeNull()

		expect(runtimeSmokeReportIsHealthy(healthyReport)).toBe(true)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, sourceKind: 'managedCache', sourceLabel: 'managed-cache'}})).toBe(true)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, sourceKind: 'systemPath', sourceLabel: 'systemPath'}})).toBe(false)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, remoteComponentsEnabled: true}})).toBe(false)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, args: ['--no-js-runtimes', '--js-runtimes', 'node:/usr/bin/node']}})).toBe(false)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, args: ['--js-runtimes', 'deno:/tmp/deno']}})).toBe(false)
		expect(runtimeSmokeReportIsHealthy({...healthyReport, ytDlp: {...healthyReport.ytDlp, verbose: {...healthyVerbose!, hasYtDlpEjs: false}}})).toBe(false)
	})
})

describe('live probe smoke contract', () => {
	function withAttemptArgs(args: string[]): LiveProbeSmokeReport {
		return {...healthyLiveProbeReport, ytDlp: {...healthyLiveProbeReport.ytDlp, args, attempts: healthyLiveProbeReport.ytDlp.attempts.map(attempt => ({...attempt, args}))}}
	}

	it('serializes one JSON result line and rejects malformed lines', () => {
		const line = serializeLiveProbeSmokeReport(healthyLiveProbeReport)

		expect(line.startsWith(LIVE_PROBE_SMOKE_RESULT_PREFIX)).toBe(true)
		expect(parseLiveProbeSmokeResultLine(line)).toEqual(healthyLiveProbeReport)
		expect(parseLiveProbeSmokeResultLine(`noise ${JSON.stringify(healthyLiveProbeReport)}`)).toBe(null)
		expect(parseLiveProbeSmokeResultLine(`${LIVE_PROBE_SMOKE_RESULT_PREFIX}{bad json`)).toBe(null)
	})

	it('requires a successful video probe or runner bot wall through the packaged Electron Node runtime', () => {
		expect(probeSmokeReportIsHealthy(healthyLiveProbeReport)).toBe(true)
		expect(probeSmokeReportIsHealthy(withAttemptArgs(['--no-js-runtimes', '--js-runtimes', 'node:/usr/bin/node']))).toBe(false)
		expect(probeSmokeReportIsHealthy(withAttemptArgs(['--js-runtimes', 'deno:/tmp/deno']))).toBe(false)
		expect(probeSmokeReportIsHealthy(withAttemptArgs(['--js-runtimes', `node:${healthyLiveProbeReport.execPath}`]))).toBe(false)
		expect(probeSmokeReportIsHealthy(withAttemptArgs(healthyLiveProbeReport.ytDlp.args.filter(arg => arg !== '--no-playlist')))).toBe(false)
		expect(probeSmokeReportIsHealthy(withAttemptArgs(healthyLiveProbeReport.ytDlp.args.filter(arg => !arg.startsWith('youtube:po_token='))))).toBe(false)
		expect(probeSmokeReportIsHealthy({...healthyLiveProbeReport, probe: {...healthyLiveProbeReport.probe, formatCount: 0}})).toBe(false)
		expect(probeSmokeReportIsHealthy({...healthyLiveProbeReport, probe: {...healthyLiveProbeReport.probe, ok: false, kind: null, formatCount: 0, error: 'bot wall', errorKind: 'botBlock'}})).toBe(true)
		expect(probeSmokeReportIsHealthy({...healthyLiveProbeReport, probe: {...healthyLiveProbeReport.probe, ok: false, kind: null, formatCount: 0, error: 'network', errorKind: 'network'}})).toBe(false)
		expect(probeSmokeReportIsHealthy({...healthyLiveProbeReport, probe: {...healthyLiveProbeReport.probe, ok: false, kind: null, formatCount: 0, error: 'bot wall', errorKind: 'botBlock'}, ytDlp: {...healthyLiveProbeReport.ytDlp, args: [], attempts: []}})).toBe(false)
	})
})
