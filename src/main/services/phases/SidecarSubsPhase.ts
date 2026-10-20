import {STATUS_KEY, type SubtitleFormat} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {postProcessSubtitleFiles, muxSubtitlesIntoVideo, resolveConvertedSubtitlePaths, logger} from '../subtitlePostProcess.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {join} from 'node:path'
import {buildYtDlpSignal, canSpawnSignedIn, compiledOutputTemplate, INFO_JSON_NAME, interruptedOutcome} from './phaseHelpers.js'
import {readSubtitleTrackNames, resolveSubtitlePlan, subtitleEmbedTracks, subtitleRunIsEmpty, subtitleRunRequest, type SubtitleRun} from './subtitleTracks.js'
import {identityFor} from '../exploreGate.js'
import {forgetOnExit} from '../download/processControl.js'
import {siteForJob} from '@shared/sites/index.js'
import type {YtDlpResult} from '../YtDlp.js'
import {settleWithExploreSession} from './signedInFlow.js'

async function runEmbedMux(ctx: PhaseContext, run: SubtitleRun, opts: {infoJsonPaths: readonly (string | undefined)[]; fetchedFormat: SubtitleFormat}): Promise<boolean> {
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
	const trackNames = await readSubtitleTrackNames({fetch: run.fetch, format: opts.fetchedFormat, infoJsonPaths: opts.infoJsonPaths})
	if (trackNames.size === 0) logger.warn('embed-mux: no track names — no readable info-json lists these tracks; they are embedded untitled', {jobId: job.id})

	let result: Awaited<ReturnType<typeof muxSubtitlesIntoVideo>>
	try {
		result = await muxSubtitlesIntoVideo({
			ffmpegPath,
			videoPath: active.mediaPath,
			tracks: subtitleEmbedTracks(active.subtitlePaths, run, trackNames),
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

			const requested = preparedJob.subtitles
			if (!requested) {
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

			// The media run's info-json first: same identity, and written moments ago.
			const infoJsonPaths = [active.tempDir ? join(active.tempDir, INFO_JSON_NAME) : undefined, input.probeInfoJsonPath]
			const run = await resolveSubtitlePlan(requested, {infoJsonPaths, site, jobId: job.id})
			if (subtitleRunIsEmpty(run)) {
				logger.info('Subtitles skipped — this video has no track in the requested languages', {jobId: job.id, request: requested.request})
				return {kind: 'completed'}
			}

			ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)

			const fetchSubtitles = async (): Promise<{result: YtDlpResult}> => ({
				result: await ytDlp.run(
					{
						kind: 'subtitles',
						url: input.url,
						output: {directory: input.outputDir!, subtitleMode: requested.mode, ...(compiledOutputTemplate(preparedJob.filenameTemplate) ? {template: compiledOutputTemplate(preparedJob.filenameTemplate)} : {})},
						subtitles: subtitleRunRequest(run, requested.format ?? DEFAULTS.subtitleFormat)
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
			const fetchedFormat = subResult.effectiveSubtitleFormat ?? requested.format ?? DEFAULTS.subtitleFormat
			active.subtitlePaths = await resolveConvertedSubtitlePaths(active.subtitlePaths, requested.format ?? DEFAULTS.subtitleFormat)

			if (run.fetch.auto) {
				await postProcessSubtitleFiles(active.subtitlePaths, {extractor: preparedJob.extractor, url: input.url, jobId: job.id, shouldAbort: () => active.cancelRequested})
			}

			if (embedAfter) {
				const muxOk = await runEmbedMux(ctx, run, {infoJsonPaths, fetchedFormat})
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}
				if (!muxOk) return {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}
			}

			return {kind: 'completed'}
		}
	}
}
