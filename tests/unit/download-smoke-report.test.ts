import {describe, expect, it} from 'vitest'
import {DOWNLOAD_SMOKE_RESULT_PREFIX, serializeDownloadSmokeReport, type DownloadSmokeReport} from '@main/downloadSmokeReport.js'

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
