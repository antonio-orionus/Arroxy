import {mkdir, rm, stat} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {STATUS_KEY} from '@shared/schemas.js'
import {siteForJob, type Site} from '@shared/sites/index.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {QueueResumeLifecycle} from '../download/QueueResumeLifecycle.js'
import {TEMP_DIR_NAME} from '../download/cleanup.js'
import {hideTempDirRoot, normalizeCreatedPath} from '../download/tempDirVisibility.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal} from './phaseHelpers.js'
import {buildMediaRequest} from './mediaRequest.js'

async function setupTempDir(outputDir: string, jobId: string, preserve: boolean, overridePath?: string): Promise<string | undefined> {
	const tempDir = overridePath ?? join(outputDir, TEMP_DIR_NAME, jobId.slice(0, 8))
	try {
		if (!preserve) await rm(tempDir, {recursive: true, force: true})
		// One recursive `mkdir` builds the root and the job directory together, and
		// its result says which of them was new: it resolves to the first path it
		// created, or undefined when everything already existed. So a result that
		// is not the job directory itself means `.arroxy-temp` was just brought
		// into existence, which is the only moment it needs hiding — cleanup
		// removes the root again when a job finalizes, so hiding once per session
		// would leave every later download's folder visible on Windows.
		//
		// Deliberately a single call. Creating the root separately leaves a window
		// in which the startup sweep can `rmdir` an empty root between the two,
		// after which the second call silently recreates it unhidden.
		const created = await mkdir(tempDir, {recursive: true})
		// Cosmetic and Windows-only, so it neither blocks nor can fail the setup.
		if (created !== undefined && normalizeCreatedPath(created) !== tempDir) await hideTempDirRoot(dirname(tempDir))
		return tempDir
	} catch {
		return undefined
	}
}

async function detectCachedInfoJson(tempDir: string | undefined): Promise<string | undefined> {
	if (!tempDir) return undefined
	const path = join(tempDir, '_arroxy.info.json')
	try {
		const s = await stat(path)
		return s.isFile() ? path : undefined
	} catch {
		return undefined
	}
}

function isSkippableSponsorBlockApiFailure(result: Exclude<YtDlpResult, {kind: 'success'}>, req: YtDlpRequest): boolean {
	if (result.kind !== 'exit-error') return false
	if (req.kind !== 'media' || req.sponsorBlock === undefined || req.sponsorBlock.categories.length === 0) return false
	return /Unable to communicate with SponsorBlock API/i.test([result.rawError, result.stderr].filter(Boolean).join('\n'))
}

function hasMediaTransferStarted(active: PhaseContext['active']): boolean {
	return active.mediaDownloadStarted === true || (active.mediaComponentPaths?.length ?? 0) > 0 || active.mediaPath !== undefined
}

// Transport failures are the ones a new session identity can fix: the bytes
// never started moving because the CDN host would not answer. Everything else
// (bot walls, unavailable media, a malformed plan) is either handled by the
// re-mint ladder inside YtDlp or is not a session problem at all, and minting
// costs a hidden-window page load — so the trigger stays narrow.
//
// The site gate is what keeps that cost honest. Pinning the edge host to the
// session identity is a YouTube behaviour, and only YouTube reads the token the
// mint produces; on every other site the scrape would buy nothing and still
// spend a hidden-window page load, which is the same reason YtDlp skips the PoT
// ladder there.
function canRecoverWithNewSession(result: YtDlpResult, site: Site): boolean {
	if (!site.needsPotToken) return false
	return result.kind === 'exit-error' && (result.errorKind === 'network' || result.errorKind === 'chunkTransferFailure')
}

export function VideoPhase(embed: boolean): Phase {
	return {
		kind: embed ? 'video+embed' : 'video',
		async run(ctx: PhaseContext): Promise<PhaseOutcome> {
			const {active, ytDlp} = ctx
			const {input, job} = active
			const preparedJob = input.job

			if (preparedJob.kind === 'subtitle-only') {
				throw new Error('invariant: VideoPhase reached with subtitle-only job')
			}

			const isResume = active.tempDir != null
			const tempDir = await setupTempDir(job.outputDir, job.id, isResume, active.tempDir)
			if (tempDir) {
				active.tempDir = tempDir
				// Disposables drain on finalize for completed / soft-failed /
				// hard-failed / cancelled outcomes; on `paused`, JobLifecycle skips
				// the drain so resume can pick up the .part files.
				QueueResumeLifecycle.registerVideoTempDataCleanup(active, job.outputDir, tempDir, disposable => ctx.register(disposable))
			}
			// Resume hardening: if a prior spawn wrote _arroxy.info.json into the
			// preserved tempDir, feed it to yt-dlp so extraction is skipped on
			// resume (signed-URL / format-ID / session-cookie drift cause spurious
			// "Requested format is not available" failures otherwise).
			const resumeInfoJsonPath = await detectCachedInfoJson(isResume ? tempDir : undefined)
			const loadInfoJsonPath = resumeInfoJsonPath ?? input.probeInfoJsonPath

			const site = siteForJob(preparedJob.extractor, input.url)
			const buildRequest = (infoJsonPath: string | undefined): YtDlpRequest => buildMediaRequest({url: input.url, job: preparedJob, outputDir: job.outputDir, tempDir, embed, infoJsonPath})

			// Don't preemptively emit downloadingMedia on spawn — yt-dlp spends
			// a few seconds on extractor work and thumbnail conversion first.
			// The first `[download] Destination:` line in consumeProgress emits
			// the accurate status when the actual data download begins.
			const runMedia = async (infoJsonPath: string | undefined): Promise<{req: YtDlpRequest; result: YtDlpResult}> => {
				const req = buildRequest(infoJsonPath)
				const result = await ytDlp.run(
					req,
					buildYtDlpSignal(ctx, active, {
						onMinting: attempt => {
							ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
						}
					})
				)
				return {req, result}
			}

			let {req, result} = await runMedia(loadInfoJsonPath)

			if (active.pauseRequested) return {kind: 'paused'}
			if (active.cancelRequested) return {kind: 'cancelled'}

			if (loadInfoJsonPath && result.kind !== 'success' && !hasMediaTransferStarted(active) && !isSkippableSponsorBlockApiFailure(result, req)) {
				// Dropping the info-json re-extracts, but extraction runs under the
				// same session identity — and YouTube keys the googlevideo edge host
				// to that identity, so a wedged host is handed straight back. Reset
				// the session first when the failure was transport-related, which is
				// what makes this fallback able to recover at all. Bounded and
				// best-effort: a failed reset still gets the plain re-extraction.
				//
				// The reset is the one await here long enough for the user to give up
				// inside it, so it takes the job's signal and the flags are re-read
				// after it. Otherwise a cancel landing mid-reset would spawn the
				// fallback anyway, only to kill it on the next line.
				if (canRecoverWithNewSession(result, site)) await ctx.ytDlp.invalidateTokenSession(active.signal)
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}

				const retry = await runMedia(undefined)
				req = retry.req
				result = retry.result
				if (active.pauseRequested) return {kind: 'paused'}
				if (active.cancelRequested) return {kind: 'cancelled'}
			}

			if (result.kind !== 'success') {
				if (isSkippableSponsorBlockApiFailure(result, req)) {
					return {kind: 'continue'}
				}
				const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
				const resumeContext = QueueResumeLifecycle.buildResumeContext(active, payload)
				if (resumeContext) active.resumeContext = resumeContext
				if (resumeContext) ctx.emitStatus('error', statusKey, params, payload, resumeContext)
				else ctx.emitStatus('error', statusKey, params, payload)
				return {kind: 'hard-failed', error: payload, resumeContext}
			}

			if (result.usedExtractorFallback) active.usedExtractorFallback = true
			return {kind: 'continue'}
		}
	}
}
