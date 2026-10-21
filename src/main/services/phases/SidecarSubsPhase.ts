import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {SubtitlePlan} from '@shared/subtitleTracks.js'
import {postProcessSubtitleFiles, muxSubtitlesIntoVideo, logger} from '../subtitlePostProcess.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {join} from 'node:path'
import {buildYtDlpSignal, canSpawnSignedIn, compiledOutputTemplate, INFO_JSON_NAME, interruptedOutcome, probeInfoJsonInTemp} from './phaseHelpers.js'
import {automaticCaptionPaths, clearSubtitleReport, eagerSubtitleLists, endWithoutFetching, missingSubtitles, planSubtitleRun, readSubtitleReport, saveSubtitleListing, subtitleEmbedTracks, subtitleFetchRequest, subtitleReportFile, type ReportedSubtitle, type SubtitleLists} from './subtitleTracks.js'
import {identityFor} from '../exploreGate.js'
import {forgetOnExit} from '../download/processControl.js'
import {siteForJob} from '@shared/sites/index.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {settleWithExploreSession} from './signedInFlow.js'

const SUBTITLES_FAILED: PhaseOutcome = {kind: 'soft-failed', status: STATUS_KEY.subtitlesFailed}

async function runEmbedMux(ctx: PhaseContext, plan: SubtitlePlan, reported: readonly ReportedSubtitle[], names: {lists: SubtitleLists; format: string}): Promise<boolean> {
	const {active, ytDlp} = ctx
	const {job, input} = active

	const ffmpegPath = ytDlp.ffmpegPath
	if (!ffmpegPath) {
		logger.warn('embed-mux skipped — ffmpeg not available', {jobId: job.id})
		return false
	}
	if (!active.mediaPath || reported.length === 0) {
		logger.warn('embed-mux: missing video or sub paths', {jobId: job.id, videoPath: active.mediaPath, subCount: reported.length})
		return false
	}

	ctx.emitStatus('download', STATUS_KEY.mergingFormats)

	const preparedJob = input.job

	let result: Awaited<ReturnType<typeof muxSubtitlesIntoVideo>>
	try {
		result = await muxSubtitlesIntoVideo({
			ffmpegPath,
			videoPath: active.mediaPath,
			tracks: subtitleEmbedTracks(reported, plan, names),
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
				return SUBTITLES_FAILED
			}
			// The media run made the temp folder; without it there is nowhere for the listing or the report.
			const {tempDir} = active
			if (!tempDir) {
				logger.warn('Subtitles skipped — the job has no temp folder; video already saved', {jobId: job.id})
				return SUBTITLES_FAILED
			}

			ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)

			// Never escalates (the video is saved; a subtitle failure is soft), but an
			// escalated job's rejected cookies are checked like any signed-in run's.
			const settledRun = async (req: YtDlpRequest): Promise<Extract<YtDlpResult, {kind: 'success'}> | PhaseOutcome> => {
				const spawn = async (): Promise<{result: YtDlpResult}> => ({
					result: await ytDlp.run(
						req,
						// A listing's stdout is the info-json, read from the result: no progress to parse, nothing to log.
						buildYtDlpSignal(ctx, active, req.kind === 'subtitle-listing' ? {onStdout: () => undefined} : {}),
						// The media is saved: the rest of this job goes ahead through a
						// rate-limit cooldown its own media run may have started.
						{identity: identityFor(input.auth), jobKey: job.id, honorCooldown: false}
					)
				})
				const first = await spawn()
				const stopped = interruptedOutcome(active)
				if (stopped) return stopped
				const settled = await settleWithExploreSession(ctx, first, {site, runSignedIn: async () => ((await canSpawnSignedIn(ctx)) ? spawn() : null)})
				if (settled.kind === 'stopped') return settled.outcome
				if (settled.kind === 'signedOut') {
					logger.warn('Subtitles skipped — the Explore session is signed out; video already saved', {jobId: job.id})
					return SUBTITLES_FAILED
				}
				const {result} = settled.run
				if (result.kind !== 'success') {
					logger.warn('Subtitle run failed — video already saved', {jobId: job.id, run: req.kind, kind: result.kind, ...(result.kind === 'exit-error' ? {code: result.exitCode, errorKind: result.errorKind} : {})})
					return SUBTITLES_FAILED
				}
				if (result.usedExtractorFallback) active.usedExtractorFallback = true
				return result
			}

			// The media run's info-json first: same identity, and written moments ago.
			let lists = await eagerSubtitleLists([join(tempDir, INFO_JSON_NAME), await probeInfoJsonInTemp(input.probeInfoJsonPath, tempDir, job.id)], site)
			if (!lists) {
				const listed = await settledRun({kind: 'subtitle-listing', url: input.url})
				if (listed.kind !== 'success') return listed
				lists = await saveSubtitleListing(listed.stdout, tempDir)
				if (!lists) {
					logger.warn('Subtitles skipped — the subtitle listing printed no info-json; video already saved', {jobId: job.id})
					return SUBTITLES_FAILED
				}
			}

			const plan = planSubtitleRun(requested, lists, {site, jobId: job.id})
			const missing = missingSubtitles(plan, {subtitlesOnly: false})
			if (missing.before) {
				logger.info('Subtitles skipped — this video has no track in the requested languages', {jobId: job.id, request: requested.request})
				return endWithoutFetching(ctx, missing.before)
			}

			const template = compiledOutputTemplate(preparedJob.filenameTemplate)
			const output = {directory: job.outputDir, subtitleMode: requested.mode, ...(template ? {template} : {})}
			if (!(await clearSubtitleReport(tempDir, job.id))) {
				logger.warn('Subtitles skipped — an earlier subtitle report could not be removed; video already saved', {jobId: job.id})
				return SUBTITLES_FAILED
			}
			const fetched = await settledRun(subtitleFetchRequest(plan, {url: input.url, output, format: requested.format ?? DEFAULTS.subtitleFormat, lists, tempDir}))
			if (fetched.kind !== 'success') return fetched

			const reported = await readSubtitleReport(subtitleReportFile(tempDir), job.outputDir, job.id)
			// yt-dlp reports every file it wrote or found already present.
			if (reported.length === 0) {
				logger.warn('Subtitles failed — the subtitle run reported no written files; video already saved', {jobId: job.id})
				return SUBTITLES_FAILED
			}
			active.subtitlePaths = reported.map(entry => entry.path)
			await postProcessSubtitleFiles(active.subtitlePaths, {extractor: preparedJob.extractor, url: input.url, jobId: job.id, shouldAbort: () => active.cancelRequested, rollingDedupe: automaticCaptionPaths(reported, plan)})

			if (embedAfter) {
				const muxOk = await runEmbedMux(ctx, plan, reported, {lists, format: fetched.effectiveSubtitleFormat ?? requested.format ?? DEFAULTS.subtitleFormat})
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}
				if (!muxOk) return SUBTITLES_FAILED
			}

			return missing.after ?? {kind: 'completed'}
		}
	}
}
