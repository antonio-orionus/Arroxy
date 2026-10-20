import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'

vi.mock('@main/services/audioStrip.js', () => ({dropAudioStreams: vi.fn(), logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {dropAudioStreams} from '@main/services/audioStrip.js'
import {DropAudioPhase} from '@main/services/phases/DropAudioPhase.js'
import {PhaseExecutor} from '@main/services/phases/PhaseExecutor.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, Phase, PhaseContext} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {EmbedOptions, PreparedJob} from '@shared/preparedJob.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {explorePorts} from '../helpers/explorePorts.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const VIDEO_ONLY_JOB: PreparedJob = {kind: 'ranged-format', extractor: 'TikTok', extractorKey: 'TikTok', intent: {kind: 'video-only', goal: 'best-picture', tier: 'best', fileType: 'auto'}, filenameTemplate: '{title}', sponsorBlock: {mode: 'off'}, embed: EMBED_OFF}

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.tiktok.com/@a/video/1', outputDir: '/out', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
}

function makeCtx(overrides: Partial<ActiveDownload> = {}): PhaseContext {
	const input = {url: 'https://www.tiktok.com/@a/video/1', outputDir: '/out', job: VIDEO_ONLY_JOB} as ResolvedStartDownloadInput
	const active: ActiveDownload = {
		job: makeJob(),
		input,
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		mediaPath: '/out/clip.mp4',
		disposables: new AsyncStack(),
		...overrides
	}
	return {active, signal: active.signal, register: d => active.disposables.defer(d), ytDlp: {ffmpegPath: '/fake/ffmpeg'} as never, emitStatus: vi.fn(), safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
}

const softFailedSubtitles: Phase = {kind: 'sidecar-subs', run: () => Promise.resolve({kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed})}

beforeEach(() => vi.clearAllMocks())

describe('DropAudioPhase', () => {
	it('finishes as a plain completion when the audio came off', async () => {
		vi.mocked(dropAudioStreams).mockResolvedValue({ok: true, dropped: true})
		const ctx = makeCtx()

		await new PhaseExecutor().run(ctx, [DropAudioPhase])

		expect(ctx.emitStatus).toHaveBeenCalledWith('done', STATUS_KEY.complete)
	})

	// The profile asked for no audio: a file that still has it is not a plain success.
	it('tells the user the file kept its audio when the strip fails', async () => {
		vi.mocked(dropAudioStreams).mockResolvedValue({ok: false, dropped: false})
		const ctx = makeCtx()

		const outcome = await new PhaseExecutor().run(ctx, [DropAudioPhase])

		expect(outcome).toEqual({kind: 'completed'})
		expect(ctx.emitStatus).toHaveBeenCalledWith('done', STATUS_KEY.audioKept)
		expect(ctx.emitStatus).not.toHaveBeenCalledWith('done', STATUS_KEY.complete)
	})

	it('still runs the subtitles after a failed strip and reports both problems', async () => {
		vi.mocked(dropAudioStreams).mockResolvedValue({ok: false, dropped: false})
		const ctx = makeCtx()

		await new PhaseExecutor().run(ctx, [DropAudioPhase, softFailedSubtitles])

		expect(ctx.emitStatus).toHaveBeenCalledWith('done', STATUS_KEY.audioKeptSubtitlesFailed)
		expect(ctx.emitStatus).not.toHaveBeenCalledWith('done', STATUS_KEY.subtitlesFailed)
	})

	it('reports a cancel, not the kept audio, when the strip was cancelled', async () => {
		const ctx = makeCtx()
		vi.mocked(dropAudioStreams).mockImplementation(() => {
			ctx.active.cancelRequested = true
			return Promise.resolve({ok: false, dropped: false})
		})

		const outcome = await new PhaseExecutor().run(ctx, [DropAudioPhase])

		expect(outcome).toEqual({kind: 'cancelled'})
		expect(ctx.emitStatus).not.toHaveBeenCalledWith('done', STATUS_KEY.audioKept)
	})
})
