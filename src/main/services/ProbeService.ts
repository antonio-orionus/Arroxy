import {EventEmitter} from 'node:events'
import log from 'electron-log/main.js'
import {nowIso} from '@main/utils/clock.js'
import {ok, fail, type Result} from '@shared/result.js'
import type {AuthBasis, JobAuth, PlaylistProbeResult, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeProgressEvent, ProbeResult, ProbeDegradationReason, ProbeInfoJsonRef, VideoChapter, VideoProbeResult} from '@shared/types.js'
import type {EscalationReason} from '@shared/escalationSchemas.js'
import type {ExploreSignInState, ProbeKind} from '@shared/schemas.js'
import {infoDictSchema, isPlaylistLike, isUrlRedirect, type InfoDict, type PlaylistInfo, type MultiVideoInfo, type VideoInfo, type YtDlpFormat} from 'yt-dlp-bridge/info'
import {isAudioOnlySource, isAudioOnlyVideo} from '@shared/ytdlp/extractorPredicates.js'
import {classifyYtDlpStderr, sabrSkippedClient} from 'ytdlp-errors'
import {splitOutputLines} from 'yt-dlp-bridge/runner'
import {requestSiteFor, siteForExtractor, siteForUrl} from '@shared/sites/index.js'
import {exploreCookieScopeFor} from '@shared/sites/exploreCookieScope.js'
import {YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS} from '@shared/youtubePlayerClients.js'
import {PROBE_TIMEOUT_MESSAGE, RATE_LIMIT_COOLDOWN_MESSAGE, YtDlp, type RunIdentity} from './YtDlp.js'
import type {LaunchGate} from './LaunchGate.js'
import type {StartDecision} from './startIdentity.js'
import type {SignInEvidence, SignInEvidenceSource} from './SuspectSignIns.js'
import {signedInFailure} from './signedInEvidence.js'
import type {ProbeSlots} from './ProbeSlots.js'
import {decideEscalation, escalationReason, reachesPlaylistItems} from './exploreEscalation.js'
import type {ExploreGate} from './exploreGate.js'
import type {ExploreSignInCheck} from './phases/types.js'
import {mapFormats} from '@shared/ytdlp/formatMapping.js'
import {formatSelectionSource} from '@shared/ytdlp/selectableFormat.js'
import type {LookedUpSizes} from './formatSizeLookup.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {buildMockProbeResult} from './probeMockResult.js'
import {summarizeProbeResult} from './probeResultSummary.js'
import {mediaTagsField, resolveTimestamp, resolveUploadDate, resolveUploader, upgradeThumbnailScheme} from './probeInfoFields.js'
import {mapPlaylistEntries} from './probePlaylistEntries.js'
import {parseProbeJsonOutput, parseProbeProgressLine} from './probeOutput.js'
import type {ProbeInfoJsonCache} from './ProbeInfoJsonCache.js'
import {degradationIsTransient, deriveDegraded, detectProbeDegradationSignals, isRateLimited, type ProbeSignal} from './probeDegradation.js'
import {defaultVhxTitleFetcher, deriveRecoveredTitle, extractPageTitleMeta, isLikelyParentPage, isVhxEmbedExtractor, isVhxSentinelTitle, patchInfoJsonTitle, smuggledRefererOf, type VhxTitleFetcher} from './vhxTitleRecovery.js'

const logger = log.scope('probe')

type ProbeAttemptName = 'initial' | 'retry'

type PlaylistScopeRequestLog = PlaylistScope['items']

interface ProbeAttemptSuccess {
	info: InfoDict
	raw: unknown
	stderr: string
	degradationSignals: ProbeSignal[]
	// Sizes the site left out, asked of its servers (`withSiteSizes`).
	lookedUpSizes?: LookedUpSizes
}

type ProbeAttemptResult = {kind: 'success'; data: ProbeAttemptSuccess} | {kind: 'failure'; error: ProbeError}

// Who a probe runs as, and whether yt-dlp rejected that identity's cookies on any of its spawns.
interface ProbeRunAs {
	// Changed by a redirect to another site when `restart` is set.
	identity: RunIdentity
	// How a run that its site's default started decides again on a redirect to
	// another site (ADR 0022). Absent: the identity holds across redirects.
	readonly restart?: (url: string) => RunIdentity
	// The last run never reached the site: Arroxy held it back (pacing, a slot
	// wait, a cooldown) or yt-dlp failed to spawn.
	heldBeforeLaunch: boolean
	// The last run's session was refused before launch (YtDlpResult.signedInRefused).
	signedInRefused: boolean
	// The user opened this link (the window's probe): a signed-in run skips its site's spacing and budget.
	readonly explicit: boolean
	cookiesRejected: boolean
	// The site yt-dlp said rejected the account cookies, on any of its spawns.
	cookiesRejectedBy: string | null
	// The URL the last run asked, after any redirect.
	lastUrl: string
	// Told the site whose cooldown held a run (YtDlp spawned nothing): a redirect may have changed it.
	readonly onHeld: (site: string) => void
	// Told when the site's signed-in pacing held a run past its wait budget (YtDlp spawned nothing).
	readonly onPaced: (until: number) => void
}

const PROBE_CANCELLED = {kind: 'failure', error: {kind: 'other', code: 'cancelled', message: 'Probe cancelled'}} as const satisfies ProbeAttemptResult
const PROBE_DEFERRED = {kind: 'other', code: 'deferred', message: 'Probe deferred'} as const satisfies ProbeError

// Options bag so unit tests can inject a deterministic parent-page fetcher;
// production leaves it undefined and gets the real HTTP fetcher.
export interface ProbeServiceOptions {
	vhxTitleFetcher?: VhxTitleFetcher
	// Absent: probes never escalate to the Explore session.
	exploreGate?: ExploreGate
	// Absent: a check after rejected cookies cannot tell (see afterCookiesRejected).
	exploreSession?: ExploreSignInCheck
	// Fills the sizes a site leaves out (formatSizeLookup). Absent: none are looked up.
	formatSizes?: (formats: readonly YtDlpFormat[], signal: AbortSignal) => Promise<LookedUpSizes>
	// How many probes run at once (ProbeSlots). Absent: no limit.
	slots?: ProbeSlots
	// Where a listing enumerated signed in is charged against its site's
	// signed-in window (the launch gate). Absent: nothing is charged.
	listingCharges?: Pick<LaunchGate, 'chargeListing'>
	// The identity a link's first run uses (ADR 0022). Absent: every probe starts anonymous.
	startIdentity?: (url: string) => StartDecision
	// Where a site-default run tells what it showed about the site's sign-in.
	signInEvidence?: (site: string, evidence: SignInEvidence, source?: SignInEvidenceSource) => void
}

// `kind` picks the probe's slot. `escalate: false` keeps the probe anonymous even when the Explore
// session could rescue it — for lookups that must not spend the user's account (title backfill).
export interface ProbeOptions {
	kind: ProbeKind
	playlistMode?: ProbePlaylistMode
	playlistScope?: PlaylistScope
	ownerKey?: string
	timeoutMs?: number
	escalate?: boolean
	// Asked when the probe's slot is granted; false declines it and the probe fails `deferred`.
	admit?: () => boolean
}

// YtDlp held the run for a cooldown that began after the probe got its slot: nothing spawned.
function heldByCooldown(result: Result<ProbeResult, ProbeError>): boolean {
	return !result.ok && result.error.kind === 'ytdlp' && result.error.error.raw === RATE_LIMIT_COOLDOWN_MESSAGE
}

const EXPLORE_VERIFIED_SIGNED_OUT = 'exploreVerifiedSignedOut'

// Timer-killed probes surface as exit-errors carrying PROBE_TIMEOUT_MESSAGE.
// Matched by literal because the taxonomy has no timeout kind — see YtDlp.ts.
function isProbeTimeoutFailure(result: ProbeAttemptResult): boolean {
	return result.kind === 'failure' && result.error.kind === 'ytdlp' && result.error.error.raw === PROBE_TIMEOUT_MESSAGE
}

function chapterTime(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined
}

// yt-dlp's `chapters`: `{start_time, end_time, title}` dicts. Anything that
// does not describe a forward range is dropped rather than trusted.
function resolveChapters(raw: unknown[] | undefined): VideoChapter[] {
	const chapters: VideoChapter[] = []
	for (const entry of raw ?? []) {
		if (typeof entry !== 'object' || entry === null) continue
		const {start_time: start, end_time: end, title} = entry as Record<string, unknown>
		const startSeconds = chapterTime(start)
		const endSeconds = chapterTime(end)
		if (startSeconds === undefined || endSeconds === undefined || endSeconds <= startSeconds) continue
		chapters.push({title: typeof title === 'string' ? title.trim() : '', startSeconds, endSeconds})
	}
	return chapters
}

function buildVideoProbeResult(info: VideoInfo, jobUrl: string, degraded: {reasons: ProbeDegradationReason[]} | undefined, lookedUpSizes?: LookedUpSizes, probeInfoJsonRef?: ProbeInfoJsonRef): VideoProbeResult {
	const extractor = info.extractor ?? ''
	const site = siteForExtractor(extractor)
	const formats = mapFormats(info.formats ?? [], {durationSeconds: typeof info.duration === 'number' ? info.duration : undefined, ...(lookedUpSizes ? {lookedUpSizes} : {})})
	return {
		kind: 'video',
		videoId: typeof info.id === 'string' && info.id.length > 0 ? info.id : null,
		...(probeInfoJsonRef ? {probeInfoJsonRef} : {}),
		extractor,
		extractorKey: info.extractor_key ?? '',
		webpageUrl: info.webpage_url ?? jobUrl,
		isAudioOnlySource: isAudioOnlyVideo(extractor, formats),
		formats,
		// yt-dlp's own formats and its extractor's sort, so the profile pick runs as the download will.
		formatSelection: formatSelectionSource(info, '_format_sort_fields' in info ? info._format_sort_fields : undefined),
		title: info.title ?? '',
		thumbnail: upgradeThumbnailScheme(info.thumbnail ?? ''),
		duration: typeof info.duration === 'number' ? Math.round(info.duration) : undefined,
		chapters: resolveChapters(info.chapters),
		subtitles: sanitizeSubtitleMap(info.subtitles, {isAutomaticCaptions: false, site}),
		automaticCaptions: sanitizeSubtitleMap(info.automatic_captions, {isAutomaticCaptions: true, site}),
		isLive: info.is_live === true || info.live_status === 'is_live' || info.live_status === 'is_upcoming',
		hasDrm: info.has_drm === true,
		availability: typeof info.availability === 'string' ? info.availability : undefined,
		ageLimit: typeof info.age_limit === 'number' && info.age_limit > 0 ? info.age_limit : undefined,
		uploader: resolveUploader(info),
		uploadDate: resolveUploadDate(info),
		...mediaTagsField(info),
		timestamp: resolveTimestamp(info),
		...(degraded ? {degraded} : {})
	}
}

function buildPlaylistProbeResult(info: PlaylistInfo | MultiVideoInfo, jobUrl: string): PlaylistProbeResult {
	const extractor = info.extractor ?? ''
	const site = siteForExtractor(extractor)
	return {
		kind: 'playlist',
		extractor,
		extractorKey: info.extractor_key ?? '',
		webpageUrl: info.webpage_url ?? jobUrl,
		isAudioOnlySource: isAudioOnlySource(extractor),
		isMultiVideo: info._type === 'multi_video',
		playlistId: info.playlist_id ?? info.id ?? '',
		playlistTitle: info.playlist_title ?? info.title ?? '',
		entries: mapPlaylistEntries(info.entries, jobUrl, site)
	}
}

type ProbeOutcome = Extract<ProbeAttemptResult, {kind: 'failure'}> | {kind: 'playlist'; result: PlaylistProbeResult} | {kind: 'video'; result: VideoProbeResult; video: VideoInfo; final: ProbeAttemptSuccess}

// Valid extractor output that still holds nothing to download is a failure too.
// Deciding it before escalation lets an empty Watch Later retry signed in.
function mapProbeAttempt(attempt: ProbeAttemptResult, url: string, logContext: Record<string, unknown>): ProbeOutcome {
	if (attempt.kind === 'failure') return attempt
	const final = attempt.data
	const info = final.info
	if (isPlaylistLike(info)) {
		const result = buildPlaylistProbeResult(info, url)
		if (result.entries.length > 0) return {kind: 'playlist', result}
		// Not a JSON parse failure: the extractor produced a valid container with
		// no entries (private, members-only, geo-blocked, exhausted page).
		logger.warn('Playlist probe returned no entries', {url, ...logContext})
		return {kind: 'failure', error: {kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}}
	}
	// Hit the redirect-depth cap. Surface the URL error rather than guess.
	if (isUrlRedirect(info)) return {kind: 'failure', error: {kind: 'other', code: 'redirect_loop', message: 'Probe redirected too many times'}}
	const result = buildVideoProbeResult(info, url, deriveDegraded(final.degradationSignals), final.lookedUpSizes)
	// Zero formats + zero subs + zero auto-captions: geo-block, age-gate,
	// members-only, or live-not-yet. The JSON shape itself was fine.
	if (result.formats.length === 0 && Object.keys(result.subtitles).length === 0 && Object.keys(result.automaticCaptions).length === 0) {
		return {kind: 'failure', error: {kind: 'other', code: 'no_formats', message: 'Probe returned no formats'}}
	}
	return {kind: 'video', result, video: info, final}
}

export class ProbeService extends EventEmitter {
	// The unkeyed (wizard) probes' controllers, so cancelInFlight() can abort
	// them all at once. probe() registers + deregisters its controller.
	private inFlight = new Set<AbortController>()
	// Keyed probes, apart from the set above: owners that cancel only their own
	// probe (a quick download's placeholder row keys on its queue item id). At
	// most one probe per key; only cancelProbe(ownerKey) aborts one.
	private inFlightByKey = new Map<string, AbortController>()
	// The app is quitting (closeForExit): no probe may start. The first refusal is logged.
	private closedForExit = false
	private refusalLogged = false

	private readonly vhxTitleFetcher: VhxTitleFetcher
	private readonly exploreGate: ExploreGate | undefined
	private readonly exploreSession: ExploreSignInCheck | undefined
	private readonly formatSizes: ProbeServiceOptions['formatSizes']
	private readonly slots: ProbeSlots | undefined
	private readonly listingCharges: Pick<LaunchGate, 'chargeListing'> | undefined
	private readonly startIdentity: ((url: string) => StartDecision) | undefined
	private readonly signInEvidence: ((site: string, evidence: SignInEvidence, source?: SignInEvidenceSource) => void) | undefined

	constructor(
		private readonly ytDlp: YtDlp,
		private readonly mockMode = false,
		private readonly probeInfoJsonCache?: ProbeInfoJsonCache,
		options?: ProbeServiceOptions
	) {
		super()
		this.vhxTitleFetcher = options?.vhxTitleFetcher ?? defaultVhxTitleFetcher
		this.exploreGate = options?.exploreGate
		this.exploreSession = options?.exploreSession
		this.formatSizes = options?.formatSizes
		this.slots = options?.slots
		this.listingCharges = options?.listingCharges
		this.startIdentity = options?.startIdentity
		this.signInEvidence = options?.signInEvidence
	}

	// The site itself said the Explore session is signed out, during a signed-in
	// probe whose cookies yt-dlp rejected. The composition root tells the view.
	onExploreVerifiedSignedOut(listener: () => void): () => void {
		this.on(EXPLORE_VERIFIED_SIGNED_OUT, listener)
		return () => this.off(EXPLORE_VERIFIED_SIGNED_OUT, listener)
	}

	// Abort every unkeyed in-flight probe (the wizard's). Renderer calls this when
	// the user changes the wizard URL, navigates away, or otherwise abandons a slow
	// fetch — without it, a stalled YouTube fallback chain (~180s) keeps the UI
	// spinner blocked. A keyed probe belongs to a Downloads placeholder row and is
	// never in this set: only cancelProbe(ownerKey) aborts it.
	cancelInFlight(): void {
		if (this.inFlight.size === 0) return
		logger.info('Cancelling in-flight probes', {count: this.inFlight.size})
		for (const ctrl of this.inFlight) {
			try {
				ctrl.abort()
			} catch {
				/* already aborted */
			}
		}
		this.inFlight.clear()
	}

	// One slot covers the whole probe, its retries, redirect and escalation; cancelling a
	// probe that waits for one removes it, and nothing spawns.
	async probe(url: string, opts: ProbeOptions): Promise<Result<ProbeResult, ProbeError>> {
		const {ownerKey} = opts
		if (this.closedForExit) {
			if (!this.refusalLogged) logger.info('Probe refused: the app is quitting', {url})
			this.refusalLogged = true
			return fail(PROBE_CANCELLED.error)
		}
		const controller = new AbortController()
		if (ownerKey) {
			// At most one live probe per owner: a duplicate probe supersedes the
			// in-flight one. Without this, the old controller becomes unreachable
			// through cancelProbe(ownerKey) and keeps running untracked.
			this.inFlightByKey.get(ownerKey)?.abort()
			this.inFlightByKey.set(ownerKey, controller)
		} else {
			this.inFlight.add(controller)
		}
		try {
			if (this.mockMode) return ok(buildMockProbeResult(url))
			if (!this.slots) return opts.admit && !opts.admit() ? fail<ProbeResult, ProbeError>(PROBE_DEFERRED) : await this.probeNow(url, opts, controller.signal)
			// The site whose cooldown held the last run, which a redirect may have made another than the link's.
			let heldBy: string | null = null
			let pacedUntil: number | null = null
			const attempt = (): Promise<Result<ProbeResult, ProbeError>> => {
				pacedUntil = null
				return this.probeNow(
					url,
					opts,
					controller.signal,
					site => (heldBy = site),
					until => (pacedUntil = until)
				)
			}
			const isHeld = (result: Result<ProbeResult, ProbeError>): string | null => (heldByCooldown(result) ? (heldBy ?? requestSiteFor(url)) : null)
			const outcome = await this.slots.run({kind: opts.kind, site: requestSiteFor(url), ...(ownerKey ? {owner: ownerKey} : {})}, controller.signal, attempt, {isHeld, pacedUntil: result => (result.ok ? null : pacedUntil), ...(opts.admit ? {admit: opts.admit} : {})})
			if (outcome.kind === 'ran') return outcome.value
			return fail<ProbeResult, ProbeError>(outcome.kind === 'deferred' ? PROBE_DEFERRED : PROBE_CANCELLED.error)
		} finally {
			this.inFlight.delete(controller)
			if (ownerKey && this.inFlightByKey.get(ownerKey) === controller) this.inFlightByKey.delete(ownerKey)
		}
	}

	private async probeNow(url: string, opts: ProbeOptions, signal: AbortSignal, onHeld: (site: string) => void = () => undefined, onPaced: (until: number) => void = () => undefined): Promise<Result<ProbeResult, ProbeError>> {
		const {playlistMode = 'auto', playlistScope, timeoutMs, escalate = true} = opts
		// At most one escalation per probe; a signed-in failure is the answer.
		let auth: JobAuth | undefined
		try {
			const logContext = {playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)}
			logger.info('Probe started', {url, ...logContext})

			let cookiesRejected = false
			let cookiesRejectedBy: string | null = null
			let heldBeforeLaunch = false
			let signedInRefused = false
			const startedAt = Date.now()
			let lastUrl = url
			// The identity the last run ended on, after any redirect.
			const last: {ranAs: RunIdentity} = {ranAs: 'configured'}
			const runAs = async (identity: RunIdentity, restart?: (next: string) => RunIdentity): Promise<ProbeOutcome> => {
				const as: ProbeRunAs = {identity, ...(restart ? {restart} : {}), heldBeforeLaunch: false, signedInRefused: false, explicit: opts.kind === 'interactive', cookiesRejected: false, cookiesRejectedBy: null, lastUrl: url, onHeld, onPaced}
				const mappedOutcome = mapProbeAttempt(await this.probeWithRedirectFollow(url, playlistMode, playlistScope, signal, as, timeoutMs), url, logContext)
				cookiesRejected = as.cookiesRejected
				cookiesRejectedBy = as.cookiesRejectedBy
				heldBeforeLaunch = as.heldBeforeLaunch
				signedInRefused = as.signedInRefused
				lastUrl = as.lastUrl
				last.ranAs = as.identity
				return mappedOutcome
			}
			// Whether a playlist's items need the account too (R20): main decides and stamps them.
			let itemsNeedAccount = false
			// A lookup that must not spend the account never starts signed in either.
			const start = escalate ? (this.startIdentity?.(url) ?? null) : null
			if (start) logger.info('Probe start identity', {url, ...start})
			// The site whose default the run ended on: a redirect to another site asks that site again.
			let startSite = start?.site
			const restart = (next: string): RunIdentity => {
				const decision = this.startIdentity?.(next) ?? null
				logger.info('Probe start identity after a redirect', {url: next, ...decision})
				startSite = decision?.site
				return decision?.auth === 'exploreSession' ? 'exploreSession' : 'configured'
			}
			let outcome = await runAs(start?.auth === 'exploreSession' ? 'exploreSession' : 'configured', start ? restart : undefined)
			let basis: AuthBasis | undefined = start && last.ranAs === 'exploreSession' ? 'siteDefault' : undefined
			const startedSignedIn = basis !== undefined
			if (basis && startSite) {
				auth = 'exploreSession'
				const settled = await this.settleSiteDefault({item: url, startedAt}, startSite, outcome, cookiesRejectedBy, {heldBeforeLaunch, signedInRefused}, () => runAs('configured'))
				outcome = settled.outcome
				if (settled.ranAnonymous) {
					auth = undefined
					basis = undefined
				}
			}
			// A probe its site started signed in never escalates: it already ran signed in.
			const reason = escalate && !startedSignedIn && outcome.kind === 'failure' ? await this.escalationFor(url, outcome.error, signal) : null
			if (reason) {
				basis = 'escalation'
				auth = 'exploreSession'
				itemsNeedAccount = reachesPlaylistItems(reason)
				outcome = await runAs('exploreSession')
				if (cookiesRejected) outcome = await this.afterCookiesRejected(url, outcome, () => runAs('exploreSession'), signal)
			}
			if (outcome.kind === 'failure') {
				// Signed in only if the last run kept the Explore cookies: one yt-dlp dropped ran anonymously.
				return fail(auth && !cookiesRejected && outcome.error.kind === 'ytdlp' ? {...outcome.error, auth} : outcome.error)
			}

			let mapped: ProbeResult
			if (outcome.kind === 'playlist') {
				// One listing is many site requests: what it returned counts against the account's window.
				if (auth && !cookiesRejected) this.listingCharges?.chargeListing(requestSiteFor(lastUrl), outcome.result.entries.length)
				// A bot-walled playlist was only enumerated signed in; its items start anonymous.
				mapped = auth && itemsNeedAccount ? {...outcome.result, entries: outcome.result.entries.map(entry => ({...entry, auth}))} : outcome.result
			} else {
				const {final, video} = outcome
				let result = outcome.result
				// VHX (Vimeo OTT) embeds surface the literal 'Untitled' sentinel and
				// yt-dlp's GenericIE merge keeps the embed's fields over the parent
				// page's, so the real page title is lost. Recover it from the parent
				// page's curated preview title (og:title / twitter:title). Any miss
				// keeps the sentinel — the download proceeds exactly as before.
				let rawForCache = final.raw
				if (isVhxSentinelTitle(result.title) && isVhxEmbedExtractor(result.extractor, result.extractorKey)) {
					const parentUrl = smuggledRefererOf(video.webpage_url) ?? (isLikelyParentPage(url) ? url : null)
					if (parentUrl) {
						let recovered: string | null = null
						try {
							const html = await this.vhxTitleFetcher(parentUrl, signal)
							if (!signal.aborted) recovered = html === null ? null : deriveRecoveredTitle(extractPageTitleMeta(html), parentUrl)
						} catch {
							// Fetcher failure is non-fatal — the sentinel title stays.
						}
						if (recovered && recovered !== result.title) {
							result = {...result, title: recovered}
							rawForCache = patchInfoJsonTitle(final.raw, recovered)
							logger.info('Recovered VHX title from parent page', {url, parentUrl, title: recovered})
						}
					}
				}
				// A signed-in result whose cookies yt-dlp dropped ran anonymously: its info-json is never replayed as signed in.
				const probeInfoJsonRef =
					playlistMode === 'video' && !(auth && (cookiesRejected || cookiesRejectedBy !== null))
						? await this.probeInfoJsonCache?.write(rawForCache, {videoId: typeof video.id === 'string' ? video.id : null, ...(final.stderr.split(/\r?\n/).some(line => sabrSkippedClient(line) !== null) ? {formatsWithheld: true} : {}), ...(auth ? {auth, ...(basis === 'siteDefault' ? {authBasis: basis} : {})} : {})})
						: undefined
				if (probeInfoJsonRef) {
					const probeInfoJsonPath = await this.probeInfoJsonCache?.resolve(probeInfoJsonRef)
					logger.info('Probe info-json cached', {url, videoId: probeInfoJsonRef.videoId ?? null, probeInfoJsonRef, probeInfoJsonPath: probeInfoJsonPath ?? null})
					result = {...result, probeInfoJsonRef}
				}
				mapped = result
			}
			// Only an escalation signs its rows in for good; a row whose site started it
			// signed in asks its site again at each start (queueStartIdentity.ts).
			if (auth && basis === 'escalation') mapped = {...mapped, auth}

			logger.info('Probe result', {...summarizeProbeResult(mapped), playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return ok(mapped)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown probing error'
			logger.error('Probe failure', {message, url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return fail<ProbeResult, ProbeError>({kind: 'other', code: signal.aborted ? 'cancelled' : 'unknown', message})
		}
	}

	// After a run its site started signed in (ADR 0022): what it showed about the
	// sign-in, and one anonymous run when it failed in a way the sign-in may have
	// caused. A result the site still gave after rejecting the cookies stands.
	private async settleSiteDefault(source: SignInEvidenceSource, site: string, first: ProbeOutcome, cookiesRejectedBy: string | null, launch: {heldBeforeLaunch: boolean; signedInRefused: boolean}, runAnonymous: () => Promise<ProbeOutcome>): Promise<{outcome: ProbeOutcome; ranAnonymous: boolean}> {
		// Nothing reached the site, so the run shows nothing about the sign-in: a
		// held run stands, and one whose session was refused goes on without it.
		if (first.kind === 'failure' && launch.heldBeforeLaunch) return {outcome: first, ranAnonymous: false}
		if (first.kind === 'failure' && launch.signedInRefused) {
			logger.info('Probe’s Explore session refused before launch; running anonymous', {url: source.item, site})
			return {outcome: await runAnonymous(), ranAnonymous: true}
		}
		const {item: url} = source
		const record = (evidence: SignInEvidence): void => this.signInEvidence?.(site, evidence, source)
		if (cookiesRejectedBy !== null) record('cookiesRejected')
		if (first.kind !== 'failure') {
			if (cookiesRejectedBy === null) record('signedInSucceeded')
			return {outcome: first, ranAnonymous: false}
		}
		const failure = signedInFailure({stage: 'probe', url, error: first.error})
		if (failure === 'accountWall') record('accountWall')
		if (failure === 'unknown') record('signedInUnknown')
		if (failure !== 'accountRequired' && failure !== 'unknown') return {outcome: first, ranAnonymous: false}
		logger.info('Probe failed signed in by its site’s default; running once anonymous', {url, site, failure})
		const anonymous = await runAnonymous()
		if (anonymous.kind !== 'failure') record('anonymousWorked')
		return {outcome: anonymous, ranAnonymous: true}
	}

	// Why an account would fix this failure, while the user is signed in to
	// Explore; null otherwise. Every failed probe that could have escalated logs
	// one line saying whether it did, and why not.
	private async escalationFor(url: string, error: ProbeError, signal: AbortSignal): Promise<EscalationReason | null> {
		if (signal.aborted || !this.exploreGate) return null
		const scope = exploreCookieScopeFor(url)
		const decision = await decideEscalation(escalationReason({stage: 'probe', url, error}), scope, this.exploreGate)
		logger.info('Probe failure escalation', {scope, failure: error.kind === 'ytdlp' ? error.error.kind : error.code, ...decision})
		return decision.escalated ? decision.reason : null
	}

	// yt-dlp dropped the session's cookies as rotated or signed out, whatever the
	// exit status. One page load tells which: still signed in → one retry with a
	// fresh jar; signed out → the view is told and the probe fails signed out,
	// never as an anonymous result; a check that cannot tell → a failure becomes
	// a retryable one, a success is kept.
	private async afterCookiesRejected(url: string, outcome: ProbeOutcome, retry: () => Promise<ProbeOutcome>, signal: AbortSignal): Promise<ProbeOutcome> {
		const scope = exploreCookieScopeFor(url)
		const state: ExploreSignInState = this.exploreSession && scope ? await this.exploreSession.verifySignedIn(scope) : 'unknown'
		if (signal.aborted) return PROBE_CANCELLED
		logger.info('yt-dlp rejected the Explore cookies on a signed-in probe', {url, state})
		if (state === 'signedIn') return retry()
		if (state === 'signedOut') {
			this.emit(EXPLORE_VERIFIED_SIGNED_OUT)
			return {kind: 'failure', error: {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Signed out of the Explore session'}}}
		}
		return outcome.kind === 'failure' ? {kind: 'failure', error: {kind: 'ytdlp', error: {kind: 'network', raw: 'Could not confirm the Explore session'}}} : outcome
	}

	// The app is quitting: every probe stops, the window's and the rows', so no
	// yt-dlp outlives it (they spawn as their own process group).
	// From then on every probe is refused: its yt-dlp would outlive the app too.
	closeForExit(): void {
		this.closedForExit = true
		const controllers = [...this.inFlight, ...this.inFlightByKey.values()]
		this.inFlight.clear()
		this.inFlightByKey.clear()
		for (const controller of controllers) controller.abort()
	}

	// Abort one keyed probe without touching any other in-flight probe. Used by
	// the probing-queue-item path: cancelling a Downloads row must not kill the
	// wizard's probe, and cancelInFlight never reaches a keyed one. Unknown keys
	// are a no-op.
	cancelProbe(ownerKey: string): void {
		const controller = this.inFlightByKey.get(ownerKey)
		if (!controller) return
		this.inFlightByKey.delete(ownerKey)
		try {
			controller.abort()
		} catch {
			/* already aborted */
		}
	}

	// The attempt the probe keeps, with the sizes its site left out looked up:
	// once, never for an attempt a retry or a redirect replaced.
	private async probeWithRedirectFollow(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal, as: ProbeRunAs, timeoutMs?: number): Promise<ProbeAttemptResult> {
		const attempt = await this.followExtractorRedirects(url, playlistMode, playlistScope, signal, as, timeoutMs)
		if (attempt.kind === 'failure') return attempt
		const lookedUpSizes = await this.withSiteSizes(attempt.data.info, url, signal)
		// A probe cancelled while its sizes were asked for is cancelled, not a result.
		if (signal.aborted) return PROBE_CANCELLED
		return lookedUpSizes === null ? attempt : {kind: 'success', data: {...attempt.data, lookedUpSizes}}
	}

	// Loop over `_type: 'url' / 'url_transparent'` redirects up to depth 1 to
	// follow extractor redirects (e.g. Bandcamp track → resolved video). Anything
	// deeper is a misbehaving extractor — bail rather than loop.
	private async followExtractorRedirects(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal, as: ProbeRunAs, timeoutMs?: number): Promise<ProbeAttemptResult> {
		let currentUrl = url
		for (let depth = 0; depth <= 1; depth++) {
			if (signal.aborted) return PROBE_CANCELLED
			const attempt = await this.runProbeWithDegradationRetry(currentUrl, playlistMode, playlistScope, signal, as, timeoutMs)
			if (attempt.kind === 'failure') return attempt
			const info = attempt.data.info
			if (!isUrlRedirect(info)) return attempt
			const next = info.url
			if (!next || next === currentUrl) return attempt
			logger.info('Probe redirect', {from: currentUrl, to: next, depth, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			if (as.restart && requestSiteFor(next) !== requestSiteFor(currentUrl)) as.identity = as.restart(next)
			currentUrl = next
		}
		// Fell through both attempts; return whatever we got — caller surfaces as
		// 'redirected too many times' if still a url_redirect.
		return this.runProbeWithDegradationRetry(currentUrl, playlistMode, playlistScope, signal, as, timeoutMs)
	}

	private async runProbeWithDegradationRetry(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal, as: ProbeRunAs, timeoutMs?: number): Promise<ProbeAttemptResult> {
		let initial = await this.runProbeAttempt(url, 'initial', playlistMode, playlistScope, signal, as, timeoutMs)
		// A timed-out probe usually means a slow link, not a dead one: the very
		// next attempt often succeeds (observed repeatedly on throttled routes).
		// Exactly one retry — a second timeout is reported as the failure.
		if (initial.kind === 'failure' && isProbeTimeoutFailure(initial) && !signal.aborted) {
			logger.info('Probe timed out — retrying once', {url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			const retry = await this.runProbeAttempt(url, 'retry', playlistMode, playlistScope, signal, as, timeoutMs)
			if (retry.kind === 'failure') {
				logger.info('Probe timeout retry failed; reporting failure', {url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
				return retry
			}
			initial = retry
		}
		if (initial.kind === 'failure') return initial
		if (initial.data.degradationSignals.length === 0) return initial
		if (signal.aborted) return initial
		// The same request now would meet the same limit, and the next one waits
		// out the site's cooldown anyway (SiteRequestState). Keep what came back.
		if (isRateLimited(initial.data.degradationSignals)) {
			logger.info('Probe rate-limited — keeping the result, no relaunch', {url, degradationSignals: initial.data.degradationSignals})
			return initial
		}
		// Every warning is a permanent HTTP error (410 Gone, 403): a second probe
		// would get the same answer after the same wait.
		if (!degradationIsTransient(initial.data.stderr)) {
			logger.info('Probe degraded-success — permanent HTTP errors, not retrying', {url, degradationSignals: initial.data.degradationSignals})
			return initial
		}

		logger.info('Probe degraded-success — retrying', {url, degradationSignals: initial.data.degradationSignals})

		const retry = await this.runProbeAttempt(url, 'retry', playlistMode, playlistScope, signal, as)
		if (retry.kind === 'failure') {
			logger.info('Probe retry failed; using initial degraded result', {url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return initial
		}
		if (retry.data.degradationSignals.length === 0) return retry

		// Both degraded — pick the one with more formats (only meaningful for video info).
		const initialFormatCount = formatCount(initial.data.info)
		const retryFormatCount = formatCount(retry.data.info)
		return retryFormatCount > initialFormatCount ? retry : initial
	}

	private async runProbeAttempt(url: string, attempt: ProbeAttemptName, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal, as: ProbeRunAs, timeoutMs?: number): Promise<ProbeAttemptResult> {
		const source = attempt === 'retry' ? 'yt-dlp-probe-retry' : 'yt-dlp-probe'
		as.lastUrl = url
		const youtubePlayerClient = playlistMode === 'video' && siteForUrl(url).id === 'youtube' ? [...YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS] : undefined
		const extractor = youtubePlayerClient ? {youtube: {playerClient: youtubePlayerClient}} : undefined
		let stdoutRemainder = ''
		const consumeStdout = (chunk: string): void => {
			const parts = `${stdoutRemainder}${chunk}`.split(/\r?\n/)
			stdoutRemainder = parts.pop() ?? ''
			for (const line of parts) {
				const progress = parseProbeProgressLine(line)
				if (progress) {
					this.emit('progress', {url, playlistMode, ...progress, at: nowIso()} satisfies ProbeProgressEvent)
				}
			}
		}
		const result = await this.ytDlp.run(
			{kind: 'probe', url, selection: {playlistMode, ...(playlistScope ? {playlistScope} : {})}, ...(extractor ? {extractor} : {})},
			{
				abortSignal: signal,
				timeoutMs,
				onStdout: consumeStdout,
				onStderr: chunk => {
					for (const line of splitOutputLines(chunk)) {
						logger.info(line, {source})
					}
				}
			},
			{identity: as.identity, ...(as.explicit ? {explicit: true} : {})}
		)
		if (result.accountCookiesRejected === true) as.cookiesRejected = true
		if (result.kind !== 'spawn-error' && result.cookiesRejectedBy !== undefined) as.cookiesRejectedBy = result.cookiesRejectedBy
		as.heldBeforeLaunch = result.kind === 'spawn-error' || (result.kind === 'exit-error' && result.heldBeforeLaunch === true)
		as.signedInRefused = result.kind === 'exit-error' && result.signedInRefused === true
		if (result.kind === 'exit-error' && result.rawError === RATE_LIMIT_COOLDOWN_MESSAGE) as.onHeld(requestSiteFor(url))
		if (result.kind === 'exit-error' && result.pacedUntil !== undefined) as.onPaced(result.pacedUntil)

		if (result.kind !== 'success') {
			const code = result.kind === 'exit-error' ? result.exitCode : null
			const rawError = result.kind === 'exit-error' ? result.rawError : result.error.message
			// Distinguish caller-driven cancellation from a genuine yt-dlp failure
			// so the UI doesn't treat it as an error.
			if (signal.aborted || rawError === 'Cancelled') {
				return PROBE_CANCELLED
			}
			// Classified from the surfaced message, which also covers a spawn
			// error that has no errorKind of its own.
			const probeKind = classifyYtDlpStderr(rawError ?? '').kind
			logger.error('yt-dlp probe failed', {attempt, code, url, kind: probeKind, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return {kind: 'failure', error: {kind: 'ytdlp', error: {kind: probeKind, raw: rawError ?? 'Probing failed'}} satisfies ProbeError}
		}

		let raw: unknown
		try {
			raw = parseProbeJsonOutput(result.stdout)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown JSON parse error'
			logger.error('Probe JSON parse failed', {attempt, message, url})
			return {kind: 'failure', error: {kind: 'other', code: 'parse', message: 'Failed to parse probe output', details: message} satisfies ProbeError}
		}

		const parseResult = infoDictSchema.safeParse(raw)
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? 'yt-dlp output failed schema validation'
			logger.error('Probe schema validation failed', {attempt, message, url})
			return {kind: 'failure', error: {kind: 'other', code: 'schema', message: 'Unexpected response from the download engine', details: message} satisfies ProbeError}
		}

		const info = parseResult.data
		const degradationSignals = detectProbeDegradationSignals(result.stderr)
		logger.info('Probe complete', {
			attempt,
			url,
			playlistMode,
			playlistScope: playlistScopeRequestForLog(playlistScope),
			type: info._type ?? 'video',
			title: (info as VideoInfo).title,
			extractor: (info as VideoInfo).extractor,
			degradationSignals: degradationSignals.length > 0 ? degradationSignals.map(s => s.label) : undefined
		})
		return {kind: 'success', data: {info, raw, stderr: result.stderr, degradationSignals}}
	}

	// The sizes a single video's site leaves out, looked up; null when none are asked.
	// Never YouTube: it reports its sizes, and its media hosts are asked nothing extra.
	private async withSiteSizes(info: InfoDict, url: string, signal: AbortSignal): Promise<LookedUpSizes | null> {
		if (!this.formatSizes || isPlaylistLike(info) || isUrlRedirect(info)) return null
		if (siteForUrl(url).id === 'youtube' || siteForExtractor(info.extractor).id === 'youtube') return null
		const formats = info.formats ?? []
		return formats.length === 0 ? null : await this.formatSizes(formats, signal)
	}
}

function formatCount(info: InfoDict): number {
	if (isPlaylistLike(info)) return info.entries.length
	const v = info as VideoInfo
	return v.formats?.length ?? 0
}

function playlistScopeRequestForLog(scope: PlaylistScope | undefined): PlaylistScopeRequestLog {
	return scope?.items ?? {kind: 'app-limit'}
}
