import {describe, expect, it} from 'vitest'
import {parseRuntimeSmokeResultLine, readRuntimeSmokeEnabled, RUNTIME_SMOKE_RESULT_PREFIX, runtimeSmokeReportIsHealthy, serializeRuntimeSmokeReport, summarizeYtDlpVerboseRuntime, type RuntimeSmokeReport} from '@main/runtimeSmoke.js'

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
