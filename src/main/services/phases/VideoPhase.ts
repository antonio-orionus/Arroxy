import {readFileSync} from 'node:fs'
import {mkdir, readFile, rm, stat} from 'node:fs/promises'
import log from 'electron-log/main.js'
import {dirname, join} from 'node:path'
import {STATUS_KEY} from '@shared/schemas.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'
import {siteForJob, type Site} from '@shared/sites/index.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {assessQualityLimit, isInfoJsonWriteLine, parseSelectedFormats, requiresSignIn, sabrSkippedClient, selectedMaxHeight, type QualityLimit} from '../download/formatLimitSignals.js'
import {QueueResumeLifecycle} from '../download/QueueResumeLifecycle.js'
import {TEMP_DIR_NAME} from '../download/cleanup.js'
import {hideTempDirRoot, normalizeCreatedPath} from '../download/tempDirVisibility.js'
import type {Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal} from './phaseHelpers.js'
import {buildMediaRequest} from './mediaRequest.js'

const logger = log.scope('downloads')

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
	const path = join(tempDir, INFO_JSON_NAME)
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

// Only a format range can be pushed down by withheld URLs; an explicit format
// either downloads as picked or fails outright. The selected height comes from
// the info-json yt-dlp writes after format selection, before temp cleanup.
async function detectQualityLimit(job: ResolvedStartDownloadInput['job'], tempDir: string | undefined, formatsWithheld: boolean): Promise<QualityLimit | null> {
	if (!formatsWithheld || job.kind !== 'ranged-format' || !tempDir) return null
	const infoJson = await readFile(join(tempDir, INFO_JSON_NAME), 'utf8').catch(() => null)
	const selectedHeight = infoJson === null ? null : selectedMaxHeight(parseSelectedFormats(infoJson))
	return assessQualityLimit({sabrSkipped: true, selectedHeight, intent: job.intent})
}

const INFO_JSON_NAME = '_arroxy.info.json'

interface MediaRunMode {
	withoutCookies: boolean
	stopIfLimited: boolean
}

const WITH_COOKIES: MediaRunMode = {withoutCookies: false, stopIfLimited: false}
const WITHOUT_COOKIES: MediaRunMode = {withoutCookies: true, stopIfLimited: false}

interface MediaRun {
	req: YtDlpRequest
	result: YtDlpResult
	formatsWithheld: boolean
	// Stopped by the phase right after format selection because YouTube limited
	// the signed-in session; the result is the cancelled run, not a failure.
	stoppedLimited: boolean
}

// Synchronous because it runs inside the output callback, between yt-dlp
// finishing the info-json and the media transfer getting underway. The file is
// small and this only happens once per run, after the withheld-formats warning.
function isLimitedSelection(tempDir: string, job: ResolvedStartDownloadInput['job']): boolean {
	if (job.kind !== 'ranged-format') return false
	let text: string
	try {
		text = readFileSync(join(tempDir, INFO_JSON_NAME), 'utf8')
	} catch {
		return false
	}
	if (requiresSignIn(text)) return false
	return assessQualityLimit({sabrSkipped: true, selectedHeight: selectedMaxHeight(parseSelectedFormats(text)), intent: job.intent}) !== null
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
			const runMedia = async (infoJsonPath: string | undefined, mode: MediaRunMode): Promise<MediaRun> => {
				const req = buildRequest(infoJsonPath)
				// yt-dlp prints the withheld-formats warning during extraction, so a run
				// that loads the probe's info-json inherits the probe's observation.
				let formatsWithheld = infoJsonPath !== undefined && infoJsonPath === input.probeInfoJsonPath && input.probeFormatsWithheld === true
				let infoJsonWritten = false
				let stopChecked = false
				let stoppedLimited = false
				const stop = new AbortController()
				// Checked on the first line after the info-json write, when the file is
				// complete and the media transfer has at most just begun. Lines from
				// that point on are not forwarded, so a stopped run leaves no media
				// state behind for the retry to trip over.
				const consume = (text: string): void => {
					if (stoppedLimited) return
					const forwarded: string[] = []
					for (const line of text.split(/\r?\n|\r/)) {
						if (sabrSkippedClient(line) !== null) formatsWithheld = true
						if (mode.stopIfLimited && tempDir && !stopChecked && infoJsonWritten && line.length > 0 && formatsWithheld) {
							stopChecked = true
							if (isLimitedSelection(tempDir, preparedJob)) {
								stoppedLimited = true
								stop.abort()
								if (forwarded.length > 0) ctx.safeConsume(forwarded.join('\n'))
								return
							}
						}
						if (isInfoJsonWriteLine(line)) infoJsonWritten = true
						forwarded.push(line)
					}
					ctx.safeConsume(text)
				}
				const signal = buildYtDlpSignal(ctx, active, {
					onMinting: attempt => {
						ctx.emitStatus('token', attempt === 0 ? STATUS_KEY.mintingToken : STATUS_KEY.remintingToken)
					},
					onStdout: consume,
					onStderr: consume,
					abortSignal: stop.signal
				})
				const result = await ytDlp.run(req, signal, {withoutCookies: mode.withoutCookies})
				return {req, result, formatsWithheld, stoppedLimited}
			}

			const runWithInfoJsonFallback = async (infoJsonPath: string | undefined, mode: MediaRunMode): Promise<MediaRun> => {
				const first = await runMedia(infoJsonPath, mode)
				if (active.pauseRequested || active.cancelRequested || first.stoppedLimited) return first
				if (!infoJsonPath || first.result.kind === 'success' || hasMediaTransferStarted(active) || isSkippableSponsorBlockApiFailure(first.result, first.req)) return first
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
				if (canRecoverWithNewSession(first.result, site)) await ctx.ytDlp.invalidateTokenSession(active.signal)
				if (active.pauseRequested || active.cancelRequested) return first
				return runMedia(undefined, mode)
			}

			const interrupted = (): PhaseOutcome | null => (active.pauseRequested ? {kind: 'paused'} : active.cancelRequested ? {kind: 'cancelled'} : null)
			const retry = ctx.cookielessRetry
			const cookielessEligible = preparedJob.kind === 'ranged-format' && site.id === 'youtube' && tempDir !== undefined && retry.current !== 'no-help' && (await ytDlp.usesCookies())
			// A probe info-json extracted with cookies but not limited can still be
			// loaded as is; starting without cookies only pays off when extraction
			// has to run again anyway.
			const startWithoutCookies = cookielessEligible && retry.startWithoutCookies() && resumeInfoJsonPath === undefined && (input.probeInfoJsonPath === undefined || input.probeFormatsWithheld === true)

			let run: MediaRun
			let triedWithoutCookies = startWithoutCookies
			if (startWithoutCookies) {
				run = await runWithInfoJsonFallback(undefined, WITHOUT_COOKIES)
			} else {
				run = await runWithInfoJsonFallback(loadInfoJsonPath, {withoutCookies: false, stopIfLimited: cookielessEligible && retry.stopLimitedRun()})
				const stoppedFirst = interrupted()
				if (stoppedFirst) return stoppedFirst
				if (run.stoppedLimited) {
					logger.info('YouTube limited the signed-in download; retrying without cookies', {jobId: job.id})
					triedWithoutCookies = true
					run = await runMedia(undefined, WITHOUT_COOKIES)
				}
			}
			const stopped = interrupted()
			if (stopped) return stopped
			// Cookieless failed (sign-in wall, bot check, a video that needs an
			// account): the session stops trying and this download goes back to the
			// configured cookies, where it can at least finish at the lower quality.
			if (triedWithoutCookies && run.result.kind !== 'success') {
				retry.record('failed')
				triedWithoutCookies = false
				logger.info('Download without cookies failed; using cookies again', {jobId: job.id})
				run = await runWithInfoJsonFallback(loadInfoJsonPath, WITH_COOKIES)
				const stoppedAgain = interrupted()
				if (stoppedAgain) return stoppedAgain
			}
			const {req, result} = run

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
			const qualityLimit = await detectQualityLimit(preparedJob, tempDir, run.formatsWithheld)
			if (qualityLimit) active.qualityLimit = qualityLimit
			if (triedWithoutCookies) retry.record(qualityLimit ? 'still-limited' : 'full-quality')
			return {kind: 'continue'}
		}
	}
}
