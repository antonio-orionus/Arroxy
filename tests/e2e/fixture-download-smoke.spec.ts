import {createRequire} from 'node:module'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {FIXTURE_VIDEO_IDS, runProcess, writeE2eSettings} from './fixtureHarness.js'
import {SABR_LIMITED_VIDEO_ID} from './fixtureMediaCatalog.js'
import {withFixtureYtDlp} from './fixtureProductE2E.js'
import {isRecord} from './fixtureWorkflow.js'

// Risk: the download smoke is the tool for diagnosing "downloaded below the
// profile's resolution" reports. It must report the format yt-dlp really chose
// and recognise YouTube's missing-URL (SABR) warning when running the real app,
// real IPC-free main process, real yt-dlp, and real format rules.
//
// Fixtures: ARX00000001 offers 360p + 720p; the SABR-limited video withholds
// the 720p format and prints yt-dlp's warning, leaving only 360p.
// Oracles: the ARROXY_DOWNLOAD_SMOKE_RESULT line, the exit code, and the deny
// proxy log (checked by withFixtureYtDlp).

const RESULT_PREFIX = 'ARROXY_DOWNLOAD_SMOKE_RESULT '

function electronExecutable(): string {
	const resolved: unknown = createRequire(path.join(process.cwd(), 'package.json'))('electron')
	if (typeof resolved !== 'string') throw new Error('electron package did not resolve to an executable path')
	return resolved
}

async function runDownloadSmoke(env: Record<string, string>, videoUrl: string): Promise<{exitCode: number | null; report: Record<string, unknown>}> {
	const result = await runProcess(electronExecutable(), [path.join(process.cwd(), 'out', 'main', 'index.js')], {env: {...env, ARROXY_SMOKE_KIND: 'download', ARROXY_SMOKE_URL: videoUrl, ARROXY_SMOKE_TIMEOUT_MS: '60000'}, timeoutMs: 90_000})
	const line = result.stdout.split(/\r?\n/).findLast(candidate => candidate.startsWith(RESULT_PREFIX))
	if (!line) throw new Error(`download smoke printed no result line\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`)
	const report: unknown = JSON.parse(line.slice(RESULT_PREFIX.length))
	if (!isRecord(report)) throw new Error('download smoke result is not an object')
	return {exitCode: result.exitCode, report}
}

test('download smoke reports the 720p selection for an unrestricted fixture video', async () => {
	test.setTimeout(120_000)

	await withFixtureYtDlp({userDataPrefix: 'arroxy-download-smoke-user-'}, async ({userDataDir, outputDir, electronEnv, urls}) => {
		writeE2eSettings(userDataDir, outputDir)
		const {exitCode, report} = await runDownloadSmoke(electronEnv, urls.video(FIXTURE_VIDEO_IDS[0]))

		expect(exitCode).toBe(0)
		expect(report).toMatchObject({ok: true, outcome: 'format-selected', selection: {selectedFormat: '22', maxHeight: 720}, observed: {sabrSkippedClients: []}})
	})
})

test('download smoke flags the SABR warning when YouTube withholds the 720p format', async () => {
	test.setTimeout(120_000)

	await withFixtureYtDlp({userDataPrefix: 'arroxy-download-smoke-sabr-user-'}, async ({userDataDir, outputDir, electronEnv, urls}) => {
		writeE2eSettings(userDataDir, outputDir)
		const {exitCode, report} = await runDownloadSmoke(electronEnv, urls.video(SABR_LIMITED_VIDEO_ID))

		expect(exitCode).toBe(0)
		expect(report).toMatchObject({ok: true, outcome: 'format-selected', selection: {selectedFormat: '18', maxHeight: 360}, observed: {sabrSkippedClients: ['web_embedded']}})
	})
})
