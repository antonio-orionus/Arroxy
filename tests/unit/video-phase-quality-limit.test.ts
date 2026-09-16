import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, PhaseContext} from '@main/services/phases/types.js'
import type {YtDlpRequest, YtDlpSignal} from '@main/services/YtDlp.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'

// Only the visibility helper is stubbed: it shells out to `attrib`, which does
// not exist off Windows.
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

const SABR_WARNING = 'WARNING: [youtube] abc: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account.\n'
const INFO_360 = JSON.stringify({format_id: '18', height: 360})
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

let outputDir: string

beforeEach(async () => {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-quality-limit-'))
})

afterEach(async () => {
	await rm(outputDir, {recursive: true, force: true})
})

// A yt-dlp stand-in that prints `output` and writes the post-selection
// info-json where the real one lands: `<tempDirectory>/_arroxy.info.json`.
function makeCtx(opts: {output: string; infoJson: string; input?: Partial<ResolvedStartDownloadInput>}): PhaseContext {
	const run = vi.fn(async (req: YtDlpRequest, signal?: YtDlpSignal) => {
		signal?.onStderr?.(opts.output)
		if (req.kind === 'media' && req.output.tempDirectory) await writeFile(join(req.output.tempDirectory, '_arroxy.info.json'), opts.infoJson)
		return {kind: 'success' as const, stdout: '', stderr: opts.output, usedExtractorFallback: false}
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
	return {active, signal: controller.signal, register: () => undefined, ytDlp: {run} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
}

describe('VideoPhase quality limit detection', () => {
	it('records a limit when yt-dlp reports withheld formats and the file lands below the cap', async () => {
		const ctx = makeCtx({output: SABR_WARNING, infoJson: INFO_360})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toEqual({height: 360})
		expect(ctx.safeConsume).toHaveBeenCalledWith(SABR_WARNING)
	})

	it('records nothing when the cap was reached despite the warning', async () => {
		const ctx = makeCtx({output: SABR_WARNING, infoJson: INFO_720})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})

	it('records nothing for a low-resolution file without the warning', async () => {
		const ctx = makeCtx({output: '[download] 100% of 1.00MiB\n', infoJson: INFO_360})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})

	it('uses the probe signal when the download reused the probe info-json and so skipped extraction', async () => {
		const probeInfoJsonPath = join(outputDir, 'probe.info.json')
		await writeFile(probeInfoJsonPath, INFO_360)
		const ctx = makeCtx({output: '', infoJson: INFO_360, input: {probeInfoJsonPath, probeFormatsWithheld: true}})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toEqual({height: 360})
	})

	it('never records a limit for a format the user picked explicitly', async () => {
		const single: MediaJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '18', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: RANGED_720.embed}
		const ctx = makeCtx({output: SABR_WARNING, infoJson: INFO_360, input: {job: single}})
		await VideoPhase(false).run(ctx)
		expect(ctx.active.qualityLimit).toBeUndefined()
	})
})
