import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, PhaseContext} from '@main/services/phases/types.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import type {YtDlpRequest, YtDlpResult, YtDlpRunOptions, YtDlpSignal} from '@main/services/YtDlp.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'

// Only the visibility helper is stubbed: it shells out to `attrib`, which does
// not exist off Windows.
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

const SABR_WARNING = 'WARNING: [youtube] abc: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account.\n'
const INFO_360 = JSON.stringify({format_id: '18', height: 360})
const INFO_360_AGE_RESTRICTED = JSON.stringify({format_id: '18', height: 360, age_limit: 18})
const INFO_720 = JSON.stringify({
	format_id: '398+251',
	requested_formats: [
		{format_id: '398', height: 720},
		{format_id: '251', height: null}
	]
})

type MediaJob = ResolvedStartDownloadInput['job']

const RANGED_720: MediaJob = {
	kind: 'ranged-format',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	intent: {kind: 'video-audio', codec: 'best', tiers: ['720'], audio: {format: 'best'}},
	formatSelector: 'bestvideo*+bestaudio/best',
	formatSort: 'res:720,fps',
	filenameTemplate: '{title} [{id}]',
	sponsorBlock: {mode: 'off'},
	embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
}

const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const CANCELLED: YtDlpResult = {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout: '', stderr: ''}
const SIGN_IN_WALL: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: 'Sign in to confirm you are not a bot', stdout: '', stderr: ''}

// One scripted yt-dlp run: whether YouTube withheld formats, the info-json it
// selects, and how it ends. `withheld` is printed during extraction, so a run
// that loads an info-json (and skips extraction) never prints it.
interface ScriptedRun {
	withheld: boolean
	infoJson: string
	result?: YtDlpResult
}

let outputDir: string

beforeEach(async () => {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-quality-limit-'))
})

afterEach(async () => {
	await rm(outputDir, {recursive: true, force: true})
})

// A yt-dlp stand-in that prints output in the real order: extraction warnings,
// the metadata write line, the info-json on disk, then the first transfer line.
// A run stopped by its abort signal resolves as cancelled, like YtDlp does.
function makeCtx(opts: {runs: ScriptedRun[]; usesCookies?: boolean; retry?: CookielessRetry; input?: Partial<ResolvedStartDownloadInput>}) {
	const runs = [...opts.runs]
	const cookieFlags: boolean[] = []
	const run = vi.fn(async (req: YtDlpRequest, signal?: YtDlpSignal, options?: YtDlpRunOptions) => {
		const script = runs.shift()
		if (!script || req.kind !== 'media' || !req.output.tempDirectory) throw new Error('unexpected yt-dlp run')
		cookieFlags.push(options?.withoutCookies !== true)
		const infoJsonPath = join(req.output.tempDirectory, '_arroxy.info.json')
		if (script.withheld && !req.resume) signal?.onStderr?.(SABR_WARNING)
		signal?.onStdout?.(`[info] Writing video metadata as JSON to: ${infoJsonPath}\n`)
		await writeFile(infoJsonPath, script.infoJson)
		signal?.onStdout?.(`[download] Destination: ${join(req.output.tempDirectory, 'video.mp4')}\n`)
		if (signal?.abortSignal?.aborted) return CANCELLED
		return script.result ?? SUCCESS
	})
	const controller = new AbortController()
	const active: ActiveDownload = {
		job: {id: 'job-quality-1', url: 'https://www.youtube.com/watch?v=abc', outputDir, status: 'running', createdAt: '', updatedAt: ''},
		input: {url: 'https://www.youtube.com/watch?v=abc', outputDir, job: RANGED_720, ...opts.input},
		controller,
		signal: controller.signal,
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
	const safeConsume = vi.fn()
	const cookielessRetry = opts.retry ?? new CookielessRetry()
	const ctx: PhaseContext = {active, signal: controller.signal, register: () => undefined, ytDlp: {run, usesCookies: vi.fn().mockResolvedValue(opts.usesCookies ?? false), invalidateTokenSession: vi.fn()} as never, emitStatus: vi.fn(), safeConsume, cookielessRetry}
	return {ctx, cookieFlags, safeConsume, cookielessRetry, remainingRuns: runs}
}

describe('VideoPhase quality limit detection', () => {
	it('records a limit when yt-dlp reports withheld formats and the file lands below the cap', async () => {
		const {ctx, safeConsume} = makeCtx({runs: [{withheld: true, infoJson: INFO_360}]})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toEqual({height: 360})
		expect(safeConsume).toHaveBeenCalledWith(SABR_WARNING)
	})

	it('records nothing when the cap was reached despite the warning', async () => {
		const {ctx} = makeCtx({runs: [{withheld: true, infoJson: INFO_720}]})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})

	it('records nothing for a low-resolution file without the warning', async () => {
		const {ctx} = makeCtx({runs: [{withheld: false, infoJson: INFO_360}]})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})

	it('uses the probe signal when the download reused the probe info-json and so skipped extraction', async () => {
		const probeInfoJsonPath = join(outputDir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, INFO_360)
		const {ctx} = makeCtx({runs: [{withheld: true, infoJson: INFO_360}], input: {probeInfoJsonPath, probeFormatsWithheld: true}})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toEqual({height: 360})
	})

	it('never records a limit for a format the user picked explicitly', async () => {
		const single: MediaJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '18', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: RANGED_720.embed}
		const {ctx} = makeCtx({runs: [{withheld: true, infoJson: INFO_360}], input: {job: single}})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})
})

describe('VideoPhase retry without cookies', () => {
	it('stops a limited signed-in download before the transfer and gets full quality without cookies', async () => {
		const {ctx, cookieFlags, safeConsume, cookielessRetry} = makeCtx({
			usesCookies: true,
			runs: [
				{withheld: true, infoJson: INFO_360},
				{withheld: false, infoJson: INFO_720}
			]
		})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(cookieFlags).toEqual([true, false])
		expect(ctx.active.qualityLimit).toBeUndefined()
		expect(cookielessRetry.current).toBe('helps')
		// Only the cookieless run's transfer reached the progress parser.
		const destinations = safeConsume.mock.calls.filter(([text]) => String(text).startsWith('[download] Destination'))
		expect(destinations).toHaveLength(1)
	})

	it('stops a download that loaded a limited probe info-json and re-extracts without cookies', async () => {
		const probeInfoJsonPath = join(outputDir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, INFO_360)
		const {ctx, cookieFlags} = makeCtx({
			usesCookies: true,
			runs: [
				{withheld: true, infoJson: INFO_360},
				{withheld: false, infoJson: INFO_720}
			],
			input: {probeInfoJsonPath, probeFormatsWithheld: true}
		})
		await VideoPhase(false).run(ctx)
		expect(cookieFlags).toEqual([true, false])
		const requests = vi.mocked(ctx.ytDlp.run).mock.calls.map(([req]) => (req.kind === 'media' ? req.resume?.loadInfoJsonPath : 'not-media'))
		expect(requests).toEqual([probeInfoJsonPath, undefined])
		expect(ctx.active.qualityLimit).toBeUndefined()
	})

	it('keeps the warning and stops retrying for the session when cookies were not the cause', async () => {
		const {ctx, cookieFlags, cookielessRetry} = makeCtx({
			usesCookies: true,
			runs: [
				{withheld: true, infoJson: INFO_360},
				{withheld: true, infoJson: INFO_360}
			]
		})
		await VideoPhase(false).run(ctx)
		expect(cookieFlags).toEqual([true, false])
		expect(ctx.active.qualityLimit).toEqual({height: 360})
		expect(cookielessRetry.current).toBe('no-help')
	})

	it('goes back to cookies when the cookieless run fails, and finishes at the lower quality', async () => {
		const {ctx, cookieFlags, cookielessRetry} = makeCtx({
			usesCookies: true,
			runs: [
				{withheld: true, infoJson: INFO_360},
				{withheld: false, infoJson: INFO_360, result: SIGN_IN_WALL},
				{withheld: true, infoJson: INFO_360}
			]
		})
		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})
		expect(cookieFlags).toEqual([true, false, true])
		expect(ctx.active.qualityLimit).toEqual({height: 360})
		expect(cookielessRetry.current).toBe('no-help')
	})

	it('starts without cookies once that has helped this session, falling back to cookies on failure', async () => {
		const retry = new CookielessRetry()
		retry.record('full-quality')
		const helped = makeCtx({usesCookies: true, retry, runs: [{withheld: false, infoJson: INFO_720}]})
		await VideoPhase(false).run(helped.ctx)
		expect(helped.cookieFlags).toEqual([false])

		const failed = makeCtx({
			usesCookies: true,
			retry,
			runs: [
				{withheld: false, infoJson: INFO_360, result: SIGN_IN_WALL},
				{withheld: false, infoJson: INFO_720}
			]
		})
		await VideoPhase(false).run(failed.ctx)
		expect(failed.cookieFlags).toEqual([false, true])
		expect(retry.current).toBe('no-help')
	})

	it('does not drop cookies for a video that needs sign-in', async () => {
		const {ctx, cookieFlags, cookielessRetry} = makeCtx({usesCookies: true, runs: [{withheld: true, infoJson: INFO_360_AGE_RESTRICTED}]})
		await VideoPhase(false).run(ctx)
		expect(cookieFlags).toEqual([true])
		expect(ctx.active.qualityLimit).toEqual({height: 360})
		expect(cookielessRetry.current).toBe('untested')
	})

	it('lets a signed-in download that reached the cap run to the end', async () => {
		const {ctx, cookieFlags} = makeCtx({usesCookies: true, runs: [{withheld: true, infoJson: INFO_720}]})
		await VideoPhase(false).run(ctx)
		expect(cookieFlags).toEqual([true])
	})

	it('never retries when cookies are off', async () => {
		const {ctx, cookieFlags, cookielessRetry} = makeCtx({usesCookies: false, runs: [{withheld: true, infoJson: INFO_360}]})
		await VideoPhase(false).run(ctx)
		expect(cookieFlags).toEqual([true])
		expect(cookielessRetry.current).toBe('untested')
	})
})
