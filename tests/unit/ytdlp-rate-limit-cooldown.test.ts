import {describe, expect, it, vi, beforeEach} from 'vite-plus/test'
import {RATE_LIMIT_COOLDOWN_MESSAGE, YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'
import {RATE_LIMIT_BASE_MS, SESSION_RATE_LIMIT_MS, SiteRequestState} from '@main/services/SiteRequestState.js'
import {classifyYtDlpStderr} from 'ytdlp-errors'
import {createTranscriptProcess} from '../helpers/processTranscript.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'

// The process adapter is the one place every yt-dlp launch passes, so the
// cooldown is enforced there: probes, media, subtitles and title lookups alike.

const URL = 'https://www.youtube.com/watch?v=test'
const WEBPAGE_429 = 'WARNING: [youtube] test: Unable to download webpage: HTTP Error 429: Too Many Requests'
const FATAL_429 = 'ERROR: [youtube] test: Unable to download webpage: HTTP Error 429: Too Many Requests'
const SESSION_LIMIT = "ERROR: [youtube] test: This content isn't available, try again later. The current session has been rate-limited by YouTube for up to an hour."
const BOT_CHECK = "ERROR: [youtube] test: Sign in to confirm you're not a bot."

function process(exitCode: number, stderr = '') {
	return createTranscriptProcess(stderr ? [{stream: 'stderr', data: stderr}, {close: exitCode}] : [{close: exitCode}])
}

function setup(opts: {ytDlpPath?: Promise<string>; token?: Promise<{token: string; visitorData: string; fromCache: boolean}>} = {}) {
	let now = 1_000_000
	const siteRequests = new SiteRequestState({now: () => now, random: () => 1})
	const tokenService = {getToken: vi.fn().mockReturnValue(opts.token ?? Promise.resolve({token: 'tok', visitorData: 'vd', fromCache: false})), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockReturnValue(opts.ytDlpPath ?? Promise.resolve('/fake/yt-dlp')), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), forgetProbeVerdict: vi.fn().mockResolvedValue(undefined)}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, {get: vi.fn().mockResolvedValue({})}, {siteRequests})
	return {ytDlp, siteRequests, tokenService, advance: (ms: number) => (now += ms), now: () => now}
}

const media = (url = URL): YtDlpRequest => ({kind: 'media', url, output: {directory: '/tmp'}})
const subtitles: YtDlpRequest = {kind: 'subtitles', url: URL, output: {directory: '/tmp'}, subtitles: {languages: ['en'], format: 'srt', writeAuto: true}}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('YtDlp — rate-limit cooldown', () => {
	it('starts the cooldown on a 429 warning, even when the run succeeds', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(0, WEBPAGE_429) as never)
		const {ytDlp, siteRequests, now} = setup()

		const result = await ytDlp.run(media())

		expect(result.kind).toBe('success')
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(now() + RATE_LIMIT_BASE_MS)
	})

	// A media run can meet a webpage 429 and then transfer a large file for
	// minutes; nothing new may ask the site meanwhile.
	it('starts the cooldown as soon as stderr shows the limit, while the run goes on', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(0, WEBPAGE_429) as never)
		const {ytDlp, siteRequests, now} = setup()
		const seenDuringRun: (number | null)[] = []

		await ytDlp.run(media(), {onStderr: () => seenDuringRun.push(siteRequests.rateLimitedUntil('youtube'))})

		expect(seenDuringRun).toEqual([now() + RATE_LIMIT_BASE_MS])
	})

	// Preparing the binary, or waiting for a signed-in slot, can take long
	// enough for another request to meet the limit.
	it('holds a run whose cooldown started while it prepared, without spawning', async () => {
		let resolvePath: (path: string) => void = () => undefined
		const {ytDlp, siteRequests} = setup({ytDlpPath: new Promise(resolve => (resolvePath = resolve))})
		const running = ytDlp.run(media())
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		resolvePath('/fake/yt-dlp')

		expect(await running).toMatchObject({errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE})
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})

	it('holds a run whose cooldown started while it minted its token, without spawning', async () => {
		let resolveToken: (token: {token: string; visitorData: string; fromCache: boolean}) => void = () => undefined
		const {ytDlp, siteRequests, tokenService} = setup({token: new Promise(resolve => (resolveToken = resolve))})
		const running = ytDlp.run(media())
		await vi.waitFor(() => expect(tokenService.getToken).toHaveBeenCalled())
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		resolveToken({token: 'tok', visitorData: 'vd', fromCache: false})

		expect(await running).toMatchObject({errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE})
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})

	it('holds every later run to the site without spawning, until the cooldown ends', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, FATAL_429) as never)
		const {ytDlp, advance} = setup()
		await ytDlp.run(media())
		vi.mocked(spawnYtDlp).mockClear()

		const held = await ytDlp.run({kind: 'probe', url: URL, selection: {playlistMode: 'video'}})
		expect(held).toMatchObject({kind: 'exit-error', errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE})
		expect(await ytDlp.run(media(), undefined, {identity: 'exploreSession'})).toMatchObject({errorKind: 'rateLimit'})
		expect(spawnYtDlp).not.toHaveBeenCalled()

		vi.mocked(spawnYtDlp).mockImplementation(() => process(0) as never)
		advance(RATE_LIMIT_BASE_MS)
		expect((await ytDlp.run(media())).kind).toBe('success')
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	it('waits 30 minutes on the session rate limit', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, SESSION_LIMIT) as never)
		const {ytDlp, siteRequests, now} = setup()
		await ytDlp.run(media())
		expect(siteRequests.rateLimitedUntil('youtube')).toBe(now() + SESSION_RATE_LIMIT_MS)
	})

	it('holds only the rate-limited site', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, FATAL_429) as never)
		const {ytDlp} = setup()
		await ytDlp.run(media())
		vi.mocked(spawnYtDlp)
			.mockClear()
			.mockImplementation(() => process(0) as never)

		expect((await ytDlp.run(media('https://vimeo.com/1'))).kind).toBe('success')
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	it('lets a "Try now" run through once, and a clean answer ends the cooldown', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, FATAL_429) as never)
		const {ytDlp, siteRequests} = setup()
		await ytDlp.run(media())
		siteRequests.allowOnce('youtube')
		vi.mocked(spawnYtDlp)
			.mockClear()
			.mockImplementation(() => process(0) as never)

		expect((await ytDlp.run(media())).kind).toBe('success')
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
		expect(siteRequests.rateLimitedUntil('youtube')).toBeNull()
	})

	it('a "Try now" run that meets the limit again keeps the cooldown', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, FATAL_429) as never)
		const {ytDlp, siteRequests} = setup()
		await ytDlp.run(media())
		siteRequests.allowOnce('youtube')
		await ytDlp.run(media())
		vi.mocked(spawnYtDlp).mockClear()

		expect(await ytDlp.run(media())).toMatchObject({errorKind: 'rateLimit'})
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})

	it('the subtitle phase of a job that saved its media still runs', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(0, WEBPAGE_429) as never)
		const {ytDlp} = setup()
		await ytDlp.run(media())
		vi.mocked(spawnYtDlp)
			.mockClear()
			.mockImplementation(() => process(0) as never)

		expect((await ytDlp.run(subtitles, undefined, {honorCooldown: false})).kind).toBe('success')
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	// The bot-wall ladder re-mints and relaunches at once. Once the run showed a
	// rate limit too, the relaunch would only meet the same limit.
	it('stops the bot-wall ladder when the run also showed a rate limit', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, `${WEBPAGE_429}\n${BOT_CHECK}`) as never)
		const {ytDlp} = setup()

		const result = await ytDlp.run(media())

		expect(result.kind).toBe('exit-error')
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	// An account cannot lift a rate limit, so a bot wall that came with one
	// must not read as the bot wall the download phases escalate on.
	it('reports a bot wall that came with a rate limit as the rate limit', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => process(1, `${WEBPAGE_429}\n${BOT_CHECK}`) as never)
		const {ytDlp} = setup()

		const result = await ytDlp.run(media())

		expect(result).toMatchObject({kind: 'exit-error', errorKind: 'rateLimit'})
		expect(result.kind === 'exit-error' ? classifyYtDlpStderr(result.rawError ?? '').kind : null).toBe('rateLimit')
	})
})
