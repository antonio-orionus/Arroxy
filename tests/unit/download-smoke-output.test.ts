import {describe, expect, it} from 'vitest'
import {createDownloadSmokeObserver} from '@main/downloadSmokeOutput.js'

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
	it('extracts selection, clients and SABR skips, and notes the info-json announcement', () => {
		const obs = createDownloadSmokeObserver()
		obs.push(COOKIE_RUN.join('\n') + '\n')
		expect(obs.snapshot()).toEqual({selectedFormat: '18', playerApiClients: ['web embedded', 'tv downgraded'], sabrSkippedClients: ['web_embedded'], warnings: [COOKIE_RUN[5]], infoJsonWriteSeen: true, transferStarting: false})
		obs.push('[download] Sleeping 1.81 seconds ...\n')
		expect(obs.snapshot().transferStarting).toBe(true)
	})

	it('does not treat a later line as proof the info-json is complete', () => {
		const obs = createDownloadSmokeObserver()
		obs.push('[info] Writing video metadata as JSON to: /tmp/_arroxy.info.json\n')
		obs.push('WARNING: [youtube] abc: a stderr line that raced the write\n')
		expect(obs.snapshot()).toMatchObject({infoJsonWriteSeen: true, transferStarting: false})
	})

	it('reports a download destination line as a transfer starting, even without an info-json line', () => {
		const obs = createDownloadSmokeObserver()
		obs.push('[download] Destination: /tmp/x.f398.mp4\r\n')
		expect(obs.snapshot().transferStarting).toBe(true)
	})

	it('dedupes warnings and clients', () => {
		const obs = createDownloadSmokeObserver()
		obs.push(`${COOKIE_RUN[3]}\n${COOKIE_RUN[3]}\n${COOKIE_RUN[5]}\n${COOKIE_RUN[5]}\n`)
		expect(obs.snapshot().playerApiClients).toEqual(['web embedded'])
		expect(obs.snapshot().warnings).toHaveLength(1)
	})
})
