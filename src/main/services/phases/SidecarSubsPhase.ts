import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {ytDlpSubtitleLanguages} from '@shared/subtitleLanguages.js'
import {postProcessSubtitleFiles, muxSubtitlesIntoVideo, resolveConvertedSubtitlePaths, logger} from '../subtitlePostProcess.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal, canSpawnSignedIn, compiledOutputTemplate, interruptedOutcome} from './phaseHelpers.js'
import {identityFor} from '../exploreGate.js'
import {forgetOnExit} from '../download/processControl.js'
import {siteForJob} from '@shared/sites/index.js'
import type {YtDlpResult} from '../YtDlp.js'
import {settleWithExploreSession} from './signedInFlow.js'

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
			keepCoverArt: preparedJob.kind !== 'subtitle-only' && preparedJob.embed.thumbnail,
			onSpawn: proc => {
				active.ffmpegProcess = proc
				forgetOnExit(proc, () => {
					if (active.ffmpegProcess === proc) active.ffmpegProcess = undefined
				})
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

			// A pause or cancel wins over a lost session: the job parks (or ends) as the user asked.
			const interrupted = interruptedOutcome(active)
			if (interrupted) return interrupted

			// An escalated job never fetches subtitles anonymously. The video is
			// already saved, so a lost Explore session soft-fails this phase like
			// any other subtitle failure instead of failing the download.
			const site = siteForJob(preparedJob.extractor, input.url)
			if (!(await canSpawnSignedIn(ctx))) {
				logger.warn('Subtitles skipped — Explore session no longer available for this signed-in job; video already saved', {jobId: job.id})
				return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}

			ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)

			const fetchSubtitles = async (): Promise<{result: YtDlpResult}> => ({
				result: await ytDlp.run(
					{
						kind: 'subtitles',
						url: input.url,
						output: {directory: input.outputDir!, subtitleMode: subs.mode, ...(compiledOutputTemplate(preparedJob.filenameTemplate) ? {template: compiledOutputTemplate(preparedJob.filenameTemplate)} : {})},
						subtitles: {languages: ytDlpSubtitleLanguages(subs), format: subs.format ?? DEFAULTS.subtitleFormat, writeAuto: subs.writeAuto, ...(subs.autoOnly ? {autoOnly: true} : {})}
					},
					buildYtDlpSignal(ctx, active),
					// The media is saved: the rest of this job goes ahead through a
					// rate-limit cooldown its own media run may have started.
					{identity: identityFor(input.auth), jobKey: job.id, honorCooldown: false}
				)
			})

			const first = await fetchSubtitles()
			const stopped = interruptedOutcome(active)
			if (stopped) return stopped
			// Never escalates (the video is saved; a subtitle failure is soft), but an
			// escalated job's rejected cookies are checked like any signed-in run's.
			const settled = await settleWithExploreSession(ctx, first, {site, runSignedIn: async () => ((await canSpawnSignedIn(ctx)) ? fetchSubtitles() : null)})
			if (settled.kind === 'stopped') return settled.outcome
			if (settled.kind === 'signedOut') {
				logger.warn('Subtitles skipped — the Explore session is signed out; video already saved', {jobId: job.id})
				return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}
			const subResult = settled.run.result
			if (subResult.kind !== 'success') {
				logger.warn('Subtitle fetch failed — video already saved', {jobId: job.id, kind: subResult.kind, ...(subResult.kind === 'exit-error' ? {code: subResult.exitCode, errorKind: subResult.errorKind} : {})})
				return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}

			if (subResult.usedExtractorFallback) active.usedExtractorFallback = true
			active.subtitlePaths = await resolveConvertedSubtitlePaths(active.subtitlePaths, subs.format ?? DEFAULTS.subtitleFormat)

			if (subs.writeAuto) {
				await postProcessSubtitleFiles(active.subtitlePaths, {extractor: preparedJob.extractor, url: input.url, jobId: job.id, shouldAbort: () => active.cancelRequested})
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
