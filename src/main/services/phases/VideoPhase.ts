import {readFileSync} from 'node:fs'
import {mkdir, readFile, rm, stat} from 'node:fs/promises'
import log from 'electron-log/main.js'
import {dirname, join} from 'node:path'
import {STATUS_KEY} from '@shared/schemas.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'
import {siteForJob, type Site} from '@shared/sites/index.js'
import type {YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {assessQualityLimit, availableMaxHeight, isInfoJsonWriteLine, parseSelectedFormats, requiresSignIn, sabrSkippedClient, selectedMaxHeight, type QualityLimit} from '../download/formatLimitSignals.js'
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

async function clearTempDir(tempDir: string): Promise<void> {
	await rm(tempDir, {recursive: true, force: true}).catch(() => undefined)
	await mkdir(tempDir, {recursive: true}).catch(() => undefined)
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
	// yt-dlp found the output file already in place and fetched nothing, so the
	// run says nothing about which quality this session can get.
	alreadyDownloaded: boolean
}

const ALREADY_DOWNLOADED = /^\[download\] .+ has already been downloaded$/

type SelectionCheck = 'limited' | 'not-limited' | 'not-ready'

// Synchronous because it runs inside the output callback, between yt-dlp
// announcing the info-json and the media transfer getting underway. The file
// is small. yt-dlp prints the announcement before writing, and stdout and
// stderr arrive separately, so an unreadable file means "check again on the
// next line", not "not limited".
function checkSelection(tempDir: string, job: ResolvedStartDownloadInput['job']): SelectionCheck {
	if (job.kind !== 'ranged-format') return 'not-limited'
	let text: string
	try {
		text = readFileSync(join(tempDir, INFO_JSON_NAME), 'utf8')
	} catch {
		return 'not-ready'
	}
	const formats = parseSelectedFormats(text)
	if (formats === null) return 'not-ready'
	if (requiresSignIn(text)) return 'not-limited'
	return assessQualityLimit({sabrSkipped: true, selectedHeight: selectedMaxHeight(formats), intent: job.intent}) !== null ? 'limited' : 'not-limited'
}

// A download that loads the probe's info-json selects from that file's format
// list, and YouTube's withheld formats are already missing from it — so when
// even its tallest format is limited, the signed-in run can be skipped outright.
async function probePredictsLimit(probeInfoJsonPath: string, job: ResolvedStartDownloadInput['job']): Promise<boolean> {
	if (job.kind !== 'ranged-format') return false
	const text = await readFile(probeInfoJsonPath, 'utf8').catch(() => null)
	if (text === null || requiresSignIn(text)) return false
	return assessQualityLimit({sabrSkipped: true, selectedHeight: availableMaxHeight(text), intent: job.intent}) !== null
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
				// A resumed run loading its own saved info-json inherits the earlier run's.
				let formatsWithheld = infoJsonPath !== undefined && ((infoJsonPath === input.probeInfoJsonPath && input.probeFormatsWithheld === true) || (infoJsonPath === resumeInfoJsonPath && active.formatsWithheld === true))
				active.formatsWithheld = formatsWithheld
				let infoJsonWritten = false
				let stopChecked = false
				let stoppedLimited = false
				let alreadyDownloaded = false
				const stop = new AbortController()
				// Checked on each line after the info-json announcement until the file
				// reads back complete, when the media transfer has at most just begun. Lines from
				// that point on are not forwarded, so a stopped run leaves no media
				// state behind for the retry to trip over.
				const consume = (text: string): void => {
					if (stoppedLimited) return
					const forwarded: string[] = []
					for (const line of text.split(/\r?\n|\r/)) {
						if (sabrSkippedClient(line) !== null) {
							formatsWithheld = true
							active.formatsWithheld = true
						}
						if (ALREADY_DOWNLOADED.test(line)) alreadyDownloaded = true
						if (mode.stopIfLimited && tempDir && !stopChecked && infoJsonWritten && line.length > 0 && formatsWithheld) {
							const check = checkSelection(tempDir, preparedJob)
							if (check !== 'not-ready') stopChecked = true
							if (check === 'limited') {
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
				// yt-dlp can finish a small file before the stop reaches it. The run
				// then did complete — at the limited quality — and is kept as it is.
				return {req, result, formatsWithheld, stoppedLimited: stoppedLimited && result.kind !== 'success', alreadyDownloaded}
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
			const cookielessEligible = preparedJob.kind === 'ranged-format' && site.id === 'youtube' && tempDir !== undefined && resumeInfoJsonPath === undefined && retry.current !== 'no-help' && (await ytDlp.usesCookies())
			const probeWithheld = input.probeInfoJsonPath !== undefined && input.probeFormatsWithheld === true
			// Starting without cookies re-extracts, so it is only worth it when there
			// is no probe info-json to load or that info-json is itself limited.
			// Once the session knows cookieless helps, any such download starts that
			// way; before that, only one the probe already shows as limited does.
			const startWithoutCookies = cookielessEligible && (input.probeInfoJsonPath === undefined || probeWithheld) && (retry.startWithoutCookies() || (retry.stopLimitedRun() && probeWithheld && input.probeInfoJsonPath !== undefined && (await probePredictsLimit(input.probeInfoJsonPath, preparedJob))))

			let run: MediaRun
			let triedWithoutCookies = startWithoutCookies
			if (startWithoutCookies) {
				run = await runWithInfoJsonFallback(undefined, WITHOUT_COOKIES)
			} else {
				// Without a probe info-json the limit only shows during extraction, so
				// the signed-in run is watched and stopped once formats are chosen.
				run = await runWithInfoJsonFallback(loadInfoJsonPath, {withoutCookies: false, stopIfLimited: cookielessEligible && retry.stopLimitedRun() && loadInfoJsonPath === undefined})
				const stoppedFirst = interrupted()
				if (stoppedFirst) return stoppedFirst
				if (run.stoppedLimited && tempDir) {
					logger.info('YouTube limited the signed-in download; retrying without cookies', {jobId: job.id})
					triedWithoutCookies = true
					// The stopped run may have begun a partial file under the same name
					// the retry will use; resuming it would splice two formats together.
					await clearTempDir(tempDir)
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
			if (triedWithoutCookies && !run.alreadyDownloaded) retry.record(qualityLimit ? 'still-limited' : 'full-quality')
			return {kind: 'continue'}
		}
	}
}
