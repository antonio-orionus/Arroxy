import {EventEmitter} from 'node:events'
import {stripVTControlCharacters} from 'node:util'
import log from 'electron-log/main.js'
import {nowIso} from '@main/utils/clock.js'
import {ok, fail, type Result} from '@shared/result.js'
import {placeholderTitleFlag} from '@shared/queueTitle.js'
import type {JobAuth, PlaylistEntry, PlaylistProbeResult, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeProgressEvent, ProbeResult, ProbeDegradationReason, ProbeInfoJsonRef, VideoChapter, VideoProbeResult} from '@shared/types.js'
import type {EscalationReason, ExploreSignInState} from '@shared/schemas.js'
import {infoDictSchema, isPlaylistLike, isUrlRedirect, type InfoDict, type PlaylistInfo, type MultiVideoInfo, type VideoInfo} from 'yt-dlp-bridge/info'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {classifyYtDlpStderr, sabrSkippedClient} from 'ytdlp-errors'
import {splitOutputLines} from 'yt-dlp-bridge/runner'
import {siteForExtractor, siteForUrl, type Site} from '@shared/sites/index.js'
import {exploreCookieScopeFor} from '@shared/sites/exploreCookieScope.js'
import {YOUTUBE_SINGLE_VIDEO_PLAYER_CLIENTS} from '@shared/youtubePlayerClients.js'
import {PROBE_TIMEOUT_MESSAGE, YtDlp, type RunIdentity} from './YtDlp.js'
import {escalationReason, reachesPlaylistItems} from './exploreEscalation.js'
import type {ExploreGate} from './exploreGate.js'
import type {ExploreSignInCheck} from './phases/types.js'
import {mapFormats} from '@shared/ytdlp/formatMapping.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {buildMockProbeResult} from './probeMockResult.js'
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
}

type ProbeAttemptResult = {kind: 'success'; data: ProbeAttemptSuccess} | {kind: 'failure'; error: ProbeError}

// Who a probe runs as, and whether yt-dlp rejected that identity's cookies on any of its spawns.
interface ProbeRunAs {
	readonly identity: RunIdentity
	cookiesRejected: boolean
}

const PROBE_CANCELLED = {kind: 'failure', error: {kind: 'other', code: 'cancelled', message: 'Probe cancelled'}} as const satisfies ProbeAttemptResult

// Options bag so unit tests can inject a deterministic parent-page fetcher;
// production leaves it undefined and gets the real HTTP fetcher.
export interface ProbeServiceOptions {
	vhxTitleFetcher?: VhxTitleFetcher
	// Absent: probes never escalate to the Explore session.
	exploreGate?: ExploreGate
	// Absent: a check after rejected cookies cannot tell (see afterCookiesRejected).
	exploreSession?: ExploreSignInCheck
}

const EXPLORE_VERIFIED_SIGNED_OUT = 'exploreVerifiedSignedOut'

// Timer-killed probes surface as exit-errors carrying PROBE_TIMEOUT_MESSAGE.
// Matched by literal because the taxonomy has no timeout kind — see YtDlp.ts.
function isProbeTimeoutFailure(result: ProbeAttemptResult): boolean {
	return result.kind === 'failure' && result.error.kind === 'ytdlp' && result.error.error.raw === PROBE_TIMEOUT_MESSAGE
}

const PLAYLIST_ITEM_PROGRESS_RE = /\[download\]\s+Downloading item\s+(\d+)\s+of\s+(\d+|N\/A)/i
const YOUTUBE_TAB_PAGE_PROGRESS_RE = /\[youtube:tab\]\s+.+?\spage\s+(\d+):\s+Downloading API JSON/i

function parseProbeProgressLine(line: string): Pick<ProbeProgressEvent, 'phase' | 'loaded' | 'total'> | null {
	const clean = stripVTControlCharacters(line)
	const pageMatch = YOUTUBE_TAB_PAGE_PROGRESS_RE.exec(clean)
	if (pageMatch) {
		const loaded = Number(pageMatch[1])
		return Number.isFinite(loaded) ? {phase: 'pages', loaded} : null
	}
	const itemMatch = PLAYLIST_ITEM_PROGRESS_RE.exec(clean)
	if (!itemMatch) return null
	const loaded = Number(itemMatch[1])
	if (!Number.isFinite(loaded)) return null
	const rawTotal = itemMatch[2]
	const total = rawTotal && rawTotal !== 'N/A' ? Number(rawTotal) : undefined
	return {phase: 'items', loaded, ...(total !== undefined && Number.isFinite(total) ? {total} : {})}
}

function parseProbeJsonOutput(stdout: string): unknown {
	let lastJsonError: unknown = null
	const lines = stdout.split(/\r?\n/).flatMap(line => {
		const trimmedLine = line.trim()
		return trimmedLine ? [trimmedLine] : []
	})
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i]
		if (!line?.startsWith('{')) continue
		try {
			return JSON.parse(line)
		} catch (error) {
			lastJsonError = error
		}
	}
	if (lastJsonError) throw lastJsonError
	return JSON.parse(stdout)
}

// The renderer CSP allows `img-src 'self' data: https:` — no plaintext http.
// Several extractors (Bilibili's i0.hdslb.com among them) hand back http URLs,
// which the renderer then refuses to load, leaving a broken thumbnail. The CDNs
// serve the identical bytes over https, so upgrade the scheme here rather than
// widening the CSP: allowing http images would let a network attacker inject
// arbitrary picture content into the picker.
function upgradeThumbnailScheme(url: string): string {
	return url.startsWith('http://') ? `https://${url.slice('http://'.length)}` : url
}

function pickEntryThumbnail(entry: InfoDict): string {
	const v = entry as VideoInfo
	if (typeof v.thumbnail === 'string' && v.thumbnail.length > 0) return upgradeThumbnailScheme(v.thumbnail)
	const list = v.thumbnails
	if (!list || list.length === 0) return ''
	// Some extractors (NicoVideo) emit thumbnail entries with `url: null` as
	// placeholders — find the first entry with a usable URL.
	for (const t of list) {
		if (typeof t.url === 'string' && t.url.length > 0) return upgradeThumbnailScheme(t.url)
	}
	return ''
}

function untitledLabel(playlistIndex: number): string {
	return `Untitled · #${playlistIndex}`
}

// Browse-id playlist hints + nested-container detection now live on the Site
// adapter (src/shared/sites/youtube.ts). For non-YouTube sites these methods
// are absent and the helpers below short-circuit cleanly.
function siteHintForId(site: Site, id: string): string | null {
	return site.hintForPlaylistId ? site.hintForPlaylistId(id) : null
}

function siteIsNestedContainer(site: Site, id: string): boolean {
	return site.isNestedContainer ? site.isNestedContainer({id}) : false
}

function buildEntryUrl(entry: InfoDict): string | null {
	// _type='url' / 'url_transparent' / 'video': webpage_url is canonical when present.
	// Flat-playlist entries often only have `url` (the watch URL) — accept either.
	const v = entry as VideoInfo & {url?: string}
	if (typeof v.webpage_url === 'string' && v.webpage_url.length > 0) return v.webpage_url
	if (typeof v.url === 'string' && v.url.startsWith('http')) return v.url
	return null
}

export function mapPlaylistEntries(entries: readonly InfoDict[], jobUrl: string, siteOrExtractor: Site | string): PlaylistEntry[] {
	const site = typeof siteOrExtractor === 'string' ? siteForExtractor(siteOrExtractor) : siteOrExtractor
	return mapPlaylistEntriesInner(entries, jobUrl, site)
}

function mapPlaylistEntriesInner(entries: readonly InfoDict[], jobUrl: string, site: Site): PlaylistEntry[] {
	// First pass: detect whether the result set contains any real video entry
	// (id without a known container prefix). If yes, the heterogeneous-result
	// case applies and we'll filter containers out below. If no (all nested),
	// we keep them — better than an empty picker.
	let hasVideoEntries = false
	for (const entry of entries) {
		const id = typeof (entry as VideoInfo).id === 'string' ? (entry as VideoInfo).id! : ''
		if (id && !siteIsNestedContainer(site, id)) {
			hasVideoEntries = true
			break
		}
	}

	const out: PlaylistEntry[] = []
	let fallbackIndex = 1
	let droppedContainerCount = 0
	for (const entry of entries) {
		const url = buildEntryUrl(entry)
		if (!url) {
			logger.warn('Playlist entry skipped — no resolvable URL', {jobUrl, entryId: typeof (entry as VideoInfo).id === 'string' ? (entry as VideoInfo).id : '(none)'})
			fallbackIndex++
			continue
		}
		const v = entry as VideoInfo & {playlist_index?: number}
		const playlistIndex = typeof v.playlist_index === 'number' ? v.playlist_index : fallbackIndex
		const idStr = typeof v.id === 'string' ? v.id : ''
		// Heterogeneous-result filter: when the set contains any actual video,
		// drop nested containers (channel/playlist/album/mix). Selecting them
		// would silently download their entire contents, which doesn't fit the
		// wizard's "pick videos" model. If the set is entirely nested (no
		// videos at all — pure music-category search), we keep everything so
		// the picker isn't empty.
		if (hasVideoEntries && idStr && siteIsNestedContainer(site, idStr)) {
			droppedContainerCount++
			fallbackIndex++
			continue
		}
		// Fallback chain: explicit title → site-specific id hint → neutral
		// placeholder. The id hint is YouTube-only today (browse-id prefixes);
		// generic sites return null and fall through to the placeholder. Only the
		// final placeholder branch marks titleIsPlaceholder — the id hint is a
		// real site-provided hint, not a fabrication.
		const rawTitle = typeof v.title === 'string' ? v.title.trim() : ''
		const idHint = idStr ? siteHintForId(site, idStr) : null
		const isPlaceholderTitle = rawTitle.length === 0 && idHint == null
		const title = rawTitle.length > 0 ? rawTitle : (idHint ?? untitledLabel(playlistIndex))
		// PlaylistEntry.id must be unique per row, not per video. YouTube mix /
		// radio feeds frequently repeat the same video at multiple positions;
		// collapsing them to one id would make the selection state and the
		// post-confirm filter (`playlistItems.filter(e => ids.includes(e.id))`)
		// treat them as one — clicking one would check both, and a single
		// selection would produce two queue items. Index-prefixing guarantees
		// 1 row = 1 stable id even when the underlying yt-dlp id collides.
		const videoIdPart = typeof v.id === 'string' && v.id.length > 0 ? v.id : url
		// Only reachable on the all-nested path — the branch above already
		// dropped containers whenever the set held a real video. Marking rather
		// than dropping keeps the picker populated; downstream refuses to queue
		// them, which is what the flag exists for.
		const isContainer = idStr.length > 0 && siteIsNestedContainer(site, idStr)
		const entryTimestamp = resolveTimestamp(v)
		out.push({
			id: `${playlistIndex}::${videoIdPart}`,
			url,
			title,
			thumbnail: pickEntryThumbnail(entry),
			duration: typeof v.duration === 'number' ? Math.round(v.duration) : undefined,
			playlistIndex,
			videoId: idStr.length > 0 ? idStr : null,
			uploader: resolveUploader(v),
			uploadDate: resolveUploadDate(v),
			...(entryTimestamp !== undefined ? {timestamp: entryTimestamp} : {}),
			...(isContainer ? {isContainer: true as const} : {}),
			...placeholderTitleFlag(isPlaceholderTitle)
		})
		fallbackIndex++
	}
	if (droppedContainerCount > 0) {
		logger.info('Playlist entries filtered: dropped nested containers', {jobUrl, droppedContainerCount, keptCount: out.length})
	}
	return out
}

/**
 * Resolve the uploader the same way the compiled `{uploader}` output template
 * does (`%(uploader,channel,creator,uploader_id)`). Arroxy renders `{uploader}`
 * itself in directory position, so drifting from that chain would put a video
 * in a folder named differently from the file yt-dlp writes inside it.
 */
function resolveUploader(source: {uploader?: string; channel?: string; creator?: string; uploader_id?: string}): string | undefined {
	for (const candidate of [source.uploader, source.channel, source.creator, source.uploader_id]) {
		if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim()
	}
	return undefined
}

function resolveUploadDate(source: {upload_date?: string}): string | undefined {
	// Anything not YYYYMMDD would render a nonsense folder name, so drop it.
	return source.upload_date !== undefined && /^\d{8}$/.test(source.upload_date) ? source.upload_date : undefined
}

function resolveTimestamp(source: {timestamp?: number}): number | undefined {
	// Epoch seconds from yt-dlp. uploadDate is YYYYMMDD — too coarse to order
	// same-day uploads within a series — so the sort control needs this finer
	// value. Anything non-finite, non-integer, or non-positive is not a real
	// timestamp, so drop it the same way resolveUploadDate drops malformed dates.
	return typeof source.timestamp === 'number' && Number.isFinite(source.timestamp) && Number.isInteger(source.timestamp) && source.timestamp > 0 ? source.timestamp : undefined
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

function buildVideoProbeResult(info: VideoInfo, jobUrl: string, degraded: {reasons: ProbeDegradationReason[]} | undefined, probeInfoJsonRef?: ProbeInfoJsonRef): VideoProbeResult {
	const extractor = info.extractor ?? ''
	const site = siteForExtractor(extractor)
	return {
		kind: 'video',
		videoId: typeof info.id === 'string' && info.id.length > 0 ? info.id : null,
		...(probeInfoJsonRef ? {probeInfoJsonRef} : {}),
		extractor,
		extractorKey: info.extractor_key ?? '',
		webpageUrl: info.webpage_url ?? jobUrl,
		isAudioOnlySource: isAudioOnlySource(extractor),
		formats: mapFormats(info.formats ?? [], typeof info.duration === 'number' ? info.duration : undefined),
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
	const result = buildVideoProbeResult(info, url, deriveDegraded(final.degradationSignals))
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

	private readonly vhxTitleFetcher: VhxTitleFetcher
	private readonly exploreGate: ExploreGate | undefined
	private readonly exploreSession: ExploreSignInCheck | undefined

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

	// `escalate: false` keeps the probe anonymous even when the Explore session could
	// rescue it — for lookups that must not spend the user's account (title backfill).
	async probe(url: string, opts: {playlistMode?: ProbePlaylistMode; playlistScope?: PlaylistScope; ownerKey?: string; timeoutMs?: number; escalate?: boolean} = {}): Promise<Result<ProbeResult, ProbeError>> {
		const {playlistMode = 'auto', playlistScope, ownerKey, timeoutMs, escalate = true} = opts
		// At most one escalation per probe; a signed-in failure is the answer.
		let auth: JobAuth | undefined

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

			const logContext = {playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)}
			logger.info('Probe started', {url, ...logContext})

			let cookiesRejected = false
			const runAs = async (identity: RunIdentity): Promise<ProbeOutcome> => {
				const as: ProbeRunAs = {identity, cookiesRejected: false}
				const mappedOutcome = mapProbeAttempt(await this.probeWithRedirectFollow(url, playlistMode, playlistScope, controller.signal, as, timeoutMs), url, logContext)
				cookiesRejected = as.cookiesRejected
				return mappedOutcome
			}
			// Whether a playlist's items need the account too (R20): main decides and stamps them.
			let itemsNeedAccount = false
			let outcome = await runAs('configured')
			const reason = escalate && outcome.kind === 'failure' ? await this.escalationFor(url, outcome.error, controller.signal) : null
			if (reason) {
				logger.info('Probe escalated to the Explore session', {url})
				auth = 'exploreSession'
				itemsNeedAccount = reachesPlaylistItems(reason)
				outcome = await runAs('exploreSession')
				if (cookiesRejected) outcome = await this.afterCookiesRejected(url, outcome, () => runAs('exploreSession'), controller.signal)
			}
			if (outcome.kind === 'failure') {
				// Signed in only if the last run kept the Explore cookies: one yt-dlp dropped ran anonymously.
				return fail(auth && !cookiesRejected && outcome.error.kind === 'ytdlp' ? {...outcome.error, auth} : outcome.error)
			}

			let mapped: ProbeResult
			if (outcome.kind === 'playlist') {
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
							const html = await this.vhxTitleFetcher(parentUrl, controller.signal)
							if (!controller.signal.aborted) recovered = html === null ? null : deriveRecoveredTitle(extractPageTitleMeta(html), parentUrl)
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
					playlistMode === 'video' && !(auth && cookiesRejected)
						? await this.probeInfoJsonCache?.write(rawForCache, {videoId: typeof video.id === 'string' ? video.id : null, ...(final.stderr.split(/\r?\n/).some(line => sabrSkippedClient(line) !== null) ? {formatsWithheld: true} : {}), ...(auth ? {auth} : {})})
						: undefined
				if (probeInfoJsonRef) {
					const probeInfoJsonPath = await this.probeInfoJsonCache?.resolve(probeInfoJsonRef)
					logger.info('Probe info-json cached', {url, videoId: probeInfoJsonRef.videoId ?? null, probeInfoJsonRef, probeInfoJsonPath: probeInfoJsonPath ?? null})
					result = {...result, probeInfoJsonRef}
				}
				mapped = result
			}
			if (auth) mapped = {...mapped, auth}

			logger.info('Probe result', {...summarizeProbeResult(mapped), playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return ok(mapped)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown probing error'
			logger.error('Probe failure', {message, url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return fail<ProbeResult, ProbeError>({kind: 'other', code: controller.signal.aborted ? 'cancelled' : 'unknown', message})
		} finally {
			this.inFlight.delete(controller)
			if (ownerKey && this.inFlightByKey.get(ownerKey) === controller) this.inFlightByKey.delete(ownerKey)
		}
	}

	// Why an account would fix this failure, while the user is signed in to
	// Explore; null otherwise. A gate that cannot answer counts as "no": the
	// anonymous failure stands.
	private async escalationFor(url: string, error: ProbeError, signal: AbortSignal): Promise<EscalationReason | null> {
		const reason = escalationReason({stage: 'probe', url, error})
		const scope = exploreCookieScopeFor(url)
		if (signal.aborted || !this.exploreGate || reason === null || scope === null) return null
		try {
			return (await this.exploreGate.canEscalate(scope)) ? reason : null
		} catch (err) {
			logger.warn('Explore escalation check failed', {url, error: err instanceof Error ? err.message : String(err)})
			return null
		}
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

	// Loop over `_type: 'url' / 'url_transparent'` redirects up to depth 1 to
	// follow extractor redirects (e.g. Bandcamp track → resolved video). Anything
	// deeper is a misbehaving extractor — bail rather than loop.
	private async probeWithRedirectFollow(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal, as: ProbeRunAs, timeoutMs?: number): Promise<ProbeAttemptResult> {
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
			{identity: as.identity}
		)
		if (result.accountCookiesRejected === true) as.cookiesRejected = true

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
}

function formatCount(info: InfoDict): number {
	if (isPlaylistLike(info)) return info.entries.length
	const v = info as VideoInfo
	return v.formats?.length ?? 0
}

function playlistScopeRequestForLog(scope: PlaylistScope | undefined): PlaylistScopeRequestLog {
	return scope?.items ?? {kind: 'app-limit'}
}

// Compact, log-friendly summary of a ProbeResult. Intentionally drops large
// fields (full formats array, full subtitle map) and keeps the shapes a human
// scanning logs would care about: kind, extractor, counts, degradation flags.
function summarizeProbeResult(r: ProbeResult): Record<string, unknown> {
	if (r.kind === 'video') {
		return {
			kind: r.kind,
			extractor: r.extractor,
			extractorKey: r.extractorKey,
			webpageUrl: r.webpageUrl,
			isAudioOnlySource: r.isAudioOnlySource,
			title: r.title,
			duration: r.duration,
			formatCount: r.formats.length,
			formatIds: r.formats.map(f => f.formatId),
			subtitleLangs: Object.keys(r.subtitles ?? {}),
			autoCaptionLangs: Object.keys(r.automaticCaptions ?? {}),
			isLive: r.isLive,
			hasDrm: r.hasDrm,
			availability: r.availability,
			ageLimit: r.ageLimit,
			degraded: r.degraded?.reasons ?? null,
			thumbnail: r.thumbnail || null
		}
	}
	return {kind: r.kind, extractor: r.extractor, extractorKey: r.extractorKey, webpageUrl: r.webpageUrl, isAudioOnlySource: r.isAudioOnlySource, isMultiVideo: r.isMultiVideo, playlistId: r.playlistId, playlistTitle: r.playlistTitle, entryCount: r.entries.length, firstEntryUrl: r.entries[0]?.url ?? null}
}
