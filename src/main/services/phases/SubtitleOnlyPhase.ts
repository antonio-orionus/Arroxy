import {STATUS_KEY} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import type {LocalizedError} from '@shared/types.js'
import {postProcessSubtitleFiles, logger} from '../subtitlePostProcess.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {cleanupTempDirByPath} from '../download/cleanup.js'
import {setupTempDir} from '../download/jobTempDir.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal, canSpawnSignedIn, compiledOutputTemplate, exploreSignedOut, guardSignedInSpawn, interruptedOutcome, probeInfoJsonInTemp} from './phaseHelpers.js'
import {automaticCaptionPaths, eagerSubtitleLists, endWithoutFetching, missingSubtitles, planSubtitleRun, readSubtitleReport, clearSubtitleReport, saveSubtitleListing, subtitleFetchRequest, subtitleReportFile} from './subtitleTracks.js'
import {identityFor} from '../exploreGate.js'
import {siteForJob} from '@shared/sites/index.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {settleWithExploreSession} from './signedInFlow.js'

type SettledRun = {kind: 'done'; result: Extract<YtDlpResult, {kind: 'success'}>} | {kind: 'ended'; outcome: PhaseOutcome}

function hardFailure(ctx: PhaseContext, error: LocalizedError, params: Record<string, string>): PhaseOutcome {
	ctx.emitStatus('error', STATUS_KEY.ytdlpProcessError, params, error)
	return {kind: 'hard-failed', error}
}

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

		// The listing and the report live in the job's temp folder, removed when the job finalizes.
		const tempDir = active.tempDir ?? (await setupTempDir(job.outputDir, job.id, false))
		if (!tempDir) {
			const error: LocalizedError = {kind: 'outputNotWritable', raw: `${job.outputDir}: the temp folder could not be created`}
			ctx.emitStatus('error', STATUS_KEY.outputNotWritable, {dir: job.outputDir}, error)
			return {kind: 'hard-failed', error}
		}
		if (active.tempDir === undefined) {
			active.tempDir = tempDir
			ctx.register(() => cleanupTempDirByPath(tempDir))
		}

		// Either run can be refused for the anonymous identity and escalate: the
		// identity is read per run, so a retry goes out as the Explore session.
		const settledRun = async (req: YtDlpRequest): Promise<SettledRun> => {
			const spawn = async (): Promise<{result: YtDlpResult}> => ({
				result: await ytDlp.run(
					req,
					buildYtDlpSignal(ctx, active, {
						// A listing's stdout is the info-json, read from the result: no progress to parse, nothing to log.
						...(req.kind === 'subtitle-listing' ? {onStdout: () => undefined} : {}),
						onMinting: attempt => {
							ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
						},
						onSpawn: () => {
							ctx.emitStatus('download', STATUS_KEY.fetchingSubtitles)
						}
					}),
					{identity: identityFor(active.input.auth), jobKey: job.id, ...(active.input.explicit ? {explicit: true} : {}), ...(active.input.signedInReservation === undefined ? {} : {signedInReservation: active.input.signedInReservation})}
				)
			})
			const first = await spawn()
			const stopped = interruptedOutcome(active)
			if (stopped) return {kind: 'ended', outcome: stopped}
			const settled = await settleWithExploreSession(ctx, first, {site, escalates: () => true, runSignedIn: async () => ((await canSpawnSignedIn(ctx)) ? spawn() : null)})
			if (settled.kind === 'stopped') return {kind: 'ended', outcome: settled.outcome}
			if (settled.kind === 'signedOut') return {kind: 'ended', outcome: exploreSignedOut(ctx)}
			const {result} = settled.run
			if (result.kind !== 'success') {
				logger.warn('subtitle-only run failed', {jobId: job.id, run: req.kind, kind: result.kind})
				const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
				ctx.emitStatus('error', statusKey, params, payload)
				return {kind: 'ended', outcome: {kind: 'hard-failed', error: payload}}
			}
			if (result.usedExtractorFallback) active.usedExtractorFallback = true
			return {kind: 'done', result}
		}

		let lists = await eagerSubtitleLists([await probeInfoJsonInTemp(input.probeInfoJsonPath, tempDir, job.id)], site)
		if (!lists) {
			const listed = await settledRun({kind: 'subtitle-listing', url: input.url})
			if (listed.kind === 'ended') return listed.outcome
			const saved = await saveSubtitleListing(listed.result.stdout, tempDir)
			if (saved.kind === 'not-info-json') return hardFailure(ctx, {kind: 'parse', raw: 'The subtitle listing printed no info-json'}, {error: 'no info-json'})
			if (saved.kind === 'unwritable') {
				logger.warn('the subtitle listing could not be saved', {jobId: job.id, raw: saved.raw})
				const error: LocalizedError = {kind: 'outputNotWritable', raw: saved.raw}
				ctx.emitStatus('error', STATUS_KEY.outputNotWritable, {dir: job.outputDir}, error)
				return {kind: 'hard-failed', error}
			}
			lists = saved.lists
		}
		// A subtitles-only job saves no media, so the row is named from here.
		if (lists.title !== null) active.mediaTitle = lists.title

		const plan = planSubtitleRun(subtitles, lists, {site, jobId: job.id})
		const missing = missingSubtitles(plan, {subtitlesOnly: true})
		if (missing.before) {
			logger.info('Subtitles skipped — this video has no track in the requested languages', {jobId: job.id, request: subtitles.request})
			return endWithoutFetching(ctx, missing.before)
		}

		const template = compiledOutputTemplate(preparedJob.filenameTemplate)
		// Tracks in progress stay in the temp folder, which a cancel removes.
		const output = {directory: job.outputDir, tempDirectory: tempDir, subtitleMode: subtitles.mode, ...(template ? {template} : {})}
		if (!(await clearSubtitleReport(tempDir, job.id))) return hardFailure(ctx, {kind: 'outputNotWritable', raw: `${tempDir}: an earlier subtitle report could not be removed`}, {error: 'stale subtitle report'})
		const fetched = await settledRun(subtitleFetchRequest(plan, {url: input.url, output, format: subtitles.format ?? DEFAULTS.subtitleFormat, lists, tempDir}))
		if (fetched.kind === 'ended') return fetched.outcome

		const {saved: reported, unmoved} = await readSubtitleReport(subtitleReportFile(tempDir), output, job.id)
		// yt-dlp reports every file it wrote or found already present, so a run
		// that planned tracks and reports none saved nothing this job is for.
		if (reported.length === 0 && unmoved.length === 0) return hardFailure(ctx, {kind: 'unknown', raw: 'The download engine saved none of the planned subtitle tracks'}, {error: 'no subtitle files reported'})
		if (reported.length > 0) {
			active.subtitlePaths = reported.map(entry => entry.path)
			await postProcessSubtitleFiles(active.subtitlePaths, {extractor: preparedJob.extractor, url: input.url, jobId: job.id, shouldAbort: () => active.cancelRequested, rollingDedupe: automaticCaptionPaths(reported, plan)})
		}
		// A track yt-dlp wrote that cannot reach the folder is lost with the temp folder.
		if (unmoved.length > 0) {
			const error: LocalizedError = {kind: 'outputNotWritable', raw: `${job.outputDir}: subtitle tracks ${unmoved.join(', ')} could not be moved out of the temp folder`}
			ctx.emitStatus('error', STATUS_KEY.outputNotWritable, {dir: job.outputDir}, error)
			return {kind: 'hard-failed', error}
		}

		return missing.after ?? {kind: 'completed'}
	}
}
