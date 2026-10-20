import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, PhaseContext} from '@main/services/phases/types.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import type {YtDlpRequest, YtDlpResult} from '@main/services/YtDlp.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'
import {explorePorts} from '../helpers/explorePorts.js'

// Only the visibility helper is stubbed: it shells out to `attrib`, which does
// not exist off Windows.
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

const JOB: ResolvedStartDownloadInput['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', filenameTemplate: '{title} [{id}]', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}
const FAILURE: YtDlpResult = {kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: 'bot', stdout: '', stderr: ''}

let outputDir: string

beforeEach(async () => {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-media-title-'))
})

afterEach(async () => {
	await rm(outputDir, {recursive: true, force: true})
})

// A yt-dlp stand-in that writes the info-json into the run's temp folder, as
// `--write-info-json -o infojson:<temp>/_arroxy` does, then ends with `result`.
function makeCtx(infoJson: string | null, result: YtDlpResult = SUCCESS): PhaseContext {
	const run = vi.fn(async (req: YtDlpRequest) => {
		if (req.kind !== 'media' || !req.output.tempDirectory) throw new Error('unexpected yt-dlp run')
		if (infoJson !== null) await writeFile(join(req.output.tempDirectory, '_arroxy.info.json'), infoJson)
		return result
	})
	const controller = new AbortController()
	const active: ActiveDownload = {
		job: {id: 'job-title-1', url: 'https://www.youtube.com/watch?v=abc', outputDir, status: 'running', createdAt: '', updatedAt: ''},
		input: {url: 'https://www.youtube.com/watch?v=abc', outputDir, job: JOB},
		controller,
		signal: controller.signal,
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
	return {active, signal: controller.signal, register: () => undefined, ytDlp: {run, usesCookies: vi.fn().mockResolvedValue(false)} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
}

describe('VideoPhase — media title', () => {
	it('keeps the unsanitized title yt-dlp wrote into the job info-json', async () => {
		const ctx = makeCtx(JSON.stringify({id: 'abc', title: 'AC/DC: Live? "Best"'}))

		expect(await VideoPhase(false).run(ctx)).toEqual({kind: 'continue'})

		expect(ctx.active.mediaTitle).toBe('AC/DC: Live? "Best"')
	})

	it('reads no title when the run wrote no info-json', async () => {
		const ctx = makeCtx(null)

		await VideoPhase(false).run(ctx)

		expect(ctx.active.mediaTitle).toBeUndefined()
	})

	it('reads no title from an info-json without one', async () => {
		const ctx = makeCtx(JSON.stringify({id: 'abc'}))

		await VideoPhase(false).run(ctx)

		expect(ctx.active.mediaTitle).toBeUndefined()
	})

	it('reads no title for a failed run', async () => {
		const ctx = makeCtx(JSON.stringify({id: 'abc', title: 'Real Title'}), FAILURE)

		expect((await VideoPhase(false).run(ctx)).kind).toBe('hard-failed')

		expect(ctx.active.mediaTitle).toBeUndefined()
	})
})
