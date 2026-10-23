import {readFileSync} from 'node:fs'
import {mkdir, readFile, rm, stat} from 'node:fs/promises'
import log from 'electron-log/main.js'
import {isAbsolute, join, relative, sep} from 'node:path'
import {STATUS_KEY} from '@shared/schemas.js'
import type {ResolvedStartDownloadInput} from '@shared/types.js'
import {siteForJob, type Site} from '@shared/sites/index.js'
import type {RunIdentity, YtDlpRequest, YtDlpResult} from '../YtDlp.js'
import {classifyYtDlpFailure} from '../download/errorClassification.js'
import {sabrSkippedClient} from 'ytdlp-errors'
import {assessQualityLimit, availableMaxHeight, isInfoJsonWriteLine, parseSelectedFormats, requiresSignIn, selectedMaxHeight, type QualityLimit} from '../download/formatLimitSignals.js'
import {QueueResumeLifecycle} from '../download/QueueResumeLifecycle.js'
import {readInfoJsonTitle} from '../download/infoJsonTitle.js'
import {setupTempDir} from '../download/jobTempDir.js'
import type {ActiveDownload, Phase, PhaseContext, PhaseOutcome} from './types.js'
import {buildYtDlpSignal, canSpawnSignedIn, exploreSignedOut, INFO_JSON_NAME, probeInfoJsonInTemp} from './phaseHelpers.js'
import {buildMediaRequest} from './mediaRequest.js'
import {FINAL_PATH_FILE_NAME, clearFinalPathFile, readFinalPathFile} from '../ytDlpFinalPath.js'
import {identityFor} from '../exploreGate.js'
import {settleWithExploreSession} from './signedInFlow.js'

const logger = log.scope('downloads')

// yt-dlp runs inside the output folder and is given the temp folder relative
// to it, so a preserved one resumes only from inside that folder.
function insideOutputDir(outputDir: string, tempDir: string): boolean {
	const inside = relative(outputDir, tempDir)
	return inside !== '' && inside !== '..' && !inside.startsWith(`..${sep}`) && !isAbsolute(inside)
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

function isSkippableSponsorBlockApiFailure(result: YtDlpResult, req: YtDlpRequest): boolean {
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

interface MediaRunMode {
	identity: RunIdentity
	stopIfLimited: boolean
}

const WITHOUT_COOKIES: MediaRunMode = {identity: 'none', stopIfLimited: false}
const SIGNED_IN: MediaRunMode = {identity: 'exploreSession', stopIfLimited: false}
const ANONYMOUS: MediaRunMode = {identity: 'configured', stopIfLimited: false}

// Stands in for a spawn the pre-spawn guard refused; the phase reports it as signed out.
function refusedSignedInRun(req: YtDlpRequest): MediaRun {
	return {req, result: {kind: 'exit-error', exitCode: -1, errorKind: 'loginRequired', rawError: 'Explore session unavailable', stdout: '', stderr: ''}, formatsWithheld: false, stoppedLimited: false, alreadyDownloaded: false}
}

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

// The path yt-dlp printed once the file reached its final place wins over the
// one followed through the log, which misses some postprocessors' renames (a
// remux to another container) and so can name a file that no longer exists.
async function adoptFinalPath(active: ActiveDownload, finalPathFile: string | undefined): Promise<void> {
	if (!finalPathFile) return
	const printed = await readFinalPathFile(finalPathFile)
	if (printed === null) {
		logger.warn('yt-dlp printed no final media path; keeping the one from its log', {jobId: active.job.id, mediaPath: active.mediaPath})
		return
	}
	if (printed !== active.mediaPath) logger.info('final media path differs from the one in the log', {jobId: active.job.id, logged: active.mediaPath, printed})
	active.mediaPath = printed
}

// What a run that produced the media leaves for completion to report: the
// file's final path and the title from the info-json the run wrote.
async function adoptFinalMedia(active: ActiveDownload, finalPathFile: string | undefined, tempDir: string | undefined): Promise<void> {
	await adoptFinalPath(active, finalPathFile)
	const title = tempDir ? await readInfoJsonTitle(join(tempDir, INFO_JSON_NAME)) : null
	if (title !== null) active.mediaTitle = title
	// A placeholder row then keeps `Untitled · #N`; say why.
	else logger.info('no title from the job info-json', {jobId: active.job.id, reason: tempDir ? 'missing, unreadable or untitled' : 'no temp folder'})
}

export const VideoPhase: Phase = {
	kind: 'video',
	async run(ctx: PhaseContext): Promise<PhaseOutcome> {
		const {active, ytDlp} = ctx
		const {input, job} = active
		const preparedJob = input.job

		if (preparedJob.kind === 'subtitle-only') {
			throw new Error('invariant: VideoPhase reached with subtitle-only job')
		}

		const preserved = active.tempDir != null && insideOutputDir(job.outputDir, active.tempDir) ? active.tempDir : undefined
		if (active.tempDir != null && preserved === undefined) logger.info('preserved temp folder is outside the output folder; starting fresh', {jobId: job.id, tempDir: active.tempDir})
		const isResume = preserved !== undefined
		const tempDir = await setupTempDir(job.outputDir, job.id, isResume, preserved)
		if (tempDir) {
			active.tempDir = tempDir
			// Disposables drain on finalize for completed / soft-failed /
			// hard-failed / cancelled outcomes; on `paused`, JobLifecycle skips
			// the drain so resume can pick up the .part files.
			QueueResumeLifecycle.registerVideoTempDataCleanup(active, tempDir, disposable => ctx.register(disposable))
		} else {
			logger.warn('Temp folder could not be made; partial files go to the output folder and stay there after a cancel', {jobId: job.id, outputDir: job.outputDir})
		}
		// Resume hardening: if a prior spawn wrote _arroxy.info.json into the
		// preserved tempDir, feed it to yt-dlp so extraction is skipped on
		// resume (signed-URL / format-ID / session-cookie drift cause spurious
		// "Requested format is not available" failures otherwise).
		//
		// Not for a part of the video: yt-dlp writes that info-json after
		// applying the section (`section_start`, a shortened `duration`), so
		// replaying it with the same section offsets the cut a second time.
		// The probe's info-json predates any section and stays safe to load.
		const isPart = preparedJob.kind !== 'ranged-format' && preparedJob.videoPart !== undefined
		const resumeInfoJsonPath = await detectCachedInfoJson(isResume && !isPart ? tempDir : undefined)
		const probeInfoJsonPath = await probeInfoJsonInTemp(input.probeInfoJsonPath, tempDir, job.id)
		const loadInfoJsonPath = resumeInfoJsonPath ?? probeInfoJsonPath

		const site = siteForJob(preparedJob.extractor, input.url)
		const buildRequest = (infoJsonPath: string | undefined): YtDlpRequest => buildMediaRequest({url: input.url, job: preparedJob, outputDir: job.outputDir, tempDir, infoJsonPath})
		const finalPathFile = tempDir ? join(tempDir, FINAL_PATH_FILE_NAME) : undefined
		// The print file the latest run wrote to; none when there is no temp
		// folder or a leftover could not be cleared.
		let printedPathFile: string | undefined

		// Set when the pre-spawn guard refused an escalated job's spawn.
		let signedOut = false
		// Don't preemptively emit downloadingMedia on spawn — yt-dlp spends
		// a few seconds on extractor work and thumbnail conversion first.
		// The first `[download] Destination:` line in consumeProgress emits
		// the accurate status when the actual data download begins.
		const runMedia = async (infoJsonPath: string | undefined, mode: MediaRunMode): Promise<MediaRun> => {
			const req = buildRequest(infoJsonPath)
			if (!(await canSpawnSignedIn(ctx))) {
				signedOut = true
				return refusedSignedInRun(req)
			}
			// yt-dlp prints the withheld-formats warning during extraction, so a run
			// that loads the probe's info-json inherits the probe's observation.
			// A resumed run loading its own saved info-json inherits the earlier run's.
			let formatsWithheld = infoJsonPath !== undefined && ((infoJsonPath === probeInfoJsonPath && input.probeFormatsWithheld === true) || (infoJsonPath === resumeInfoJsonPath && active.formatsWithheld === true))
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
				abortSignal: AbortSignal.any([active.signal, stop.signal])
			})
			printedPathFile = finalPathFile && (await clearFinalPathFile(finalPathFile)) ? finalPathFile : undefined
			if (finalPathFile && !printedPathFile) logger.warn('could not clear the final-path file; using the path from the log', {jobId: job.id})
			// A site-default job the guard moved to anonymous no longer runs on the session.
			const identity = mode.identity === 'exploreSession' && active.input.auth !== 'exploreSession' ? ANONYMOUS.identity : mode.identity
			const result = await ytDlp.run(req, signal, {identity, jobKey: job.id, ...(input.explicit ? {explicit: true} : {}), ...(input.signedInReservation === undefined ? {} : {signedInReservation: input.signedInReservation}), ...(printedPathFile ? {finalPathFile: printedPathFile} : {})})
			// yt-dlp can finish a small file before the stop reaches it. The run
			// then did complete — at the limited quality — and is kept as it is.
			return {req, result, formatsWithheld, stoppedLimited: stoppedLimited && result.kind !== 'success', alreadyDownloaded}
		}

		const runWithInfoJsonFallback = async (infoJsonPath: string | undefined, mode: MediaRunMode): Promise<MediaRun> => {
			const first = await runMedia(infoJsonPath, mode)
			if (active.pauseRequested || active.cancelRequested || first.stoppedLimited || signedOut) return first
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
		// D4: an escalated job never runs without cookies, so it never takes the cookieless retry.
		const cookielessEligible = input.auth !== 'exploreSession' && preparedJob.kind === 'ranged-format' && site.id === 'youtube' && tempDir !== undefined && resumeInfoJsonPath === undefined && retry.current !== 'no-help' && (await ytDlp.usesCookies())
		const probeWithheld = input.probeInfoJsonPath !== undefined && input.probeFormatsWithheld === true
		// Starting without cookies re-extracts, so it is only worth it when there
		// is no probe info-json to load or that info-json is itself limited.
		// Once the session knows cookieless helps, any such download starts that
		// way; before that, only one the probe already shows as limited does.
		const startWithoutCookies = cookielessEligible && (input.probeInfoJsonPath === undefined || probeWithheld) && (retry.startWithoutCookies() || (retry.stopLimitedRun() && probeWithheld && input.probeInfoJsonPath !== undefined && (await probePredictsLimit(input.probeInfoJsonPath, preparedJob))))

		// An escalated job runs signed in wherever an anonymous one would use the configured cookies.
		const withCookies: MediaRunMode = {identity: identityFor(input.auth), stopIfLimited: false}
		let run: MediaRun
		let triedWithoutCookies = startWithoutCookies
		if (startWithoutCookies) {
			run = await runWithInfoJsonFallback(undefined, WITHOUT_COOKIES)
		} else {
			// Without a probe info-json the limit only shows during extraction, so
			// the signed-in run is watched and stopped once formats are chosen.
			run = await runWithInfoJsonFallback(loadInfoJsonPath, {...withCookies, stopIfLimited: cookielessEligible && retry.stopLimitedRun() && loadInfoJsonPath === undefined})
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
			run = await runWithInfoJsonFallback(loadInfoJsonPath, withCookies)
			const stoppedAgain = interrupted()
			if (stoppedAgain) return stoppedAgain
		}
		if (signedOut) return exploreSignedOut(ctx)

		const settled = await settleWithExploreSession(ctx, run, {
			site,
			escalates: ({result, req}) => !isSkippableSponsorBlockApiFailure(result, req),
			// Re-runs signed in, re-extracting: an anonymous info-json is never replayed
			// on the account, and the cleared temp dir holds no partial file to splice.
			runSignedIn: async () => {
				if (tempDir) await clearTempDir(tempDir)
				const signedInRun = await runMedia(undefined, SIGNED_IN)
				return signedOut ? null : signedInRun
			},
			// The safety launch re-extracts anonymously: a signed-in info-json is
			// never replayed without the account.
			runAnonymous: async () => {
				if (tempDir) await clearTempDir(tempDir)
				return runMedia(undefined, ANONYMOUS)
			}
		})
		if (settled.kind === 'stopped') return settled.outcome
		if (settled.kind === 'signedOut') return exploreSignedOut(ctx)
		run = settled.run
		const {req, result} = run

		if (result.kind !== 'success') {
			if (isSkippableSponsorBlockApiFailure(result, req)) {
				await adoptFinalMedia(active, printedPathFile, tempDir)
				return {kind: 'continue'}
			}
			const {payload, statusKey, params} = await classifyYtDlpFailure(result, job.outputDir, job.id)
			const resumeContext = QueueResumeLifecycle.buildResumeContext(active, payload)
			if (resumeContext) active.resumeContext = resumeContext
			if (resumeContext) ctx.emitStatus('error', statusKey, params, payload, resumeContext)
			else ctx.emitStatus('error', statusKey, params, payload)
			return {kind: 'hard-failed', error: payload, resumeContext}
		}

		await adoptFinalMedia(active, printedPathFile, tempDir)
		if (result.usedExtractorFallback) active.usedExtractorFallback = true
		const qualityLimit = await detectQualityLimit(preparedJob, tempDir, run.formatsWithheld)
		if (qualityLimit) active.qualityLimit = qualityLimit
		if (triedWithoutCookies && !run.alreadyDownloaded) retry.record(qualityLimit ? 'still-limited' : 'full-quality')
		return {kind: 'continue'}
	}
}
