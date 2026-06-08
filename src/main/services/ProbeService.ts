import log from 'electron-log/main.js'
import {trackMain, probeDurationBucket} from '@main/services/analytics.js'
import {splitStderrLines} from '@main/utils/process.js'
import {ok, fail, type Result} from '@shared/result.js'
import {sortFormatsByQuality} from '@shared/qualitySorter.js'
import {humanSize} from '@shared/format.js'
import type {FormatOption, PlaylistEntry, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, ProbeDegradationReason, SubtitleMap} from '@shared/types.js'
import {LIVE_CHAT_LANG} from '@shared/constants.js'
import {infoDictSchema, isPlaylistLike, isUrlRedirect, type InfoDict, type PlaylistInfo, type MultiVideoInfo, type VideoInfo, type YtDlpFormat, type YtDlpSubtitleTrack} from '@shared/ytdlp/infoDict.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {classifyYtDlpStderr, type YtDlpErrorKind} from 'ytdlp-errors'
import {siteForExtractor, type Site} from '@shared/sites/index.js'
import {YtDlp} from './YtDlp.js'

const logger = log.scope('probe')

type ProbeSignalCategory = 'extractor' | 'bot'

// Patterns sourced from yt-dlp's stderr emit sites — verified against
// yt-dlp/yt_dlp/extractor/youtube/_video.py and yt-dlp/yt_dlp/downloader/common.py
// (search the repo for each exact string). yt-dlp wording occasionally changes
// across releases; if a probe stops triggering the degradation retry path,
// re-grep yt-dlp main and update these patterns.
const PROBE_DEGRADATION_SIGNALS: readonly {label: string; pattern: RegExp; category: ProbeSignalCategory}[] = [
	{label: 'n challenge solving failed', pattern: /n challenge solving failed/i, category: 'extractor'},
	{label: 'Some formats may be missing', pattern: /some formats may be missing/i, category: 'extractor'},
	{label: 'Error solving n challenge request', pattern: /error solving n challenge request/i, category: 'extractor'},
	{label: 'Failed to download m3u8 information', pattern: /failed to download m3u8 information/i, category: 'extractor'},
	{label: 'Unable to download webpage', pattern: /unable to download webpage/i, category: 'extractor'},
	{label: 'IncompleteRead', pattern: /incompleteread/i, category: 'extractor'},
	{label: 'Sign in to confirm', pattern: /sign in to confirm you'?re not a bot/i, category: 'bot'},
	{label: 'HTTP 429', pattern: /HTTP Error 429\b|too many requests/i, category: 'bot'}
]

interface ProbeSignal {
	label: string
	category: ProbeSignalCategory
}

type ProbeAttemptName = 'initial' | 'retry'

type PlaylistScopeRequestLog = PlaylistScope['items']

interface ProbeAttemptSuccess {
	info: InfoDict
	stderr: string
	degradationSignals: ProbeSignal[]
}

type ProbeAttemptResult = {kind: 'success'; data: ProbeAttemptSuccess} | {kind: 'failure'; error: ProbeError; errorCategory: ProbeFailureCategory}

function sanitizeSubtitleMap(raw: Record<string, YtDlpSubtitleTrack[]> | undefined, opts: {isAutomaticCaptions: boolean; site: Site}): SubtitleMap {
	if (!raw) return {}
	const result: SubtitleMap = {}
	// Site adapter decides whether auto-caption keys must end in `-orig`. YouTube
	// bundles real generated tracks with on-demand translation options under the
	// same map; only `-orig` are real. Other sites emit auto-captions under bare
	// lang codes — applying the filter would discard every track.
	const requireOrig = opts.isAutomaticCaptions && opts.site.autoCaptionRequiresOrigSuffix
	for (const [lang, tracks] of Object.entries(raw)) {
		if (lang === LIVE_CHAT_LANG) continue
		if (requireOrig && !lang.endsWith('-orig')) continue
		const valid = tracks.flatMap(t => (typeof t.ext === 'string' && t.ext.length > 0 ? [{ext: t.ext, ...(t.name ? {name: t.name} : {})}] : []))
		if (valid.length > 0) result[lang] = valid
	}
	return result
}

function friendlyCodec(acodec: string): string {
	if (acodec === 'opus') return 'Opus'
	if (acodec.startsWith('mp4a')) return 'AAC'
	return acodec
}

export function mapFormats(formats: readonly YtDlpFormat[]): FormatOption[] {
	const mapped = formats.flatMap((item): FormatOption[] => {
		if (!item.format_id || item.ext === 'mhtml' || (item.vcodec === 'none' && (!item.acodec || item.acodec === 'none'))) return []
		const isAudioOnly = item.vcodec === 'none'
		const ext = item.ext ?? 'unknown'
		const filesize = item.filesize ?? item.filesize_approx
		const formatId = item.format_id ?? ''

		if (isAudioOnly) {
			const abr = item.abr
			const codec = friendlyCodec(item.acodec ?? '')
			const details = [ext, codec, abr ? `${Math.round(abr)} kbps` : null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' · ')
			return [{formatId, label: details, ext, resolution: 'audio only', abr, filesize, isVideoOnly: false, isAudioOnly: true, dynamicRange: undefined} satisfies FormatOption]
		}

		const resolution = item.resolution ?? item.format_note ?? 'unknown'
		const fps = item.fps
		const isVideoOnly = item.acodec === 'none'
		const dynamicRange = item.dynamic_range && item.dynamic_range !== 'SDR' ? item.dynamic_range : undefined
		const details = [resolution, ext, fps ? `${fps}fps` : null, dynamicRange ?? null, filesize ? humanSize(filesize) : null].filter(Boolean).join(' | ')

		return [{formatId, label: details, ext, resolution, fps, filesize, isVideoOnly, isAudioOnly: false, dynamicRange} satisfies FormatOption]
	})

	return sortFormatsByQuality(mapped)
}

// Probe-specific operational categories that aren't a yt-dlp stderr kind:
// 'cancelled' (user-driven), 'content_unavailable' (zero formats / empty
// playlist), 'redirect_loop' (extractor redirected too many times). All other
// failures carry a `YtDlpErrorKind`. This union is the analytics
// `error_category` value.
type ProbeFailureCategory = YtDlpErrorKind | 'cancelled' | 'content_unavailable' | 'redirect_loop'

// `Unsupported URL` is emitted by yt-dlp before any extraction begins; it
// doesn't match any of the post-extraction stderr patterns. Detect it here so
// the user gets the right copy + CTA.
function classifyProbeFailure(rawError: string): YtDlpErrorKind {
	if (/unsupported url|is not a supported (?:site|url)|no extractor matches/i.test(rawError)) {
		return 'unsupportedUrl'
	}
	return classifyYtDlpStderr(rawError).kind
}

function detectProbeDegradationSignals(stderr: string): ProbeSignal[] {
	return PROBE_DEGRADATION_SIGNALS.flatMap(({pattern, label, category}) => (pattern.test(stderr) ? [{label, category}] : []))
}

function deriveDegraded(signals: ProbeSignal[]): {reasons: ProbeDegradationReason[]} | undefined {
	if (signals.length === 0) return undefined
	const reasons = Array.from(new Set(signals.map(s => (s.category === 'bot' ? 'botWall' : 'extractor')))) as ProbeDegradationReason[]
	return {reasons}
}

function pickEntryThumbnail(entry: InfoDict): string {
	const v = entry as VideoInfo
	if (typeof v.thumbnail === 'string' && v.thumbnail.length > 0) return v.thumbnail
	const list = v.thumbnails
	if (!list || list.length === 0) return ''
	// Some extractors (NicoVideo) emit thumbnail entries with `url: null` as
	// placeholders — find the first entry with a usable URL.
	for (const t of list) {
		if (typeof t.url === 'string' && t.url.length > 0) return t.url
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
		// generic sites return null and fall through to the placeholder.
		const rawTitle = typeof v.title === 'string' ? v.title.trim() : ''
		const idHint = idStr ? siteHintForId(site, idStr) : null
		const title = rawTitle.length > 0 ? rawTitle : (idHint ?? untitledLabel(playlistIndex))
		// PlaylistEntry.id must be unique per row, not per video. YouTube mix /
		// radio feeds frequently repeat the same video at multiple positions;
		// collapsing them to one id would make the selection state and the
		// post-confirm filter (`playlistItems.filter(e => ids.includes(e.id))`)
		// treat them as one — clicking one would check both, and a single
		// selection would produce two queue items. Index-prefixing guarantees
		// 1 row = 1 stable id even when the underlying yt-dlp id collides.
		const videoIdPart = typeof v.id === 'string' && v.id.length > 0 ? v.id : url
		out.push({id: `${playlistIndex}::${videoIdPart}`, url, title, thumbnail: pickEntryThumbnail(entry), duration: typeof v.duration === 'number' ? Math.round(v.duration) : undefined, playlistIndex, videoId: idStr.length > 0 ? idStr : null})
		fallbackIndex++
	}
	if (droppedContainerCount > 0) {
		logger.info('Playlist entries filtered: dropped nested containers', {jobUrl, droppedContainerCount, keptCount: out.length})
	}
	return out
}

function buildVideoProbeResult(info: VideoInfo, jobUrl: string, degraded: {reasons: ProbeDegradationReason[]} | undefined): ProbeResult {
	const extractor = info.extractor ?? ''
	const site = siteForExtractor(extractor)
	return {
		kind: 'video',
		videoId: typeof info.id === 'string' && info.id.length > 0 ? info.id : null,
		extractor,
		extractorKey: info.extractor_key ?? '',
		webpageUrl: info.webpage_url ?? jobUrl,
		isAudioOnlySource: isAudioOnlySource(extractor),
		formats: mapFormats(info.formats ?? []),
		title: info.title ?? '',
		thumbnail: info.thumbnail ?? '',
		duration: typeof info.duration === 'number' ? Math.round(info.duration) : undefined,
		subtitles: sanitizeSubtitleMap(info.subtitles, {isAutomaticCaptions: false, site}),
		automaticCaptions: sanitizeSubtitleMap(info.automatic_captions, {isAutomaticCaptions: true, site}),
		isLive: info.is_live === true || info.live_status === 'is_live' || info.live_status === 'is_upcoming',
		hasDrm: info.has_drm === true,
		availability: typeof info.availability === 'string' ? info.availability : undefined,
		ageLimit: typeof info.age_limit === 'number' && info.age_limit > 0 ? info.age_limit : undefined,
		...(degraded ? {degraded} : {})
	}
}

function buildPlaylistProbeResult(info: PlaylistInfo | MultiVideoInfo, jobUrl: string): ProbeResult {
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

export class ProbeService {
	// Tracks every in-flight probe's controller so cancelInFlight() can abort
	// them all at once. probe() registers + deregisters its controller.
	private inFlight = new Set<AbortController>()

	constructor(
		private readonly ytDlp: YtDlp,
		private readonly mockMode = false
	) {}

	// Abort every in-flight probe. Renderer calls this when the user changes the
	// wizard URL, navigates away, or otherwise abandons a slow fetch — without
	// it, a stalled YouTube fallback chain (~60s) keeps the UI spinner blocked.
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

	async probe(url: string, cookiesMode: 'off' | 'file' | 'browser' = 'off', playlistMode: ProbePlaylistMode = 'auto', playlistScope?: PlaylistScope): Promise<Result<ProbeResult, ProbeError>> {
		const startMs = Date.now()
		const emitSuccess = (result: ProbeResult): void => {
			trackMain('format_probed', {duration_bucket: probeDurationBucket(Date.now() - startMs), bot_wall: result.kind === 'video' && result.degraded?.reasons.includes('botWall') === true, cookies_mode: cookiesMode, result_kind: result.kind})
		}
		const emitFailure = (errorCategory: ProbeFailureCategory): void => {
			trackMain('probe_failed', {duration_bucket: probeDurationBucket(Date.now() - startMs), error_category: errorCategory, cookies_mode: cookiesMode})
		}

		const controller = new AbortController()
		this.inFlight.add(controller)
		try {
			if (this.mockMode) return ok(buildMockProbeResult(url))

			logger.info('Probe started', {url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})

			const probeResult = await this.probeWithRedirectFollow(url, playlistMode, playlistScope, controller.signal)
			if (probeResult.kind === 'failure') {
				emitFailure(probeResult.errorCategory)
				return fail(probeResult.error)
			}

			const final = probeResult.data
			const info = final.info
			let mapped: ProbeResult

			if (isPlaylistLike(info)) {
				mapped = buildPlaylistProbeResult(info, url)
				if (mapped.kind === 'playlist' && mapped.entries.length === 0) {
					// Empty playlist isn't a JSON parse failure — extractor produced a
					// valid container with no entries (private playlist, members-only,
					// geo-blocked, exhausted page). Categorize accordingly so analytics
					// and any user-facing copy can distinguish the cause.
					logger.warn('Playlist probe returned no entries', {url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
					emitFailure('content_unavailable')
					return fail<ProbeResult, ProbeError>({kind: 'other', message: 'Playlist returned no entries'})
				}
			} else if (isUrlRedirect(info)) {
				// Hit redirect-depth cap. Surface the URL error rather than guess.
				emitFailure('redirect_loop')
				return fail<ProbeResult, ProbeError>({kind: 'other', message: 'Probe redirected too many times'})
			} else {
				const video = info
				const degraded = deriveDegraded(final.degradationSignals)
				mapped = buildVideoProbeResult(video, url, degraded)
				if (mapped.kind === 'video' && mapped.formats.length === 0 && mapped.subtitles && Object.keys(mapped.subtitles).length === 0 && Object.keys(mapped.automaticCaptions).length === 0) {
					// Valid extractor response with zero formats + zero subs + zero
					// auto-captions — geo-block, age-gate, members-only, or live-not-yet.
					// Not a parse failure; the JSON shape was fine.
					emitFailure('content_unavailable')
					return fail<ProbeResult, ProbeError>({kind: 'other', message: 'Probe returned no formats'})
				}
			}

			emitSuccess(mapped)
			logger.info('Probe result', {...summarizeProbeResult(mapped), playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return ok(mapped)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown probing error'
			logger.error('Probe failure', {message, url, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			emitFailure(controller.signal.aborted ? 'cancelled' : classifyProbeFailure(message))
			return fail<ProbeResult, ProbeError>({kind: 'other', message})
		} finally {
			this.inFlight.delete(controller)
		}
	}

	// Loop over `_type: 'url' / 'url_transparent'` redirects up to depth 1 to
	// follow extractor redirects (e.g. Bandcamp track → resolved video). Anything
	// deeper is a misbehaving extractor — bail rather than loop.
	private async probeWithRedirectFollow(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal): Promise<ProbeAttemptResult> {
		let currentUrl = url
		for (let depth = 0; depth <= 1; depth++) {
			if (signal.aborted) return {kind: 'failure', error: {kind: 'other', message: 'Probe cancelled'} satisfies ProbeError, errorCategory: 'cancelled'}
			const attempt = await this.runProbeWithDegradationRetry(currentUrl, playlistMode, playlistScope, signal)
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
		return this.runProbeWithDegradationRetry(currentUrl, playlistMode, playlistScope, signal)
	}

	private async runProbeWithDegradationRetry(url: string, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal): Promise<ProbeAttemptResult> {
		const initial = await this.runProbeAttempt(url, 'initial', playlistMode, playlistScope, signal)
		if (initial.kind === 'failure') return initial
		if (initial.data.degradationSignals.length === 0) return initial
		if (signal.aborted) return initial

		logger.info('Probe degraded-success — retrying', {url, degradationSignals: initial.data.degradationSignals})

		const retry = await this.runProbeAttempt(url, 'retry', playlistMode, playlistScope, signal)
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

	private async runProbeAttempt(url: string, attempt: ProbeAttemptName, playlistMode: ProbePlaylistMode, playlistScope: PlaylistScope | undefined, signal: AbortSignal): Promise<ProbeAttemptResult> {
		const source = attempt === 'retry' ? 'yt-dlp-probe-retry' : 'yt-dlp-probe'
		const result = await this.ytDlp.run(
			{kind: 'probe', url, playlistMode, playlistScope},
			{
				abortSignal: signal,
				onStderr: chunk => {
					for (const line of splitStderrLines(chunk)) {
						logger.info(line, {source})
					}
				}
			}
		)

		if (result.kind !== 'success') {
			const code = result.kind === 'exit-error' ? result.exitCode : null
			const rawError = result.kind === 'exit-error' ? result.rawError : result.error.message
			// Distinguish caller-driven cancellation from a genuine yt-dlp failure
			// so analytics + UI don't treat it as an error.
			if (signal.aborted || rawError === 'Cancelled') {
				return {kind: 'failure', error: {kind: 'other', message: 'Probe cancelled'} satisfies ProbeError, errorCategory: 'cancelled'}
			}
			// yt-dlp's exit-error kind is anchored to its stderr classifier; for
			// probe-time failures we additionally recognize 'unsupportedUrl' which
			// yt-dlp emits before extraction begins.
			const probeKind = classifyProbeFailure(rawError ?? '')
			logger.error('yt-dlp probe failed', {attempt, code, url, kind: probeKind, playlistMode, playlistScope: playlistScopeRequestForLog(playlistScope)})
			return {kind: 'failure', error: {kind: 'ytdlp', error: {kind: probeKind, raw: rawError ?? 'Probing failed'}} satisfies ProbeError, errorCategory: probeKind}
		}

		let raw: unknown
		try {
			raw = JSON.parse(result.stdout)
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown JSON parse error'
			logger.error('Probe JSON parse failed', {attempt, message, url})
			return {kind: 'failure', error: {kind: 'other', message: 'Failed to parse probe output', details: message} satisfies ProbeError, errorCategory: 'parse'}
		}

		const parseResult = infoDictSchema.safeParse(raw)
		if (!parseResult.success) {
			const message = parseResult.error.issues[0]?.message ?? 'yt-dlp output failed schema validation'
			logger.error('Probe schema validation failed', {attempt, message, url})
			return {kind: 'failure', error: {kind: 'other', message: 'Unexpected yt-dlp output shape', details: message} satisfies ProbeError, errorCategory: 'parse'}
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
		return {kind: 'success', data: {info, stderr: result.stderr, degradationSignals}}
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

function buildMockProbeResult(url: string): ProbeResult {
	return {
		kind: 'video',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		webpageUrl: url,
		isAudioOnlySource: false,
		formats: [
			{formatId: '137', label: '1080p | mp4 | 30fps', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true, isAudioOnly: false},
			{formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false},
			{formatId: '18', label: '360p | mp4 | 30fps', ext: 'mp4', resolution: '360p', fps: 30, filesize: 150_000_000, isVideoOnly: false, isAudioOnly: false}
		],
		title: 'Mock Video Title',
		thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
		duration: 212,
		subtitles: {en: [{ext: 'vtt', name: 'English'}], es: [{ext: 'vtt'}]},
		automaticCaptions: {de: [{ext: 'vtt'}], ja: [{ext: 'vtt', name: '日本語'}]},
		isLive: false,
		hasDrm: false
	}
}
