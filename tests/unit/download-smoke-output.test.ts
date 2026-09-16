import {describe, expect, it} from 'vitest'
import {createDownloadSmokeObserver, parseSelectedFormats} from '@main/downloadSmokeOutput.js'

// Lines copied from a 0.4.16 user log: cookies enabled, 360p picked.
const COOKIE_RUN = [
	'[youtube] Extracting URL: https://www.youtube.com/watch?v=z1NNgSu8hTI',
	'[youtube] z1NNgSu8hTI: Downloading webpage',
	'[youtube] z1NNgSu8hTI: Downloading web embedded client config',
	'[youtube] z1NNgSu8hTI: Downloading web embedded player API JSON',
	'[youtube] z1NNgSu8hTI: Downloading tv downgraded player API JSON',
	'WARNING: [youtube] z1NNgSu8hTI: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account. See  https://github.com/yt-dlp/yt-dlp/issues/12482  for more details',
	'[info] z1NNgSu8hTI: Downloading 1 format(s): 18',
	'[info] Writing video metadata as JSON to: C:\\tmp\\_arroxy.info.json'
]

describe('createDownloadSmokeObserver', () => {
	it('extracts selection, clients and SABR skips, and waits for the line after the info-json write', () => {
		const obs = createDownloadSmokeObserver()
		obs.push(COOKIE_RUN.join('\n') + '\n')
		expect(obs.snapshot()).toEqual({selectedFormat: '18', playerApiClients: ['web embedded', 'tv downgraded'], sabrSkippedClients: ['web_embedded'], warnings: [COOKIE_RUN[5]], shouldStop: false})
		obs.push('[download] Sleeping 1.81 seconds ...\n')
		expect(obs.snapshot().shouldStop).toBe(true)
	})

	it('stops on any line after the info-json write', () => {
		const obs = createDownloadSmokeObserver()
		obs.push('[info] Writing video metadata as JSON to: /tmp/_arroxy.info.json\n')
		expect(obs.snapshot().shouldStop).toBe(false)
		obs.push('[info] Downloading video thumbnail 41 ...\n')
		expect(obs.snapshot().shouldStop).toBe(true)
	})

	it('stops on a download destination line even without an info-json line', () => {
		const obs = createDownloadSmokeObserver()
		obs.push('[download] Destination: /tmp/x.f398.mp4\r\n')
		expect(obs.snapshot().shouldStop).toBe(true)
	})

	it('dedupes warnings and clients', () => {
		const obs = createDownloadSmokeObserver()
		obs.push(`${COOKIE_RUN[3]}\n${COOKIE_RUN[3]}\n${COOKIE_RUN[5]}\n${COOKIE_RUN[5]}\n`)
		expect(obs.snapshot().playerApiClients).toEqual(['web embedded'])
		expect(obs.snapshot().warnings).toHaveLength(1)
	})
})

describe('parseSelectedFormats', () => {
	it('reads requested_formats for merged selections', () => {
		const json = JSON.stringify({
			format_id: '398+251',
			height: 720,
			requested_formats: [
				{format_id: '398', height: 720, vcodec: 'av01.0.05M.08', acodec: 'none'},
				{format_id: '251', height: null, vcodec: 'none', acodec: 'opus'}
			]
		})
		expect(parseSelectedFormats(json)).toEqual([
			{formatId: '398', height: 720, vcodec: 'av01.0.05M.08', acodec: 'none'},
			{formatId: '251', height: null, vcodec: 'none', acodec: 'opus'}
		])
	})

	it('falls back to the top-level format for single-file selections', () => {
		expect(parseSelectedFormats(JSON.stringify({format_id: '18', height: 360, vcodec: 'avc1.42001E', acodec: 'mp4a.40.2'}))).toEqual([{formatId: '18', height: 360, vcodec: 'avc1.42001E', acodec: 'mp4a.40.2'}])
	})

	it('returns null for truncated or foreign JSON', () => {
		expect(parseSelectedFormats('{"format_id": "1')).toBeNull()
		expect(parseSelectedFormats(JSON.stringify({title: 'no format'}))).toBeNull()
	})
})
