import {describe, expect, it} from 'vitest'
import {DOWNLOAD_SMOKE_RESULT_PREFIX, serializeDownloadSmokeReport, summarizeSpawnArgs, type DownloadSmokeReport} from '@main/downloadSmokeReport.js'

const report: DownloadSmokeReport = {
	downloadSmoke: true,
	ok: true,
	outcome: 'format-selected',
	appVersion: '0.4.16',
	platform: 'win32',
	arch: 'x64',
	url: 'https://www.youtube.com/watch?v=z1NNgSu8hTI',
	inputs: {cookies: 'browser:firefox', proxy: 'off', profileId: 'balanced', youtubePlayerClients: 'production-default'},
	effective: {cookiesMode: 'browser', proxyConfigured: false, formatSelector: 'bestvideo*+bestaudio/best', formatSort: 'res:720,fps'},
	selection: {selectedFormat: '18', formats: [{formatId: '18', height: 360, vcodec: 'avc1', acodec: 'mp4a'}], maxHeight: 360},
	observed: {playerApiClients: ['web embedded', 'tv downgraded'], sabrSkippedClients: ['web_embedded'], warnings: []},
	spawned: {cookies: 'browser', proxy: false, poToken: true, playerClients: ['default', 'web_embedded']},
	attempts: [],
	error: null,
	durationMs: 1234
}

describe('download smoke result line', () => {
	it('is a single prefixed line whose payload is the report JSON', () => {
		const line = serializeDownloadSmokeReport(report)
		expect(line.startsWith(DOWNLOAD_SMOKE_RESULT_PREFIX)).toBe(true)
		expect(line).not.toContain('\n')
		expect(JSON.parse(line.slice(DOWNLOAD_SMOKE_RESULT_PREFIX.length))).toEqual(report)
	})
})

describe('summarizeSpawnArgs', () => {
	it('reads cookies, proxy, token and player clients from a redacted argv', () => {
		const args = ['--extractor-args', 'youtube:po_token=[REDACTED];visitor_data=[REDACTED]', '--cookies-from-browser', '[REDACTED]', '--proxy', '[REDACTED]', '-f', 'best', '--extractor-args', 'youtube:player_client=default,web_embedded']
		expect(summarizeSpawnArgs(args)).toEqual({cookies: 'browser', proxy: true, poToken: true, playerClients: ['default', 'web_embedded']})
	})

	it('reports a cookie file, and no player_client when none was passed', () => {
		expect(summarizeSpawnArgs(['--cookies', '[REDACTED]', '-f', 'best'])).toEqual({cookies: 'file', proxy: false, poToken: false, playerClients: null})
	})

	it('reports no cookies for an empty argv', () => {
		expect(summarizeSpawnArgs([])).toEqual({cookies: 'none', proxy: false, poToken: false, playerClients: null})
	})
})
