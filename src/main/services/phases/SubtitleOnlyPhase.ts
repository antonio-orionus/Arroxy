import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {ytDlpSubtitleLanguages} from '@shared/subtitleLanguages.js'
import {postProcessSubtitleFiles, resolveConvertedSubtitlePaths, logger} from '../subtitlePostProcess.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal, canSpawnSignedIn, compiledOutputTemplate, exploreSignedOut, guardSignedInSpawn, interruptedOutcome} from './phaseHelpers.js'
import {identityFor} from '../exploreGate.js'
import {siteForJob} from '@shared/sites/index.js'
import type {YtDlpResult} from '../YtDlp.js'
import {settleWithExploreSession} from './signedInFlow.js'

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

		// A pause or cancel wins over a lost session: the job parks (or ends) as the user asked.
		const interrupted = interruptedOutcome(active)
		if (interrupted) return interrupted

		const site = siteForJob(preparedJob.extractor, input.url)
		const refused = await guardSignedInSpawn(ctx)
		if (refused) return refused

		// The identity is read per run: an escalation switches the job to the Explore session.
		const fetchSubtitles = async (): Promise<{result: YtDlpResult}> => ({
			result: await ytDlp.run(
				{
					kind: 'subtitles',
					url: input.url,
					output: {directory: input.outputDir!, subtitleMode: subtitles.mode, ...(compiledOutputTemplate(preparedJob.filenameTemplate) ? {template: compiledOutputTemplate(preparedJob.filenameTemplate)} : {})},
					subtitles: {languages: ytDlpSubtitleLanguages(subtitles), format: subtitles.format ?? DEFAULTS.subtitleFormat, writeAuto: subtitles.writeAuto, ...(subtitles.autoOnly ? {autoOnly: true} : {})}
				},
				buildYtDlpSignal(ctx, active, {
					onMinting: attempt => {
						ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
					},
					onSpawn: () => {
						ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)
					}
				}),
				{identity: identityFor(active.input.auth), jobKey: job.id}
			)
		})

		const first = await fetchSubtitles()
		const stopped = interruptedOutcome(active)
		if (stopped) return stopped

		const settled = await settleWithExploreSession(ctx, first, {site, escalates: () => true, runSignedIn: async () => ((await canSpawnSignedIn(ctx)) ? fetchSubtitles() : null)})
		if (settled.kind === 'stopped') return settled.outcome
		if (settled.kind === 'signedOut') return exploreSignedOut(ctx)
		const {result} = settled.run

		if (result.kind !== 'success') {
			logger.warn('subtitle-only fetch failed', {jobId: job.id, kind: result.kind})
			const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
			ctx.emitStatus('error', statusKey, params, payload)
			return {kind: 'hard-failed', error: payload}
		}

		if (result.usedExtractorFallback) active.usedExtractorFallback = true
		active.subtitlePaths = await resolveConvertedSubtitlePaths(active.subtitlePaths, subtitles.format ?? DEFAULTS.subtitleFormat)

		if (subtitles.writeAuto) {
			await postProcessSubtitleFiles(active.subtitlePaths, {extractor: preparedJob.extractor, url: input.url, jobId: job.id, shouldAbort: () => active.cancelRequested})
		}

		return {kind: 'completed'}
	}
}
