import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {dedupeSubtitleFiles, logger} from '../subtitlePostProcess.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal} from './phaseHelpers.js'

export const SubtitleOnlyPhase: Phase = {
	kind: 'subtitle-only',
	async run(ctx: PhaseContext): Promise<PhaseOutcome> {
		const {active, ytDlp} = ctx
		const {job, input} = active
		const preparedJob = input.job

		if (preparedJob.kind !== 'subtitle-only') {
			throw new Error('invariant: SubtitleOnlyPhase reached with non-subtitle-only job')
		}

		const {subtitles} = preparedJob

		const result = await ytDlp.run(
			{kind: 'subtitle', url: input.url, outputDir: input.outputDir!, subtitleLanguages: subtitles.languages, subtitleMode: subtitles.mode, subtitleFormat: subtitles.format ?? DEFAULTS.subtitleFormat, writeAutoSubs: subtitles.writeAuto, outputTemplate: preparedJob.outputTemplate},
			buildYtDlpSignal(ctx, active, {
				onMinting: attempt => {
					ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
				},
				onSpawn: () => {
					ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)
				}
			})
		)

		if (active.pauseRequested) return {kind: 'paused'}
		if (active.cancelRequested) return {kind: 'cancelled'}

		if (result.kind !== 'success') {
			logger.warn('subtitle-only fetch failed', {jobId: job.id, kind: result.kind})
			const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
			ctx.emitStatus('error', statusKey, params, payload)
			return {kind: 'hard-failed', error: payload}
		}

		if (result.usedExtractorFallback) active.usedExtractorFallback = true

		if (subtitles.writeAuto) {
			await dedupeSubtitleFiles(active.subtitlePaths, preparedJob.extractor, job.id, () => active.cancelRequested)
		}

		return {kind: 'completed'}
	}
}
