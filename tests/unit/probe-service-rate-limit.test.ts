import {describe, expect, it, vi} from 'vite-plus/test'
import {ProbeService} from '@main/services/ProbeService.js'
import {RATE_LIMIT_COOLDOWN_MESSAGE, type YtDlpResult} from '@main/services/YtDlp.js'
import {deriveDegraded, detectProbeDegradationSignals} from '@main/services/probeDegradation.js'

// A rate limit is its own outcome: the usable result is kept, the identical
// request is not relaunched, and an account is never brought in for it
// (YouTube rate-limits signed-in accounts too).

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const WEBPAGE_429 = 'WARNING: [youtube] abc: Unable to download webpage: HTTP Error 429: Too Many Requests (caused by <HTTPError 429: Too Many Requests>)'
const FATAL_429 = 'ERROR: [youtube] abc: Unable to download webpage: HTTP Error 429: Too Many Requests'
const SESSION_LIMIT = "WARNING: [youtube] abc: This content isn't available, try again later. The current session has been rate-limited by YouTube for up to an hour."
const FORMATS_MISSING = 'WARNING: [youtube] abc: Some formats may be missing'
const BOT_CHECK = 'WARNING: [youtube] abc: Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies for the authentication.'

const VIDEO = {_type: 'video', id: 'abc', title: 'Video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: VIDEO_URL, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]}

const success = (stderr = ''): YtDlpResult => ({kind: 'success', stdout: JSON.stringify(VIDEO), stderr, usedExtractorFallback: false})
const exitError = (rawError: string): YtDlpResult => ({kind: 'exit-error', exitCode: 1, errorKind: 'rateLimit', rawError, stdout: '', stderr: rawError})

function makeService(results: YtDlpResult[]) {
	const run = vi.fn(async () => results.shift() ?? success())
	const gate = {canEscalate: vi.fn(async () => ({allowed: true as const}))}
	const service = new ProbeService({run} as never, false, undefined, {exploreGate: gate, exploreSession: {verifySignedIn: vi.fn(async () => 'signedIn' as const)}})
	return {service, run, gate}
}

describe('ProbeService — rate limits', () => {
	it('keeps a result that came back with a 429 warning, marked rate-limited, and does not relaunch', async () => {
		const {service, run} = makeService([success(WEBPAGE_429)])

		const result = await service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(1)
		expect(result.ok && result.data.kind === 'video' ? result.data.degraded : null).toEqual({reasons: ['rateLimit']})
	})

	it('reads the session rate limit the same way', async () => {
		const {service, run} = makeService([success(SESSION_LIMIT)])

		const result = await service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(1)
		expect(result.ok && result.data.kind === 'video' ? result.data.degraded?.reasons : null).toEqual(['rateLimit'])
	})

	it('still relaunches once for an extractor-side miss', async () => {
		const {service, run} = makeService([success(FORMATS_MISSING), success()])

		const result = await service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(2)
		expect(result.ok && result.data.kind === 'video' ? result.data.degraded : 'absent').toBeUndefined()
	})

	it('fails a fatal 429 as a rate limit without bringing in the Explore session', async () => {
		const {service, run, gate} = makeService([exitError(FATAL_429)])

		const result = await service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(1)
		expect(gate.canEscalate).not.toHaveBeenCalled()
		expect(result.ok ? null : result.error).toMatchObject({kind: 'ytdlp', error: {kind: 'rateLimit'}})
	})

	it('reads a run held by the cooldown as a rate limit', async () => {
		const {service, run} = makeService([{kind: 'exit-error', exitCode: -1, errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE, stdout: '', stderr: ''}])

		const result = await service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(1)
		expect(result.ok ? null : result.error).toMatchObject({kind: 'ytdlp', error: {kind: 'rateLimit'}})
	})
})

describe('detectProbeDegradationSignals', () => {
	it('counts the webpage failure behind a 429 as the rate limit only', () => {
		expect(deriveDegraded(detectProbeDegradationSignals(WEBPAGE_429))).toEqual({reasons: ['rateLimit']})
	})

	it('keeps the other signs of the same run', () => {
		expect(deriveDegraded(detectProbeDegradationSignals(`${WEBPAGE_429}\n${FORMATS_MISSING}`))?.reasons.sort()).toEqual(['extractor', 'rateLimit'])
	})

	it('reads the bot check with yt-dlp’s curly apostrophe', () => {
		expect(deriveDegraded(detectProbeDegradationSignals(BOT_CHECK))).toEqual({reasons: ['botWall']})
	})

	it('finds nothing in a clean run', () => {
		expect(deriveDegraded(detectProbeDegradationSignals('[youtube] abc: Downloading webpage'))).toBeUndefined()
	})
})
