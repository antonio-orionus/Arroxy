import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {dedupeSubtitleFiles, muxSubtitlesIntoVideo, logger} from '../subtitlePostProcess.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal} from './phaseHelpers.js'

async function runEmbedMux(ctx: PhaseContext): Promise<boolean> {
	const {active, ytDlp} = ctx
	const {job, input} = active

	const ffmpegPath = ytDlp.ffmpegPath
	if (!ffmpegPath) {
		logger.warn('embed-mux skipped — ffmpeg not available', {jobId: job.id})
		return false
	}
	if (!active.mediaPath || active.subtitlePaths.length === 0) {
		logger.warn('embed-mux: missing video or sub paths', {jobId: job.id, videoPath: active.mediaPath, subCount: active.subtitlePaths.length})
		return false
	}

	ctx.emitStatus('download', STATUS_KEY.mergingFormats)

	const preparedJob = input.job
	const subtitleLanguages = preparedJob.kind !== 'subtitle-only' ? (preparedJob.subtitles?.languages ?? []) : []

	let result: Awaited<ReturnType<typeof muxSubtitlesIntoVideo>>
	try {
		result = await muxSubtitlesIntoVideo({
			ffmpegPath,
			videoPath: active.mediaPath,
			subtitlePaths: active.subtitlePaths,
			requestedLangs: subtitleLanguages,
			onSpawn: proc => {
				active.ffmpegProcess = proc
				if (active.cancelRequested) proc.kill('SIGKILL')
				ctx.register(() => {
					proc.kill('SIGKILL')
				})
			},
			jobId: job.id
		})
	} catch (err) {
		logger.warn('embed-mux failed unexpectedly', {jobId: job.id, message: err instanceof Error ? err.message : String(err)})
		return false
	} finally {
		active.ffmpegProcess = undefined
	}

	if (!result.ok || !result.outputPath) return false
	active.mediaPath = result.outputPath
	return true
}

export function SidecarSubsPhase(embedAfter: boolean): Phase {
	return {
		kind: 'sidecar-subs',
		async run(ctx: PhaseContext): Promise<PhaseOutcome> {
			const {active, ytDlp} = ctx
			const {job, input} = active
			const preparedJob = input.job

			if (preparedJob.kind === 'subtitle-only') {
				throw new Error('invariant: SidecarSubsPhase reached with subtitle-only job')
			}

			const subs = preparedJob.subtitles
			if (!subs) {
				throw new Error('invariant: SidecarSubsPhase reached with no subtitles in job')
			}

			ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)

			const subResult = await ytDlp.run(
				{kind: 'subtitle', url: input.url, outputDir: input.outputDir!, subtitleLanguages: subs.languages, subtitleMode: subs.mode, subtitleFormat: subs.format ?? DEFAULTS.subtitleFormat, writeAutoSubs: subs.writeAuto, outputTemplate: preparedJob.outputTemplate},
				buildYtDlpSignal(ctx, active)
			)

			if (active.pauseRequested) return {kind: 'paused'}
			if (active.cancelRequested) return {kind: 'cancelled'}
			if (subResult.kind !== 'success') {
				logger.warn('Subtitle fetch failed — video already saved', {jobId: job.id, kind: subResult.kind, ...(subResult.kind === 'exit-error' ? {code: subResult.exitCode, errorKind: subResult.errorKind} : {})})
				return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}

			if (subResult.usedExtractorFallback) active.usedExtractorFallback = true

			if (subs.writeAuto) {
				await dedupeSubtitleFiles(active.subtitlePaths, preparedJob.extractor, job.id, () => active.cancelRequested)
			}

			if (embedAfter) {
				const muxOk = await runEmbedMux(ctx)
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}
				if (!muxOk) return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}

			return {kind: 'completed'}
		}
	}
}
